const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');
const UserGroup = require('../models/userGroup');

/* GET ALL */
exports.displays_get_all = (req, res, next) => {
  Display.find()
    .select('_id id name description tags url created_at updated_at')
    .exec()
    .then(docs => {
      console.log(docs);
      setTimeout(() => { res.status(200).json(docs) }, 0);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* GET ONE */
exports.displays_get_one = (req, res, next) => {
  const _id = req.params.id;
  Display.findById(_id)
    .select('_id id url name description location tags images groups userGroup created_by created_at updated_at')
    .populate('active_image', '_id id url name descrption created_at tags_total')
    .populate('userGroup', '_id id url name')
    .populate({
      path: 'device',
      select: '_id url name resolution',
      populate: [{
        path: 'resolution',
        select: '_id url name size'
      },{
        path: 'gateway',
        select: '_id url name location',
        populate: {
          path: 'location',
          select: '_id url name'
        }
      }]
    })
    .populate('images', '_id id url name descrption created_at tags_total')
    .populate('groups', '_id id url name descrption created_at tags_total')
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
exports.display_create = (req, res, next) => {
  const { id, name, description, location, updated_by, created_by, images, image, groups, tags, device, userGroup } = req.body;
  // _id for the new document
  const _id = new mongoose.Types.ObjectId();
  // create displays and groups ids from data received
  const i_ids = images && images.map((i) => mongoose.Types.ObjectId(i));
  const g_ids = groups && groups.map((g) => mongoose.Types.ObjectId(g));
  const d_id  = mongoose.Types.ObjectId(device);
  const u_id  = mongoose.Types.ObjectId(userGroup);
  // build the new display from its model
  const display = new Display({
    _id: _id,
    url: 'http://localhost:4000/displays/' + _id,
    id: id,
    name: name,
    description: description,
    location: location,
    updated_by: updated_by,
    created_by: created_by,
    groups: groups,
    images: images,
    active_image: image,
    tags_total: tags.length,
    tags: tags,
    device: device,
    userGroup: userGroup
  });
  // save the display
  display
    .save()
    // update devices involved
    .then(() => { return Device.update({ _id: d_id }, { $set: { display: _id } }) }) // add the display to selected device
    // update userGroups involved
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { displays: _id } }) }) // add the display to the selected userGroup
    // update images involved
    .then(() => { return Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected images
    // update groups involved
    .then(() => { return Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected images
    // send response
    .then((res) => Display.findById(_id).exec())
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
        message: 'Success at adding a new display to the collection',
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

/* UPDATE (PUT) */
exports.display_update = (req, res, next) => {
  // get the id from the request for the query
  const _id = req.params.id;
  // get displays and images ids from the request
  const { images, groups, device, userGroup } = req.body;
  // create displays and images ids from data received
  const i_ids = images && images.map((i) => mongoose.Types.ObjectId(i));
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g));
  const d_id  = mongoose.Types.ObjectId(device);
  const u_id  = mongoose.Types.ObjectId(userGroup);
  const updateObject = req.body;
  updateObject.updated_at = new Date();
  Display
    // update display
    .findOneAndUpdate({ _id: _id }, { $set: updateObject }, { new: true })
    // update images involved
    .then(() => { return Image.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all images that have its ref
    .then(() => { return Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected images
    // update groups involved
    .then(() => { return Group.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all groups that have its ref
    .then(() => { return Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected groups
    // update devices involved
    .then(() => { return Device.updateMany({ display: _id }, { $unset: { display: ""} }) }) // remove the display from all devices that have its ref
    .then(() => { return Device.update({ _id: d_id }, { $set: { display: _id } }) }) // add the display to selected device
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all userGroups that have its ref
    .then(() => { return UserGroup.update({ _id: u_id }, { $addToSet: { displays: _id } }) }) // add the display to the selected userGroup
    // send response
    .then(result => {
      console.log(result);
      res.status(201).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* DELETE */
exports.display_delete = (req, res, next) => {
  // get the id from the request for the query
  const _id = req.params.id;
  // save result
  var result;
  // remove display
  Display
    .remove({_id: _id})
    .exec()
    .then((res) => result = res)
    // update images involved
    .then(() => { return Image.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all images that have its ref
    // update groups involved
    .then(() => { return Group.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all groups that have its ref
    // update userGroups involved
    .then(() => { return Device.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all devices that have its ref
    // update userGroups involved
    .then(() => { return UserGroup.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all userGroups that have its ref
    // send response
    .then(() => {
      res.status(200).json({
        message: 'Success at removing a display',
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
