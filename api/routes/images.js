const express = require('express');
const router = express.Router();
const { displays, images, groups } = require('../datos');
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './img/');
  },
  filename: function(req, file, cb){
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    filesize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

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
            tags: doc.tags,
            created_at: doc.created_at,
          }
        })
      }
      setTimeout(() => { res.status(200).json(response) }, 0);
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
    .populate('resolution', '_id url name size')
    .exec()
    .then(doc => {
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
router.post('/', upload.single('imageFile'), (req, res, next) => {
  console.log(req.file);
  const { id, name, description, user, display, group, tags, dimensions, category, color_profile } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const image = new Image({
    _id: _id,
    url: 'http://localhost/4000/images/' + _id,
    id: id,
    name: name,
    description: description,
    user: user,
    src_url: req.file.path,
    file: req.file.mimetype,
    color_profile: color_profile,
    dimensions: dimensions,
    size: 0,
    category: category,
    tags_total: tags.length,
    tags: tags,
    displays: display,
    groups: group
  });

  image
    .save()
    .then(result => {
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
    .remove({ _id: _id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Success',
        result: result
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err});
    });
});

module.exports = router;
