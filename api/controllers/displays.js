const mongoose = require('mongoose');

/* DATA MODELS */
const Group = require('../models/group');
const Display = require('../models/display');
const Image = require('../models/image');
const Device = require('../models/device');

/* GET ALL */
exports.displaysGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const displays = await Display.find()
        .select('_id url name description tags device createdAt updatedAt')
        .populate('device', '_id url name initcode')
        .exec();
      res.status(200).json(displays);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.displaysGetOne = async (req, res) => {
  try {
    const _id = req.params.id;
    const query = req.AuthData.admin
      ? { _id }
      : { _id, userGroup: req.AuthData.userGroup };
    const display = await Display.findOne(query)
      .select('_id url name description category location tags images group userGroup overlayImage imageFromGroup createdBy createdAt updatedAt updating lastUpdateResult')
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
      .exec();
    if (display) {
      res.status(200).json(display);
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id within the given user group' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.displayCreate = async (req, res) => {
  try {
    const {
      body, body: {
        images, group, device,
      },
    } = req;
    // _id for the new document
    const _id = new mongoose.Types.ObjectId();
    // create displays and groups ids from data received
    const iIDs = images && images.map(i => mongoose.Types.ObjectId(i));
    const gID = group && mongoose.Types.ObjectId(group);
    const dID = mongoose.Types.ObjectId(device);
    // set new properties to the body object
    body._id = _id;
    body.url = `${process.env.API_URL}displays/${_id}`;
    body.activeImage = body.image;
    body.userGroup = req.AuthData.userGroup;
    // build the new display from its model
    const display = new Display(body);
    // Save the display
    await display.save();
    // Update resources involved
    await Promise.all([
      Device.update({ _id: dID }, { $set: { display: _id } }),
      Image.updateMany({ _id: { $in: iIDs } }, { $addToSet: { displays: _id } }),
      Group.update({ _id: gID }, { $addToSet: { displays: _id } }),
    ]);
    // Get the display and the device
    const response = await Promise.all([
      Display.find(_id)
        .select('_id url name description tags device updatedAt createdAt')
        .populate('device', '_id url name initcode')
        .exec(),
      Device.find({ userGroup: req.AuthData.userGroup })
        .select('_id name description display updatedAt createdAt')
        .populate('display', '_id url name description')
        .exec(),
    ]);
    // Send the response
    res.status(201).json({
      message: 'Success at adding a new display to the collection',
      success: true,
      resourceId: _id,
      resource: response[0][0],
      devices: response[1],
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};


/* UPDATE (PUT) */
exports.displayUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      images,
      group,
      device,
    } = req.body;
    const imageIds = images && images.map(image => mongoose.Types.ObjectId(image));
    const groupId = group && mongoose.Types.ObjectId(group);
    const deviceId = device && mongoose.Types.ObjectId(device);
    const display = await Display.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    const pullPromises = [];
    const pushPromises = [];
    if (display) {
      if (imageIds) {
        pullPromises.push(Image.updateMany({ displays: id }, { $pull: { displays: id } }).exec());
        pushPromises.push(Image.updateMany({ _id: { $in: imageIds } }, { $addToSet: { displays: id } }).exec());
      }
      if (groupId) {
        pullPromises.push(Group.update({ displays: id }, { $pull: { displays: id } }).exec());
        pushPromises.push(Group.update({ _id: groupId }, { $addToSet: { displays: id } }).exec());
      }
      if (deviceId) {
        pullPromises.push(Device.update({ displays: id }, { $unset: { display: undefined } }).exec());
        pushPromises.push(Device.update({ _id: deviceId }, { $set: { display: id } }).exec());
      }
      if (pullPromises) await Promise.all(pullPromises);
      if (pushPromises) await Promise.all(pushPromises);
      const devices = await Device.find().populate('display', '_id url name description').exec();
      res.status(201).json({
        message: 'Succes at updating a display from the collection',
        notify: `'${display.name}' actualizado`,
        success: true,
        resourceId: id,
        resource: display,
        devices,
      });
    } else {
      res.status(404).json({ message: `No valid entry for provided id: ${id}` });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.displayDelete = async (req, res) => {
  try {
    const _id = req.params.id;
    const query = req.AuthData.admin
      ? { _id }
      : { _id, userGroup: req.AuthData.userGroup };
    const display = await Display.findOneAndDelete(query);
    if (display) {
      await Promise.all([
        Image.updateMany({ displays: _id }, { $pull: { displays: _id } }),
        Group.update({ displays: _id }, { $pull: { displays: _id } }),
        Device.update({ display: _id }, { $unset: { display: '' } }),
      ]);
      const devices = await Device.find().select('_id url name description display').populate('display', '_id url name');
      res.status(200).json({
        message: 'Success at removing a display from the collection',
        success: true,
        resourceId: _id,
        devices,
      });
    } else {
      res.status(404).json({ message: 'No valid entry found for provided id' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
