const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/* DATA MODELS */
const User = require('../models/user.js')
const UserGroup = require('../models/userGroup.js')
const Display = require('../models/display.js')
const Image = require('../models/image.js')
const Group = require('../models/group.js')
const Device = require('../models/device.js')
const Screen = require('../models/screen.js')

/* GET ALL */
exports.users_get_all = (req, res, next) => {
  User.find()
    .select('_id id url name login email created_at updated_at admin userGroup')
    .populate('userGroup', '_id url name')
    .exec()
    .then(docs => {
      setTimeout(() => { res.status(200).json(docs) }, 0)
    })
    .catch(err => {
      res.status(500).json({error: err})
    })
}

/* GET ONE */
exports.users_get_one = (req, res, next) => {
  const id = req.params.id
  User.findById(id)
    .select('_id url name login password email created_at updated_at admin')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc)
      } else {
        res.status(404).json({message: 'No valid entry found for provided id'})
      }
    })
    .catch(err => {
      res.status(500).json({error: err})
    })
}

/* SIGN UP */
exports.user_signup = (req, res, next) => {
  User.find({login: req.body.login})
    .exec()
    .then(user => {
      if(user.length >= 1){
        return res.status(409).json({
          message: 'Login exists'
        })
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            })
          } else {
            const _id = new mongoose.Types.ObjectId()
            const user = new User({
              _id: _id,
              url: process.env.API_URL + 'users/' + _id,
              login: req.body.login,
              name: req.body.name,
              email: req.body.email,
              admin: req.body.admin,
              userGroup: req.body.userGroup || undefined,
              password: hash,
            })
            user
              .save()
              .then(() => {
                if (req.body.userGroup){
                  return UserGroup.update({ _id: mongoose.Types.ObjectId(req.body.userGroup) }, { $addToSet: { users: _id } })
                }
              })
              .then(result => { res.status(201).json({
                message: 'User created'
                })
              })
              .catch(err => { res.status(500).json({
                  error: err
                })
              })
          }
        })
      }
    })
}

/* LOGIN */
exports.user_login = (req, res, next) => {
  // check if the user exists
  User.findOne({ login: req.body.login })
    .select('_id url login password name email admin userGroup created_at')
    .populate('userGroup', '_id url name')
    .exec()
    // user array
    .then(user => {
      // check if user was found or not
      if (!user) { // not found
        return res.status(401).json({
          message: 'Auth failed'
        })
      }
      // found => check if password is correct
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        // general error from bcrypt
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          })
        }
        if (result) { // passowrd matches!
          // create token
          const token = jwt.sign(
            { // payload
            login: user.login,
            userID: user._id,
            userGroup: user.userGroup._id,
            admin: user.admin
            },
            // secret key
            process.env.JWT_KEY,
            { // options
              expiresIn: "1h"
            }
          )

          Promise.all([
            Display.find({userGroup: user.userGroup._id}).select('_id url name description tags updated_at created_at').exec(),
            Image.find({userGroup: user.userGroup._id}).select('_id url name description tags updated_at created_at').exec(),
            Group.find({userGroup: user.userGroup._id}).select('_id url name description tags updated_at created_at').exec(),
            Device.find({userGroup: user.userGroup._id}).select('_id url name description display updated_at created_at').populate('display', '_id url name description').exec(),
            Screen.find({}).select('_id url name').exec()
          ])
          .then((data) => {
            return res.status(200).json({
              message: 'Auth Successful',
              token: token,
              user: {
                _id: user._id,
                url: user.url,
                name: user.name,
                admin: user.admin,
                created_at: user.created_at,
                updated_at: user.updated_at
              },
              data: {
                displays: data[0],
                images: data[1],
                groups: data[2],
                devices: data[3]
              }
            })
          })
        } else { // password doesn't match!
          return res.status(401).json({message: 'Auth failed'})
        }
      })
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      })
    })
}

/* PUT */
exports.user_update = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    User
      .update({ _id: req.body._is }, { $set: req.body }, { new: true })
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: err}))
  }
}

/* DELETE */
exports.user_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    User
      .remove({_id: req.params.id}) // remove user document
      .exec()
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: err}))
  }
}
