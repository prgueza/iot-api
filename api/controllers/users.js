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

/* GET ALL */
exports.usersGetAll = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id url name login email createdAt updatedAt admin userGroup')
      .populate('userGroup', '_id url name')
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
      .select('_id url name login email createdAt updatedAt admin')
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
          const id = new mongoose.Types.ObjectId();
          const { body, body: { userGroup } } = req;
          body._id = id;
          body.url = `${process.env.API_URL}users/${id}`;
          body.userGroup = userGroup || undefined;
          body.password = hash;
          const user = new User(body);
          const newUser = await user.save();
          if (userGroup) await UserGroup.update({ _id: mongoose.Types.ObjectId(userGroup) }, { $addToSet: { users: id } });
          res.status(201).json({
            message: 'Success at adding a user to the collection',
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
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* LOGIN */
exports.userLogin = async (req, res) => {
  try {
    const user = await User.findOne({ login: req.body.login })
      .select('_id url login password name email admin userGroup createdAt')
      .populate('userGroup', '_id url name')
      .exec();
    if (user) {
      bcrypt.compare(req.body.password, user.password, async (err, result) => {
        if (err) {
          res.status(401).json({ message: 'Auth failed' });
          return false;
        }
        if (result) {
          const token = jwt.sign({
            login: user.login,
            userID: user._id,
            userGroup: user.userGroup._id,
            admin: user.admin,
          },
          process.env.JWT_KEY, {
            expiresIn: 60 * 60 * 7,
          });
          const resources = user.admin ? [
            Device.find().select('_id url name description initcode gateway updatedAt found lastFound').populate('gateway', '_id ulr name').exec(),
            Gateway.find().select('_id url name description ip port mac device updatedAt createdAt').exec(),
            UserGroup.find().select('_id url name description').exec(),
            Screen.find().select('_id url name description size screen_code color_profile').exec(),
            Location.find().select('_id url name description').exec(),
            User.find().select('_id url name login email admin userGroup').populate('userGroup', '_id url name').exec(),
          ] : [
            Display.find({ userGroup: user.userGroup._id }).select('_id url name description tags device updating lastUpdateResult timeline activeImage updatedAt createdAt').populate('device', '_id url name initcode').populate('activeImage', '_id url name')
              .exec(),
            Image.find({ userGroup: user.userGroup._id }).select('_id url name description tags src updatedAt createdAt').exec(),
            Group.find({ userGroup: user.userGroup._id }).select('_id url name description tags updatedAt createdAt').exec(),
            Device.find({ userGroup: user.userGroup._id }).select('_id url name description display updatedAt createdAt found, lastFound').populate('display', '_id url name description').exec(),
            Screen.find().select('_id url name').exec(),
          ];
          const results = await Promise.all(resources);
          const data = user.admin ? {
            devices: results[0].map((d) => {
              d.url = `http://localhost:4000/devices/${d._id}`;
              return d;
            }),
            gateways: results[1],
            userGroups: results[2],
            screens: results[3],
            locations: results[4],
            users: results[5],
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
      res.status(401).json({ message: 'Auth failed' });
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
          const { id } = req.params;
          const user = await User.findByIdAndUpdate({ _id: id }, { $set: body }, { new: true })
            .select('_id url name login email admin userGroup createdAt updatedAt')
            .populate('userGroup', '_id url name');
          if (user) {
            if (userGroup) await UserGroup.update({ _id: mongoose.Types.ObjectId(userGroup) }, { $addToSet: { users: id } });
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
      User
        .findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
        .select('_id url name login email admin userGroup createdAt updatedAt')
        .populate('userGroup', '_id url name')
        .then(doc => res.status(200)
          .json({
            message: 'Success at updating a user from the collection',
            notify: `Datos de ${doc.name} actualizados`,
            success: true,
            resourceId: doc._id,
            resource: doc,
          }))
        .catch(err => res.status(500)
          .json({ error: err }));
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
      const user = await User.findByIdAndRemove({ _id: id }).exec();
      if (user) {
        res.status(200).json({
          message: 'Success at removing a user from the collection',
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
