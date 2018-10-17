const mongoose = require('mongoose');

/* DATA MODELS */
const Device = require('../models/device');
const Display = require('../models/display');
const Gateway = require('../models/gateway');
const UserGroup = require('../models/userGroup');

/* GET ALL -  Authorization: Only admin users can get ALL the devices */
exports.devices_get_all = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const devices = await Device.find()
        .select('_id url name description gateway mac found batt rssi screen initcode createdAt updatedAt')
        .populate('gateway', '_id url name mac')
        .exec();
      const mapDevices = devices.map((device) => {
        device.url = `${process.env.API_URL}devices/${device._id}`;
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
      .select('_id url name description mac mac found batt rssi initcode screen display activeImage userGroup createdBy createdAt updatedAt')
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
    console.log(error);
    res.status(500).json(error);
  }
};


/* PUT */
exports.device_update = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401)
      .json({ error: 'Not allowed' });
  } else {
    // get the id from the request for the query
    const _id = req.params.id;
    // get userGroup id from the request
    const { userGroup, gateway } = req.body;
    // create userGroup id from data received
    const u_id = mongoose.Types.ObjectId(userGroup);
    const g_id = mongoose.Types.ObjectId(gateway);
    // update the device based on its id
    if (!req.body.userGroup) req.body.userGroup = undefined;
    Device
    // update device
      .findOneAndUpdate({
        _id,
      }, {
        $set: req.body,
      }, { new: true })
    // send response
      .then(res => Device.findById(_id)
        .select('_id url name description gateway mac found batt rssi screen initcode createdAt updatedAt')
        .populate('gateway', '_id url name mac')
        .exec())
      .then((doc) => {
        doc.url = `http://localhost:4000/devices/${doc._id}`; // // HACK: hotfix
        res.status(200)
          .json({
            message: 'Success at adding a new display to the collection',
            notify: `(${doc.initcode}) - ${doc.name} actualizado`,
            success: true,
            resourceId: _id,
            resource: doc,
          });
      })
    // catch any errors
      .catch((err) => {
        console.log(err);
        res.status(500)
          .json({ message: 'Internal Server Error', error: err });
      });
  }
};

/* DELETE */
exports.device_delete = (req, res, next) => {
  // get id from request parameters
  const _id = req.params.id;
  if (req.AuthData.admin) {
    Device.findByIdAndDelete(_id)
      .exec()
      .then(doc => doc.display && Display.findByIdAndDelete(doc.display._id))
      .then(() => {
        res.status(200)
          .json({
            message: 'Success at removing a device from the collection',
            success: true,
            resourceId: _id,
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500)
          .json({
            error: err,
          });
      });
  } else {
    res.status(401).json({ message: 'Forbidden' });
  }
};
