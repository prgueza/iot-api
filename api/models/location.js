const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    name: { type: String, required: true },
    description: { type: String, default: 'Sin descripción' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
