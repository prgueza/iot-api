const mongoose = require( 'mongoose' )

/* DATA MODELS */
const Group = require( '../models/group' )
const Display = require( '../models/display' )
const Image = require( '../models/image' )
const UserGroup = require( '../models/userGroup' )

/* GET ALL */
exports.group_get_all = ( req, res, next ) => {
	const query = req.AuthData.admin ? {} : { userGroup: req.AuthData.userGroup }
	Group.find( query )
		.select( '_id name description tags url createdAt updatedAt' )
		.exec()
		.then( docs => {
			setTimeout( () => {
				res.status( 200 )
					.json( docs )
			}, process.env.DELAY )
		} )
		.catch( err => {
			res.status( 500 )
				.json( {
					message: 'Internal Server Error',
					error: err
				} )
		} )
}

/* GET ONE */
exports.group_get_one = ( req, res, next ) => {
	const _id = req.params.id
	const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
	Group.findOne( query )
		.select( '_id url name description createdAt createdBy updatedAt updatedBy activeImage overlayImage images displays tags resolution' )
		.populate( 'activeImage', '_id url src name description createdAt tags_total' )
		.populate( 'overlayImage.image', '_id url name src' )
		.populate( 'images', '_id url src name description createdAt tags_total' )
		.populate( 'displays', '_id url name description createdAt tags_total' )
		.populate( 'resolution', '_id url name size' )
		.populate( 'createdBy', '_id url name' )
		.populate( 'updatedBy', '_id url name' )
		.exec()
		.then( doc => {
			if ( doc ) { // if the group is found
				res.status( 200 )
					.json( doc ) // set response status to 200 and return the doc
			} else { // set response status to 404 and return an error message
				res.status( 404 )
					.json( { message: 'No valid entry found for provided id within the user group' } )
			}
		} )
		.catch( err => { // catch any errors
			console.log( err )
			res.status( 500 )
				.json( {
					message: 'Internal Server Error',
					error: err
				} )
		} )
}

/* POST */
exports.group_create = ( req, res, next ) => {
	// get data for new group
	const { name, description, createdBy, updatedBy, displays, images, activeImage, resolution, tags } = req.body
	// create a new id for the new group
	const _id = new mongoose.Types.ObjectId()
	// create displays and images ids from data received
	const d_ids = displays && displays.map( ( d ) => mongoose.Types.ObjectId( d ) )
	const i_ids = images && images.map( ( i ) => mongoose.Types.ObjectId( i ) )
	// build the new group with its model
	const group = new Group( {
		_id: _id,
		url: process.env.API_URL + 'groups/' + _id,
		name: name,
		description: description,
		createdBy: createdBy,
		updatedBy: updatedBy,
		tags: tags,
		activeImage: activeImage,
		displays: displays,
		images: images,
		resolution: resolution,
		userGroup: req.AuthData.userGroup
	} )
	// save group
	group
		.save()
		// update displays involved
		.then( () => { return Display.updateMany( { _id: { $in: d_ids } }, { $addToSet: { groups: _id } } ) } ) // add the group to selected displays
		// update images involved
		.then( () => { return Image.updateMany( { _id: { $in: i_ids } }, { $addToSet: { groups: _id } } ) } ) // add the group to selected images
		// send response
		.then( () => Group.findById( _id )
			.select( '_id url name description tags updatedAt createdAt' )
			.exec() )
		.then( ( doc ) => {
			res.status( 201 )
				.json( {
					message: 'Success at adding a new group to the collection',
					notify: `Se ha creado un nuevo grupo: '${doc.name}'`,
					success: true,
					resourceId: doc._id,
					resource: doc
				} )
		} )
		// catch any errors
		.catch( err => {
			console.log( err )
			res.status( 500 )
				.json( {
					message: 'Internal Server Error',
					error: err
				} )
		} )
}

/* PUT */
exports.group_update = ( req, res, next ) => {
	// get the id from the request for the query
	const _id = req.params.id
	// get displays and images ids from the request
	const { displays, images, userGroup } = req.body
	// create displays and images ids from data received
	const d_ids = displays && displays.map( ( d ) => mongoose.Types.ObjectId( d ) )
	const i_ids = images && images.map( ( i ) => mongoose.Types.ObjectId( i ) )
	const u_id = mongoose.Types.ObjectId( userGroup )
	// update the group based on its id
	Group
		// update group
		.findOneAndUpdate( { _id: _id, userGroup: req.AuthData.userGroup }, { $set: req.body } )
		// update displays involved
		.then( () => { return Display.updateMany( { groups: _id }, { $unset: { group: undefined } } ) } ) // remove the group from all displays that have its ref
		.then( () => { return Display.updateMany( { _id: { $in: d_ids } }, { group: _id } ) } ) // add the group to selected displays
		// update images involved
		.then( () => { return Image.updateMany( { groups: _id }, { $pull: { groups: _id } } ) } ) // remove the group from all images that have its ref
		.then( () => { return Image.updateMany( { _id: { $in: i_ids } }, { $addToSet: { groups: _id } } ) } ) // add the group to selected images
		// update userGroups involved
		.then( () => { return UserGroup.updateMany( { groups: _id }, { $pull: { groups: _id } } ) } ) // remove the group from all userGroups that have its ref
		.then( () => { return UserGroup.update( { _id: u_id }, { $addToSet: { groups: _id } } ) } ) // add the group to selected userGroup
		// send response
		.then( ( res ) => Group.findById( _id )
			.select( '_id url name description tags updatedAt createdAt' )
			.exec() )
		.then( doc => {
			res.status( 201 )
				.json( {
					message: 'Success at updating a group from the collection',
					success: true,
					resourceId: doc._id,
					resource: doc
				} )
		} )
		// catch any errors
		.catch( err => {
			console.log( err )
			res.status( 500 )
				.json( {
					message: 'Internal Server Error',
					error: err
				} )
		} )
}

/* DELETE */
exports.group_delete = ( req, res, next ) => {
	// get id from request parameters
	const _id = req.params.id
	const query = req.AuthData.admin ? { _id: _id } : { _id: _id, userGroup: req.AuthData.userGroup }
	// delete document from collection
	Group
		.findOneAndRemove( query )
		.exec()
		.then( ( doc ) => {
			if ( doc ) {
				return Promise.all( [
        Display.updateMany( { groups: _id }, { $unset: { group: _id } } ),
        Image.updateMany( { groups: _id }, { $pull: { groups: _id } } )
      ] )
					.then( () => {
						res.status( 200 )
							.json( {
								message: 'Success at removing a group from the collection',
								success: true,
								resourceId: _id
							} )
					} )
			} else {
				res.status( 404 )
					.json( { message: 'No valid entry found for provided id within the user group' } )
			}
		} )
		// catch any errors
		.catch( ( err ) => {
			res.status( 500 )
				.json( {
					message: 'Internal Server Error',
					error: err,
				} )
		} )
}
