const express = require('express');
const router = express.Router();

/* CONTROLLER */
const LocationsController = require('../controllers/locations.js');

/* API GET */
router.get('/', LocationsController.locations_get_all);
router.get('/:id', LocationsController.locations_get_one);

/* API POST */
router.post('/', LocationsController.location_create);

/* API PUT */
router.put('/:id', LocationsController.location_update);

/* API DELETE */
router.delete('/:id', LocationsController.location_delete);

module.exports = router;
