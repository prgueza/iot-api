const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');

/* GET ALL */
exports.images_get_all = (req, res, next) => {
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
}

/* GET ONE */
exports.images_get_one = (req, res, next) => {
  const _id = req.params.id;
  Image.findById(_id)
    .select('_id id url name description created_by file size src_url color_profile resolution category groups displays tags created_at updated_at')
    .populate('displays', '_id id url name descrption created_at tags_total')
    .populate('groups', '_id id url name descrption created_at tags_total')
    .populate('resolution', '_id url name size')
    .populate('created_by', '_ud url name ')
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
}

/* POST */
exports.image_create = (req, res, next) => {
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

}

/* PUT */
exports.image_update = (req, res, next) => {
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
}

/* DELETE */
exports.image_delete = (req, res, next) => {
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
}
