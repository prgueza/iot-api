const mongoose = require('mongoose');

const UserGroup = require('./userGroup.js');
const Display = require('./display.js');
const Image = require('./image.js');
const Group = require('./group.js');
const Gateway = require('./gateway.js');
const Location = require('./location.js');
const Screen = require('./screen.js');
const Device = require('./device.js');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  admin: { type: Boolean, default: false },
  userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new user an _id must be set in order to configure the url properly
userSchema.pre('save', async function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}users/${id}`;
  if (this.userGroup) {
    await UserGroup.update({ _id: this.userGroup }, { $addToSet: { users: id } });
  }
  next();
});

// After removing a user, it must be removed from any resource that may reference him
userSchema.post('remove', { query: true, document: false }, function () {
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ users: _id }, { $pull: { users: _id } }),
    Display.updateMany({ createdBy: _id }, { $unset: { createdBy: '' } }),
    Display.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
    Image.updateMany({ createdBy: _id }, { $unset: { createdBy: '' } }),
    Image.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
    Group.updateMany({ createdBy: _id }, { $unset: { createdBy: '' } }),
    Group.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
    Gateway.updateMany({ createdBy: _id }, { $unset: { createdBy: '' } }),
    Gateway.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
    Location.updateMany({ createdBy: _id }, { $unset: { createdBy: '' } }),
    Location.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
    Screen.updateMany({ createdBy: _id }, { $unset: { createdBy: '' } }),
    Screen.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
    Device.updateMany({ updatedBy: _id }, { $unset: { updatedBy: '' } }),
  ]);
});

// After updating a user, since the userGroup might have changed, it may be needed to update the userGroups
userSchema.pre('findOneAndUpdate', async function (next) {
  const { _id } = this.getQuery();
  await UserGroup.findOneAndUpdate({ users: _id }, { $pull: { users: _id } });
  next();
});

module.exports = mongoose.model('User', userSchema);
