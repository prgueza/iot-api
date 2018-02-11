const mongoose = require('mongoose');

/* DATA MODELS */
const Device = require('../models/device');
const Display = require('../models/display');
const Gateway = require('../models/gateway');

/* GET ALL */
exports.devices_get_all = (req, res, next) => {
  Device.find()
    .select('_id id name description url mac_address ip_address created_at updated_at')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        data: docs.map((doc) => {
          return{
            _id: doc._id,
            url: doc.url,
            id: doc.id,
            name: doc.name,
            description: doc.description,
            mac_address: doc.mac_address,
            ip_address: doc.ip_address,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          }
        })
      }
      console.log(response);
      setTimeout(() => { res.status(200).json(response) }, 0);
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
    .select('_id id url name description ip_address mac_address created_by created_at updated_at')
    .populate('display', '_id url name')
    .populate('gateway', '_id url name')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .populate('location', '_id url name')
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
  const { id, name, description, location, user, mac_address, ip_address, display, gateway, status } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const device = new Device({
    _id: _id,
    url: 'http://localhost:4000/devices/' + _id,
    id: id,
    name: name,
    description: description,
    location: location,
    display: display,
    gateway: gateway,
    user: user,
    mac_address: mac_address,
    ip_address: ip_address,
  });

  device
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Device created',
        createdDevice: {
          _id: result._id,
          id: result.id,
          name: result.name,
          description: result.description,
          url: 'http://localhost:4000/devices/' + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* PUT */
exports.device_update = (req, res, next) => {
  const _id = req.params.id;
  Device
    .update({ _id: _id }, { $set: req.body })
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* DELETE */
exports.device_delete = (req, res, next) => {
  const _id = req.params.id;
  Device
    .remove({_id: _id})
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
