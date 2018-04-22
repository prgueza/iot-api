const mongoose = require('mongoose');

/* DATA MODELS */
const Screen = require('../models/screen.js');
const Image = require('../models/image.js');
const Group = require('../models/group.js');
const Device = require('../models/device.js');


// TODO: filter response and write missing methods

/* GET ALL */
exports.screens_get_all = (req, res, next) => {
  Screen.find()
    .select('_id url name description screen_code color_profile size created_at')
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* GET ONE */
exports.screens_get_one = (req, res, next) => {
  const _id = req.params.id;
  Screen.findById(_id)
    .select('_id url name description screen_code color_profile size created_at')
    .exec()
    .then(docs => {
      console.log(docs);
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* POST */
exports.screen_create = (req, res, next) => {
  const { name, description, size, screen_code, color_profile } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const screen = new Screen({
    _id: _id,
    url: process.env.API_URL + 'resolutions/' + _id,
    name: name,
    description: description,
    screen_code: screen_code,
    color_profile: color_profile,
    size: size,
  });

  screen
    .save()
    .then(result => {
      console.log(result);
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
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });}

/* PUT */
exports.screen_update = (req, res, next) => {
  const _id = req.params.id;
  Screen
    .update({ _id: _id }, { $set: req.body })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* DELETE */
exports.screen_delete = (req, res, next) => {
  const _id = req.params.id;
  Screen
    .remove({_id: _id})
    .exec()
    // update devices involved
    .then(() => { return Device.updateMany({ screen: _id }, { $unset: { screen: null } }) })
    // update images involved
    .then(() => { return Image.updateMany({ screen: _id }, { $unset: { screen: null } }) })
    // update groups involved
    .then(() => { return Group.updateMany({ screen: _id }, { $unset: { screen: null } }) })
    // send response
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
