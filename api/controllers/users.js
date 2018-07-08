const mongoose = require( 'mongoose' )
const bcrypt = require( 'bcrypt' )
const jwt = require( 'jsonwebtoken' )

/* DATA MODELS */
const User = require( '../models/user.js' )
const UserGroup = require( '../models/userGroup.js' )
const Display = require( '../models/display.js' )
const Image = require( '../models/image.js' )
const Group = require( '../models/group.js' )
const Device = require( '../models/device.js' )
const Gateway = require( '../models/gateway.js' )
const Screen = require( '../models/screen.js' )
const Location = require( '../models/location.js' )

/* GET ALL */
exports.users_get_all = ( req, res, next ) => {
	User.find()
		.select( '_id url name login email createdAt updatedAt admin userGroup' )
		.populate( 'userGroup', '_id url name' )
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

/* GET ONE */
exports.users_get_one = ( req, res, next ) => {
	const id = req.params.id
	User.findById( id )
		.select( '_id url name login password email createdAt updatedAt admin' )
		.exec()
		.then( doc => {
			if ( doc ) {
				res.status( 200 )
					.json( doc )
			} else {
				res.status( 404 )
					.json( { message: 'No valid entry found for provided id' } )
			}
		} )
		.catch( err => {
			res.status( 500 )
				.json( { error: err } )
		} )
}

/* SIGN UP */
exports.user_signup = ( req, res, next ) => {
	User.find( { login: req.body.login } )
		.exec()
		.then( user => {
			if ( user.length >= 1 ) {
				return res.status( 409 )
					.json( {
						message: 'Login exists'
					} )
			} else {
				bcrypt.hash( req.body.password, 10, ( err, hash ) => {
					if ( err ) {
						return res.status( 500 )
							.json( {
								error: err
							} )
					} else {
						const _id = new mongoose.Types.ObjectId()
						const user = new User( {
							_id: _id,
							url: process.env.API_URL + 'users/' + _id,
							login: req.body.login,
							name: req.body.name,
							email: req.body.email,
							admin: req.body.admin,
							userGroup: req.body.userGroup || undefined,
							password: hash,
						} )
						user
							.save()
							.then( () => {
								if ( req.body.userGroup ) {
									return UserGroup.update( { _id: mongoose.Types.ObjectId( req.body.userGroup ) }, { $addToSet: { users: _id } } )
								}
							} )
							.then( () => {
								return User.findById( _id )
									.select( '_id url name login email admin userGroup' )
									.exec()
							} )
							.then( doc => {
								res.status( 201 )
									.json( {
										message: 'Success at adding a user to the collection',
										success: true,
										resourceId: doc._id,
										resource: doc
									} )
							} )
							.catch( err => {
								res.status( 500 )
									.json( {
										error: err
									} )
							} )
					}
				} )
			}
		} )
}

/* LOGIN */
exports.user_login = ( req, res, next ) => {
	// check if the user exists
	User.findOne( { login: req.body.login } )
		.select( '_id url login password name email admin userGroup createdAt' )
		.populate( 'userGroup', '_id url name' )
		.exec()
		// user array
		.then( user => {
			// check if user was found or not
			if ( !user ) { // not found
				return res.status( 401 )
					.json( {
						message: 'Auth failed'
					} )
			}
			// found => check if password is correct
			bcrypt.compare( req.body.password, user.password, ( err, result ) => {
				// general error from bcrypt
				if ( err ) {
					return res.status( 401 )
						.json( {
							message: 'Auth failed'
						} )
				}
				if ( result ) { // passowrd matches!
					// create token
					const token = jwt.sign( { // payload
							login: user.login,
							userID: user._id,
							userGroup: user.userGroup._id,
							admin: user.admin
						},
						// secret key
						process.env.JWT_KEY, { // options
							expiresIn: "1h"
						}
					)

					var resources_array = user.admin ? [
            Device.find()
						.select( '_id url name description initcode gateway updatedAt' )
						.populate( 'gateway', '_id ulr name' )
						.exec(),
            Gateway.find()
						.select( '_id url name description ip port mac device updatedAt createdAt' )
						.exec(),
            UserGroup.find()
						.select( '_id url name description' )
						.exec(),
            Screen.find()
						.select( '_id url name description size screen_code color_profile' )
						.exec(),
            Location.find()
						.select( '_id url name description' )
						.exec(),
            User.find()
						.select( '_id url name login email admin userGroup' )
						.populate( 'userGroup', '_id url name' )
						.exec()
          ] : [
            Display.find( { userGroup: user.userGroup._id } )
						.select( '_id url name description tags device updatedAt createdAt' )
						.populate( 'device', '_id url name initcode' )
						.exec(),
            Image.find( { userGroup: user.userGroup._id } )
						.select( '_id url name description tags src updatedAt createdAt' )
						.exec(),
            Group.find( { userGroup: user.userGroup._id } )
						.select( '_id url name description tags updatedAt createdAt' )
						.exec(),
            Device.find( { userGroup: user.userGroup._id } )
						.select( '_id url name description display updatedAt createdAt' )
						.populate( 'display', '_id url name description' )
						.exec(),
            Screen.find()
						.select( '_id url name' )
						.exec()
          ]

					Promise.all( resources_array )
						.then( ( data ) => {

							var data_obj = user.admin ? {
								devices: data[ 0 ].map( ( d ) => {
									d.url = 'http://localhost:4000/devices/' + d._id
									return d
								} ), //// HACK: Hotfix
								gateways: data[ 1 ],
								userGroups: data[ 2 ],
								screens: data[ 3 ],
								locations: data[ 4 ],
								users: data[ 5 ]
							} : {
								displays: data[ 0 ],
								images: data[ 1 ],
								groups: data[ 2 ],
								devices: data[ 3 ],
								screens: data[ 4 ]
							}

							return res.status( 200 )
								.json( {
									message: 'Auth Successful',
									token: token,
									user: {
										_id: user._id,
										url: user.url,
										name: user.name,
										admin: user.admin,
										createdAt: user.createdAt,
										updatedAt: user.updatedAt
									},
									data: data_obj
								} )
						} )
				} else { // password doesn't match!
					return res.status( 401 )
						.json( { message: 'Auth failed' } )
				}
			} )
		} )
		.catch( ( err ) => {
			res.status( 500 )
				.json( {
					message: 'Internal Server Error',
					error: err
				} )
		} )
}

/* PUT */
exports.user_update = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else if ( req.body.password ) {
		bcrypt.hash( req.body.password, 10, ( err, hash ) => {
			if ( err ) {
				return res.status( 500 )
					.json( {
						error: err
					} )
			} else {
				req.body.password = hash
				console.log( req.body )
				User
					.findByIdAndUpdate( { _id: req.params.id }, { $set: req.body }, { new: true } )
					.select( '_id url name login email admin userGroup createdAt updatedAt' )
					.populate( 'userGroup', '_id url name' )
					.then( doc => res.status( 200 )
						.json( {
							message: 'Success at updating a user from the collection',
							notify: 'Datos de ' + doc.name + ' actualizados',
							success: true,
							resourceId: doc._id,
							resource: doc
						} ) )
					.catch( err => res.status( 500 )
						.json( { error: err } ) )

			}
		} )
	} else {
		User
			.findByIdAndUpdate( { _id: req.params.id }, { $set: req.body }, { new: true } )
			.select( '_id url name login email admin userGroup createdAt updatedAt' )
			.populate( 'userGroup', '_id url name' )
			.then( doc => res.status( 200 )
				.json( {
					message: 'Success at updating a user from the collection',
					notify: 'Datos de ' + doc.name + ' actualizados',
					success: true,
					resourceId: doc._id,
					resource: doc
				} ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}

/* DELETE */
exports.user_delete = ( req, res, next ) => {
	if ( !req.AuthData.admin ) {
		res.status( 401 )
			.json( { message: 'Not allowed' } )
	} else {
		User
			.findByIdAndRemove( { _id: req.params.id } ) // remove user document
			.select( '_id url name login email userGroup createdAt updatedAt' )
			.exec()
			.then( doc => res.status( 200 )
				.json( {
					message: 'Success at removing a user from the collection',
					success: true,
					resourceId: req.params.id,
					resource: doc
				} ) )
			.catch( err => res.status( 500 )
				.json( { error: err } ) )
	}
}
