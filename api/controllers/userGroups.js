/* DATA MODELS */
const UserGroup = require('../models/userGroup.js');
const Selections = require('./select');

/* GET ALL */
exports.userGroupsGetAll = async (req, res) => {
  try {
    const userGroups = await UserGroup.find()
      .select(Selections.userGroups.short)
      .exec();
    res.status(200).json(userGroups);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.userGroupsGetOne = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { id } = req.params;
      const userGroup = await UserGroup.findById(id)
        .select(Selections.userGroups.long)
        .exec();
      if (userGroup) {
        res.status(200).json(userGroup);
      } else {
        res.status(404).json({ message: 'No valid entry for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.userGroupCreate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { body } = req;
      const userGroup = new UserGroup(body);
      const { _id } = await userGroup.save();
      const newUserGroup = await UserGroup.findById(_id).select(Selections.userGroups.short);
      res.status(201).json({
        message: 'Success at adding a new usergroup to the collection',
        notify: `${newUserGroup.name} añadido`,
        success: true,
        resourceId: newUserGroup._id,
        resource: newUserGroup,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.userGroupUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { id } = req.params;
      const userGroup = await UserGroup
        .findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
        .select(Selections.userGroups.short)
        .exec();
      if (userGroup) {
        res.status(200).json({
          message: 'Success at updating an usergroup from the collection',
          notify: `${userGroup.name} actualizado`,
          success: true,
          resourceId: id,
          resource: userGroup,
        });
      } else {
        res.status(404).json({ message: 'No valid entry for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.userGroupDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { id } = req.params;
      const userGroup = await UserGroup.findById(id).select(Selections.userGroups.short);
      if ((userGroup.users.length + userGroup.devices.length + userGroup.displays.length + userGroup.images.length + userGroup.groups.length) > 0) {
        res.status(500).json({
          message: 'Unable to remove a user group with associated resources',
          notify: 'El grupo tiene recursos asociados',
          success: false,
        });
      } else {
        userGroup.remove();
      }
      if (userGroup) {
        res.status(200).json({
          message: 'Success at removing an usergroup from the collection',
          notify: `${userGroup.name} eliminado`,
          success: true,
          resourceId: id,
          resource: userGroup,
        });
      } else {
        res.status(404).json({ message: 'No valid entry for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};
