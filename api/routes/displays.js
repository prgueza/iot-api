const express = require('express')
const router = express.Router()

/* CONTROLLER */
const DisplayController = require('../controllers/displays.js')
const checkAuth = require('../middleware/check-auth.js')

/* API GET */
router.get('/', checkAuth, DisplayController.displays_get_all)
router.get('/:id', checkAuth, DisplayController.displays_get_one)

/* API POST */
router.post('/', checkAuth, DisplayController.display_create)

/* API PUT */
router.put('/:id', checkAuth, DisplayController.display_update)

/* API DELETE */
router.delete('/:id', checkAuth, DisplayController.display_delete)

module.exports = router
