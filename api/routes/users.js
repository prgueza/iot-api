const express = require('express');

const router = express.Router();

/* CONTROLLER */
const UsersController = require('../controllers/users.js');
const checkAdmin = require('../middleware/check-admin');

/* API SIGNUP */
router.post('/signup', checkAdmin, UsersController.userSignup);

/* API LOGIN */
router.post('/login', UsersController.userLogin);

/* API GET */
router.get('/', checkAdmin, UsersController.usersGetAll);
router.get('/:id', checkAdmin, UsersController.usersGetOne);

/* API PATCH */
router.put('/:id', checkAdmin, UsersController.userUpdate);

/* API DELETE */
router.delete('/:id', checkAdmin, UsersController.userDelete);

module.exports = router;
