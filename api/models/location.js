const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
