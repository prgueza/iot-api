const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    resolutions:[
       {
          id: Number,
          name: String,
          resolution:{
             width: Number,
             height: Number
          }
    ],
    locations:[String]
});

module.exports = mongoose.model('Setting', settingSchema);
