const mongoose = require( 'mongoose' )
const axios = require( 'axios' )
const fs = require( 'fs' )
const path = require( 'path' )
const FormData = require( 'form-data' )
const moment = require( 'moment' )
const http = require( 'http' )

/* DATA MODELS */
const Display = require( '../models/display' )
const Image = require( '../models/image' )
const Device = require( '../models/device' )
const Gateway = require( '../models/gateway' )
const UserGroup = require( '../models/userGroup' )

var last_update = false
var waiting = false

/* GET */
exports.update = ( req, res, next ) => {
	if ( last_update && moment()
		.diff( last_update, 'seconds' ) < process.env.LAST_UPDATE_TIMER ) { // if last update was recent send the data without updating
		// get devices that can be accessed by the user that sent the request
		console.log( 'data from last update' )
		var query = !req.AuthData.admin // Only restrict search if the user isn't admin
			?
			{
				userGroup: req.AuthData.userGroup // get devices that belong to the userGroup the user belongs to
			} : {}
		Device.find( query )
			.select( '_id url name description mac found batt rssi initcode screen gateway createdAt updatedAt' )
			.populate( 'gateway', '_id name description mac url' )
			.exec()
			.then( docs => res.status( 200 )
				.json( docs ) )
	} else if ( waiting ) { // if another user is requesting the update
		res.status( 500 )
			.json( {
				error: 'Waiting for another request to finish'
			} )
	} else { // else update database
		console.log( 'updating...' )
		waiting = true // block
		var new_devices = []
		var data = []
		var errors = []
		var requests = []
		var filteredData = []
		var gateways_ips = []
		Gateway.find()
			.select( 'sync' )
			.exec()
			.then( ( gateways ) => { // get all syncs for the gateways stored in the database
				console.log( gateways )
				var urls = gateways.map( gateway => gateway.sync ) // map the urls into an array
				console.log( urls )
				requests = urls.map( url => axios.get( url, { timeout: process.env.TIMEOUT } )
					.catch( err => errors.push( { Error: err.message } ) ) ) // store as axios get requests in an array
				console.log( requests )
				axios.all( requests )
					.then( ( responses ) => { // execute all requests
						data = responses.map( r => r.data ) // store just data from requests in the data variable
						filteredData = data.filter( gateway_list => gateway_list != undefined ) // filter undefined gateway lists coming from failed requests
						if ( filteredData.length == 0 ) {
							res.status( 201 )
								.json( { error: 'No hay puertas de enlace disponibles' } )
							return
						}
						gateways_ips = filteredData.map( gateway_list => gateway_list.gateway_ip ) // get ip for every gateway for filtering as is the only unique identifier the ARTIK API returns
					} )
					.then( () => {
						Device.updateMany( {}, { found: false } ) // set all devices to "not found"
					} )
					.then( () => {
						Gateway.find( { // get all data for the gateways that could be accessed
								ip: {
									$in: gateways_ips
								}
							} )
							.then( ( gateways ) => {
								var sync_devices = [] // for storing all devices found
								for ( var j = 0; j < filteredData.length; j++ ) { // for every list of displays from the gateways
									var current_gateway = gateways.find( ( g ) => g.ip == filteredData[ j ].gateway_ip && g.port == filteredData[ j ].gateway_port ) // get the gateway that provided the list
									for ( var i = 0; i < filteredData[ j ].devices.length; i++ ) { // for every device within the list from this specific gateway
										var current_device = filteredData[ j ].devices[ i ] // save the device into a variable
										var duplicate = sync_devices.find( ( d ) => d.device.mac == current_device.mac ) // check if the device has already been found
										if ( !duplicate ) { // if it's the first time that the device is found
											current_device.found = true // set found to true within the device data
											current_device.gateway = current_gateway._id // set the devices access gateway to the one where it was found on
											sync_devices.push( { device: current_device } ) // push to found devices array
										} else if ( +duplicate.device.rssi < +current_device.rssi ) { // if it has a duplicate but the signal from the last gateway is stronger thatn from the first one
											var duplicate_index = sync_devices.findIndex( ( d ) => d.device.mac == current_device.mac ) // get the index of the device stored in found devices
											current_device.found = true // set found to true within the device data
											current_device.gateway = current_gateway._id //set the devices access gateway to the one where it was found on
											sync_devices.splice( duplicate_index, 1, { // replace the already stored device with this new one which has better signal
												device: current_device
											} )
										}
									}
								} // once this is done for every device from every list we should have an array with all found devices and no duplicates (keeping the one with the better signal)
								var bulk_ops = []
								var bulk_ops = sync_devices.map( ( d ) => { // set an update op for every device in the list
									return {
										updateOne: {
											filter: {
												mac: d.device.mac // search for the device to update filtering by mac address
											},
											update: d.device, // update the device with the new device data coming from the gateways
											upsert: true // if it's the first time this device has been found, create a new device resource
										}
									}
								} )
								Device.bulkWrite( bulk_ops ) // bulk write all these updates
							} )
							.then( () => {
								// get devices that can be accessed by the user that sent the request
								var query = !req.AuthData.admin // Only restrict search if the user isn't admin
									?
									{
										userGroup: req.AuthData.userGroup // get devices that belong to the userGroup the user belongs to
									} : {}
								Device.find( query )
									.select( '_id url name description mac found batt rssi initcode screen gateway createdAt updatedAt' )
									.populate( 'gateway', '_id name description mac url' )
									.exec()
									.then( ( docs ) => {
										last_update = moment() // set last_update to now
										waiting = false // unblock
										res.status( 200 )
											.json( docs.map( ( doc ) => { // send a response to the user maping all the results
												doc.url = process.env.API_URL + 'devices/' + doc._id // set the doc url manually for those devices that were added automatically and for which we couldnt know the id at that moment
												return doc
											} ) )
									} )
							} )
					} )
			} )
			.catch( err => {
				console.log( err )
				waiting = false // unblock
				res.status( 500 )
					.json( { error: err } )
			} ) // catch and return any error
	}
}
exports.change_image = ( req, res, next ) => {
	// query for checking if the user can update the display
	var display_query = !req.AuthData.admin ? {
		_id: req.params.id,
		userGroup: req.AuthData.userGroup
	} : {
		_id: req.params.id
	}
	// query for checking if the user has control over the image
	var image_query = !req.AuthData.admin ? {
		_id: req.body.image_id,
		userGroup: req.AuthData.userGroup
	} : {
		_id: req.body.image_id
	}
	// execute both querys (if both resources are found it means the op is posible)
	Promise.all( [
    Display.findOne( display_query )
      .select( 'device' )
      .populate( {
				path: 'device',
				select: '_id activeImage gateway',
				populate: [ {
					path: 'gateway',
					select: '_id ip port mac sync'
        } ]
			} )
      .exec(),
    Image.findOne( image_query )
      .select( 'path' )
      .exec()
  ] )
		.then( doc => {
			console.log( doc )
			var gateway = doc[ 0 ].device.gateway // get gateway data for uploading the image
			var file_path = doc[ 1 ].path // get the path for the image file
			fs.readFile( file_path, ( err, data ) => {
				if ( err ) // if error while reading the file
					throw err
				const form = new FormData()
				form.append( 'image', data, 'image.bmp' ) // get file into the request and name it image.bmp
				axios.put( gateway.sync, form, {
						params: { // set url following the API requirements (host:port/devices?mac=gateway_mac)
							mac: gateway.mac
						},
						headers: form.getHeaders()
					} )
					.then( response => { // perform the request
						if ( response.status == 200 ) { // with success
							Display.findOneAndUpdate( display_query, { // update the display data and set the image as active
									$set: {
										activeImage: req.body.image_id
									}
								}, { new: true } )
								.select( '_id url name description device createdAt updatedAt' )
								.populate( 'device', '_id url name description' )
								.then( doc => { //return new resource and select some fields
									if ( doc ) { // if the resource was found and updated send response with the API format (message, succes, resourceId, resource)
										res.status( 201 )
											.json( { message: 'Success at uploading an image to a device', success: true, resourceId: doc._id, resource: doc } )
									} else { // if the resource was not found send error
										res.status( 401 )
											.json( { message: 'Resource not found or unauthorized op' } )
									}
								} )
						} else { // with failure send response as received from the ARTIK API
							res.status( response.status )
								.json( response.data )
						}
					} )
			} )
		} )
		.catch( err => console.log( 'Error: ' + err.message ) ) // catch any errors
}
