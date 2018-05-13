const mongoose = require( 'mongoose' )

const imageSchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: { type: String, required: true },
	name: { type: String, required: true },
	description: { type: String, default: 'No hay descripción disponible' },
	src: String,
	path: { type: String, default: null },
	extension: { type: String, default: 'Sin definir' },
	size: { type: String, default: 0 },
	category: { type: String, default: "Sin categoría" },
	tags: [ String ],
	displays: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Display' } ],
	groups: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Group' } ],
	userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } )

module.exports = mongoose.model( 'Image', imageSchema )
