const mongoose = require('mongoose');

const displaySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution:{
      height: { type: Number, required: true },
      width: { type: Number, required: true },
    },
    groups:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    images:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    active_image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    tags_total: {type: Number, required: true },
    tags: [String],
    mac_address: String,
    gateway: {
      _id: mongoose.Schema.Types.ObjectId,
      id: Number,
      name: String,
      ip_address: String
   }
});

module.exports = mongoose.model('Display', displaySchema);
