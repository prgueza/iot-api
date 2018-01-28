const mongoose = require('mongoose');

const resolutionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: String,
    id: Number,
    name: { type: String, required: true },
    description: { type: String, default: 'Sin descripción' },
    created_at: { type: Date, default: Date.now },
    size:{
       width: { type: Number, default: 0 },
       height: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('Resolution', resolutionSchema);
