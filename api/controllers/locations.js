const mongoose = require('mongoose');

/* DATA MODELS */
const Location = require('../models/location.js');

/* GET ALL */
exports.locationsGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const location = await Location.find()
        .select('_id url name description createdAt')
        .exec();
      res.status(200).json({ location });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.locationsGetOne = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const location = await Location.findById(req.params.id)
        .select('_id url name description createdAt')
        .exec();
      if (location) {
        res.status(200).json({ location });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.locationCreate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const _id = new mongoose.Types.ObjectId();
      const { body } = req;
      body.url = `${process.env.API_URL}locations/${_id}`;
      body._id = _id;
      const location = new Location(body);
      const newLocation = await location.save();
      res.status(201).json({
        message: 'Success at adding a location from the collection',
        success: true,
        resourceId: _id,
        resource: newLocation,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.locationUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const location = await Location.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
      if (location) {
        res.status(200).json({
          message: 'Success at updating an usergroup from the collection',
          notify: `Localización '${location.name}' actualizada`,
          success: true,
          resourceId: req.params.id,
          resource: location,
        });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.locationDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ messgae: 'Not allowed' });
    } else {
      const location = await Location.findByIdAndRemove({ _id: req.params.id }).exec();
      if (location) {
        res.status(200).json({
          message: 'Success at removing a location from the collection',
          success: true,
          resourceId: req.params.id,
          resource: location,
        });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};
