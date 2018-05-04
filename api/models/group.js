const mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: 'Sin descripcion' },
    active_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
    tags_total: { type: Number, required: true },
    tags:[String],
    displays:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    images:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
    userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model('Group', groupSchema)
