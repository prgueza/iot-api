const mongoose = require('mongoose')

const gatewaySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    sync_url: String,
    name: String,
    description: String,
    ip: String,
    port: Number,
    mac: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model('Gateway', gatewaySchema)
