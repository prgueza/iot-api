const mongoose = require('mongoose')

/* DATA MODELS */
const Group = require('../models/group')
const Display = require('../models/display')
const Image = require('../models/image')
const Device = require('../models/device')
const UserGroup = require('../models/userGroup')

/* GET ALL */
exports.displays_get_all = (req, res, next) => {
  if (!req.AuthData.admin) {
    res.status(401).json({error: 'Not allowed'})
  } else {
    Display.find()
    .select('_id url name description tags created_at updated_at')
    .exec()
    .then(docs => {
      console.log(docs)
      setTimeout(() => { res.status(200).json(docs) }, 0)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
  }
}

/* GET ONE */
exports.displays_get_one = (req, res, next) => {
  const _id = req.params.id
  const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
  Display.findOne(query)
  .select('_id url name description category location tags images groups userGroup created_by created_at updated_at')
  .populate('active_image', '_id url name src_url description created_at tags_total')
  .populate('userGroup', '_id url name')
  .populate({
    path: 'device',
    select: '_id url name resolution description',
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
  .populate('images', '_id url name description src_url created_at tags_total')
  .populate('groups', '_id url name description created_at tags_total')
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
exports.display_create = (req, res, next) => {
  const { name, description, category, updated_by, created_by, images, image, groups, tags, device } = req.body
  // _id for the new document
  const _id = new mongoose.Types.ObjectId()
  // create displays and groups ids from data received
  const i_ids = images && images.map((i) => mongoose.Types.ObjectId(i))
  const g_ids = groups && groups.map((g) => mongoose.Types.ObjectId(g))
  const d_id  = mongoose.Types.ObjectId(device)
  // build the new display from its model
  const display = new Display({
    _id: _id,
    url: process.env.API_URL + 'displays/' + _id,
    name: name,
    description: description,
    updated_by: updated_by,
    created_by: created_by,
    category: category,
    groups: groups,
    images: images,
    active_image: image,
    tags_total: tags.length,
    tags: tags,
    device: device,
    userGroup: req.AuthData.userGroup
  })
  // save the display
  display
  .save()
  // update devices involved
  .then(() => { return Device.update({ _id: d_id }, { $set: { display: _id } }) }) // add the display to selected device
  // update images involved
  .then(() => { return Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected images
  // update groups involved
  .then(() => { return Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected images
  // send response
  .then(() =>
    Promise.all([
      Display.find(_id).select('_id url name description tags updated_at created_at').exec(),
      Device.find({userGroup: req.AuthData.userGroup}).select('_id url name description display updated_at created_at').populate('display', '_id url name description').exec(),
    ]))
  .then((doc) =>
    res.status(201).json({
      message: 'Success at adding a new display to the collection',
      success: true,
      resourceId: _id,
      resource: doc[0][0],
      devices: doc[1]
    })
  )
  // catch any errors
  .catch(err => {
    console.log(err)
    res.status(500).json({
      message: 'Internal Server Error',
      error: err
    })
  })
}

/* UPDATE (PUT) */
exports.display_update = (req, res, next) => {
  // Get the id for the group of users that is allowed to update this resource
  const userGroup_id = ''
  Display.findById(req.body._id).select('userGroup', _id).exec()
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
    // get displays and images ids from the request
    const { images, groups, device } = req.body
    // create displays and images ids from data received
    const i_ids = images && images.map((i) => mongoose.Types.ObjectId(i))
    const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g))
    const d_id  = device && mongoose.Types.ObjectId(device)
    // save for response
    var doc
    Display
    // update display
    .findOneAndUpdate({ _id: _id }, { $set: req.body }, { new: true })
    // update images involved
    .then(() => { return i_ids && Image.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all images that have its ref
    .then(() => { return i_ids && Image.updateMany({ _id: { $in: i_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected images
    // update groups involved
    .then(() => { return g_ids && Group.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all groups that have its ref
    .then(() => { return g_ids && Group.updateMany({ _id: { $in: g_ids } }, { $addToSet: { displays: _id } }) }) // add the display to selected groups
    // update devices involved
    .then(() => { return d_id && Device.updateMany({ display: _id }, { $unset: { display: ''} }) }) // remove the display from all devices that have its ref
    .then(() => { return d_id && Device.update({ _id: d_id }, { $set: { display: _id } }) }) // add the display to selected device
    // send response
    .then(() =>
      Promise.all([
        Display.find(_id).select('_id url name description tags updated_at created_at').exec(),
        Device.find({userGroup: req.AuthData.userGroup}).select('_id url name description display updated_at created_at').populate('display', '_id url name description').exec(),
      ])
    )
    .then(doc => {
      res.status(201).json({
        message: 'Succes at updating a display from the collection',
        success: true,
        resourceId: _id,
        resource: doc[0][0],
        devices: doc[1]
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
  }
}

/* DELETE */
exports.display_delete = (req, res, next) => {
  // get id from request parameters
  const _id = req.params.id
  const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
  // delete document from collection
  // remove display
  Display
  .find(query)
  .remove()
  .exec()
  .then((res) => result = res)
  // update images involved
  .then(() => { return Image.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all images that have its ref
  // update groups involved
  .then(() => { return Group.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all groups that have its ref
  // update userGroups involved
  .then(() => { return Device.updateMany({ displays: _id }, { $pull: { displays: _id } }) }) // remove the display from all devices that have its ref
  // send response
  .then(() => Device.find({userGroup: req.AuthData.userGroup}).select('_id url name description display updated_at created_at').populate('display', '_id url name description').exec())
  .then((doc) => {
    res.status(200).json({
      message: 'Success at removing a display from the collection',
      success: true,
      resourceId: _id,
      devices: doc
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({error: err})
  })
}
