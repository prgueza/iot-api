const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    displays:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    active_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    images:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    tags_total: Number,
    tags:[String]
});

module.exports = mongoose.model('Group', groupSchema);
