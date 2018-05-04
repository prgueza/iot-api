const mongoose = require('mongoose')

const displaySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    name: { type: String, required: true },
    description: { type: String, required: true },
    tags_total: { type: Number, required: true },
    tags: [String],
    category: { type: String, default: "Sin categoría" },
    active_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    images:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    groups:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup'},
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model('Display', displaySchema)
