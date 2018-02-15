const mongoose = require('mongoose');

/* DATA MODELS */
const Gateway = require('../models/gateway');
const Device = require('../models/device');

/* GET ALL */
exports.gateways_get_all = (req, res, next) => {
  Gateway.find()
    .select('_id id name description url created_at updated_at ip_address mac_address')
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
            created_at: doc.created_at,
            updated_at: doc.updated_at,
            ip_address: doc.ip_address,
            mac_address: doc.mac_address,
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
exports.gateways_get_one = (req, res, next) => {
  const _id = req.params.id;
  Gateway.findById(_id)
    .select('_id id url name description created_by created_at updated_at ip_address mac_address devices')
    .populate('devices', '_id id url name')
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
exports.gateway_create = (req, res, next) => {
  // get data for new gateway
  const { id, name, description, location, created_by, mac_address, ip_address, devices } = req.body;
  // create a new id for the gateway
  const _id = new mongoose.Types.ObjectId();
  // create devices ids from data received
  const d_ids = devices && devices.map((d) => mongoose.Types.ObjectId(d));
  // build the new gateway from its model
  const gateway = new Gateway({
    _id: _id,
    url: 'http://localhost:4000/gateways/' + _id,
    id: id,
    name: name,
    description: description,
    location: location,
    devices: devices,
    created_by: created_by,
    mac_address: mac_address,
    ip_address: ip_address,
  });
  // save gateway
  gateway
    .save()
    // update devices involved
    .then(() => {
      Device
        // add the gateway id to the device array
        .updateMany({ _id: { $in: d_ids } }, { $set: { gateway: _id } })
        .then(doc => console.log(doc))
    })
    // send a response to the app
    .then((res) => Gateway.findById(_id).exec())
    .then((doc) => {
      const result = {
        _id: doc._id,
        url: doc.url,
        id: doc.id,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        ip_address: doc.ip_address,
        mac_address: doc.mac_address,
      }
      res.status(201).json({
        message: 'Success at adding a new gateway to the collection',
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
exports.gateway_update = (req, res, next) => {
  const _id = req.params.id;
  Gateway
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
exports.gateway_delete = (req, res, next) => {
  const _id = req.params.id;
  Gateway
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
