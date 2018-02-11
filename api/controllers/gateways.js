const mongoose = require('mongoose');

/* DATA MODELS */
const Gateway = require('../models/gateway');
const Device = require('../models/device');

/* GET ALL */
exports.gateways_get_all = (req, res, next) => {
  Gateway.find()
    .select('_id id name description url created_at updated_at')
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
    .select('_id id url name description created_by created_at updated_at')
    .populate('devices_linked', '_id id url name descrption created_at')
    .populate('devices_in_range', '_id id url name descrption created_at')
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
  const { id, name, description, location, user, mac, devices_linked, devices_in_range } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const gateway = new Gateway({
    _id: _id,
    url: 'http://localhost:4000/gateways/' + _id,
    id: id,
    name: name,
    description: description,
    location: location,
    devices_linked: devices_linked,
    devices_in_range: devices_in_range,
    user: user,
    mac_address: mac,
  });

  gateway
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Gateway created',
        createdGateway: {
          _id: result._id,
          id: result.id,
          name: result.name,
          description: result.description,
          url: 'http://localhost:4000/gateways/' + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
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
