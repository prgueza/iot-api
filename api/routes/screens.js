const express = require('express')
const router = express.Router()

/* CONTROLLER */
const ScreenController = require('../controllers/screens.js')
const checkAuth = require('../middleware/check-auth')

/* API GET */
router.get('/', checkAuth, ScreenController.screens_get_all)
router.get('/:id', checkAuth, ScreenController.screens_get_one)

/* API POST */
router.post('/', checkAuth, ScreenController.screen_create)

/* API PUT */
router.put('/:id', checkAuth, ScreenController.screen_update)

/* API DELETE */
router.delete('/:id', checkAuth, ScreenController.screen_delete)

module.exports = router
