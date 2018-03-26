const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const UserGroup = require('../models/userGroup');

/* GET ALL */
exports.group_get_all = (req, res, next) => {
  Group.find()
    .select('_id id name description tags url created_at updated_at')
    .exec()
    .then(docs => {
      setTimeout(() => { res.status(200).json(docs) }, process.env.DELAY);
    })
    .catch(err => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* GET ONE */
exports.group_get_one = (req, res, next) => {
  // get id from request parameters
  const _id = req.params.id;
  // find group by id
  Group.findById(_id)
    .select('_id url id name description created_at created_by updated_at updated_by active_image images displays tags resolution')
    .populate('active_image', '_id id url src_url name description created_at tags_total')
    .populate('images', '_id id url src_url name description created_at tags_total')
    .populate('displays', '_id id url name description created_at tags_total')
    .populate('resolution', '_id url name size')
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .exec()
    .then(doc => {
      if (doc) { // if the group is found
        res.status(200).json(doc); // set response status to 200 and return the doc
      } else { // set response status to 404 and return an error message
        res.status(404).json({ message: 'No valid entry found for provided id' });
      }
    })
    .catch(err => { // catch any errors
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* POST */
exports.group_create = (req, res, next) => {
  // get data for new group
  const { id, name, description, created_by, updated_by, displays, images, active_image, userGroup, resolution, tags } = req.body;
  // create a new id for the new group
  const _id = new mongoose.Types.ObjectId();
  // create displays and images ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d));
  const i_ids = images && images.map((i) =>  mongoose.Types.ObjectId(i));
  const u_id  = mongoose.Types.ObjectId(userGroup);
  // build the new group with its model
  const group = new Group({
    _id: _id,
    url: 'http://localhost:4000/groups/' + _id,
    id: id,
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
    userGroup: userGroup
  });
  // save group
  group
    .save()
    // update displays involved
    .then(() => { return Display.updateMany({ _id: { $in: d_ids } }, { $addToSet: { groups: _id } }) }) // add the group to selected displays
    // update images involved
    .then(() => { return Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { groups: _id } }) }) // add the group to selected images
    // update userGroups involved
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { groups: _id } }) }) // add the group to selected userGroup
    // send response
    .then((res) => Group.findById(_id).exec())
    .then((doc) => {
      const result = {
        _id: doc._id,
        url: doc.url,
        id: doc.id,
        name: doc.name,
        description: doc.description,
        tags_total: doc.tags.length,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }
      res.status(201).json({
        message: 'Success at adding a new group to the collection',
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
exports.group_update = (req, res, next) => {
  // get the id from the request for the query
  const _id = req.params.id;
  // get displays and images ids from the request
  const { displays, images, userGroup } = req.body;
  // create displays and images ids from data received
  const d_ids = displays && displays.map((d) => mongoose.Types.ObjectId(d));
  const i_ids = images && images.map((i) =>  mongoose.Types.ObjectId(i));
  const u_id  = mongoose.Types.ObjectId(userGroup);
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
    .then((res) => Group.findById(_id).exec())
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
      res.status(201).json({
        message: 'Success at updating a group from the collection',
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
exports.group_delete = (req, res, next) => {
  // get id from request parameters
  const _id = req.params.id;
  // delete document from collection
  Group
    .remove({ _id: _id })
    .exec()
    // update displays involved
    .then(() => { return Display.updateMany({ groups: _id }, { $pull: { groups: _id } }) }) // remove the group from all displays that have its ref
    // update images involved
    .then(() => { return Image.updateMany({ groups: _id }, { $pull: { groups: _id } }) }) // remove the group from all images that have its ref
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ groups: _id }, { $pull: { groups: _id } }) }) // remove the group from all userGroups that have its ref
    // send response
    .then((result) => {
      res.status(200).json({
        message: 'Success',
        resourceId: _id,
        result: result
      })
    })
    // catch any errors
    .catch((err) => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err,
      })
    })
}
