const mongoose = require( 'mongoose' )

/* DATA MODELS */
const UserGroup = require( '../models/userGroup.js' )

// TODO: filter response and write missing methods

/* GET ALL */
exports.userGroups_get_all = ( req, res, next ) => {
	// if ( !req.AuthData.admin ) {
	// 	res.status( 401 )
	// 		.json( { message: 'Not allowed' } )
	// } else {
	UserGroup.find()
		.select( '_id url name description createdAt' )
		.exec()
		.then( docs => res.status( 200 )
			.json( docs ) )
		.catch( err => res.status( 500 )
			.json( { error: err } ) )
	//}
}

/* GET ONE */
exports.userGroups_get_one = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		UserGroup.findById( req.params.id )
			.select( '_id url name description createdAt' )
			.exec()
			.then( docs => res.status( 200 )
				.json( docs ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}

/* POST */
exports.userGroup_create = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		const { name, description } = req.body
		const _id = new mongoose.Types.ObjectId()
		const userGroup = new UserGroup( {
			_id: _id,
			url: process.env.API_URL + 'userGroups/' + _id,
			name: name,
			description: description,
		} )

		userGroup
			.save()
			.then( doc => {
				res.status( 201 )
					.json( {
						message: 'Success at adding a new usergroup to the collection',
						success: true,
						resourceId: doc._id,
						resource: {
							_id: doc._id,
							url: doc.url,
							name: doc.name,
							description: doc.description,
							createdAt: doc.createdAt,
							updatedAt: doc.updatedAt
						}
					} )
			} )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}

/* PUT */
exports.userGroup_update = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		UserGroup
			.findByIdAndUpdate( { _id: req.params.id }, { $set: req.body }, { new: true } )
			.select( '_id url name description createdAt updatedAt' )
			.exec()
			.then( doc => res.status( 200 )
				.json( {
					message: 'Success at updating an usergroup from the collection',
					notify: doc.name + ' actualizado',
					success: true,
					resourceId: req.params.id,
					resource: doc
				} ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}

/* DELETE */
exports.userGroup_delete = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		UserGroup
			.findByIdAndRemove( { _id: req.params.id } )
			.select( '_id url name description createdAt updatedAt' )
			.exec()
			.then( doc => res.status( 200 )
				.json( {
					message: 'Success at removing an usergroup from the collection',
					success: true,
					resourceId: req.params.id,
					resource: doc
				} ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}
