/* DATA MODELS */
const moment = require('moment');
const Device = require('../models/device');
// const Display = require('../models/display');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL -  Authorization: Only admin users can get ALL the devices */
exports.devicesGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const devices = await Device.find()
        .select(SELECTION.devices.short)
        .populate('gateway', SELECTION.gateways.populate)
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
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE - Authorization: Only admin users or users from the same userGroup as the device can get said device */
exports.devicesGetOne = async (req, res) => {
  try {
    const _id = req.params.id;
    const device = await Device.findById(_id)
      .select(SELECTION.devices.long)
      .populate('display', SELECTION.displays.populate)
      .populate('gateway', SELECTION.gateways.populate)
      .populate('updatedBy', SELECTION.users.populate)
      .populate('resolution', SELECTION.screens.populate)
      .populate('location', SELECTION.locations.populate)
      .populate('userGroup', SELECTION.userGroups.populate)
      .populate('activeImage', SELECTION.images.populate)
      .exec();
    if (device && ((device.userGroup && req.AuthData.userGroup === device.userGroup._id) || req.AuthData.admin)) {
      device.url = `${process.env.API_URL}devices/${device._id}`;
      res.status(200).json(device);
    } else if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(error.status || 500).json(MESSAGE[500](error));
  }
};

/* PUT */
exports.deviceUpdate = async (req, res) => {
  try {
    // If the user has no admin privileges answer with an error
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    }
    // Get the id from the request for the query
    const { id } = req.params;
    // If it's not assigned to a usergroup set the property as undefined
    if (!req.body.userGroup) req.body.userGroup = undefined;
    // Update and get the device
    const device = await Device.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true })
      .select(SELECTION.devices.short)
      .populate('gateway', SELECTION.gateways.populate)
      .exec();
    if (device) {
      // Set the url manually
      device.url = `${process.env.API_URL}devices/${device._id}`;
      // Send a response
      res.status(200).json({
        message: 'Success at updating the device',
        notify: `${device.initcode} - ${device.name} actualizado`,
        success: true,
        resourceId: id,
        resource: device,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(error.status || 500).json(MESSAGE[500](error));
  }
};

/* DELETE */
exports.deviceDelete = async (req, res) => {
  try {
    // If the user has no admin privileges answer with an error
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    }
    const { id } = req.params;
    const device = await Device.findById(id);
    await device.remove();
    if (device) {
      res.status(200).json({
        message: 'Success at removing a device from the collection',
        notify: `${device.initcode} - ${device.name} eliminado`,
        success: true,
        resourceId: id,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(error.status || 500).json(MESSAGE[500](error));
  }
};
