const mongoose = require('mongoose');
const axios = require('axios');

/* DATA MODELS */
const Device = require('../models/device');
const Gateway = require('../models/gateway');
const UserGroup = require('../models/userGroup');

/* GET */
exports.update = (req, res, next) => {

  var old_devices = [];
  var new_devices = [];
  var data = [];

  Device.find()
    .select('_id mac')
    .exec()
    .then((docs) => old_devices = docs.map((doc) => doc._id))
    .then(() => { return axios.get('http://localhost:5000/devices')
      .then((response) =>{
        // TODO: when there are more than one gateway merge the response and use as gateway for any device the result with better signal
        data = response;
        return new_devices = response.data.devices;
      })
    })
    .then(() => { return Device.updateMany({ _id: { $in: old_devices } }, { found: false }) })
    .then(() => { return Gateway.findOne({ ip_address: data.data.gateway_ip }) })
    .then((gateway) => {
      var bulk_ops = [];
      for (var i = 0; i < new_devices.length; i++){
        var update_body = new_devices[i];
        update_body.found = true;
        update_body.gateway = gateway._id;
        bulk_ops[i] = {
          updateOne: {
              filter: { mac: new_devices[i].mac },
              update: update_body,
              upsert: true
          }
        }
      }
      return Device.bulkWrite(bulk_ops);
    })
    .then(() => Device.find()
      .select('_id url name description mac found batt rssi initcode created_at updated_at gateway')
      .populate('gateway', '_id name description url')
      .exec()
      .then((docs) => {
        return res.status(200).json(
          docs.map((doc) => {
            doc.url = 'http://localhost:4000/devices/' + doc._id;
            return doc;
          })
      )})
    )
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
