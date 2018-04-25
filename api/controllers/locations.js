const mongoose = require('mongoose')

/* DATA MODELS */
const Location = require('../models/location.js')
const Gateway = require('../models/gateway.js')

// TODO: filter response and write missing methods

/* GET ALL */
exports.locations_get_all = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ message: 'Not allowed' })
  } else {
    Location.find()
      .select('_id url name description created_at')
      .exec()
      .then(docs => res.status(200).json(docs) )
      .catch(err => res.status(500).json({error: err}) )
  }
}

/* GET ONE */
exports.locations_get_one = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ message: 'Not allowed' })
  } else {
    Location.findById(req.params.id)
      .select('_id url name description created_at')
      .exec()
      .then(docs => res.status(200).json(docs) )
      .catch(err => res.status(500).json({error: err}) )
  }
}

/* POST */
exports.location_create = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ message: 'Not allowed' })
  } else {
    const _id = new mongoose.Types.ObjectId()
    const location = new Location({
      _id: _id,
      url: process.env.API_URL + 'locations/' + _id,
      name: req.body.name,
      description: req.body.description,
    })

    location
      .save()
      .then(result => {
        res.status(201).json({
          message: 'Location created',
          createdLocation: {
            _id: result._id,
            name: result.name,
            description: result.description,
            url: result.url
          }
        })
      })
      .catch(err => res.status(500).json({ error: err }))
  }
}

/* PUT */
exports.location_update = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ message: 'Not allowed' })
  } else {
    Location
      .update({ _id: req.params.id }, { $set: req.body })
      .then(result => res.status(200).json(result) )
      .catch(err => res.status(500).json({ error: err }))
  }
}

/* DELETE */
exports.location_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ messgae: 'Not allowed' })
  } else {
    Location
      .remove({_id: req.params.id})
      .exec()
      .then(result => res.status(200).json(result) )
      .catch(err => res.status(500).json({ error: err }) )
  }
}
