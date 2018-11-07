const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const UserGroup = require('../models/userGroup');

/* GET ALL */
exports.groupGetAll = async (req, res) => {
  try {
    const query = req.AuthData.admin ? {} : { userGroup: req.AuthData.userGroup };
    const group = await Group.find(query)
      .select('_id name description tags url createdAt updatedAt')
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
      .select('_id url name description createdAt createdBy updatedAt updatedBy activeImage overlayImage images displays tags resolution')
      .populate('activeImage', '_id url src name description createdAt tags_total')
      .populate('overlayImage.image', '_id url name src')
      .populate('images', '_id url src name description createdAt tags_total')
      .populate('displays', '_id url name description createdAt tags_total')
      .populate('resolution', '_id url name size')
      .populate('createdBy', '_id url name')
      .populate('updatedBy', '_id url name')
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
    const {
      body, body: { displays, images },
    } = req;
    const _id = new mongoose.Types.ObjectId();
    const displaysIds = displays && displays.map(d => mongoose.Types.ObjectId(d));
    const imagesIds = images && images.map(i => mongoose.Types.ObjectId(i));
    body._id = _id;
    body.url = `${process.env.API_URL}groups/${_id}`;
    body.userGroup = req.AuthData.userGroup;
    const group = new Group(body);
    const newGroup = await group.save();
    const updatePromises = [];
    if (displaysIds) updatePromises.push(Display.updateMany({ _id: { $in: displaysIds } }, { $addToSet: { groups: _id } }).exec());
    if (imagesIds) updatePromises.push(Image.updateMany({ _id: { $in: imagesIds } }, { $addToSet: { groups: _id } }).exec());
    if (updatePromises) await Promise.all(updatePromises);
    res.status(201)
      .json({
        message: 'Success at adding a new group to the collection',
        notify: `Se ha creado un nuevo grupo: '${newGroup.name}'`,
        success: true,
        resourceId: _id,
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
    const userGroupId = mongoose.Types.ObjectId(req.AuthData.userGroup);
    body.userGroup = req.AuthData.userGroup;
    const group = Group.findOneAndUpdate({ _id: id, userGroup: req.AuthData.userGroup }, { $set: body });
    const pullPromises = [];
    const pushPromises = [];
    if (group) {
      pullPromises.push(UserGroup.updateMany({ groups: id }, { $pull: { groups: id } }).exec());
      pushPromises.push(UserGroup.update({ _id: userGroupId }, { $addToSet: { groups: id } }).exec());
      if (displaysIds) {
        pullPromises.push(Display.updateMany({ groups: id }, { $unset: { group: undefined } }).exec());
        pushPromises.push(Display.updateMany({ _id: { $in: displaysIds } }, { group: id }).exec());
      }
      if (imagesIds) {
        pullPromises.push(Image.updateMany({ groups: id }, { $pull: { groups: id } }).exec());
        pushPromises.push(Image.updateMany({ _id: { $in: imagesIds } }, { $addToSet: { groups: id } }).exec());
      }
      if (pullPromises) await Promise.All(pullPromises);
      if (pushPromises) await Promise.All(pushPromises);
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
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const group = Group.findOneAndDelete(query).exec();
    if (group) {
      await Promise.all([
        Display.updateMany({ groups: id }, { $unset: { group: id } }),
        Image.updateMany({ groups: id }, { $pull: { groups: id } }),
      ]);
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
