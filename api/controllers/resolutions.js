const mongoose = require('mongoose');

/* DATA MODELS */
const Resolution = require('../models/resolution.js');
const Image = require('../models/image.js');
const Group = require('../models/group.js');
const Device = require('../models/device.js');


// TODO: filter response and write missing methods

/* GET ALL */
exports.resolutions_get_all = (req, res, next) => {
  Resolution.find()
    .select('_id url name description size created_at')
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
exports.resolutions_get_one = (req, res, next) => {
  const _id = req.params.id;
  Resolution.findById(_id)
    .select('_id url name description size created_at')
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
exports.resolution_create = (req, res, next) => {
  const { name, description, size } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const resolution = new Resolution({
    _id: _id,
    url: 'http://localhost:4000/locations/' + _id,
    name: name,
    description: description,
    size: size,
  });

  resolution
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Resolution created',
        createdResolution: {
          _id: result._id,
          name: result.name,
          description: result.description,
          url: 'http://localhost:4000/location/' + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });}

/* PUT */
exports.resolution_update = (req, res, next) => {
  const _id = req.params.id;
  Resolution
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
exports.resolution_delete = (req, res, next) => {
  Resolution
    .remove({_id: req.params.id})
    .exec()
    // update devices involved
    .then(() => { return Device.updateMany({ resolution: _id }, { $unSet: { resolution: "" } }) })
    // update images involved
    .then(() => { return Image.updateMany({ resolution: _id } }, { $unSet: { resolution: "" } }) })
    // update groups involved
    .then(() => { return Group.updateMany({ resolution: _id } }, { $unSet: { resolution: "" } }) })
    // send response
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
