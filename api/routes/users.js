const express = require('express');
const router = express.Router();

/* CONTROLLER */
const UsersController = require('../controllers/users.js');

/* API SIGNUP */
router.post('/signup', UsersController.user_signup);

/* API LOGIN */
router.post('/login', UsersController.user_login);

/* API GET */
router.get('/', UsersController.users_get_all);
router.get('/:id', UsersController.users_get_one);

/* API PATCH */
router.put('/:id', UsersController.user_update);

/* API DELETE */
router.delete('/:id', UsersController.user_delete);

module.exports = router;
