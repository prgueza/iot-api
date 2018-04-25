const mongoose = require('mongoose')

/* DATA MODELS */
const Screen = require('../models/screen.js')
const Image = require('../models/image.js')
const Group = require('../models/group.js')
const Device = require('../models/device.js')

/* GET ALL */
exports.screens_get_all = (req, res, next) => {
  Screen.find()
    .select('_id url name description screen_code color_profile size created_at')
    .exec()
    .then(docs => res.status(200).json(docs))
    .catch(err => res.status(500).json({error: err}))
}

/* GET ONE */
exports.screens_get_one = (req, res, next) => {
  Screen.findById(req.params.id)
    .select('_id url name description screen_code color_profile size created_at')
    .exec()
    .then(docs => res.status(200).json(docs))
    .catch(err => res.status(500).json({error: err}))
}

/* POST */
exports.screen_create = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    const { name, description, size, screen_code, color_profile } = req.body
    const _id = new mongoose.Types.ObjectId()
    const screen = new Screen({
      _id: _id,
      url: process.env.API_URL + 'resolutions/' + _id,
      name: name,
      description: description,
      screen_code: screen_code,
      color_profile: color_profile,
      size: size,
    })

    screen
      .save()
      .then(result => {
        res.status(201).json({
          message: 'Resolution created',
          createdResolution: {
            _id: result._id,
            url: result.url
            name: result.name,
            description: result.description,
            screen_code: result.screen_code,
            color_profile: result.color_profile,
            size: result.size,
          }
        })
      })
      .catch(err => res.status(500).json({error: err}))
  }
}

/* PUT */
exports.screen_update = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    Screen
      .update({ _id: req.params.id }, { $set: req.body })
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: err}))
  }
}

/* DELETE */
exports.screen_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    Screen
      .remove({_id: req.params.id})
      .exec()
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: err}))
  }
}
