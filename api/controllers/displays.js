const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');

/* GET ALL */
exports.displays_get_all = (req, res, next) => {
  Display.find()
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
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          }
        })
      }
      console.log(response);
      setTimeout(() => { res.status(200).json(response) }, 0);
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
    .select('_id id url name description location resolution tags images groups created_by created_at updated_at')
    .populate('active_image', '_id id url name descrption created_at tags_total')
    .populate('images', '_id id url name descrption created_at tags_total')
    .populate('groups', '_id id url name descrption created_at tags_total')
    .populate('created_by', '_id url name')
    .populate('resolution', '_id url name size')
    .populate('location', '_id url name')
    .populate('device', '_id url name')
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
  const { id, name, description, location, user, images, image, groups, tags, dimensions, device } = req.body;
  const _id = new mongoose.Types.ObjectId();
  // create displays and groups ids from data received
  const i_ids = images && images.map((i) => mongoose.Types.ObjectId(i));
  const g_ids = groups && groups.map((g) =>  mongoose.Types.ObjectId(g));

  const display = new Display({
    _id: _id,
    url: 'http://localhost:4000/displays/' + _id,
    id: id,
    name: name,
    description: description,
    location: location,
    user: user,
    resolution: dimensions,
    groups: groups,
    images: images,
    active_image: image,
    tags_total: tags.length,
    tags: tags,
    device: device
  });

  display
    .save()
    // update images involved
    .then(() => {
      Image
        // add the image id to the display array
        .updateMany({ _id: { $in: i_ids } }, { $addToSet: { displays: _id } })
        .then(doc => console.log(doc))
    })
    // update groupss involved
    .then(() => {
      Group
        // add the image id to the group array
        .updateMany({ _id: { $in: g_ids } }, { $addToSet: { displays: _id } })
        .then(doc => console.log(doc))
    })
    // send a response to the app
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

/* PUT */
exports.display_update = (req, res, next) => {
  const _id = req.params.id;
  Display
    .update({ _id: _id }, { $set: req.body })
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

/* DELETE */
exports.display_delete = (req, res, next) => {
  const _id = req.params.id;
  Display
    .remove({_id: _id})
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}
