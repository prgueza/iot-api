const fs = require('fs');

/* DATA MODELS */
const Image = require('../models/image');
const { SELECTION, MESSAGE } = require('./static');

/* GET ALL */
exports.imagesGetAll = async (req, res) => {
  try {
    if (!req.AuthData.admin) {
      res.status(401).json(MESSAGE[401]);
    } else {
      const image = await Image.find()
        .select(SELECTION.images.short)
        .exec();
      if (image) {
        res.status(200).json(image);
      } else {
        res.status(404).json(MESSAGE[404]);
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};

/* GET ONE */
exports.imagesGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.AuthData.admin ? { _id: id } : { _id: id, userGroup: req.AuthData.userGroup };
    const image = await Image.findById(query)
      .select(SELECTION.images.long)
      .populate('displays', SELECTION.displays.populate)
      .populate('groups', SELECTION.groups.populate)
      .populate('createdBy', SELECTION.screens.populate)
      .populate('updatedBy', SELECTION.users.populate)
      .populate('userGroup', SELECTION.userGroups.populate)
      .exec();
    if (image) {
      res.status(200).json(image);
    } else {
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
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
    const newImage = await Image.findById(_id).select(SELECTION.images.short);
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
    const image = await Image.findOneAndUpdate({ _id: id, userGroup: req.AuthData.userGroup }, { $set: body }, { new: true }).select(SELECTION.images.short);
    res.status(201).json({
      message: 'Succes at updating an image from the collection',
      notify: `${image.name} actualizada`,
      success: true,
      resourceId: id,
      resource: image,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(MESSAGE[500](error));
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
      res.status(404).json(MESSAGE[404]);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
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
        bytes: req.file.size,
        path: req.file.path,
        src: process.env.API_URL + req.file.path,
      };
      const newImage = await Image.findOneAndUpdate({ _id: id }, { $set: updateObject }, { new: true }).select(SELECTION.images.short);
      res.status(200)
        .json({
          success: true,
          message: 'Success at uploading an image to the server',
          notify: `Imagen '${newImage.name}' subida al servidor`,
          resourceId: id,
          resource: newImage,
        });
    }
    res.status(404).json(MESSAGE[404]);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(MESSAGE[500](error));
  }
};
