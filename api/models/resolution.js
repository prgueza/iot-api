const mongoose = require('mongoose');

const resolutionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: String,
    created_at: { type: Date, default: Date.now },
    size:{
       width: Number,
       height: Number
    }
});

module.exports = mongoose.model('Resolution', resolutionSchema);
