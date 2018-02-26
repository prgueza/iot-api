const mongoose = require('mongoose');

/* DATA MODELS */
const Device = require('../models/device');
const Display = require('../models/display');
const Gateway = require('../models/gateway');
const UserGroup = require('../models/userGroup');

/* GET ALL */
exports.devices_get_all = (req, res, next) => {
  Device.find()
    .select('_id id name description url mac_address bt_address created_at updated_at')
    .exec()
    .then((docs) => {
      setTimeout(() => { res.status(200).json(docs) }, 0);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* GET ONE */
exports.devices_get_one = (req, res, next) => {
  const _id = req.params.id;
  Device.findById(_id)
    .select('_id id url name description resolution bt_address mac_address bt_address display userGroup created_by created_at updated_at')
    .populate('display', '_id url name')
    .populate('gateway', '_id url name')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .populate('resolution', '_id url name')
    .populate('location', '_id url name')
    .populate('userGroup', '_id url name')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({message: 'No valid entry found for provided id'});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* POST */
exports.device_create = (req, res, next) => {
  const { id, name, description, created_by, resolution, mac_address, bt_address, gateway, userGroup } = req.body;
  console.log(req.body);
  // create a new id for the device
  const _id = new mongoose.Types.ObjectId();
  // create userGroup and gateway id from data received
  const u_id = mongoose.Types.ObjectId(userGroup);
  const g_id = mongoose.Types.ObjectId(gateway);
  const device = new Device({
    _id: _id,
    url: 'http://localhost:4000/devices/' + _id,
    id: id,
    name: name,
    description: description,
    resolution: resolution,
    gateway: gateway,
    created_by: created_by,
    mac_address: mac_address,
    bt_address: bt_address,
    userGroup: userGroup,
  });

  device
    .save()
    // update userGroups involved
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { devices: _id } }) }) // add the device to the selected userGroup
    // update gateways involved
    .then(() => { return Gateway.update({ _id: g_id }, { $addToSet: { devices: _id } }) }) // add the device to selected images
    // send response
    .then((res) => Device.findById(_id).exec())
    .then((doc) => {
      const result = {
        _id: doc._id,
        url: doc.url,
        id: doc.id,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
      }
      res.status(201).json({
        message: 'Success at adding a new device to the collection',
        success: true,
        result: result
      });
    })
    // catch any errors
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* PUT */
exports.device_update = (req, res, next) => {
  // get the id from the request for the query
  const _id = req.params.id;
  // get userGroup id from the request
  const { userGroup, gateway } = req.body;
  // create userGroup id from data received
  const u_id = mongoose.Types.ObjectId(userGroup);
  const g_id = mongoose.Types.ObjectId(gateway);
  // update the device based on its id
  Device
    // update device
    .findOneAndUpdate({ _id: _id }, { $set: req.body }, { new: true })
    // update gateways involved
    .then(() => { return Gateway.updateMany({ device: _id }, { $pull: { devices: _id } }) }) // remove the device from all gateways that have its ref
    .then(() => { return Gateway.update({ _id: d_id }, { $set: { display: _id } }) }) // add the device to selected gateways
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ devices: _id }, { $pull: { devices: _id } }) }) // remove the display from all userGroups that have its ref
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { devices: _id } }) }) // add the display to the selected userGroup
    // send response
    .then((res) => Device.findById(_id).exec())
    .then(doc => {
      const result = {
        _id: doc._id,
        url: doc.url,
        id: doc.id,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
      }
      res.status(200).json({
        message: 'Success at updating a device from the collection',
        success: true,
        result: result
      });
    })
    // catch any errors
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* DELETE */
exports.device_delete = (req, res, next) => {
  const _id = req.params.id;
  Device
    .remove({_id: _id})
    .then((res) => result = res)
    // update gateways involved
    .then(() => { return Gateway.updateMany({ devices: _id }, { $pull: { devices: _id } }) }) // remove the device from all gateways that have its ref
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ devices: _id }, { $pull: { devices: _id } }) }) // remove the device from all userGroups that have its ref
    // send response
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
