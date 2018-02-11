const mongoose = require('mongoose');

const gatewaySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    ip_address: String,
    mac_address: String,
    devices_linked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    devices_in_range: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gateway', gatewaySchema);
