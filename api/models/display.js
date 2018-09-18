const mongoose = require( 'mongoose' )

const displaySchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	name: { type: String, required: true },
	description: { type: String, required: true },
	tags: [ String ],
	category: { type: String, default: "Sin categoría" },
	activeImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
	overlayImage: {
		image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
		size: { type: Number, default: 100 },
		xCoordinate: { type: Number, default: 0 },
		yCoordinate: { type: Number, default: 0 }
	},
	imageFromGroup: { type: Boolean, default: false },
	images: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Image' } ],
	group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
	device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
	userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } )

module.exports = mongoose.model( 'Display', displaySchema )
