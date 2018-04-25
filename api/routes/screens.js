const express = require('express')
const router = express.Router()

/* CONTROLLER */
const ScreenController = require('../controllers/screens.js')
const checkAuth = require('../middleware/check-auth')

/* API GET */
router.get('/', checkAuth, ResolutionController.resolutions_get_all)
router.get('/:id', checkAuth, ResolutionController.resolutions_get_one)

/* API POST */
router.post('/', checkAuth, ResolutionController.resolution_create)

/* API PUT */
router.put('/:id', checkAuth, ResolutionController.resolution_update)

/* API DELETE */
router.delete('/:id', checkAuth, ResolutionController.resolution_delete)

module.exports = router
