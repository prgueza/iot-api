const mongoose = require('mongoose')

/* DATA MODELS */
const UserGroup = require('../models/userGroup.js')

// TODO: filter response and write missing methods

/* GET ALL */
exports.userGroups_get_all = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    UserGroup.find()
      .select('_id url name description created_at')
      .exec()
      .then(docs => res.status(200).json(docs))
      .catch(err => res.status(500).json({error: err}))
  }
}

/* GET ONE */
exports.userGroups_get_one = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    UserGroup.findById(req.params.id)
      .select('_id url name description created_at')
      .exec()
      .then(docs => res.status(200).json(docs))
      .catch(err => res.status(500).json({error: err}))
  }
}

/* POST */
exports.userGroup_create = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    const { name, description } = req.body
    const _id = new mongoose.Types.ObjectId()
    const userGroup = new UserGroup({
      _id: _id,
      url: process.env.API_URL + 'userGroups/' + _id,
      name: name,
      description: description,
    })

    userGroup
      .save()
      .then(result => {
        res.status(201).json({
          message: 'UserGroup created',
          createdUserGroup: {
            _id: result._id,
            name: result.name,
            description: result.description,
            url: result.url
          }
        })
      })
      .catch(err => res.status(500).json({error: err}))
  }
}

/* PUT */
exports.userGroup_update = (req, res, next) => {
  if (!rea.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    UserGroup
      .update({ _id: req.params.id }, { $set: req.body })
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: err}))
  }
}

/* DELETE */
exports.userGroup_delete = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({message: 'Not allowed'})
  } else {
    UserGroup
      .remove({_id: req.params.id})
      .exec()
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: err}))
  }
}
