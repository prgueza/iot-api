const mongoose = require('mongoose')
const axios = require('axios')

/* DATA MODELS */
const Device = require('../models/device')
const Gateway = require('../models/gateway')
const UserGroup = require('../models/userGroup')

/* GET */
exports.update = (req, res, next) => {

  console.log(req.AuthData)

  var old_devices = []
  var new_devices = []
  var data = []
  var errors = []
  var requests = []

  var filteredData = []
  var gateways_ips = []

  Gateway.find()
    .select('sync_url')
    .exec()
    .then((gateways) => {
      var urls = gateways.map((g) => g.sync_url)
      requests = urls.map((url) => axios.get(url, {timeout: 10000}).catch((err) => err.message))
    })
    .then(() => { axios.all(requests)
      .then((responses) => {
        // get devices lists
        data = responses.map(r => r.data)
        // filter undefined gateway lists coming from failed requests
        filteredData = data.filter((gateway_list) => gateway_list != undefined)
        gateways_ips = filteredData.map((gateway_list) => gateway_list.gateway_ip )
      })
      .then(() => { return Device.updateMany({}, { found: false }) })     // set all devices to "not found"
      .then(() => { return Gateway.find({ ip: { $in: gateways_ips } })
        .then((gateways) => {
          var bulk_ops = []
          var sync_devices = []
          for (var j = 0; j < filteredData.length; j++) {
            var current_gateway = gateways.find((g) => g.ip == filteredData[j].gateway_ip && g.port == filteredData[j].gateway_port)
            for (var i = 0; i < filteredData[j].devices.length; i++){
              var current_device = filteredData[j].devices[i]
              var duplicate = sync_devices.find((d) => d.body.mac == current_device.mac)
              if (!duplicate){
                current_device.found = true
                current_device.gateway = current_gateway._id
                sync_devices.push({
                  filter_mac: current_device.mac,
                  body: current_device
                })
              } else if (+duplicate.body.rssi < +current_device.rssi) {
                var duplicate_index = sync_devices.findIndex((d) => d.body.mac == current_device.mac)
                current_device.found = true
                current_device.gateway = current_gateway._id
                sync_devices.splice(duplicate_index, 1, {
                  filter_mac: current_device.mac,
                  body: current_device
                })
              }
            }
          }
          bulk_ops = sync_devices.map((d) => { return {
            updateOne: {
                filter: { mac: d.filter_mac },
                update: d.body,
                upsert: true
            }
          }})
          return Device.bulkWrite(bulk_ops)
        })
        .then(() => {
          var query = !req.AuthData.admin ? { userGroup: req.AuthData.userGroup } : {} // Only restrict search if the user isn't admin
          Device.find(query)
          .select('_id url name description mac found batt rssi initcode screen gateway created_at updated_at')
          .populate('gateway', '_id name description mac url')
          .exec()
          .then((docs) => {
            return res.status(200).json(
              docs.map((doc) => {
                doc.url = process.env.API_URL + 'devices/' + doc._id
                return doc
              })
          )})
        })
     })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({error: err})
    })
}
