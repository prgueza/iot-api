const express = require('express');

const router = express.Router();

/* CONTROLLER */
const UsersController = require('../controllers/users.js');
const checkAuth = require('../middleware/check-auth');

/* API SIGNUP */
router.post('/signup', UsersController.userSignup);

/* API LOGIN */
router.post('/login', UsersController.userLogin);

/* API GET */
router.get('/', checkAuth, UsersController.usersGetAll);
router.get('/:id', checkAuth, UsersController.usersGetOne);

/* API PATCH */
router.put('/:id', checkAuth, UsersController.userUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, UsersController.userDelete);

module.exports = router;
