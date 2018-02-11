const express = require('express');
const router = express.Router();

/* CONTROLLER */
const DeviceController = require('../controllers/devices.js');

/* API GET */
router.get('/', DeviceController.devices_get_all);
router.get('/:id', DeviceController.devices_get_one);

/* API POST */
router.post('/', DeviceController.device_create);

/* API PUT */
router.put('/:id', DeviceController.device_update);

/* API DELETE */
router.delete('/:id', DeviceController.device_delete);

module.exports = router;
