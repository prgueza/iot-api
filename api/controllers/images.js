const fs = require('fs');

/* DATA MODELS */
const Image = require('../models/image');
const Selections = require('./select');

/* GET ALL */
exports.imagesGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json({ error: 'Not allowed' });
    } else {
      const image = await Image.find()
        .select(Selections.images.short)
        .exec();
      if (image) {
        res.status(200).json(image);
      } else {
        res.status(404).json({ message: 'Not valid entry for provided id' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* GET ONE */
exports.imagesGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const image = await Image.findById(query)
      .select(Selections.images.long)
      .populate('displays', Selections.displays.populate)
      .populate('groups', Selections.groups.populate)
      .populate('createdBy', Selections.screens.populate)
      .populate('updatedBy', Selections.users.populate)
      .populate('userGroup', Selections.userGroups.populate)
      .exec();
    if (image) {
      res.status(200).json(image);
    } else {
      res.status(404).json({ message: 'Not valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* POST */
exports.imageCreate = async (req, res) => {
  try {
    const { body } = req;
    body.size = 0;
    body.userGroup = req.AuthData.userGroup;
    const image = new Image(body);
    const { _id } = await image.save();
    const newImage = await Image.findById(_id).select(Selections.images.short);
    res.status(201).json({
      success: true,
      message: 'Success at uploading an image to the server',
      notify: `Imagen '${newImage.name}' creada`,
      resourceId: newImage._id,
      resource: newImage,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* PUT */
exports.imageUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const image = await Image.findOneAndUpdate({ _id: id, userGroup: req.AuthData.userGroup }, { $set: body }, { new: true }).select(Selections.images.short);
    res.status(201).json({
      message: 'Succes at updating an image from the collection',
      notify: `${image.name} actualizada`,
      success: true,
      resourceId: id,
      resource: image,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

/* DELETE */
exports.imageDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const image = await Image.findOne(query).remove();
    if (image) {
      res.status(200).json({
        message: 'Success at removing an image from the collection',
        success: true,
        resourceId: id,
      });
    } else {
      res.status(404).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

/* IMAGE UPLOAD */
exports.imageUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (image) {
      if (image.path) {
        await fs.access(image.path, (result) => {
          if (result) fs.unlink(image.path);
        });
      }
      const updateObject = {
        extension: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        src: process.env.API_URL + req.file.path,
      };
      const newImage = await Image.findOneAndUpdate({ _id: id }, { $set: updateObject }, { new: true }).select(Selections.images.short);
      res.status(200)
        .json({
          success: true,
          message: 'Success at uploading an image to the server',
          notify: `Imagen '${newImage.name}' subida al servidor`,
          resourceId: id,
          resource: newImage,
        });
    } else {
      res.status(404).json({ message: 'No valid entry for provided id' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};
