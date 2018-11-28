const mongoose = require('mongoose');

const userGroupSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  name: { type: String, required: true },
  description: { type: String, default: 'Sin descripción' },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new userGroup an _id must be set in order to configure the url properly
userGroupSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}usergroups/${id}`;
  next();
});

module.exports = mongoose.model('UserGroup', userGroupSchema);
