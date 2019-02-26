/* DATA MODELS */
const Group = require('../models/group');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL */
exports.groupGetAll = async (req, res) => {
  try {
    const query = req.AuthData.admin ? {} : { userGroup: req.AuthData.userGroup };
    const group = await Group.find(query)
      .select(SELECTION.groups.short)
      .exec();
    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE */
exports.groupGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const group = await Group.findOne(query)
      .select(SELECTION.groups.long)
      .populate('activeImage', SELECTION.images.populate)
      .populate('images', SELECTION.images.populate)
      .populate('displays', SELECTION.displays.populate)
      .populate('screen', SELECTION.screens.populate)
      .populate('createdBy', SELECTION.users.populate)
      .populate('updatedBy', SELECTION.users.populate)
      .exec();
    if (group) {
      res.status(200).json(group);
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* POST */
exports.groupCreate = async (req, res) => {
  try {
    const { body } = req;
    body.userGroup = req.AuthData.userGroup;
    const group = new Group(body);
    const { _id } = await group.save();
    const newGroup = await Group.findById(_id).select(SELECTION.groups.short);
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
    res.status(500).json(MESSAGE[500](error));
  }
};

/* PUT */
exports.groupUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const group = await Group.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true }).select(SELECTION.groups.short).exec();
    if (group) {
      res.status(200).json({
        message: 'Success at updating a group from the collection',
        success: true,
        resourceId: group._id,
        resource: group,
      });
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(MESSAGE[500](error));
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
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};
