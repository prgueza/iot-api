const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const moment = require('moment');

/* DATA MODELS */
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');
const Gateway = require('../models/gateway');

let lastUpdate = false;
let waiting = false;

const parsePort = url => url.split('/')[2].split(':')[1];
const parseURL = url => url.split(':')[1].replace('//', '');
const parseMac = mac => mac.replace(/:/g, '');

exports.update = async (req, res) => {
  try {
    // Query based on authorization
    const query = !req.AuthData.admin
      ? { userGroup: req.AuthData.userGroup }
      : {};
    // Array where all the found devices will be stored
    const devices = [];
    // Log
    console.log('updating...');
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
        status: 400,
      };
      throw error;
    }
    // Map responses so they contain the ip, port and list of devices for each gateway
    const mappedResponses = responses.map(response => ({
      sync: response.config.url,
      devices: response.data.device,
    }));
    // Set all devices to "not found"
    await Device.updateMany({}, { found: false }).exec();
    // Fill the devices array avoiding duplicates and selecting devices with better signal level
    for (let i = 0; i < mappedResponses.length; i++) { // for the first devices list
      // Get the full gateway object which found this devices
      const gateway = gateways.find(g => g.sync === mappedResponses[i].sync);
      // for each device within the list
      for (let j = 0; j < mappedResponses[i].length; j++) {
        // save the device into a variable
        const currentDevice = mappedResponses[i].devices[j];
        // Check if the device has already been found
        const duplicate = devices.find(d => d.device.mac === currentDevice.mac);
        if (!duplicate) { // If it hasn't been found
          // Add two new properties
          currentDevice.found = true;
          currentDevice.gateway = gateway._id;
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
    // Get the updated devices back from the database
    const updatedDevices = await Device.find(query).select('_id url name description mac found batt rssi initcode screen gateway createdAt updatedAt').populate('gateway', '_id name description mac url').exec();
    // Map devices for the responses
    updatedDevices.map((d) => {
      const device = d;
      // set the doc url manually for those devices that were added automatically and for which we couldnt know the id at that moment
      device.url = `${process.env.API_URL}devices/${device._id}`;
      return device;
    });
    // set lastUpdate to now
    lastUpdate = moment();
    // unblock
    waiting = false;
    // Send response with the devices
    res.status(200).json(updatedDevices);
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ error });
  }
};

