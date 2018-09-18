const mongoose = require( 'mongoose' )

const deviceSchema = mongoose.Schema( {
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	name: { type: String, default: "Dispositivo no configurado" },
	description: { type: String, default: "Sin descripción" },
	mac: String,
	screen: String,
	batt: String,
	rssi: String,
	initcode: String,
	found: Boolean,
	activeImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
	prefGateway: { type: mongoose.Schema.Types.ObjectId, ref: 'Gateway' },
	display: { type: mongoose.Schema.Types.ObjectId, ref: 'Display' },
	userGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGroup' },
	gateway: { type: mongoose.Schema.Types.ObjectId, ref: 'Gateway' },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
	timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
} )

module.exports = mongoose.model( 'Device', deviceSchema )
