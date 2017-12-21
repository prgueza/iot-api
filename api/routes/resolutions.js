const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Resolution = require('../models/resolution.js');

// TODO: filter response and write missing methods

/* API GET */
router.get('/', (req, res, next) => {
  Resolution.find()
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
  const _id = req.params.id;
  Resolution.findById(_id)
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


/* API POST */
router.post('/', (req, res, next) => {
  res.status(200).json({ mensaje: 'exito' });
});


/* API PUT */
router.put('/:id', (req, res, next) => {

});


/* API DELETE */
router.delete('/:id', (req, res, next) => {

});

module.exports = router;
