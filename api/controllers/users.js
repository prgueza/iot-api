const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* DATA MODELS */
const User = require('../models/user.js');
const UserGroup = require('../models/userGroup.js');

/* GET ALL */
exports.users_get_all = (req, res, next) => {
  User.find()
    .select('_id id url name login password email created_at updated_at admin userGroup')
    .populate('userGroup', '_id url name')
    .exec()
    .then(docs => {
      setTimeout(() => { res.status(200).json(docs) }, 0);
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
}

/* GET ONE */
exports.users_get_one = (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .select('_id url name login password email created_at updated_at admin')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({message: 'No valid entry found for provided id'});
      }
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
}

/* SIGN UP */
exports.user_signup = (req, res, next) => {
  User.find({login: req.body.login})
    .exec()
    .then(user => {
      if(user.length >= 1){
        return res.status(409).json({
          message: 'Login exists'
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const _id = new mongoose.Types.ObjectId();
            const user = new User({
              _id: _id,
              url: 'http://localhost:4000/users/' + _id,
              login: req.body.login,
              name: req.body.name,
              email: req.body.email,
              admin: req.body.admin,
              userGroup: req.body.userGroup,
              password: hash,
            });
            user
              .save()
              .then(() => {
                if (req.body.userGroup){
                  return UserGroup.update({ _id: mongoose.Types.ObjectId(req.body.userGroup) }, { $addToSet: { users: _id } })
                }
              })
              .then(result => { res.status(201).json({
                message: 'User created'
                });
              })
              .catch(err => { res.status(500).json({
                  error: err
                });
              })
          }
        });
      }
    });
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
        });
      }
      // found => check if password is correct
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        // general error from bcrypt
        if (err) {
          return res.status(401).json({
            message: 'Auth failed'
          });
        }
        if (result) { // passowrd matches!
          // create token
          const token = jwt.sign(
            { // payload
            login: user.login,
            userID: user._id,
            },
            // secret key
            process.env.JWT_KEY,
            { // options
              expiresIn: "1h"
            }
          );
          delete user.password; // avoid sending password field
          return res.status(200).json({
            message: 'Auth Successful',
            token: token,
            userID: user._id, // TODO: delete this line
            user: user
          });
        } else { // password doesn't match!
          return res.status(401).json({
            message: 'Auth failed'
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* PUT */
exports.user_update = (req, res, next) => {
  const _id = req.params.id;
  User
    .update({ _id: _id }, { $set: req.body }, { new: true })
    .then(() => {
      if (!req.body.userGroup){ // If there is no userGroup assignation
        return User.update({ _id: _id }, { $unset: { userGroup: "" } }) // Unset userGroup from the document
      } else { // If there is userGroup assignation
        return UserGroup.updateMany({ users: _id }, { $pull: { users: _id } }) // pull the user id from all userGroups
          .then(() => {
            return UserGroup.update({ _id: mongoose.Types.ObjectId(req.body.userGroup) }, { $addToSet: { users: _id } }) // add the user id to the new userGroup
          })
      }
    })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* DELETE */
exports.user_delete = (req, res, next) => {
  const _id = req.params.id;
  User
    .remove({_id: _id}) // remove user document
    .exec()
    .then(() => { // remove user from the userGroup
      return UserGroup.update({ users: _id }, { $pull: { users: _id }})
    })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
