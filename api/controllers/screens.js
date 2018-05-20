const mongoose = require( 'mongoose' )

/* DATA MODELS */
const Screen = require( '../models/screen.js' )
const Image = require( '../models/image.js' )
const Group = require( '../models/group.js' )
const Device = require( '../models/device.js' )

/* GET ALL */
exports.screens_get_all = ( req, res, next ) => {
	Screen.find()
		.select( '_id url name description screenCode colorProfile size createdAt' )
		.exec()
		.then( docs => res.status( 200 )
			.json( docs ) )
		.catch( err => res.status( 500 )
			.json( { error: err } ) )
}

/* GET ONE */
exports.screens_get_one = ( req, res, next ) => {
	Screen.findById( req.params.id )
		.select( '_id url name description screenCode colorProfile size createdAt' )
		.exec()
		.then( docs => res.status( 200 )
			.json( docs ) )
		.catch( err => res.status( 500 )
			.json( { error: err } ) )
}

/* POST */
exports.screen_create = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		const { name, description, size, screenCode, colorProfile } = req.body
		const _id = new mongoose.Types.ObjectId()
		const screen = new Screen( {
			_id: _id,
			url: process.env.API_URL + 'resolutions/' + _id,
			name: name,
			description: description,
			screenCode: screenCode,
			colorProfile: colorProfile,
			size: size,
		} )

		screen
			.save()
			.then( doc => {
				res.status( 201 )
					.json( {
						message: 'Success at adding a screen from the collection',
						success: true,
						resourceId: doc._id,
						resource: {
							'_id': doc._id,
							'url': doc.url,
							'name': doc.name,
							'description': doc.description,
							'size': doc.size,
							'screenCode': doc.screenCode,
							'updatedAt': doc.updatedAt,
							'createdAt': doc.createdAt,
						}
					} )
			} )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}

/* PUT */
exports.screen_update = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		Screen
			.findByIdAndUpdate( { _id: req.params.id }, { $set: req.body }, { new: true } )
			.then( doc => res.status( 200 )
				.json( {
					message: 'Success at updating a screen from the collection',
					notify: 'Pantalla \'' + doc.name + '\' actualizada',
					success: true,
					resourceId: req.params.id,
					resource: doc
				} ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}

/* DELETE */
exports.screen_delete = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		Screen
			.findByIdAndRemove( { _id: req.params.id } )
			.exec()
			.then( doc => res.status( 200 )
				.json( {
					message: 'Success at removing a screen from the collection',
					success: true,
					resourceId: req.params.id,
					resource: doc
				} ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}
