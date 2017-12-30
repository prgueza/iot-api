const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

/* API SIGNUP */
router.post('/signup', (req, res, next) => {
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
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              login: req.body.login,
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
});

/* API LOGIN */
router.post('/login', (req, res, next) => {
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
            userId: user._id,
            },
            // secret key
            process.ENV.JWT_KEY,
            { // options
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: 'Auth Successful',
            token: token
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
});

/* API GET */
router.get('/', (req, res, next) => {
  User.find()
    .exec()
    .then(docs => {
      console.log(docs);
      setTimeout(() => { res.status(200).json(docs) }, 0);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({message: 'No valid entry found for provided id'});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});


/* API POST */
router.post('/', (req, res, next) => {
  const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      password: req.body.password
  });
  user
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Handling POST requests to /users',
        createdUser: user});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});


/* API PATCH */
router.patch('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateOps = {}; // update operations (may not be all)
  for (const ops of req.body){
    updateOps[ops.propName] = ops.value;
  }
  User
    .update({ _id: id }, {$set: updateOps })
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});


/* API DELETE */
router.delete('/:id', (req, res, next) => {
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
});

module.exports = router;
