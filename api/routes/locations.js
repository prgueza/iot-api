const express = require('express')
const router = express.Router()

/* CONTROLLER */
const LocationsController = require('../controllers/locations.js')
const checkAuth = require('../middleware/check-auth')

/* API GET */
router.get('/', checkAuth, LocationsController.locations_get_all)
router.get('/:id', checkAuth, LocationsController.locations_get_one)

/* API POST */
router.post('/', checkAuth, LocationsController.location_create)

/* API PUT */
router.put('/:id', checkAuth, LocationsController.location_update)

/* API DELETE */
router.delete('/:id', checkAuth, LocationsController.location_delete)

module.exports = router
