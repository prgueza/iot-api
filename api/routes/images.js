const express = require('express');
const router = express.Router();
const { displays, images, groups } = require('../datos');
const mongoose = require('mongoose');

const Image = require('../models/image.js');

/* API GET */
router.get('/', (req, res, next) => {
  Image.find()
    .select('_id id name description tags url created_at')
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        data: docs.map((doc) => {
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
      setTimeout(() => { res.status(200).json(response) }, 1000);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.get('/:id', (req, res, next) => {
  const _id = req.params.id;
  Image.findById(_id)
    .populate('displays', '_id id url name descrption created_at tags_total')
    .populate('groups', '_id id url name descrption created_at tags_total')
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
  const { id, name, description, user, display, group, tags, dimensions, category, color_profile } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const image = new Image({
    _id: _id,
    url: 'http://localhost/4000/images/' + _id,
    id: id,
    name: name,
    description: description,
    user: user,
    src_url: 'http://localhost/3000/img/' + name + '.png',
    file: 'png',
    color_profile: color_profile,
    dimensions: dimensionss,
    size: 0,
    category: category,
    tags_total: tags.length,
    tags: tags,
    displays: [display],
    groups: [grupo]
  });

  image
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Handling POST requests to /images',
        createdImage: image});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });

});


/* API PUT */
router.put('/:id', (req, res, next) => {
  const _id = req.params.id;
  Image
    .update({ _id: _id }, {$set: req.body })
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
  const _id = req.params.id;
  Image
    .remove({_id: _id})
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
