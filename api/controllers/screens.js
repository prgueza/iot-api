const mongoose = require('mongoose');

/* DATA MODELS */
const Screen = require('../models/screen.js');

/* GET ALL */
exports.screensGetAll = async (req, res) => {
  try {
    const screens = await Screen.find()
      .select('_id url name description screenCode colorProfile size createdAt')
      .exec();
    res.status(200).json(screens);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.screensGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findById(id)
      .select('_id url name description screenCode colorProfile size createdAt')
      .exec();
    if (screen) {
      res.status(200).json(screen);
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.screenCreate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { body } = req;
      const _id = new mongoose.Types.ObjectId();
      body.url = `${process.env.API_URL}resolutions/${_id}`;
      body._id = _id;
      const screen = new Screen(body);
      const newScreen = await screen.save();
      res.status(201).json({
        message: 'Success at adding a screen from the collection',
        notify: 'Se ha creado un nuevo tamaño de pantalla',
        success: true,
        resourceId: _id,
        resource: newScreen,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.screenUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { params: { id } } = req;
      const { body } = req;
      const screen = await Screen.findByIdAndUpdate(id, { $set: body }, { new: true });
      if (screen) {
        res.status(200).json({
          message: 'Success at updating a screen from the collection',
          notify: `Pantalla '${screen.name}' actualizada`,
          success: true,
          resourceId: id,
          resource: screen,
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
exports.screenDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { id } = req.params;
      const screen = await Screen.findByIdAndRemove(id).exec();
      if (screen) {
        res.status(200).json({
          message: 'Success at removing a screen from the collection',
          success: true,
          resourceId: id,
          resource: screen,
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
