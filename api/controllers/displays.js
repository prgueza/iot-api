const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');

/* GET ALL */
exports.displays_get_all = (req, res) => {
  if (!req.AuthData.admin) {
    res.status(401)
      .json({
        error: 'Not allowed',
      });
  } else {
    Display.find()
      .select('_id url name description tags device createdAt updatedAt')
      .populate('device', '_id url name initcode')
      .exec()
      .then((docs) => {
        setTimeout(() => {
          res.status(200)
            .json(docs);
        }, 0);
      })
      .catch((err) => {
        console.log(err);
        res.status(500)
          .json({
            error: err,
          });
      });
  }
};
/* GET ONE */
exports.displays_get_one = (req, res) => {
  const _id = req.params.id;
  const query = req.AuthData.admin ? {
    _id,
  } : {
    _id,
    userGroup: req.AuthData.userGroup,
  };
  Display.findOne(query)
    .select('_id url name description category location tags images group userGroup overlayImage imageFromGroup createdBy createdAt updatedAt')
    .populate('activeImage', '_id url name src description createdAt')
    .populate('userGroup', '_id url name')
    .populate('overlayImage.image', '_id url name src')
    .populate({
      path: 'device',
      select: '_id url name resolution description activeImage initcode',
      populate: [{
        path: 'resolution',
        select: '_id url name size',
      }, {
        path: 'gateway',
        select: '_id url name location',
        populate: {
          path: 'location',
          select: '_id url name',
        },
      }],
    })
    .populate({
      path: 'group',
      select: '_id url name description activeImage overlayImage createdAt',
      populate: [{
        path: 'activeImage',
        select: '_id url name src',
      }, {
        path: 'overlayImage.image',
        select: '_id url name src',
      }],
    })
    .populate('images', '_id url name description src createdAt')
    .populate('createdBy', '_id url name')
    .populate('updatedBy', '_id url name')
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200)
          .json(doc);
      } else {
        res.status(404)
          .json({
            message: 'No valid entry found for provided id within the user group',
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500)
        .json({
          error: err,
        });
    });
};
/* POST */
exports.display_create = (req, res) => {
  const {
    name,
    description,
    category,
    updatedBy,
    createdBy,
    images,
    image,
    group,
    tags,
    device,
  } = req.body;
  // _id for the new document
  const _id = new mongoose.Types.ObjectId();
  // create displays and groups ids from data received
  const i_ids = images && images.map(image => mongoose.Types.ObjectId(image));
  const g_id = group && mongoose.Types.ObjectId(group);
  const d_id = mongoose.Types.ObjectId(device);
  // build the new display from its model
  const display = new Display({
    _id,
    url: `${process.env.API_URL}displays/${_id}`,
    name,
    description,
    updatedBy,
    createdBy,
    category,
    group,
    images,
    activeImage: image,
    tags,
    device,
    userGroup: req.AuthData.userGroup,
  });
  // save the display
  display.save()
  // update devices involved
    .then(() => Device.update({
      _id: d_id,
    }, {
      $set: {
        display: _id,
      },
    })) // add the display to selected device
  // update images involved
    .then(() => Image.updateMany({
      _id: {
        $in: i_ids,
      },
    }, {
      $addToSet: {
        displays: _id,
      },
    })) // add the display to selected images
  // update groups involved
    .then(() => Group.update({
      _id: g_id,
    }, {
      $addToSet: {
        displays: _id,
      },
    })) // add the display to selected images
  // send response
    .then(() => Promise.all([
      Display.find(_id)
        .select('_id url name description tags device updatedAt createdAt')
        .populate('device', '_id url name initcode')
        .exec(),
      Device.find({
        userGroup: req.AuthData.userGroup,
      })
        .select('_id name description display updatedAt createdAt')
        .populate('display', '_id url name description')
        .exec(),
    ]))
    .then(doc => res.status(201)
      .json({
        message: 'Success at adding a new display to the collection',
        success: true,
        resourceId: _id,
        resource: doc[0][0],
        devices: doc[1],
      }))
  // catch any errors
    .catch((err) => {
      console.log(err);
      res.status(500)
        .json({
          message: 'Internal Server Error',
          error: err,
        });
    });
};
/* UPDATE (PUT) */
exports.display_update = (req, res) => {
  // get the id from the request for the query
  const _id = req.params.id;
  // get displays and images ids from the request
  const {
    images,
    group,
    device,
  } = req.body;
  // create displays and images ids from data received
  const i_ids = images && images.map(image => mongoose.Types.ObjectId(image));
  const g_id = group && mongoose.Types.ObjectId(group);
  const d_id = device && mongoose.Types.ObjectId(device);
  // save for response
  let doc;
  Display.findOneAndUpdate({ // update display
    _id,
    userGroup: req.AuthData.userGroup,
  }, {
    $set: req.body,
  }, {
    new: true,
  })
    .then((doc) => {
      if (doc) {
        let updatePromises = [];
        if (i_ids) {
          updatePromises.push(Image.updateMany({
            displays: _id,
          }, {
            $pull: {
              displays: _id,
            },
          })
            .exec().catch(e => console.log(JSON.stringify({
              message: 'Error updating referenced images',
              error: e,
            }, null, ' '))));
        }
        if (g_id) {
          updatePromises.push(Group.update({
            displays: _id,
          }, {
            $pull: {
              displays: _id,
            },
          })
            .exec().catch(e => console.log(JSON.stringify({
              message: 'Error updating referenced groups',
              error: e,
            }, null, ' '))));
        }
        if (d_id) {
          updatePromises.push(Device.updateMany({
            displays: _id,
          }, {
            $pull: {
              display: _id,
            },
          })
            .exec().catch(e => console.log(JSON.stringify({
              message: 'Error updating referenced displays',
              error: e,
            }, null, ' '))));
        }
        Promise.all(updatePromises)
          .then(() => {
            updatePromises = [];
            if (i_ids) {
              updatePromises.push(Image.updateMany({
                _id: {
                  $in: i_ids,
                },
              }, {
                $addToSet: {
                  displays: _id,
                },
              })
                .exec().catch(e => console.log(e)));
            }
            if (g_id) {
              updatePromises.push(Group.updateMany({
                _id: g_id,
              }, {
                $addToSet: {
                  displays: _id,
                },
              })
                .exec().catch(e => console.log(e)));
            }
            if (d_id) {
              updatePromises.push(Device.update({
                _id: d_id,
              }, {
                $set: {
                  display: _id,
                },
              })
                .exec().catch(e => console.log(e)));
            }
            Promise.all(updatePromises);
          })
          .then(() => Promise.all([
            Display.findOne(mongoose.Types.ObjectId(_id))
              .select('_id url name description tags device updatedAt createdAt')
              .populate('device', '_id url name initcode')
              .exec(),
            Device.find({
              userGroup: req.AuthData.userGroup,
            })
              .select('_id url name description display updatedAt createdAt')
              .populate('display', '_id url name description')
              .exec(),
          ]))
          .then((doc) => {
            setTimeout(() => {
              res.status(201)
                .json({
                  message: 'Succes at updating a display from the collection',
                  notify: `'${doc[0].name}' actualizado`,
                  success: true,
                  resourceId: _id,
                  resource: doc[0],
                  devices: doc[1],
                });
            }, 0);
          });
      } else {
        res.status(401)
          .json({
            error: 'No valid entry found for provided id within the user group',
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500)
        .json({
          error: err,
        });
    });
};

/* DELETE */
exports.display_delete = (req, res) => {
  // get id from request parameters
  const _id = req.params.id;
  const query = req.AuthData.admin ? {
    _id,
  } : {
    _id,
    userGroup: req.AuthData.userGroup,
  };
  // delete document from collection
  // remove display
  Display.findOneAndDelete(query)
    .then(res => result = res)
  // update images involved
    .then(() => Image.updateMany({
      displays: _id,
    }, {
      $pull: {
        displays: _id,
      },
    })) // remove the display from all images that have its ref
  // update groups involved
    .then(() => {
      Group.update({ displays: _id }, { $pull: { displays: _id } });
    }) // remove the display from all groups that have its ref
  // update userGroups involved
    .then(() => {
      Device.update({ displays: _id }, { $pull: { displays: _id } });
    }) // remove the display from all devices that have its ref
  // send response
    .then(() => Device.find({ userGroup: req.AuthData.userGroup })
      .select('_id url name description display updatedAt createdAt')
      .populate('display', '_id url name description')
      .exec())
    .then((doc) => {
      res.status(200)
        .json({
          message: 'Success at removing a display from the collection',
          success: true,
          resourceId: _id,
          devices: doc,
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500)
        .json({
          error: err,
        });
    });
};
