const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* DATA MODELS */
const User = require('../models/user.js');
const UserGroup = require('../models/userGroup.js');
const Display = require('../models/display.js');
const Image = require('../models/image.js');
const Group = require('../models/group.js');
const Device = require('../models/device.js');
const Gateway = require('../models/gateway.js');
const Screen = require('../models/screen.js');
const Location = require('../models/location.js');
const Selections = require('./select');

/* GET ALL */
exports.usersGetAll = async (req, res) => {
  try {
    const users = await User.find()
      .select(Selections.users.short)
      .populate('userGroup', Selections.userGroups.populate)
      .exec();
    if (users) {
      res.status(200).json(users);
    } else {
      res.status(404).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.usersGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select(Selections.users.long)
      .exec();
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* SIGN UP */
exports.userSignup = async (req, res) => {
  try {
    const { login } = req.body;
    const existingUser = await User.findOne({ login }).exec();
    if (!existingUser) {
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        try {
          const { body, body: { userGroup } } = req;
          body.userGroup = userGroup || undefined; // TODO: review if this is necessary
          body.password = hash;
          const user = new User(body);
          const { _id } = await user.save();
          const newUser = await User.findById(_id)
            .select(Selections.users.short)
            .populate('userGroup', Selections.userGroups.populate);
          res.status(201).json({
            message: 'Success at adding a user to the collection',
            notify: `${user.name} añadido`,
            success: true,
            resourceId: newUser._id,
            resource: newUser,
          });
        } catch (error) {
          console.log(error.message);
          res.status(500).json(error);
        }
      });
    } else {
      res.status(409).json({ message: 'Login exists' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

/* LOGIN */
exports.userLogin = async (req, res) => {
  try {
    const user = await User.findOne({ login: req.body.login })
      .select(Selections.users.long)
      .exec();
    if (user) {
      bcrypt.compare(req.body.password, user.password, async (err, result) => {
        if (err) {
          res.status(401).json({ message: 'Incorrect login params' });
          console.error('Login attempt failed');
          return false;
        }
        if (result) {
          const token = jwt.sign({
            login: user.login,
            userID: user._id,
            userGroup: user.userGroup,
            admin: user.admin,
          },
          process.env.JWT_KEY, {
            expiresIn: 60 * 60 * 7,
          });
          const resources = user.admin ? [
            Device.find().select(Selections.devices.short)
              .populate('gateway', Selections.gateways.populate)
              .exec(),
            Gateway.find().select(Selections.gateways.short).exec(),
            UserGroup.find().select(Selections.userGroups.short).exec(),
            Screen.find().select(Selections.screens.short).exec(),
            Location.find().select(Selections.locations.short).exec(),
            User.find().select(Selections.users.short)
              .populate('userGroup', Selections.userGroups.populate)
              .exec(),
            Display.find().select(Selections.displays.short).exec(),
            Image.find().select(Selections.images.short).exec(),
            Group.find().select(Selections.groups.short).exec(),
          ] : [
            Display.find({ userGroup: user.userGroup._id }).select(Selections.displays.short)
              .populate('device', Selections.devices.populate)
              .populate('activeImage', Selections.images.populate)
              .exec(),
            Image.find({ userGroup: user.userGroup._id }).select(Selections.images.short).exec(),
            Group.find({ userGroup: user.userGroup._id }).select(Selections.groups.short).exec(),
            Device.find({ userGroup: user.userGroup._id }).select(Selections.devices.short)
              .populate('display', Selections.displays.populate)
              .exec(),
            Screen.find().select(Selections.screens.short).exec(),
          ];
          const results = await Promise.all(resources);
          const data = user.admin ? {
            devices: results[0].map((d) => {
              d.url = `${process.env.API_URL}devices/${d._id}`;
              return d;
            }),
            gateways: results[1],
            userGroups: results[2],
            screens: results[3],
            locations: results[4],
            users: results[5],
            displays: results[6],
            images: results[7],
            groups: results[8],
          } : {
            displays: results[0],
            images: results[1],
            groups: results[2],
            devices: results[3],
            screens: results[4],
          };
          res.status(200).json({
            message: 'Auth Successful',
            token,
            user: {
              _id: user._id,
              url: user.url,
              name: user.name,
              admin: user.admin,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
            data,
          });
          return false;
        }
        return false;
      });
    } else {
      res.status(401).json({ message: 'Incorrect login params' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.userUpdate = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else if (req.body.password) {
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        try {
          const { body, body: { userGroup } } = req;
          body.password = hash;
          body.userGroup = mongoose.Types.ObjectId(userGroup);
          const { id } = req.params;
          const user = await User.findByIdAndUpdate(id, { $set: body }, { new: true })
            .select(Selections.users.short)
            .populate('userGroup', Selections.userGroups.populate);
          if (user) {
            if (userGroup) {
              await UserGroup.findByIdAndUpdate(mongoose.Types.ObjectId(userGroup), { $addToSet: { users: id } });
            }
            res.status(200).json({
              message: 'Success at updating a user from the collection',
              notify: `Datos de ${user.name} actualizados`,
              success: true,
              resourceId: id,
              resource: user,
            });
          } else {
            res.status(404).json({ message: 'Not valid entry for provided id' });
          }
        } catch (error) {
          console.log(error.message);
          res.status(500).json(error);
        }
      });
    } else {
      const { body, body: { userGroup } } = req;
      body.userGroup = mongoose.Types.ObjectId(userGroup);
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(id, { $set: body }, { new: true })
        .select(Selections.users.short)
        .populate('userGroup', Selections.userGroups.populate);
      if (user) {
        if (userGroup) {
          await UserGroup.findByIdAndUpdate(mongoose.Types.ObjectId(userGroup), { $addToSet: { users: id } });
        }
        res.status(200).json({
          message: 'Success at updating a user from the collection',
          notify: `Datos de ${user.name} actualizados`,
          success: true,
          resourceId: id,
          resource: user,
        });
      } else {
        res.status(404).json({ message: 'Not valid entry for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.userDelete = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ message: 'Not allowed' });
    } else {
      const { id } = req.params;
      const user = await User.findById(id);
      await user.remove();
      if (user) {
        res.status(200).json({
          message: 'Success at removing a user from the collection',
          notify: `${user.name} eliminado`,
          success: true,
          resourceId: id,
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