/* GET */
exports.update2 = (req, res) => {
  if (lastUpdate && moment().diff(lastUpdate, 'seconds') < process.env.lastUpdate_TIMER) { // if last update was recent send the data without updating
    // get devices that can be accessed by the user that sent the request
    console.log('data from last update');
    const query = !req.AuthData.admin // Only restrict search if the user isn't admin
      ? { userGroup: req.AuthData.userGroup }// get devices that belong to the userGroup
      : {};
    Device.find(query)
      .select('_id url name description mac found batt rssi initcode screen gateway createdAt updatedAt')
      .populate('gateway', '_id name description mac url')
      .exec()
      .then(docs => res.status(200)
        .json(docs));
  } else if (waiting) { // if another user is requesting the update
    res.status(500)
      .json({
        error: 'Waiting for another request to finish!',
      });
  } else { // else update database
    console.log('Updating...');
    waiting = true; // block
    let data = [];
    let requests = [];
    let filteredData = [];
    let gatewaysIPs = [];
    Gateway.find()
      .select('sync')
      .exec()
      .then((gateways) => { // get all syncs for the gateways stored in the database
        const urls = gateways.map(gateway => gateway.sync); // map the urls into an array
        console.log(`Gateways found: ${urls.length}`);
        requests = urls.map(url => axios.get(url, { timeout: process.env.TIMEOUT })
          .catch(err => console.log(err))); // store as axios get requests in an array
        axios.all(requests)
          .then((responses) => { // execute all requests
            data = responses.map(r => ({
              gateway_ip: parseURL(r.config.url),
              gateway_port: parsePort(r.config.url),
              devices: r.data.device,
            })); // store just data from requests in the data variable
            filteredData = data.filter(gatewayList => gatewayList !== undefined);
            if (filteredData.length === 0) {
              res.status(201)
                .json({ error: 'No hay puertas de enlace disponibles' });
              return;
            }
            console.log(`Devices found (total): ${filteredData.length}`);
            gatewaysIPs = responses.map(response => parseURL(response.config.url));
          })
          .then(() => {
            Device.updateMany({}, { found: false }).exec(); // set all devices to "not found"
          })
          .then(() => {
            Gateway.find({ // get all data for the gateways that could be accessed
              ip: {
                $in: gatewaysIPs,
              },
            })
              .then((gateways) => {
                const sync_devices = []; // for storing all devices found
                console.log('Filtered data: ');
                console.log(filteredData);
                for (var j = 0; j < filteredData.length; j++) { // for every list of displays from the gateways
                  const current_gateway = gateways.find(g => g.ip == filteredData[j].gateway_ip && g.port == filteredData[j].gateway_port); // get the gateway that provided the list
                  for (let i = 0; i < filteredData[j].devices.length; i++) { // for every device within the list from this specific gateway
                    var current_device = filteredData[j].devices[i]; // save the device into a variable
                    console.log('Current device ');
                    console.log(current_device);
                    const duplicate = sync_devices.find(d => d.device.mac == current_device.mac); // check if the device has already been found
                    if (!duplicate) { // if it's the first time that the device is found
                      current_device.found = true; // set found to true within the device data
                      current_device.gateway = current_gateway._id; // set the devices access gateway to the one where it was found on
                      sync_devices.push({ device: current_device }); // push to found devices array
                      console.log('Current device 2: ');
                      console.log(current_device);
                    } else if (+duplicate.device.rssi < +current_device.rssi) { // if it has a duplicate but the signal from the last gateway is stronger thatn from the first one
                      const duplicate_index = sync_devices.findIndex(d => d.device.mac == current_device.mac); // get the index of the device stored in found devices
                      current_device.found = true; // set found to true within the device data
                      current_device.gateway = current_gateway._id; // set the devices access gateway to the one where it was found on
                      sync_devices.splice(duplicate_index, 1, { // replace the already stored device with this new one which has better signal
                        device: current_device,
                      });
                    }
                  }
                } // once this is done for every device from every list we should have an array with all found devices and no duplicates (keeping the one with the better signal)
                console.log('Sync devices: ');
                console.log(sync_devices);
                if (sync_devices.length == 0) {
                  res.status(500) // todo: controlar errores
                    .json({ error: 'No devices found' });
                }
                var bulk_ops = [];
                var bulk_ops = sync_devices.map(d => ({
                  updateOne: {
                    filter: {
                      mac: d.device.mac, // search for the device to update filtering by mac address
                    },
                    update: d.device, // update the device with the new device data coming from the gateways
                    upsert: true, // if it's the first time this device has been found, create a new device resource
                  },
                })); // TODO: ver por que a veces devuelve solo uno y ver que pasa cuando eliminas uno
                console.log('Bulk_ops: ');
                console.log(JSON.stringify(bulk_ops, null, ' '));
                return Device.bulkWrite(bulk_ops); // bulk write all these updates
              })
              .then(() => {
                // get devices that can be accessed by the user that sent the request
                const query = !req.AuthData.admin
                  ? { userGroup: req.AuthData.userGroup }
                  : {};
                Device.find(query)
                  .select('_id url name description mac found batt rssi initcode screen gateway createdAt updatedAt')
                  .populate('gateway', '_id name description mac url')
                  .exec()
                  .then((docs) => {
                    lastUpdate = moment(); // set lastUpdate to now
                    waiting = false; // unblock
                    res.status(200)
                      .json(docs.map((doc) => { // send a response to the user maping all the results
                        doc.url = `${process.env.API_URL}devices/${doc._id}`; // set the doc url manually for those devices that were added automatically and for which we couldnt know the id at that moment
                        return doc;
                      }));
                  });
              });
          });
      })
      .catch((err) => {
        console.log(err);
        waiting = false; // unblock
        res.status(500)
          .json({ error: err });
      }); // catch and return any error
  }
};

exports.update_image = async (req, res) => {
  // get id for the display
  const _id = req.params.id;
  // get device and image information from the display resource
  try {
    const display = await Display.findById(_id).select('device activeImage');
    console.log(`Display found with id: ${display._id}`);
    const image = await Image.findById(mongoose.Types.ObjectId(display.activeImage)).select('path');
    console.log(`Image found with id: ${image._id}`);
    console.log(`The file's path is: ${image.path}`);
    const device = await Device.findById(mongoose.Types.ObjectId(display.device)).select('gateway mac').populate('gateway', 'sync');
    console.log(`The device to which this display is linked has the id: ${display.device}`);
    console.log(`This device has this mac: ${device.mac}`);
    console.log(`The url for uploading the image is: ${device.gateway.sync}/?mac=${parseMac(device.mac)}`);
    const file = fs.readFileSync(image.path);
    const form = new FormData();
    form.append('image', file, 'image.bmp');
    console.log(form);
    const config = {
      params: {
        mac: parseMac(device.mac),
      },
      headers: form.getHeaders(),
      timeout: 15000,
    };
    const response = await axios.put(device.gateway.sync, form, config);
    console.log(response);
  } catch (e) {
    const error = {
      message: 'An error has ocurred while uploading the image to the display',
      error: e.message,
    };
    console.log(error);
    res.status(500).json({ error });
  }
};
