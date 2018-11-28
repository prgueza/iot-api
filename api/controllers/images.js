const mongoose = require('mongoose');
const fs = require('fs');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const Selections = require('./select');

/* GET ALL */
exports.imagesGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const image = await Image.find()
        .select(Selections.images.short)
        .exec();
      if (image) {
        res.status(200).json(image);
      } else {
        res.status(404).json({ message: 'Not valid entry for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.imagesGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const image = await Image.findById(query)
      .select(Selections.images.long)
      .populate('displays', Selections.displays.populate)
      .populate('groups', Selections.groups.populate)
      .populate('resolution', Selections.screens.populate)
      .populate('created_by', Selections.screens.populate)
      .populate('updated_by', Selections.users.populate)
      .populate('userGroup', Selections.userGroups.populate)
      .exec();
    if (image) {
      res.status(200).json(image);
    } else {
      res.status(404).json({ message: 'Not valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.imageCreate = async (req, res) => {
  try {
    const {
      body, body: { displays, groups },
    } = req;
    const displaysIds = displays && displays.map(d => mongoose.Types.ObjectId(d));
    const groupsIds = groups && groups.map(g => mongoose.Types.ObjectId(g));
    body.size = 0; // TODO: get from file
    body.userGroup = req.AuthData.userGroup;
    const image = new Image(body);
    const newImage = await image.save().select(Selections.images.short);
    const pushPromises = [];
    if (image) {
      if (displaysIds) {
        pushPromises.push((Display.updateMany({ _id: { $in: displaysIds } }, { $addToSet: { images: newImage._id } })).exec());
      }
      if (groupsIds) {
        pushPromises.push((Display.updateMany({ _id: { $in: groupsIds } }, { $addToSet: { images: newImage._id } })).exec());
      }
    }
    if (pushPromises) await Promise.all(pushPromises);
    res.status(201).json({
      success: true,
      message: 'Success at uploading an image to the server',
      notify: `Imagen '${newImage.name}' creada`,
      resourceId: newImage._id,
      resource: newImage,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.imageUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, body: { displays, groups } } = req;
    const displaysIds = displays && displays.map(display => mongoose.Types.ObjectId(display));
    const groupsIds = groups && groups.map(group => mongoose.Types.ObjectId(group));
    const image = await Image.findOneAndUpdate({ _id: id, userGroup: req.AuthData.userGroup }, { $set: body }, { new: true }).select(Selections.images.short);
    const pullPromises = [];
    const pushPromises = [];
    if (image) {
      if (displaysIds) {
        pullPromises.push(Display.updateMany({ images: id }, { $pull: { images: id } }).exec());
        pushPromises.push(Display.updateMany({ _id: { $in: displaysIds } }, { $addToSet: { images: id } }));
      }
      if (groupsIds) {
        pullPromises.push(Group.updateMany({ images: id }, { $pull: { images: id } }).exec());
        pushPromises.push(Group.updateMany({ _id: { $in: groupsIds } }, { $addToSet: { images: id } }));
      }
    }
    if (pullPromises) await Promise.all(pullPromises);
    if (pushPromises) await Promise.all(pushPromises);
    res.status(201).json({
      message: 'Succes at updating an image from the collection',
      notify: `${image.name} actualizada`,
      success: true,
      resourceId: id,
      resource: image,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.imageDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const image = await Image.findOneAndDelete(query).exec();
    if (image) {
      await Promise.all([
        Display.updateMany({ images: id }, { $pull: { images: id } }),
        Group.updateMany({ images: id }, { $pull: { images: id } }),
      ]);
      res.status(200).json({
        message: 'Success at removing an image from the collection',
        success: true,
        resourceId: id,
      });
    } else {
      res.status(404).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* IMAGE UPLOAD */
exports.imageUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (image) {
      if (image.path) {
        await fs.access(image.path, (result) => {
          if (result) fs.unlink(image.path);
        });
      }
      const updateObject = {
        extension: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        src: process.env.API_URL + req.file.path,
      };
      const newImage = await Image.findOneAndUpdate({ _id: id }, { $set: updateObject }, { new: true }).select(Selections.images.short);
      res.status(200)
        .json({
          success: true,
          message: 'Success at uploading an image to the server',
          notify: `Imagen '${newImage.name}' subida al servidor`,
          resourceId: id,
          resource: newImage,
        });
    } else {
      res.status(404).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};
