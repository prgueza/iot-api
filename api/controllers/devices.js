const mongoose = require('mongoose')

/* DATA MODELS */
const Device = require('../models/device')
const Display = require('../models/display')
const Gateway = require('../models/gateway')
const UserGroup = require('../models/userGroup')

/* GET ALL */
exports.devices_get_all = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    Device.find()
    .select('_id url name description gateway mac found batt rssi screen initcode created_at updated_at')
    .populate('gateway', '_id url name mac')
    .exec()
    .then((docs) => {
      return res.status(200).json(
        docs.map((doc) => {
          doc.url = process.env.API_URL + 'devices/' + doc._id
          return doc
        })
    )})
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
  }
}

/* GET ONE */
exports.devices_get_one = (req, res, next) => {
  const _id = req.params.id
  Device.findById(_id)
  .select('_id url name description mac mac found batt rssi initcode screen display userGroup created_by created_at updated_at')
  .populate('display', '_id url name')
  .populate('gateway', '_id url name')
  .populate('created_by', '_id url name')
  .populate('updated_by', '_id url name')
  .populate('resolution', '_id url name')
  .populate('location', '_id url name')
  .populate('userGroup', '_id url name')
  .exec()
  .then(doc => {
    if (doc && ((doc.userGroup && req.AuthData.userGroup == doc.userGroup._id) || req.AuthData.admin)) { // if the user can manage the device or if the user is an admin
      doc.url = process.env.API_URL + 'devices/' + doc._id
      res.status(200).json(doc)
    } else if (!req.AuthData.admin) { // if the user can't manage the device and isn't an admin
      res.status(401).json({error: 'Not allowed'})
    } else { // if the id provided for the device doesn't match any
      res.status(404).json({message: 'No valid entry found for provided id'})
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: err})
  })
}

/* PUT */
exports.device_update = (req, res, next) => {
  if (!req.checkAuth.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    // get the id from the request for the query
    const _id = req.params.id
    // get userGroup id from the request
    const { userGroup, gateway } = req.body
    // create userGroup id from data received
    const u_id = mongoose.Types.ObjectId(userGroup)
    const g_id = mongoose.Types.ObjectId(gateway)
    // update the device based on its id
    if (!req.body.userGroup) req.body.userGroup = undefined
    Device
    // update device
    .findOneAndUpdate({ _id: _id }, { $set: req.body }, { new: true })
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ devices: _id }, { $pull: { devices: _id } }) }) // remove the display from all userGroups that have its ref
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { devices: _id } }) }) // add the display to the selected userGroup
    // send response
    .then((res) => Device.findById(_id).exec())
    .then(doc => {
      const result = {
        _id: doc._id,
        url: doc.url,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
      }
      res.status(200).json({
        message: 'Success at updating a device from the collection',
        success: true,
        result: result
      })
    })
    // catch any errors
    .catch(err => {
      console.log(err)
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      })
    })
  }
}

/* DELETE */
exports.device_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    const _id = req.params.id
    Device
    .remove({_id: _id})
    .then((res) => result = res)
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ devices: _id }, { $pull: { devices: _id } }) }) // remove the device from all userGroups that have its ref
    // send response
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
  }
}
