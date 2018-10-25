const mongoose = require('mongoose');

/* DATA MODELS */
const Screen = require('../models/screen.js');

/* GET ALL */
exports.screensGetAll = (req, res) => {
  Screen.find()
    .select('_id url name description screenCode colorProfile size createdAt')
    .exec()
    .then(docs => res.status(200)
      .json(docs))
    .catch(err => res.status(500)
      .json({ error: err }));
};

/* GET ONE */
exports.screensGetOne = (req, res) => {
  Screen.findById(req.params.id)
    .select('_id url name description screenCode colorProfile size createdAt')
    .exec()
    .then(docs => res.status(200)
      .json(docs))
    .catch(err => res.status(500)
      .json({ error: err }));
};

/* POST */
exports.screenCreate = (req, res) => {
  if (!req.AuthData.admin) {
    res.status(401)
      .json({ message: 'Not allowed' });
  } else {
    const {
      name, description, size, screenCode, colorProfile,
    } = req.body;
    const _id = new mongoose.Types.ObjectId();
    const screen = new Screen({
      _id,
      url: `${process.env.API_URL}resolutions/${_id}`,
      name,
      description,
      screenCode,
      colorProfile,
      size,
    });

    screen
      .save()
      .then((doc) => {
        res.status(201)
          .json({
            message: 'Success at adding a screen from the collection',
            success: true,
            resourceId: doc._id,
            resource: {
              _id: doc._id,
              url: doc.url,
              name: doc.name,
              description: doc.description,
              size: doc.size,
              screenCode: doc.screenCode,
              updatedAt: doc.updatedAt,
              createdAt: doc.createdAt,
            },
          });
      })
      .catch(err => res.status(500)
        .json({ error: err }));
  }
};

/* PUT */
exports.screenUpdate = (req, res) => {
  if (!req.AuthData.admin) {
    res.status(401)
      .json({ message: 'Not allowed' });
  } else {
    Screen
      .findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
      .then(doc => res.status(200)
        .json({
          message: 'Success at updating a screen from the collection',
          notify: `Pantalla '${doc.name}' actualizada`,
          success: true,
          resourceId: req.params.id,
          resource: doc,
        }))
      .catch(err => res.status(500)
        .json({ error: err }));
  }
};

/* DELETE */
exports.screenDelete = (req, res) => {
  if (!req.AuthData.admin) {
    res.status(401)
      .json({ message: 'Not allowed' });
  } else {
    Screen
      .findByIdAndRemove({ _id: req.params.id })
      .exec()
      .then(doc => res.status(200)
        .json({
          message: 'Success at removing a screen from the collection',
          success: true,
          resourceId: req.params.id,
          resource: doc,
        }))
      .catch(err => res.status(500)
        .json({ error: err }));
  }
};
