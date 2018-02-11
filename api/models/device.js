const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    ip_address: String,
    mac_address: String,
    status: String,
    display: { type: mongoose.Schema.Types.ObjectId, ref: 'Display' },
    gateway: { type: mongoose.Schema.Types.ObjectId, ref: 'Gateway' },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);
