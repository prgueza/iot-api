const mongoose = require('mongoose')
const fs = require('fs')

/* DATA MODELS */
const Group = require('../models/group')
const Display = require('../models/display')
const Image = require('../models/image')
const UserGroup = require('../models/userGroup')

/* GET ALL */
exports.images_get_all = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({ error: 'Not allowed'})
  } else {
    Image.find()
    .select('_id name description tags url created_at updated_at')
    .exec()
    .then(docs => { setTimeout(() => { res.status(200).json(docs) }, 0) })
    .catch(err => { res.status(500).json({error: err}) })
  }
}

/* GET ONE */
exports.images_get_one = (req, res, next) => {
  const _id = req.params.id
  const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
  Image.findById(query)
    .select('_id url name description created_by updated_by extension path size src_url color_profile resolution category groups displays tags created_at updated_at')
    .populate('displays', '_id url name')
    .populate('groups', '_id url name')
    .populate('resolution', '_id url name size')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc)
      } else {
        res.status(404).json({message: 'No valid entry found for provided id within the user group'})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
}

/* POST */
exports.image_create = (req, res, next) => {
  // get data for new image
  const { name, description, created_by, updated_by, displays, groups, tags, resolution, category, color_profile } = req.body
  // create a new id for the image
  const _id = new mongoose.Types.ObjectId()
  // create displays and groups ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d))
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g))
  // build the new image from its model
  const image = new Image({
    _id: _id,
    url: process.env.API_URL + 'images/' + _id,
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
    groups: groups,
    userGroup: req.AuthData.userGroup
  })
  // save image
  image
    .save()
    // update displays involved
    .then(() => { return Display.updateMany({ _id: { $in: d_ids } }, { $addToSet: { images: _id } }) }) // add the image to selected images
    // update groups involved
    .then(() => { return Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { images: _id } }) }) // add the image to selected images
    // send response
    .then(() => Image.findById(_id).select('_id url name description tags created:at').exec() )
    .then((doc) => {
      res.status(201).json({
        message: 'Success at adding a new image to the collection',
        success: true,
        result: doc
      })
    })
    // catch any errors
    .catch(err => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      })
    })
}

/* PUT */
exports.image_update = (req, res, next) => {
  // Get the id for the group of users that is allowed to update this resource
  const userGroup_id = ''
  Image.findById(req.body._id).select('userGroup', _id).exec()
  .then((doc) => {
    if (doc) userGroup_id = doc.userGroup
  })
  .catch((err) => console.log(err))
  // if the user is not allowed to update this resource
  if (!AuthData.admin && AuthData.userGroup != userGroup_id){
    res.status(401).json({error: 'Not allowed'})
  } else {
    // get the id from the request for the query
    const _id = req.params.id
    // get displays, userGroup and groups ids from the request
    const { displays, groups, userGroup } = req.body
    // create displays, userGroup and groups ids from data received
    const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d))
    const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g))
    const u_id  = mongoose.Types.ObjectId(userGroup)
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
    .then((res) => Image.findById(_id).select('_id url name description tags created_at updated_at').exec())
    .then(doc => {
      res.status(200).json({
        message: 'Success at updating an image from the collection',
        success: true,
        result: doc
      })
    })
    // catch any errors
    .catch(err => {
      console.log(err)
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      })
    })
  }
}

/* DELETE */
exports.image_delete = (req, res, next) => {
  const _id = req.params.id
  var result
  // Get the id for the group of users that is allowed to remove this resource
  const userGroup_id = ''
  Image.findById(req.params._id).select('userGroup').exec()
  .then((doc) => {
    if (doc) userGroup_id = doc.userGroup
  }).catch((err) => console.log(err))
  // if the user is not allowed to remove this resource
  if (!AuthData.admin && AuthData.userGroup != userGroup_id) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    Image
      .remove({ _id: _id })
      .exec()
      .then((res) => result = res)
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
        })
      })
      .catch(err => {
        res.status(500).json({
          message: 'Internal Server Error',
          error: err})
      })
    }
  }


/* IMAGE UPLOAD */
exports.image_upload = (req, res, next) => {
  const _id = req.params.id
  Image
    .findById(_id)
    .then((doc) => doc.path && fs.unlink(doc.path))
    .then(() => {
      const updateObject = {
        extension: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        src_url: process.env.API_URL + req.file.path
      }
      Image
        .findOneAndUpdate({ _id: _id }, { $set: updateObject }, { new: true })
        // send response
        .then(doc => {
          const result = {
            _id: doc._id,
            url: doc.url,
            name: doc.name,
            updated_by: doc.user,
            description: doc.description,
            tags_total: doc.tags.length,
            src_url: doc.src_url,
            size: doc.size,
            extension: doc.extension,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          }
          res.status(200).json({
            message: 'Success at uploading an image to the collection',
            success: true,
            result: result
          })
        })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      })
    })
}
