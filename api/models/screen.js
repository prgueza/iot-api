const mongoose = require( 'mongoose' )

const screenSchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	name: { type: String, required: true },
	description: { type: String, default: 'Sin descripción' },
	screenCode: { type: String, required: true },
	colorProfile: { type: String, default: 'grayscale' },
	size: {
		width: { type: Number, default: 0 },
		height: { type: Number, default: 0 }
	},
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } )

module.exports = mongoose.model( 'Screen', screenSchema )
