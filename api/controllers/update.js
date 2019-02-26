const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const moment = require('moment');
const Store = require('data-store');

/* DATA MODELS */
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');
const Gateway = require('../models/gateway');
const { SELECTION } = require('./static');

const store = new Store({ path: 'config.json' });
const queue = [];
const sockets = [];
const waiting = {
  update: false,
  updateImage: false,
};

exports.manager = (io) => {
  io.on('connection', (socket) => {
    sockets.push(socket);
    console.log('user connected');
    socket.on('login', (data) => {
      console.log(data);
      socket.emit('queue', queue);
    });
  });
};

async function runNext(result, response) {
  queue[0].result = result;
  queue[0].status = 'finished';
  const { id } = queue[0];
  let display;
  if (result) {
    display = await Display.findByIdAndUpdate(id, { updating: false, lastUpdateResult: true, timeline: response.data.result }, { new: true }).select(SELECTION.displays.short).populate('device', SELECTION.devices.populate).populate('activeImage', SELECTION.images.populate);
  } else {
    display = await Display.findByIdAndUpdate(id, { updating: false, lastUpdateResult: false, timeline: response.data.error }, { new: true }).select(SELECTION.displays.short).populate('device', SELECTION.devices.populate).populate('activeImage', SELECTION.images.populate);
  }
  sockets.map(socket => socket.emit('done processing', display));
  queue.shift();
  sockets.map(socket => socket.emit('update queue', queue.map(q => q.display)));
  console.log('Queue status on run next');
  console.log(queue);
  if (queue.length > 0) {
    queue[0].runRequest();
    console.log('Queue not empty');
    console.log(queue);
  }
}

class UpdateRequest {
  constructor(id, gateway, display, request) {
    this.id = id;
    this.gateway = gateway;
    this.display = display;
    this.request = request;
    this.status = 'waiting';
    this.result = false;
    this.shouldRun();
  }

  getId() {
    return this.id;
  }

  getRequest() {
    return this.request;
  }

  runRequest() {
    console.log(`Running request with id ${this.id}`);
    this.status = 'running';
    this.request();
  }

  shouldRun() {
    if (queue.length === 0) {
      this.runRequest();
    }
  }
}


exports.update = async (req, res) => {
  try {
    const lastUpdate = store.get('lastUpdate');
    // Log last update
    console.log(`Last update was ${moment().diff(lastUpdate, 'seconds')} seconds ago`);
    // Array where all the found devices will be stored
    const devices = [];
    // Query based on authorization
    const query = !req.AuthData.admin
      ? { userGroup: req.AuthData.userGroup }
      : {};
    // If last update was made more than a minute ago
    if (waiting.update) {
      const error = {
        message: 'Waiting for another request to finish',
        status: 500,
      };
      throw error;
    } else if (moment().diff(lastUpdate, 'seconds') > 5) {
      // Set waiting flag to true
      waiting.update = true;
      // Log
      console.log('Updating...');
      // Get all gateways sync url stored in the database
      const gateways = await Gateway.find().select('id sync').exec();
      const sync = gateways.map(g => g.sync);
      // Map the sync urls to http responses with axios
      const requests = sync.map(async url => axios.get(url, { timeout: process.env.TIMEOUT }));
      // Perform all the requests and wait for them to end
      const responses = await axios.all(requests).catch(error => console.log(error.message));
      // If there are no responses set error message
      if (responses === undefined) {
        const error = {
          message: 'None of the gateways was reachable.',
          notify: 'No hay puertas de enlace disponibles.',
          status: 400,
        };
        throw error;
      }
      // Map responses so they contain the ip, port and list of devices for each gateway
      const mappedResponses = responses.map(response => ({
        sync: response.config.url,
        devices: response.data.device,
      }));
      console.log(JSON.stringify(mappedResponses, null, ' '));
      // Set all devices to "not found"
      await Device.updateMany({}, { found: false }).exec();
      // Fill the devices array avoiding duplicates and selecting devices with better signal level
      for (let i = 0; i < mappedResponses.length; i++) { // for the first devices list
        // Get the full gateway object which found this devices
        const gateway = gateways.find(g => g.sync === mappedResponses[i].sync);
        // for each device within the list
        for (let j = 0; j < mappedResponses[i].devices.length; j++) {
          // save the device into a variable
          const currentDevice = mappedResponses[i].devices[j];
          // Check if the device has already been found
          const duplicate = devices.find(d => d.device.mac === currentDevice.mac);
          if (!duplicate) { // If it hasn't been found
            // Add two new properties
            currentDevice.found = true;
            currentDevice.gateway = gateway._id;
            currentDevice.lastFound = moment();
            // Push to found devices array
            devices.push({ device: currentDevice });
          } else if (Number(duplicate.device.rssi) < Number(currentDevice.rssi)) {
            // get the index of the device stored in found devices
            const duplicateIndex = devices.findIndex(d => d.device.mac === currentDevice.mac);
            // Add two new properties
            currentDevice.found = true;
            currentDevice.gateway = gateway._id;
            // Replace the device in the devices array
            devices.splice(duplicateIndex, 1, { device: currentDevice });
          }
        }
      }
      // If there are no devices return with an error
      if (devices.length === 0) {
        const error = {
          message: 'None of the gateways found any device.',
          notify: 'No se ha encontrado ningún dispositivo.',
          status: 400,
        };
        throw error;
      }
      // Else update the API resources with new devices
      const updateOps = devices.map(d => ({
        updateOne: {
          filter: {
            // search for the device to update filtering by mac address
            mac: d.device.mac,
          },
          // update the device with the new device data coming from the gateways
          update: d.device,
          // if it's the first time this device has been found, create a new device resource
          upsert: true,
        },
      }));
      // Perform a bulkwrite operation and wait for it to finish
      await Device.bulkWrite(updateOps);
      // set lastUpdate to now
      store.set('lastUpdate', moment());
      console.log('Data store updated to:');
      console.log(store.data);
    }
    // Get the devices back from the database
    const updatedDevices = await Device.find(query)
      .select(SELECTION.devices.short)
      .populate('gateway', SELECTION.gateways.populate)
      .exec();
    // Map devices for the responses
    updatedDevices.map((d) => {
      const device = d;
      // set the doc url manually for those devices that were added automatically and for which we couldnt know the id at that moment
      device.url = `${process.env.API_URL}devices/${device._id}`;
      return device;
    });
    // unblock
    waiting.update = false;
    // Send response with the devices
    res.status(200).json(updatedDevices);
  } catch (error) {
    // unblock
    waiting.update = false;
    // log and return errors
    console.log(error.message);
    res.status(error.status || 401).json({ error });
  }
};

exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { activeImage } = req.body;
    console.log(id);

    const deviceInQueue = queue.filter(device => device.id === id);

    if (deviceInQueue.length > 0) {
      res.status(300).json({
        notify: 'La imagen está en cola o siendo procesada',
      });
      return;
    }

    const display = await Display.findById(id).select('device activeImage');
    const image = activeImage
      ? await Image.findById(mongoose.Types.ObjectId(activeImage)).select('path')
      : await Image.findById(mongoose.Types.ObjectId(display.activeImage)).select('path');
    console.log(image);
    const device = await Device.findById(mongoose.Types.ObjectId(display.device)).select('gateway mac').populate('gateway', '_id sync');
    const file = fs.readFileSync(image.path);

    if (!display || !image || !device || !device.gateway || !file) {
      const error = {
        message: 'Something went wrong!',
      };
      throw error;
    }

    const form = new FormData();
    form.append('image', file, 'image.bmp');
    const config = {
      params: {
        mac: device.mac,
      },
      headers: form.getHeaders(),
      timeout: 50000,
    };

    const axiosRequest = () => axios.put(device.gateway.sync, form, config)
      .then(async (response) => {
        if (response.status === 200) {
          console.log(`Success: ${response.status}`);
          console.log(`Message: ${JSON.stringify(response.data, null, null)}`);
          setTimeout(() => {
            runNext(true, response);
          }, 500);
        } else {
          console.log(`Error: ${response.status}`);
          console.log(`Message: ${response.data}`);
          setTimeout(() => {
            runNext(false, response);
          }, 500);
        }
      })
      .catch((err) => {
        console.log(err.response.data);
        return setTimeout(() => {
          runNext(false, err.response);
        }, 500);
      });


    const resource = await Display.findByIdAndUpdate(id, {
      $set: {
        updating: true, timeline: '', lastUpdateResult: false, activeImage: mongoose.Types.ObjectId(image._id),
      },
    }, { new: true }).select(SELECTION.displays.short).populate('device', SELECTION.devices.populate).populate('activeImage', SELECTION.images.populate)
      .exec();

    const request = new UpdateRequest(id, device.gateway._id, display._id, axiosRequest);
    queue.push(request);
    console.log('Queue status on shouldRun:');
    console.log(queue);

    sockets.map(socket => socket.emit('update queue', queue.map(q => q.display)));
    sockets.map(socket => socket.emit('processing', resource));

    res.status(200).json({
      message: 'Success at adding a new update to the queue',
      notify: 'La imagen está siendo procesada',
      success: true,
      resourceId: resource._id,
      resource,
    });
  } catch (e) {
    const error = {
      message: 'An error has ocurred while uploading the image to the display',
      error: e,
    };
    console.log(error);
    res.status(500).json({ error });
  }
};
