/* DATA MODELS */
const Screen = require('../models/screen.js');
const Selections = require('./select');

/* GET ALL */
exports.screensGetAll = async (req, res) => {
  try {
    const screens = await Screen.find()
      .select(Selections.screens.short)
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
      .select(Selections.screens.long)
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
      const screen = new Screen(body);
      const { _id } = await screen.save();
      const newScreen = await Screen.findById(_id).select(Selections.screens.short);
      res.status(201).json({
        message: 'Success at adding a screen from the collection',
        notify: `${newScreen.name} añadida`,
        success: true,
        resourceId: newScreen._id,
        resource: newScreen,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      notify: 'Compruebe que ha rellenado los campos',
      error,
    });
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
      const screen = await Screen.findByIdAndUpdate(id, { $set: body }, { new: true }).select(Selections.screens.short);
      if (screen) {
        res.status(200).json({
          message: 'Success at updating a screen from the collection',
          notify: `${screen.name} actualizada`,
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
      const screen = await Screen.findByIdAndRemove(id);
      if (screen) {
        res.status(200).json({
          message: 'Success at removing a screen from the collection',
          notify: `${screen.name} eliminada`,
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
