const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const UserGroup = require('../models/userGroup');

/* GET ALL */
exports.images_get_all = (req, res, next) => {
  Image.find()
    .select('_id id name description tags url created_at updated_at')
    .exec()
    .then(docs => {
      setTimeout(() => { res.status(200).json(docs) }, process.ENV.delay);
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
    .select('_id id url name description created_by updated_by file size src_url color_profile resolution category groups displays tags created_at updated_at')
    .populate('displays', '_id id url name')
    .populate('groups', '_id id url name')
    .populate('resolution', '_id url name size')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
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
  const { id, name, description, created_by, updated_by, displays, groups, tags, resolution, category, color_profile, userGroup } = req.body;
  // create a new id for the image
  const _id = new mongoose.Types.ObjectId();
  // create displays and groups ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d));
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g));
  const u_id  = mongoose.Types.ObjectId(userGroup);
  // build the new image from its model
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
    .then(() => { return Display.updateMany({ _id: { $in: d_ids } }, { $addToSet: { images: _id } }) }) // add the image to selected images
    // update groups involved
    .then(() => { return Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { images: _id } }) }) // add the image to selected images
    // update userGroups involved
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { images: _id } }) }) // add the image to selected userGroup
    // send response
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
  // get displays, userGroup and groups ids from the request
  const { displays, groups, userGroup } = req.body;
  // create displays, userGroup and groups ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d));
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g));
  const u_id  = mongoose.Types.ObjectId(userGroup);
  // update the image based on its id
  Image
  // update image
  .findOneAndUpdate({ _id: _id }, { $set: req.body }, { new: true })
  // update displays involved
  .then(() => { return Display.updateMany({ images: _id }, { $pull: { images: _id } }) }) // remove the image from all displays that have its ref
  .then(() => { return Display.updateMany({ _id: { $in: d_ids } }, { $addToSet: { images: _id } }) }) // add the image to selected displays
  // update groups involved
  .then(() => { return Group.updateMany({ images: _id }, { $pull: { images: _id } }) }) // remove the image from all groups that have its ref
  .then(() => { return Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { images: _id } }) }) // add the image to selected groups
  // update userGroups involved
  .then(() => { return UserGroup.updateMany({ images: _id }, { $pull: { images: _id } }) }) // remove the image from all userGroups that have its ref
  .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { images: _id } }) }) // add the image to selected userGroup
  // send response
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
    // update displays involved
    .then(() => { return Display.updateMany({ images: _id }, { $pull: { images: _id } }) }) // remove the image from all displays that have its ref
    // update groups involved
    .then(() => { return Group.updateMany({ images: _id }, { $pull: { images: _id } }) }) // remove the image from all groups that have its ref
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ images: _id }, { $pull: { images: _id } }) }) // remove the image from all userGroups that have its ref
    // send response
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
