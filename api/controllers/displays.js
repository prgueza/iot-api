const mongoose = require('mongoose');

/* DATA MODELS */
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');
const Selections = require('./select');

/* GET ALL */
exports.displaysGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const displays = await Display.find()
        .select(Selections.displays.short)
        .populate('device', Selections.devices.populate)
        .exec();
      res.status(200).json(displays);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
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
      .select(Selections.displays.long)
      .populate('activeImage', Selections.images.populate)
      .populate('userGroup', Selections.userGroups.populate)
      .populate('images', Selections.images.populate)
      .populate('createdBy', Selections.users.populate)
      .populate('updatedBy', Selections.users.populate)
      .populate({
        path: 'device',
        select: Selections.devices.populate,
        populate: [{
          path: 'gateway',
          select: Selections.gateways.populate,
          populate: {
            path: 'location',
            select: Selections.locations.populate,
          },
        }],
      })
      .populate({
        path: 'group',
        select: Selections.groups.populate,
        populate: [{
          path: 'activeImage',
          select: Selections.images.populate,
        }],
      })
      .exec();
    if (display) {
      res.status(200).json(display);
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id within the given user group' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
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
        .select(Selections.displays.short)
        .populate('device', Selections.devices.populate)
        .exec(),
      Device.find({ userGroup: req.AuthData.userGroup })
        .select(Selections.devices.short)
        .populate('display', Selections.displays.populate)
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
    res.status(500).json(error);
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
      .select(Selections.displays.short)
      .populate('activeImage', Selections.images.populate)
      .populate('device', Selections.device.populate);
    if (display) {
      if (imageIds) await Image.updateMany({ _id: { $in: imageIds } }, { $addToSet: { displays: id } }).exec();
      const devices = await Device.find()
        .select(Selections.devices.short)
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
      res.status(404).json({ message: `No valid entry for provided id: ${id}` });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
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
      const devices = await Device.find().select(Selections.devices.short).exec();
      res.status(200).json({
        message: 'Success at removing a display from the collection',
        success: true,
        resourceId: _id,
        devices,
      });
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
