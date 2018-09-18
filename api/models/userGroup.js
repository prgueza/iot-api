const mongoose = require( 'mongoose' )

const userGroupSchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	name: { type: String, required: true },
	description: { type: String, default: 'Sin descripción' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } )

module.exports = mongoose.model( 'UserGroup', userGroupSchema )
