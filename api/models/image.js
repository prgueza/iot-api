const mongoose = require('mongoose');

const UserGroup = require('../models/userGroup.js');
const Display = require('../models/display.js');
const Group = require('../models/group.js');

const imageSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  name: { type: String, required: true },
  description: { type: String, default: 'No hay descripción disponible' },
  src: String,
  path: { type: String, default: null },
  extension: { type: String, default: 'Sin definir' },
  bytes: { type: String, default: 0 },
  category: { type: String, default: 'Sin categoría' },
  color: { type: String, enum: ['Color', 'Escala de grises'] },
  tags: [String],
  displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new image an _id must be set in order to configure the url properly
imageSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}images/${id}`;
  UserGroup.update({ _id: this.userGroup }, { $addToSet: { images: id } });
  next();
});

// After removing an image, it must be removed from any resource that may reference him
imageSchema.post('remove', { query: true, document: false }, function () {
  const Display = require('./display.js');
  const Group = require('./group.js');
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ images: _id }, { $pull: { images: _id } }),
    Display.updateMany({ images: _id }, { $pull: { images: _id } }),
    Group.updateMany({ images: _id }, { $pull: { images: _id } }),
  ]);
});


module.exports = mongoose.model('Image', imageSchema);
