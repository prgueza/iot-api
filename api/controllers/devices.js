/* DATA MODELS */
const moment = require('moment');
const Device = require('../models/device');
const Display = require('../models/display');

/* GET ALL -  Authorization: Only admin users can get ALL the devices */
exports.devices_get_all = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const devices = await Device.find()
        .select('_id url name description gateway mac found lastFound batt rssi screen initcode createdAt updatedAt')
        .populate('gateway', '_id url name mac')
        .exec();
      const mapDevices = devices.map((device) => {
        device.url = `${process.env.API_URL}devices/${device._id}`;
        if (moment().diff(device.lastFound, 'days') > 7) device.found = false;
        return device;
      });
      res.status(200).json(mapDevices);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE - Authorization: Only admin users or users from the same userGroup as the device can get said device */
exports.devices_get_one = async (req, res) => {
  try {
    const _id = req.params.id;
    const device = await Device.findById(_id)
      .select('_id url name description mac mac found lastFound batt rssi initcode screen display activeImage userGroup createdBy createdAt updatedAt')
      .populate('display', '_id url name')
      .populate('gateway', '_id url name')
      .populate('created_by', '_id url name')
      .populate('updated_by', '_id url name')
      .populate('resolution', '_id url name')
      .populate('location', '_id url name')
      .populate('userGroup', '_id url name')
      .populate('active_image', '_id url name')
      .exec();
    if (device && ((device.userGroup && req.AuthData.userGroup === device.userGroup._id) || req.AuthData.admin)) {
      device.url = `${process.env.API_URL}devices/${device._id}`;
      res.status(200).json(device);
    } else if (!req.AuthData.admin) {
      console.log('Error: Not allowed');
      res.status(401).json({ error: 'Not allowed' });
    } else {
      console.log('Error: No valid entry for privided id');
      res.status(404).json({ error: 'No valid entry found for provided id' });
    }
  } catch (error) {
    // Log errors
    console.log(error.message);
    res.status(error.status || 500).json(error.message);
  }
};

/* PUT */
exports.device_update = async (req, res) => {
  try {
    // If the user has no admin privileges answer with an error
    if (!req.AuthData.admin) {
      console.log('Error: Not allowed');
      res.status(401).json({ error: 'Not allowed' });
    }
    // Get the id from the request for the query
    const { id } = req.params;
    // If it's not assigned to a usergroup set the property as undefined
    if (!req.body.userGroup) req.body.userGroup = undefined;
    // Update and get the device
    const device = await Device.findOneAndUpdate({ _id: id }, {
      $set: req.body,
    }, { new: true })
      .select('_id url name description gateway mac found batt rssi screen initcode userGroup createdAt updatedAt')
      .populate('gateway', '_id url name mac')
      .populate('userGroup', '_id url name')
      .exec();
    // Set the url manually
    device.url = `http://localhost:4000/devices/${device._id}`;
    // Send a response
    res.status(200).json({
      message: 'Success at updating the device',
      notify: `(${device.initcode}) - ${device.name} actualizado`,
      success: true,
      resourceId: id,
      resource: device,
    });
  } catch (error) {
    // Log errors
    console.log(error.message);
    res.status(error.status || 500).json(error.message);
  }
};

/* DELETE */
exports.device_delete = async (req, res) => {
  try {
    // If the user has no admin privileges answer with an error
    if (!req.AuthData.admin) {
      console.log('Error: Not allowed');
      res.status(401).json({ error: 'Not allowed' });
    }
    // Get the id from the request for the query
    const { id } = req.params;
    // Delete and get the device
    const device = await Device.findByIdAndDelete(id).exec();
    // Delete the associated display if any
    await Display.findByIdAndDelete(device.display._id);
    // Send a response
    res.status(200).json({
      message: 'Success at removing a device from the collection',
      success: true,
      resourceId: id,
    });
  } catch (error) {
    // Log errors
    console.log(error.message);
    res.status(error.status || 500).json(error.message);
  }
};
