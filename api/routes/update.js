const express = require('express')
const router = express.Router()

/* CONTROLLER */
const UpdateController = require('../controllers/update.js')
const checkAuth = require('../middleware/check-auth')

/* API GET */
router.get('/', checkAuth ,UpdateController.update)

module.exports = router
