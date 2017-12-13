const express = require('express');
const router = express.Router();
const { users } = require('../datos');
const mongoose = require('mongoose');

const User = require('../models/user');

/* API GET */
router.get('/', (req, res, next) => {
  User.find()
    .exec()
    .then(docs => {
      console.log(docs);
      res.status(200).json(docs);
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
  const id = req.params.id;
  User
    .remove({_id: id})
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
