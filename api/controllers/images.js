const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');

/* GET ALL */
exports.images_get_all = (req, res, next) => {
  Image.find()
    .select('_id id name description tags url created_at updated_at')
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
            updated_at: doc.updated_at,
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
  // get data for new image
  const { id, name, description, created_by, updated_by, displays, groups, tags, resolution, category, color_profile } = req.body;
  // create a new id for the image
  const _id = new mongoose.Types.ObjectId();
  // create displays and groups ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d));
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g));
  // build the new image with its model
  const image = new Image({
    _id: _id,
    url: 'http://localhost:4000/images/' + _id,
    id: id,
    name: name,
    description: description,
    created_by: created_by,
    updated_by: updated_by,
    color_profile: color_profile,
    resolution: resolution,
    size: 0,
    category: category,
    tags_total: tags.length,
    tags: tags,
    displays: displays,
    groups: groups
  });
  // save image
  image
    .save()
    // update displays involved
    .then(() => {
      Display
        // add the image id to the display array
        .updateMany({ _id: { $in: d_ids } }, { $addToSet: { images: _id } })
        .then(doc => console.log(doc))
    })
    // update groupss involved
    .then(() => {
      Group
        // add the image id to the group array
        .updateMany({ _id: { $in: g_ids } }, { $addToSet: { images: _id } })
        .then(doc => console.log(doc))
    })
    // send a response to the app
    .then((res) => Image.findById(_id).exec())
    .then((doc) => {
      const result = {
        _id: doc._id,
        url: doc.url,
        id: doc.id,
        name: doc.name,
        description: doc.description,
        tags_total: doc.tags.length,
        created_at: doc.created_at,
      }
      res.status(201).json({
        message: 'Success at adding a new image to the collection',
        success: true,
        result: result
      });
    })
    // catch any errors
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* PUT */
exports.image_update = (req, res, next) => {
  // get the id from the request for the query
  const _id = req.params.id;
  // get displays and images ids from the request
  const { displays, groups } = req.body;
  // create displays and images ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d));
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g));
  // update the group based on its id
  const updateObject = req.body;
  updateObject.updated_at = new Date();
  Image
    .findOneAndUpdate({ _id: _id }, { $set: updateObject }, { new: true })
    // update displays involved
    .then(() => {
      Display
        // add the group id to the group array
        .updateMany({ _id: { $in: d_ids } }, { $addToSet: { images: _id } })
        .then(doc => console.log(doc))
    })
    // update images involved
    .then(() => {
      Group
        // add the group id to the group array
        .updateMany({ _id: { $in: g_ids } }, { $addToSet: { images: _id } })
        .then(doc => console.log(doc))
    })
    // send a response to the app
    .then((res) => Image.findById(_id).exec())
    .then(doc => {
      const result = {
        _id: doc._id,
        url: doc.url,
        id: doc.id,
        name: doc.name,
        updated_by: doc.user,
        description: doc.description,
        tags_total: doc.tags.length,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      }
      res.status(200).json({
        message: 'Success at updating an image from the collection',
        success: true,
        result: result
      });
    })
    // catch any errors
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
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
