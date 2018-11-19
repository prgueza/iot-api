const express = require('express');

const router = express.Router();

/* CONTROLLER */
const UserGroupController = require('../controllers/userGroups.js');
const checkAuth = require('../middleware/check-auth');

/* API GET */
router.get('/', UserGroupController.userGroupsGetAll);
router.get('/:id', checkAuth, UserGroupController.userGroupsGetOne);

/* API POST */
router.post('/', checkAuth, UserGroupController.userGroupCreate);

/* API PUT */
router.put('/:id', checkAuth, UserGroupController.userGroupUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, UserGroupController.userGroupDelete);

module.exports = router;
