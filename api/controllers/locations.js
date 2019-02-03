/* DATA MODELS */
const Location = require('../models/location.js');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL */
exports.locationsGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const location = await Location.find()
        .select(SELECTION.locations.short)
        .exec();
      res.status(200).json({ location });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE */
exports.locationsGetOne = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const location = await Location.findById(req.params.id)
        .select(SELECTION.locations.long)
        .exec();
      if (location) {
        res.status(200).json({ location });
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* POST */
exports.locationCreate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const { body } = req;
      const location = new Location(body);
      const { _id } = await location.save();
      const newLocation = await Location.findById(_id).select(SELECTION.locations.short);
      res.status(201).json({
        message: 'Success at adding a location from the collection',
        notify: `${newLocation.name} añadida`,
        success: true,
        resourceId: newLocation._id,
        resource: newLocation,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* PUT */
exports.locationUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const location = await Location.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true }).select(SELECTION.locations.short);
      if (location) {
        res.status(200).json({
          message: 'Success at updating an usergroup from the collection',
          notify: `${location.name} actualizada`,
          success: true,
          resourceId: req.params.id,
          resource: location,
        });
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* DELETE */
exports.locationDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const { id } = req.params;
      const location = await Location.findById(id);
      await location.remove();
      if (location) {
        res.status(200).json({
          message: 'Success at removing a location from the collection',
          notify: `${location.name} eliminada`,
          success: true,
          resourceId: req.params.id,
          resource: location,
        });
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};
