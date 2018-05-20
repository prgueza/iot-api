const mongoose = require( 'mongoose' )

const groupSchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: { type: String, required: true },
	name: { type: String, required: true },
	description: { type: String, default: 'Sin descripcion' },
	tags: [ String ],
	activeImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image', default: null },
	overlayImage: {
		image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
		size: { type: Number, default: 100 },
		xCoordinate: { type: Number, default: 0 },
		yCoordinate: { type: Number, default: 0 }
	},
	displays: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Display' } ],
	images: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Image' } ],
	screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen' },
	userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } )

module.exports = mongoose.model( 'Group', groupSchema )
