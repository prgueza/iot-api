const mongoose = require( 'mongoose' )
const fs = require( 'fs' )

/* DATA MODELS */
const Group = require( '../models/group' )
const Display = require( '../models/display' )
const Image = require( '../models/image' )
const UserGroup = require( '../models/userGroup' )

/* GET ALL */
exports.images_get_all = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { error: 'Not allowed' } )
	} else {
		Image.find()
			.select( '_id name description tags url createdAt updatedAt' )
			.exec()
			.then( docs => {
				setTimeout( () => {
					res.status( 200 )
						.json( docs )
				}, 0 )
			} )
			.catch( err => {
				res.status( 500 )
					.json( { error: err } )
			} )
	}
}

/* GET ONE */
exports.images_get_one = ( req, res, next ) => {
	const _id = req.params.id
	const query = req.AuthData.admin ? {
		_id: _id
	} : {
		_id: _id,
		userGroup: req.AuthData.userGroup
	}
	Image.findById( query )
		.select( '_id url name description created_by updated_by extension path size src colorProfile resolution category groups displays tags userGroup createdAt updatedAt' )
		.populate( 'displays', '_id url name' )
		.populate( 'groups', '_id url name' )
		.populate( 'resolution', '_id url name size' )
		.populate( 'created_by', '_id url name' )
		.populate( 'updated_by', '_id url name' )
		.populate( 'userGroup', '_id url name description' )
		.exec()
		.then( doc => {
			if ( doc ) {
				res.status( 200 )
					.json( doc )
			} else {
				res.status( 404 )
					.json( { message: 'No valid entry found for provided id within the user group' } )
			}
		} )
		.catch( err => {
			console.log( err )
			res.status( 500 )
				.json( { error: err } )
		} )
}

/* POST */
exports.image_create = ( req, res, next ) => {
	// get data for new image
	const {
		name,
		description,
		created_by,
		updated_by,
		displays,
		groups,
		tags,
		resolution,
		category,
		color_profile
	} = req.body
	// create a new id for the image
	const _id = new mongoose.Types.ObjectId()
	// create displays and groups ids from data received
	const d_ids = displays && displays.map( ( d ) => mongoose.Types.ObjectId( d ) )
	const g_ids = groups && groups.map( ( g ) => mongoose.Types.ObjectId( g ) )
	// build the new image from its model
	const image = new Image( {
		_id: _id,
		url: process.env.API_URL + 'images/' + _id,
		name: name,
		description: description,
		created_by: created_by,
		updated_by: updated_by,
		color_profile: color_profile,
		resolution: resolution,
		size: 0,
		category: category,
		tags_total: tags.length,
		tags: tags,
		displays: displays,
		groups: groups,
		userGroup: req.AuthData.userGroup
	} )
	// save image
	image.save()
		// update displays involved
		.then( () => {
			return Display.updateMany( {
				_id: {
					$in: d_ids
				}
			}, {
				$addToSet: {
					images: _id
				}
			} )
		} ) // add the image to selected images
		// update groups involved
		.then( () => {
			return Group.updateMany( {
				_id: {
					$in: g_ids
				}
			}, {
				$addToSet: {
					images: _id
				}
			} )
		} ) // add the image to selected images
		// send response
		.then( () => Image.findById( _id )
			.select( '_id url name description tags created:at' )
			.exec() )
		.then( ( doc ) => {
			res.status( 201 )
				.json( {
					success: true,
					message: 'Success at uploading an image to the server',
					notify: 'Imagen \'' + doc.name + '\' creada',
					resourceId: doc._id,
					resource: doc
				} )
		} )
		// catch any errors
		.catch( err => {
			res.status( 500 )
				.json( { message: 'Internal Server Error', error: err } )
		} )
}

/* PUT */
exports.image_update = ( req, res, next ) => { // get id from request parameters
	const _id = req.params.id
	const query = req.AuthData.admin ? {
		_id: _id
	} : {
		_id: _id,
		userGroup: req.AuthData.userGroup
	}
	// delete document from collection
	// remove display
	Display.find( query )
		.remove()
		.exec()
		.then( ( res ) => result = res )
		// update images involved
		.then( () => {
			return Image.updateMany( {
				displays: _id
			}, {
				$pull: {
					displays: _id
				}
			} )
		} ) // remove the display from all images that have its ref
		// update groups involved
		.then( () => {
			return Group.updateMany( {
				displays: _id
			}, {
				$pull: {
					displays: _id
				}
			} )
		} ) // remove the display from all groups that have its ref
		// update userGroups involved
		.then( () => {
			return Device.updateMany( {
				displays: _id
			}, {
				$pull: {
					displays: _id
				}
			} )
		} ) // remove the display from all devices that have its ref
		// send response
		.then( () => Device.find( { userGroup: req.AuthData.userGroup } )
			.select( '_id url name description display updatedAt createdAt' )
			.populate( 'display', '_id url name description' )
			.exec() )
		.then( ( doc ) => {
			res.status( 200 )
				.json( { message: 'Success at removing a display from the collection', success: true, resourceId: _id, devices: doc } )
		} )
		.catch( err => {
			console.log( err )
			res.status( 500 )
				.json( { error: err } )
		} )
}

/* DELETE */
exports.image_delete = ( req, res, next ) => { // get id from request parameters
	const _id = req.params.id
	const query = req.AuthData.admin ? {
		_id: _id
	} : {
		_id: _id,
		userGroup: req.AuthData.userGroup
	}
	// remove image
	Image.find( query )
		.remove()
		.exec()
		.then( () => {
			return Display.updateMany( {
				images: _id
			}, {
				$pull: {
					images: _id
				}
			} )
		} )
		.then( () => {
			return Group.updateMany( {
				images: _id
			}, {
				$pull: {
					images: _id
				}
			} )
		} )
		.then( () => res.status( 200 )
			.json( { message: 'Success at removing an image from the collection', success: true, resourceId: _id } ) )
		.catch( err => {
			res.status( 500 )
				.json( { error: err } )
		} )
}

/* IMAGE UPLOAD */
exports.image_upload = ( req, res, next ) => {
	const _id = req.params.id
	Image.findById( _id )
		.then( doc => doc.path && fs.access( doc.path, ( result ) => { result && fs.unlink( doc.path ) } ) )
		.then( () => { //if path exists, remove previous file
			const updateObject = {
				extension: req.file.mimetype,
				size: req.file.size,
				path: req.file.path,
				src: process.env.API_URL + req.file.path
			}
			Image.findOneAndUpdate( {
					_id: _id
				}, {
					$set: updateObject
				}, { new: true } )
				.select( '_id url name description src tags createdAt updatedAt' )
				.then( doc => {
					res.status( 200 )
						.json( {
							success: true,
							message: 'Success at uploading an image to the server',
							notify: 'Imagen \'' + doc.name + '\' subida al servidor',
							resourceId: _id,
							resource: doc
						} )
				} )
		} )
		.catch( err => {
			console.log( err )
			res.status( 500 )
				.json( { message: 'Internal Server Error', error: err } )
		} )
}
