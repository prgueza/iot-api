const mongoose = require('mongoose');

/* DATA MODELS */
const UserGroup = require('../models/userGroup.js');

/* GET ALL */
exports.userGroupsGetAll = async (req, res) => {
  try {
    const userGroups = await UserGroup.find()
      .select('_id url name description createdAt')
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
        .select('_id url name description createdAt')
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
      const _id = new mongoose.Types.ObjectId();
      body.url = `${process.env.API_URL}userGroups/${_id}`;
      body._id = _id;
      const userGroup = new UserGroup(body);
      const newUserGroup = await userGroup.save();
      res.status(201).json({
        message: 'Success at adding a new usergroup to the collection',
        success: true,
        resourceId: _id,
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
        .select('_id url name description createdAt updatedAt')
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
      const userGroup = await UserGroup
        .findByIdAndRemove(id)
        .select('_id url name description createdAt updatedAt')
        .exec();
      if (userGroup) {
        res.status(200).json({
          message: 'Success at removing an usergroup from the collection',
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
