const express = require('express')
const router = express.Router()

/* CONTROLLER */
const UsersController = require('../controllers/users.js')
const checkAuth = require('../middleware/check-auth')

/* API SIGNUP */
router.post('/signup', checkAuth, UsersController.user_signup)

/* API LOGIN */
router.post('/login', UsersController.user_login)

/* API GET */
router.get('/', checkAuth, UsersController.users_get_all)
router.get('/:id', checkAuth, UsersController.users_get_one)

/* API PATCH */
router.put('/:id', checkAuth, UsersController.user_update)

/* API DELETE */
router.delete('/:id', checkAuth, UsersController.user_delete)

module.exports = router
