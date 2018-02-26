const mongoose = require('mongoose');

/* DATA MODELS */
const UserGroup = require('../models/userGroup.js');

// TODO: filter response and write missing methods

/* GET ALL */
exports.userGroups_get_all = (req, res, next) => {
  UserGroup.find()
    .select('_id url name description created_at devices displays images groups users')
    .populate({
      path: 'devices',
      select: '_id url name display description',
      populate: [{
        path: 'display',
        select: '_id url name'
      },{
        path: 'resolution',
        select: '_id url name'
      }]
    })
    .populate('displays', '_id url name')
    .populate('images', '_id url name')
    .populate('groups', '_id url name')
    .populate('users', '_id url name')
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* GET ONE */
exports.userGroups_get_one = (req, res, next) => {
  const _id = req.params.id;
  UserGroup.findById(_id)
    .select('_id url name description created_at devices displays images groups')
    .populate({
      path: 'devices',
      select: '_id url name display description',
      populate: [{
        path: 'display',
        select: '_id url name'
      },{
        path: 'resolution',
        select: '_id url name'
      }]
    })
    .populate({
      path: 'displays',
      select: '_id id url name description tags_total created_at updated_at'
    })
    .populate('images', '_id id url name description tags_total created_at updated_at')
    .populate('groups', '_id id url name description tags_total created_at updated_at')
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* POST */
exports.userGroup_create = (req, res, next) => {
  const { name, description } = req.body;
  const _id = new mongoose.Types.ObjectId();
  const userGroup = new UserGroup({
    _id: _id,
    url: 'http://localhost:4000/userGroups/' + _id,
    name: name,
    description: description,
  });

  userGroup
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'UserGroup created',
        createdUserGroup: {
          _id: result._id,
          name: result.name,
          description: result.description,
          url: 'http://localhost:4000/userGroup/' + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* PUT */
exports.userGroup_update = (req, res, next) => {
  const _id = req.params.id;
  UserGroup
    .update({ _id: _id }, { $set: req.body })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* DELETE */
exports.userGroup_delete = (req, res, next) => {
  UserGroup
    .remove({_id: req.params.id})
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
