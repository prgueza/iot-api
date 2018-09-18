const express = require( 'express' )
const app = express()
const morgan = require( 'morgan' )
const bodyParser = require( 'body-parser' )
const mongoose = require( 'mongoose' )

process.env.API_URL = 'http://localhost:4000/'
process.env.MONGO_ATLAS_PW = '7MZ5oRy4e0YWG4v0'
process.env.JWT_KEY = 'secret'
process.env.DELAY = 0 // miliseconds
process.env.TIMEOUT = 10000 // miliseconds
process.env.LAST_UPDATE_TIMER = 0 // seconds
process.env.DEV = 'production'

// Routes
const displaysRoutes = require( './api/routes/displays' )
const imagesRoutes = require( './api/routes/images' )
const groupsRoutes = require( './api/routes/groups' )
const screensRoutes = require( './api/routes/screens' )
const locationsRoutes = require( './api/routes/locations' )
const usersRoutes = require( './api/routes/users' )
const gatewaysRoutes = require( './api/routes/gateways' )
const devicesRoutes = require( './api/routes/devices' )
const updateRoutes = require( './api/routes/update' )
const userGroupsRoutes = require( './api/routes/userGroup' )

if ( process.env.DEV == 'development' ) {
	mongoose.connect( 'mongodb://administrador:' + process.env.MONGO_ATLAS_PW + '@iot-api-shard-00-00-yznka.mongodb.net:27017,iot-api-shard-00-01-yznka.mongodb.net:27017,iot-api-shard-00-02-yznka.mongodb.net:27017/test?ssl=true&replicaSet=iot-api-shard-0&authSource=admin', { useMongoClient: true } )
		.then( () => console.log( "Conected to development database" ) )
} else {
	mongoose.connect( 'mongodb://administrador:' + process.env.MONGO_ATLAS_PW + '@iot-api-prod-shard-00-00-kjtyd.mongodb.net:27017,iot-api-prod-shard-00-01-kjtyd.mongodb.net:27017,iot-api-prod-shard-00-02-kjtyd.mongodb.net:27017/test?ssl=true&replicaSet=iot-api-prod-shard-0&authSource=admin&retryWrites=true', { useMongoClient: true } )
		.then( () => console.log( "Connected to production database" ) )
}

app.use( morgan( 'dev' ) ) // logger
app.use( '/img', express.static( 'img' ) )
app.use( bodyParser.urlencoded( { extended: true } ) ) // body parser
app.use( bodyParser.json() )

// CORS
app.use( ( req, res, next ) => {
	res.header( 'Access-Control-Allow-Origin', '*' )
	res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization' )
	if ( req.method === 'OPTIONS' ) {
		res.header( 'Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET' )
		return res.status( 200 )
			.json( {} )
	}
	next()
} )

// Routes which should handle requests
app.use( '/displays', displaysRoutes )
app.use( '/images', imagesRoutes )
app.use( '/groups', groupsRoutes )
app.use( '/screens', screensRoutes )
app.use( '/locations', locationsRoutes )
app.use( '/users', usersRoutes )
app.use( '/gateways', gatewaysRoutes )
app.use( '/devices', devicesRoutes )
app.use( '/userGroups', userGroupsRoutes )
app.use( '/update', updateRoutes )

// Error handling
app.use( ( req, res, next ) => {
	const err = new Error( 'Not Found' )
	err.status = 404
	next( err )
} )

app.use( ( err, req, res, next ) => {
	res.status( err.status || 500 )
	res.json( {
		error: {
			message: err.message
		}
	} )
} )

module.exports = app
