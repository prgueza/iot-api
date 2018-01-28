const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    src_url: { type: String, required: true },
    file: String,
    color_profile: String,
    resolution: { type: mongoose.Schema.Types.ObjectId, ref: 'Resolution'},
    size: Number,
    category: String,
    tags_total: Number,
    tags:[String],
    displays:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    groups:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Group'}]
});

module.exports = mongoose.model('Image', imageSchema);
