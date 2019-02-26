const mongoose = require('mongoose');

/* DATA MODELS */
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL */
exports.displaysGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const displays = await Display.find()
        .select(SELECTION.displays.short)
        .populate('device', SELECTION.devices.populate)
        .exec();
      res.status(200).json(displays);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE */
exports.displaysGetOne = async (req, res) => {
  try {
    const _id = req.params.id;
    const query = req.AuthData.admin
      ? { _id }
      : { _id, userGroup: req.AuthData.userGroup };
    const display = await Display.findOne(query)
      .select(SELECTION.displays.long)
      .populate('activeImage', SELECTION.images.populate)
      .populate('userGroup', SELECTION.userGroups.populate)
      .populate('images', SELECTION.images.populate)
      .populate('createdBy', SELECTION.users.populate)
      .populate('updatedBy', SELECTION.users.populate)
      .populate({
        path: 'device',
        select: SELECTION.devices.populate,
        populate: [{
          path: 'gateway',
          select: SELECTION.gateways.populate,
          populate: {
            path: 'location',
            select: SELECTION.locations.populate,
          },
        }],
      })
      .populate({
        path: 'group',
        select: SELECTION.groups.populate,
        populate: [{
          path: 'activeImage',
          select: SELECTION.images.populate,
        }],
      })
      .exec();
    if (display) {
      res.status(200).json(display);
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* POST */
exports.displayCreate = async (req, res) => {
  try {
    const {
      body,
    } = req;
    // set new properties to the body object
    body.activeImage = body.image;
    body.userGroup = req.AuthData.userGroup;
    // build the new display from its model
    const display = new Display(body);
    // Save the display
    await display.save();
    // Get the display and the device
    const response = await Promise.all([
      Display.find(display._id)
        .select(SELECTION.displays.short)
        .populate('device', SELECTION.devices.populate)
        .exec(),
      Device.find({ userGroup: req.AuthData.userGroup })
        .select(SELECTION.devices.short)
        .populate('display', SELECTION.displays.populate)
        .exec(),
    ]);
    // Send the response
    res.status(201).json({
      message: 'Success at adding a new display to the collection',
      success: true,
      resourceId: display._id,
      resource: response[0][0],
      devices: response[1],
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};


/* UPDATE (PUT) */
exports.displayUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      images,
    } = req.body;
    const { body } = req;
    body.lastUpdateResult = false;
    const imageIds = images && images.map(image => mongoose.Types.ObjectId(image));
    const display = await Display.findByIdAndUpdate(id, { $set: body }, { new: true })
      .select(SELECTION.displays.short)
      .populate('activeImage', SELECTION.images.populate)
      .populate('device', SELECTION.devices.populate);
    if (display) {
      if (imageIds) await Image.updateMany({ _id: { $in: imageIds } }, { $addToSet: { displays: id } }).exec();
      const devices = await Device.find()
        .select(SELECTION.devices.short)
        .populate('display', '_id url name description')
        .exec();
      res.status(201).json({
        message: 'Success at updating a display from the collection',
        notify: `'${display.name}' actualizado`,
        success: true,
        resourceId: id,
        resource: display,
        devices,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* DELETE */
exports.displayDelete = async (req, res) => {
  try {
    const _id = req.params.id;
    const query = req.AuthData.admin
      ? { _id }
      : { _id, userGroup: req.AuthData.userGroup };
    const display = await Display.findOne(query).remove();
    if (display) {
      const devices = await Device.find().select(SELECTION.devices.short).exec();
      res.status(200).json({
        message: 'Success at removing a display from the collection',
        success: true,
        resourceId: _id,
        devices,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(MESSAGE[500](error));
  }
};
