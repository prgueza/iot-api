const express = require('express');
const router = express.Router();
const { displays, groups, images } = require('../datos');
const mongoose = require('mongoose');

const Display = require('../models/display');

/* API GET */
router.get('/', (req, res, next) => {
  Display.find()
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
      setTimeout(() => { res.status(200).json(response) }, 2000);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.get('/:id', (req, res, next) => {
  const _id = req.params.id;
  Display.findById(_id)
    .populate('active_image', '_id id url name descrption created_at tags_total')
    .populate('images', '_id id url name descrption created_at tags_total')
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
  const { id, name, description, location, user, images, image, groups, tags, dimensions, mac, gateway } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const display = new Display({
    _id: _id,
    url: 'http://localhost:4000/displays/' + _id,
    id: id,
    name: name,
    description: description,
    location: location,
    user: user,
    resolution: dimensions,
    groups: groups,
    images: images,
    active_image: image,
    tags_total: tags.length,
    tags: tags,
    mac_address: mac,
    gateway: gateway
  });

  display
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Display created',
        createdDisplay: {
          _id: result._id,
          id: result.id,
          name: result.name,
          description: result.description,
          url: 'http://localhost:4000/displays/' + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });

});


/* API PUT */
router.put('/:id', (req, res, next) => {
  const _id = req.params.id;
  Display
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
  Display
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
