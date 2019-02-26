const mongoose = require('mongoose');
const moment = require('moment');

const UserGroup = require('./userGroup.js');
const Display = require('./display.js');

const deviceSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  name: { type: String, default: 'Dispositivo no configurado' },
  description: { type: String, default: 'Sin descripción' },
  mac: String,
  screen: String,
  batt: String,
  rssi: String,
  initcode: String,
  found: Boolean,
  lastFound: { type: Date, default: moment() },
  activeImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  display: { type: mongoose.Schema.Types.ObjectId, ref: 'Display' },
  userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
  gateway: { type: mongoose.Schema.Types.ObjectId, ref: 'Gateway' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

// Before creating a new device an _id must be set in order to configure the url properly
deviceSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}devices/${id}`;
  next();
});

// After removing a device, it must be removed from any resource that may reference him
deviceSchema.post('remove', { query: true, document: false }, function () {
  const { _id } = this.getQuery();
  Promise.all([
    UserGroup.findOneAndUpdate({ devices: _id }, { $pull: { devices: _id } }),
    Display.findOneAndDelete({ device: _id }),
  ]);
});


module.exports = mongoose.model('Device', deviceSchema);
