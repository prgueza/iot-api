const express = require('express');

const router = express.Router();

/* CONTROLLER */
const LocationsController = require('../controllers/locations.js');
const checkAuth = require('../middleware/check-auth');

/* API GET */
router.get('/', checkAuth, LocationsController.locationsGetAll);
router.get('/:id', checkAuth, LocationsController.locationsGetOne);

/* API POST */
router.post('/', checkAuth, LocationsController.locationCreate);

/* API PUT */
router.put('/:id', checkAuth, LocationsController.locationUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, LocationsController.locationDelete);

module.exports = router;
