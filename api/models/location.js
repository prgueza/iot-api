const mongoose = require('mongoose');

const Gateway = require('./gateway.js');

const locationSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  name: { type: String, required: true },
  description: { type: String, default: 'Sin descripción' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new location an _id must be set in order to configure the url properly
locationSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}locations/${id}`;
  next();
});

// After removing a location, it must be removed from any resource that may reference it
locationSchema.post('remove', { query: true, document: false }, function () {
  const { _id } = this.getQuery();
  Gateway.findOneAndUpdate({ location: _id }, { $unset: { location: '' } });
});


module.exports = mongoose.model('Location', locationSchema);
