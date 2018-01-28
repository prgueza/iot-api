const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: { type: String, required: true },
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, default: 'Sin descripcion' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
    images:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    displays:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    tags:[String]
});

module.exports = mongoose.model('Group', groupSchema);
