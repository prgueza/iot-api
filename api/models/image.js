const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: { type: String, required: true },
    description: { type: String, default: 'No hay descripción disponible' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    src_url: { type: String, default: 'undefined.png' },
    file: { type: String, default: 'Sin definir' },
    color_profile: { type: String, default: 'Sin definir' },
    resolution: { type: mongoose.Schema.Types.ObjectId, ref: 'Resolution'},
    size: { type: String, default: 0 },
    category: String,
    tags_total: Number,
    tags:[String],
    displays:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    groups:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Group'}]
});

module.exports = mongoose.model('Image', imageSchema);
