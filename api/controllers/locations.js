/* DATA MODELS */
const Location = require('../models/location.js');
const Selections = require('./select');

/* GET ALL */
exports.locationsGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const location = await Location.find()
        .select(Selections.locations.short)
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
        .select(Selections.locations.long)
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
      const { body } = req;
      const location = new Location(body);
      const { _id } = await location.save();
      const newLocation = await Location.findById(_id).select(Selections.locations.short);
      res.status(201).json({
        message: 'Success at adding a location from the collection',
        success: true,
        resourceId: newLocation._id,
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
      const location = await Location.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true }).select(Selections.locations.short);
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
      const { id } = req.params;
      const location = await Location.findById(id).remove();
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
