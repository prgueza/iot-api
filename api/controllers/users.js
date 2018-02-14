const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* DATA MODELS */
const User = require('../models/user.js');

/* GET ALL */
exports.users_get_all = (req, res, next) => {
  User.find()
    .select('_id id url name login password email created_at updated_at admin')
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
            console.log(req.body);
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              login: req.body.login,
              name: req.body.name,
              email: req.body.email,
              admin: req.body.admin,
              password: hash,
            });
            user
              .save()
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
          return res.status(200).json({
            message: 'Auth Successful',
            token: token,
            userID: user._id
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
    .update({ _id: _id }, { $set: req.body })
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
  User
    .remove({_id: req.params.id})
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
