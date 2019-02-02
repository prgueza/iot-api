const mongoose = require('mongoose');

const Image = require('../models/image.js');
const Group = require('../models/group.js');
const Device = require('../models/device.js');
const UserGroup = require('../models/userGroup.js');

const displaySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  name: { type: String, required: true },
  description: { type: String, required: true },
  tags: [String],
  category: { type: String, default: 'Sin categoría' },
  activeImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  imageFromGroup: { type: Boolean, default: false },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  updating: { type: Boolean, default: false },
  lastUpdateResult: { type: Boolean, default: false },
  timeline: { type: String, default: '' },
  userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new display an _id must be set in order to configure the url properly
displaySchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}displays/${id}`;
  Promise.all([
    Device.update({ _id: this.device }, { $set: { display: id } }),
    Image.updateMany({ _id: { $in: this.images } }, { $addToSet: { displays: id } }),
    UserGroup.update({ _id: mongoose.Types.ObjectId(this.userGroup) }, { $addToSet: { displays: id } }),
  ]);
  next();
});

// After removing a display, it must be removed from any resource that may reference him
displaySchema.pre('remove', { query: true, document: false }, function () {
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ displays: _id }, { $pull: { displays: _id } }),
    Device.findOneAndUpdate({ display: _id }, { $unset: { display: '' } }),
    Image.updateMany({ displays: _id }, { $pull: { displays: _id } }),
    Group.updateMany({ displays: _id }, { $pull: { displays: _id } }),
  ]);
});

// After updating a display, since the images might have changed, it may be needed to update the reference
displaySchema.pre('findOneAndUpdate', async function (next) {
  const { _id } = this.getQuery();
  Image.updateMany({ displays: _id }, { $pull: { displays: _id } });
  next();
});

module.exports = mongoose.model('Display', displaySchema);
