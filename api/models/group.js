const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    description: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    user: String,
    displays:[
       {
         _id: mongoose.Schema.Types.ObjectId,
         url: String,
         id: Number,
         name: String
       }
    ],
    active_image:{
       _id: mongoose.Schema.Types.ObjectId,
       url: String,
       id: Number,
       name: String,
       src_url: String
    },
    images:[
       {
         _id: mongoose.Schema.Types.ObjectId,
         url: String,
         id: Number,
         name: String,
         src_url: String
       }
    ],
    tags_total: Number,
    tags:[String]
});

module.exports = mongoose.model('Group', groupSchema);
