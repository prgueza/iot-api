const express = require('express');
const router = express.Router();
const { displays, images, groups } = require('../datos');
const mongoose = require('mongoose');

const Group = require('../models/group');

/* API GET */
router.get('/', (req, res, next) => {
  Group.find()
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        data: docs.map((doc) =>{
          return{
            _id: doc._id,
            url: doc.url,
            id: doc.id,
            name: doc.name,
            description: doc.description,
            tags_total: doc.tags.length,
            created_at: doc.created_at,
          }
        })
      }
      console.log(response);
      setTimeout(() => { res.status(200).json(response) }, 3000);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.get('/:id', (req, res, next) => {
  const _id = req.params.id;
  Group.findById(_id)
    .populate('active_image', '_id id url name descrption created_at tags_total')
    .populate('images', '_id id url name descrption created_at tags_total')
    .populate('displays', '_id id url name descrption created_at tags_total')
    .populate('user', '_id url name')
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
  res.status(200).json({ mensaje: 'exito' });
});


/* API PATCH */
router.patch('/:id', (req, res, next) => {

});


/* API DELETE */
router.delete('/:id', (req, res, next) => {

});

module.exports = router;
