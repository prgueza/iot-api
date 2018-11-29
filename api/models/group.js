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
groupSchema.pre('save', async function (next) {
  const id = new mongoose.Types.ObjectId();
  const Display = require('./display.js'); // TODO: investigate why declaring Display globally doesn't work
  const Image = require('./image.js');
  const Group = require('./group.js');
  this._id = id;
  this.url = `${process.env.API_URL}groups/${id}`;
  if (this.displays) {
    this.displays.forEach(async (display) => {
      await Group.updateMany({ displays: display }, { $pull: { displays: display } }).exec();
    });
  } await Promise.all([
    UserGroup.update({ _id: this.userGroup }, { $addToSet: { groups: id } }).exec(),
    Display.updateMany({ _id: { $in: this.displays } }, { group: id }).exec(),
    Image.updateMany({ _id: { $in: this.images } }, { $addToSet: { groups: id } }).exec(),
  ]);
  next();
});

// After removing a group, it must be removed from any resource that may reference him
groupSchema.post('remove', { query: true, document: false }, async function () {
  const Display = require('./display.js');
  const Image = require('./image.js');
  const { _id } = this.getQuery();
  await Promise.all([
    UserGroup.findOneAndUpdate({ groups: _id }, { $pull: { groups: _id } }).exec(),
    Display.updateMany({ group: _id }, { $unset: { group: '' } }).exec(),
    Image.updateMany({ groups: _id }, { $pull: { groups: _id } }).exec(),
  ]);
});


// After updating a group, since the userGroup might have changed, it may be needed to update the userGroups
groupSchema.pre('findOneAndUpdate', async function () {
  const Display = require('./display.js');
  const Image = require('./image.js');
  const Group = require('./group.js');
  const { _id } = this.getQuery();
  await Promise.all([
    Display.updateMany({ group: _id }, { $unset: { group: '' } }).exec(),
    Image.updateMany({ groups: _id }, { $pull: { groups: _id } }).exec(),
  ]);
  if (this._update.$set.displays) {
    this._update.$set.displays.forEach(async (display) => {
      await Group.updateMany({ displays: display }, { $pull: { displays: display } }).exec();
      await Display.updateMany({ _id: mongoose.Types.ObjectId(display) }, { $set: { group: _id } }).exec();
    });
  }
  if (this._update.$set.images) {
    await Image.updateMany({ _id: { $in: this._update.$set.images.map(image => mongoose.Types.ObjectId(image)) } }, { $addToSet: { groups: _id } }).exec();
  }
});

module.exports = mongoose.model('Group', groupSchema);
