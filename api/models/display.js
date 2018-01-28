const mongoose = require('mongoose');

const displaySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    created_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_at: { type: Date, default: Date.now },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: mongoose.Schema.Types.ObjectId, ref: 'Resolution'},
    groups:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    images:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    active_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    tags_total: {type: Number, required: true },
    tags: [String],
    mac_address: String,
    gateway: { type: mongoose.Schema.Types.ObjectId, ref: 'Gateway' }
});

module.exports = mongoose.model('Display', displaySchema);
