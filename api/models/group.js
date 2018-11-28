const mongoose = require('mongoose');

const UserGroup = require('./userGroup.js');
// const Image = require('./image.js');
// const Display = require('./display');

const groupSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: { type: String },
  name: { type: String, required: true },
  description: { type: String, default: 'Sin descripcion' },
  tags: [String],
  activeImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
  displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
  userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new group an _id must be set in order to configure the url properly
groupSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  const Display = require('./display.js'); // TODO: investigate why declaring Display globally doesn't work
  const Image = require('./image.js');
  this._id = id;
  this.url = `${process.env.API_URL}groups/${id}`;
  Promise.all([
    UserGroup.update({ _id: this.userGroup }, { $addToSet: { groups: id } }),
    Display.updateMany({ _id: { $in: this.displays } }, { group: id }),
    Image.updateMany({ _id: { $in: this.images } }, { $addToSet: { groups: id } }),
  ]);
  next();
});

// After removing a group, it must be removed from any resource that may reference him
groupSchema.post('remove', { query: true, document: false }, function () {
  const Display = require('./display.js');
  const Image = require('./image.js');
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ groups: _id }, { $pull: { groups: _id } }),
    Display.updateMany({ group: _id }, { $unset: { group: '' } }),
    Image.updateMany({ groups: _id }, { $pull: { groups: _id } }),
  ]);
});

module.exports = mongoose.model('Group', groupSchema);
