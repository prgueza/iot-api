const mongoose = require('mongoose');

/* DATA MODELS */
const Location = require('../models/location.js');
const Gateway = require('../models/gateway.js');

// TODO: filter response and write missing methods

/* GET ALL */
exports.locations_get_all = (req, res, next) => {
  Location.find()
    .select('_id url name description created_at')
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
exports.locations_get_one = (req, res, next) => {
  const _id = req.params.id;
  Location.findById(_id)
    .select('_id url name description created_at')
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* POST */
exports.location_create = (req, res, next) => {
  const { name, description } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const location = new Location({
    _id: _id,
    url: 'http://localhost:4000/locations/' + _id,
    name: name,
    description: description,
  });

  location
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Location created',
        createdLocation: {
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
    });
}

/* PUT */
exports.location_update = (req, res, next) => {
  const _id = req.params.id;
  Location
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
exports.location_delete = (req, res, next) => {
  Location
    .remove({_id: req.params.id})
    .exec()
    // update gateways involved
    .then(() => { return Gateway.updateMany({ location: _id }, { $unSet: { location: "" } }) })
    // send response
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
