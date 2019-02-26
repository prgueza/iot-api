const express = require('express');

const router = express.Router();

/* CONTROLLER */
const UserGroupController = require('../controllers/userGroups.js');
const checkAdmin = require('../middleware/check-auth');

/* API GET */
router.get('/', UserGroupController.userGroupsGetAll);
router.get('/:id', checkAdmin, UserGroupController.userGroupsGetOne);

/* API POST */
router.post('/', checkAdmin, UserGroupController.userGroupCreate);

/* API PUT */
router.put('/:id', checkAdmin, UserGroupController.userGroupUpdate);

/* API DELETE */
router.delete('/:id', checkAdmin, UserGroupController.userGroupDelete);

module.exports = router;
