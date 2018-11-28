const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const Selections = require('./select');

/* GET ALL */
exports.groupGetAll = async (req, res) => {
  try {
    const query = req.AuthData.admin ? {} : { userGroup: req.AuthData.userGroup };
    const group = await Group.find(query)
      .select(Selections.groups.short)
      .exec();
    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.groupGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const group = await Group.findOne(query)
      .select(Selections.groups.long)
      .populate('activeImage', Selections.images.populate)
      .populate('images', Selections.images.populate)
      .populate('displays', Selections.displays.populate)
      .populate('screen', Selections.screens.populate)
      .populate('createdBy', Selections.users.populate)
      .populate('updatedBy', Selections.users.populate)
      .exec();
    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.groupCreate = async (req, res) => {
  try {
    const { body } = req;
    body.userGroup = req.AuthData.userGroup;
    const group = new Group(body);
    const { _id } = await group.save();
    const newGroup = await Group.findById(_id).select(Selections.groups.short);
    res.status(201)
      .json({
        message: 'Success at adding a new group to the collection',
        notify: `Se ha creado un nuevo grupo: '${newGroup.name}'`,
        success: true,
        resourceId: newGroup._id,
        resource: newGroup,
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.groupUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, body: { displays, images } } = req;
    const displaysIds = displays && displays.map(d => mongoose.Types.ObjectId(d));
    const imagesIds = images && images.map(i => mongoose.Types.ObjectId(i));
    const group = await Group.findOneAndUpdate({ _id: id, userGroup: req.AuthData.userGroup }, { $set: body }).select(Selections.groups.short);
    const pullPromises = [];
    const pushPromises = [];
    if (group) {
      if (displaysIds) {
        pullPromises.push(Display.updateMany({ groups: id }, { $unset: { group: undefined } }).exec());
        pushPromises.push(Display.updateMany({ _id: { $in: displaysIds } }, { group: id }).exec());
      }
      if (imagesIds) {
        pullPromises.push(Image.updateMany({ groups: id }, { $pull: { groups: id } }).exec());
        pushPromises.push(Image.updateMany({ _id: { $in: imagesIds } }, { $addToSet: { groups: id } }).exec());
      }
      if (pullPromises) await Promise.all(pullPromises);
      if (pushPromises) await Promise.all(pushPromises);
      res.status(201).json({
        message: 'Success at updating a group from the collection',
        success: true,
        resourceId: group._id,
        resource: group,
      });
    } else {
      res.status(404).json({ message: 'Not valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.groupDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).remove();
    if (group) {
      res.status(200).json({
        message: 'Success at removing a group from the collection',
        success: true,
        resourceId: id,
      });
    } else {
      res.status(400).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};
