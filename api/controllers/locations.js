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
      .then(doc => {
        res.status(201).json({
          message: 'Success at adding a location from the collection',
          success: true,
          resourceId: doc._id,
          resource: {
            '_id': doc._id,
            'url': doc.url,
            'name': doc.name,
            'description': doc.description,
            'created_at': doc.created_at,
            'updated_at': doc.updated_at
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
      .findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
      .then(doc => res.status(200).json({
        message: 'Success at updating an usergroup from the collection',
        success: true,
        resourceId: req.params.id,
        resource: doc
      }))
      .catch(err => res.status(500).json({ error: err }))
  }
}

/* DELETE */
exports.location_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ messgae: 'Not allowed' })
  } else {
    Location
      .findByIdAndRemove({_id: req.params.id})
      .exec()
      .then(doc => res.status(200).json({
        message: 'Success at removing a location from the collection',
        success: true,
        resourceId: req.params.id,
        resource: doc
      }))
      .catch(err => res.status(500).json({ error: err }) )
  }
}
