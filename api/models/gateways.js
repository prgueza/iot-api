const mongoose = require('mongoose');

const gatewaySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    ip_address: String,
    mac_address: String,
    displays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Display' }],
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gateway', gatewaySchema);
