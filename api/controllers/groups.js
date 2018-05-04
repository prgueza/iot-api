const mongoose = require('mongoose')

/* DATA MODELS */
const Group = require('../models/group')
const Display = require('../models/display')
const Image = require('../models/image')
const UserGroup = require('../models/userGroup')

/* GET ALL */
exports.group_get_all = (req, res, next) => {
  const query = req.AuthData.admin ? {} : {userGroup: req.AuthData.userGroup}
  Group.find(query)
  .select('_id name description tags url created_at updated_at')
  .exec()
  .then(docs => {
    setTimeout(() => { res.status(200).json(docs) }, process.env.DELAY)
  })
  .catch(err => {
    res.status(500).json({
      message: 'Internal Server Error',
      error: err
    })
  })
}

/* GET ONE */
exports.group_get_one = (req, res, next) => {
  const _id = req.params.id
  const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
  Group.findOne(query)
    .select('_id url name description created_at created_by updated_at updated_by active_image images displays tags resolution')
    .populate('active_image', '_id url src_url name description created_at tags_total')
    .populate('images', '_id url src_url name description created_at tags_total')
    .populate('displays', '_id url name description created_at tags_total')
    .populate('resolution', '_id url name size')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .exec()
    .then(doc => {
      if (doc) { // if the group is found
        res.status(200).json(doc) // set response status to 200 and return the doc
      } else { // set response status to 404 and return an error message
        res.status(404).json({message: 'No valid entry found for provided id within the user group'})
      }
    })
    .catch(err => { // catch any errors
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      })
    })
}

/* POST */
exports.group_create = (req, res, next) => {
  // get data for new group
  const { name, description, created_by, updated_by, displays, images, active_image, resolution, tags } = req.body
  // create a new id for the new group
  const _id = new mongoose.Types.ObjectId()
  // create displays and images ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d))
  const i_ids = images && images.map((i) =>  mongoose.Types.ObjectId(i))
  // build the new group with its model
  const group = new Group({
    _id: _id,
    url: process.env.API_URL + 'groups/' + _id,
    name: name,
    description: description,
    created_by: created_by,
    updated_by: updated_by,
    tags_total: tags.length,
    tags: tags,
    active_image: active_image,
    displays: displays,
    images: images,
    resolution: resolution,
    userGroup: req.AuthData.userGroup
  })
  // save group
  group
  .save()
  // update displays involved
  .then(() => { return Display.updateMany({ _id: { $in: d_ids } }, { $addToSet: { groups: _id } }) }) // add the group to selected displays
  // update images involved
  .then(() => { return Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { groups: _id } }) }) // add the group to selected images
  // send response
  .then(() => Group.findById(_id).select('_id url name description tags updated_at created_at').exec())
  .then((doc) => {
    res.status(201).json({
      message: 'Success at adding a new group to the collection',
      success: true,
      resourceId: doc._id,
      resource: doc
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

/* PUT */
exports.group_update = (req, res, next) => {
  // Get the id for the group of users that is allowed to update this resource
  const userGroup_id = ''
  Group.findById(req.body._id).select('userGroup', _id).exec().then((doc) => {
    if (doc) userGroup_id = doc.userGroup
  })
  // if the user is not allowed to update this resource
  if (!AuthData.admin && AuthData.userGroup != userGroup_id){
    res.status(401).json({error: 'Not allowed'})
  } else {
    // get the id from the request for the query
    const _id = req.params.id
    // get displays and images ids from the request
    const { displays, images, userGroup } = req.body
    // create displays and images ids from data received
    const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d))
    const i_ids = images && images.map((i) =>  mongoose.Types.ObjectId(i))
    const u_id  = mongoose.Types.ObjectId(userGroup)
    // update the group based on its id
    Group
    // update group
    .update({ _id: _id }, { $set: req.body })
    // update displays involved
    .then(() => { return Display.updateMany({ groups: _id }, { $pull: { groups: _id } }) }) // remove the group from all displays that have its ref
    .then(() => { return Display.updateMany({ _id: { $in: d_ids } }, { $addToSet: { groups: _id } }) }) // add the group to selected displays
    // update images involved
    .then(() => { return Image.updateMany({ groups: _id }, { $pull: { groups: _id } }) }) // remove the group from all images that have its ref
    .then(() => { return Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { groups: _id } }) }) // add the group to selected images
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ groups: _id }, { $pull: { groups: _id } }) }) // remove the group from all userGroups that have its ref
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { groups: _id } }) }) // add the group to selected userGroup
    // send response
    .then((res) => Group.findById(_id).select('_id url name description tags updated_at created_at').exec())
    .then(doc => {
      res.status(201).json({
        message: 'Success at updating a group from the collection',
        success: true,
        resourceId: doc._id,
        resource: doc
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
exports.group_delete = (req, res, next) => {
  // get id from request parameters
  const _id = req.params.id
  const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
  // delete document from collection
  Group
  .findOneAndRemove(query).exec()
  .then((doc) => {
    if (doc) {
      return Promise.all([
        Display.updateMany({ groups: _id }, { $pull: { groups: _id } }),
        Image.updateMany({ groups: _id }, { $pull: { groups: _id } })
      ])
      .then(() => {
        res.status(200).json({
          message: 'Success at removing a group from the collection',
          success: true,
          resourceId: _id
        })
      })
    } else {
      res.status(404).json({message: 'No valid entry found for provided id within the user group'})
    }
  })
  // catch any errors
  .catch((err) => {
    res.status(500).json({
      message: 'Internal Server Error',
      error: err,
    })
  })
}
