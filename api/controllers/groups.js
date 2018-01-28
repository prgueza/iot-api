const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');

/* GET ALL */
exports.group_get_all = (req, res, next) => {
  // find all groups from the collection
  Group.find()
    .exec()
    // return docs as JSON
    .then(docs => {
      const response = {
        count: docs.length, // count of all groups
        date: Date.now(), // date and time of the query
        data: docs.map((doc) =>{ // data
          return{ // only some of the fields
            _id: doc._id,
            url: doc.url,
            id: doc.id,
            name: doc.name,
            description: doc.description,
            tags_total: doc.tags.length,
            tags: doc.tags,
            created_at: doc.created_at
          }
        })
      }
      // simulate delay for dev
      setTimeout(() => { res.status(200).json(response) }, process.env.DELAY);
    })
    // catch any errors
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
    // select fields
    .select('_id url id name description created_at created_by updated_at updated_by active_image images displays tags')
    // populate active image
    .populate('active_image', '_id id url src_url name description created_at tags_total')
    // populate images
    .populate('images', '_id id url src_url name description created_at tags_total')
    // populate displays
    .populate('displays', '_id id url name description created_at tags_total')
    // populate user
    .populate('created_by', '_id url name')
    .populate('updated_by', '_id url name')
    .exec()
    .then(doc => {
      // if the group is found
      if (doc) {
        // set response status to 200 and return the doc
        res.status(200).json(doc);
      } else {
        // set response status to 404 and return an error message
        res.status(404).json({
          message: 'No valid entry found for provided id'
        });
      }
    })
    // catch any errors
    .catch(err => {
      res.status(500).json({
        message: 'Internal Server Error',
        error: err
      });
    });
}

/* POST */
exports.group_create = (req, res, next) => {
  // get data for new group
  const { id, name, description, created_by, updated_by, displays, images, active_image, tags } = req.body;
  // construct a new id for the new group
  const _id = new mongoose.Types.ObjectId();
  // construct displays and images ids from data received
  const d_ids = displays.map((d) => mongoose.Types.ObjectId(d));
  const i_ids = images.map((i) =>  mongoose.Types.ObjectId(i));
  // build the new group with its model
  const group = new Group({
    _id: _id,
    url: 'http://localhost:4000/groups/' + _id,
    id: id,
    name: name,
    description: description,
    created_by: created_by,
    updated_by: updated_by,
    tags: tags,
    active_image: active_image,
    displays: displays,
    images: images
  });
  // save group
  group
    .save()
    // update displays involved
    .then(() => {
      Display
        // add the group id to the group array
        .updateMany({ _id: { $in: d_ids } }, { $addToSet: { groups: _id } })
        .then(doc => console.log(doc))
    })
    // update images involved
    .then(() => {
      Image
        // add the group id to the group array
        .updateMany({ _id: { $in: i_ids } }, { $addToSet: { groups: _id } })
        .then(doc => console.log(doc))
    })
    // send a response to the app
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
  const _id = req.params.id;
  Group
    .findOneAndUpdate({ _id: _id }, { $set: req.body }, { new: true })
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
      }
      res.status(200).json({
        message: 'Success at updating a group from the collection',
        success: true,
        result: result
      });
    })
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
    // send result back to the application
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
