const express = require('express')
const router = express.Router()

/* CONTROLLER */
const UpdateController = require('../controllers/update.js')
const checkAuth = require('../middleware/check-auth')

/* API GET */
router.get('/', checkAuth ,UpdateController.update)

/* API PUT */
router.put('/:id', checkAuth, UpdateController.change_image)


module.exports = router
