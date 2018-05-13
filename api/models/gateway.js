const mongoose = require( 'mongoose' )

const gatewaySchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	sync: String,
	name: String,
	description: String,
	ip: String,
	port: Number,
	mac: String,
	location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } )

module.exports = mongoose.model( 'Gateway', gatewaySchema )
