const express = require('express');

const router = express.Router();

/* CONTROLLER */
const DeviceController = require('../controllers/devices.js');
const checkAuth = require('../middleware/check-auth.js');

/* API GET */
router.get('/', checkAuth, DeviceController.devicesGetAll);
router.get('/:id', checkAuth, DeviceController.devicesGetOne);

/* API PUT */
router.put('/:id', checkAuth, DeviceController.deviceUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, DeviceController.deviceDelete);

module.exports = router;
