const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: { type: String, required: true },
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, default: 'No hay descripción disponible' },
    src_url: String,
    path: { type: String, default: null },
    extension: { type: String, default: 'Sin definir' },
    color_profile: { type: String, default: 'escala de grises' },
    size: { type: String, default: 0 },
    category: { type: String, default: "Sin categoría" },
    tags_total: { type: Number, required: true },
    tags:[String],
    displays:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    groups:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    resolution: { type: mongoose.Schema.Types.ObjectId, ref: 'Resolution' },
    userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Image', imageSchema);
