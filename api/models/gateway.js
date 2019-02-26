const mongoose = require('mongoose');

const Device = require('./device.js');

const gatewaySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  sync: String,
  name: String,
  description: String,
  ip: String,
  port: Number,
  mac: String,
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new user an _id must be set in order to configure the url properly
gatewaySchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}gateways/${id}`;
  this.sync = `http://${this.ip}:${this.port}/devices`;
  next();
});

// After removing a gateway, it must be removed from any resource that may reference him
gatewaySchema.post('remove', { query: true, document: false }, function () {
  const { _id } = this.getQuery();
  Device.updateMany({ gateway: _id }, { $unset: { gateway: '' } });
});

module.exports = mongoose.model('Gateway', gatewaySchema);
