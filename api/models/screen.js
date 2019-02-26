const mongoose = require('mongoose');

const screenSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  url: String,
  name: { type: String, required: true },
  description: { type: String, default: 'Sin descripción' },
  screenCode: { type: String, required: true },
  color: { type: String, default: 'Escala de grises', enum: ['Color', 'Escala de grises'] },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// Before creating a new screen an _id must be set in order to configure the url properly
screenSchema.pre('save', function (next) {
  const id = new mongoose.Types.ObjectId();
  this._id = id;
  this.url = `${process.env.API_URL}screens/${id}`;
  next();
});

module.exports = mongoose.model('Screen', screenSchema);
