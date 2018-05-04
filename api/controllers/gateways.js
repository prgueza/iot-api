const mongoose = require('mongoose')

/* DATA MODELS */
const Gateway = require('../models/gateway')
const Device = require('../models/device')

/* GET ALL */
exports.gateways_get_all = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    Gateway.find()
      .select('_id url sync_url name ip mac port description created_at updated_at')
      .exec()
      .then(docs => {
        console.log(docs)
        setTimeout(() => { res.status(200).json(docs) }, 0)
        // setTimeout(() => { res.status(500).json({error: 'forced error'}) }, 0)
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({error: err})
      })
  }
}

/* GET ONE */
exports.gateways_get_one = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    const _id = req.params.id
    Gateway.findById(_id)
    .select('_id url name description ip mac port created_by created_at updated_at')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .populate('location', '_id url name')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc)
      } else {
        res.status(404).json({message: 'No valid entry found for provided id'})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
  }
}

/* POST */
exports.gateway_create = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    // get data for new gateway
    const { name, description, location, created_by, mac, ip, port } = req.body
    // create a new id for the gateway
    const _id = new mongoose.Types.ObjectId()
    // create devices ids from data received
    const d_ids = devices && devices.map((d) => mongoose.Types.ObjectId(d))
    // build the new gateway from its model
    const gateway = new Gateway({
      _id: _id,
      url: process.env.API_URL + 'gateways/' + _id,
      sync_url: 'http://' + ip + ':' + port + '/devices',
      id: id,
      name: name,
      description: description,
      location: location,
      created_by: created_by,
      mac: mac,
      ip: ip,
      port: port
    })
    // save gateway
    gateway
    .save()
    // send response
    .then((res) => Gateway.findById(_id).exec())
    .then((doc) => {
      const result = {
        _id: doc._id,
        url: doc.url,
        name: doc.name,
        description: doc.description,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        ip: doc.ip,
        mac: doc.mac,
      }
      res.status(201).json({
        message: 'Success at adding a new gateway to the collection',
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

/* PUT */
exports.gateway_update = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    // get _id from params
    const _id = req.params.id
    if ( req.body.port ) { req.body.sync_url = 'http://' + req.body.ip + ':' + req.body.port + '/devices' }
    // update gateway
    Gateway
    .update({ _id: _id }, { $set: req.body })
    // send response
    .then(result => {
      console.log(result)
      res.status(200).json(result)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
  }
}

/* DELETE */
exports.gateway_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    const _id = req.params.id
    Gateway
    .remove({_id: _id})
    .exec()
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
