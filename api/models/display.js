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
    user: { type: String, required: true },
    resolution:{
      height: { type: Number, required: true },
      width: { type: Number, required: true },
    },
    groups:[
      {
          _id: mongoose.Schema.Types.ObjectId,
          url: String,
          id: Number,
          name: String,
      }
    ],
    images:[
      {
         _id: mongoose.Schema.Types.ObjectId,
         url: String,
         id: Number,
         name: String,
         src_url: String
      }
    ],
    active_image:{
      _id: mongoose.Schema.Types.ObjectId,
      url: String,
      id: Number,
      name: String,
      src_url: String
   },
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
