const express = require('express')
const router = express.Router()

/* CONTROLLER */
const DeviceController = require('../controllers/devices.js')
const checkAuth = require('../middleware/check-auth.js')

/* API GET */
router.get('/', checkAuth, DeviceController.devices_get_all)
router.get('/:id', checkAuth, DeviceController.devices_get_one)

/* API PUT */
router.put('/:id', checkAuth, DeviceController.device_update)

/* API DELETE */
router.delete('/:id', checkAuth, DeviceController.device_delete)

module.exports = router
