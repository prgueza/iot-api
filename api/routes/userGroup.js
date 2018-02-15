const express = require('express');
const router = express.Router();

/* CONTROLLER */
const UserGroupController = require('../controllers/userGroups.js');

/* API GET */
router.get('/', UserGroupController.userGroups_get_all);
router.get('/:id', UserGroupController.userGroups_get_one);

/* API POST */
router.post('/', UserGroupController.userGroup_create);

/* API PUT */
router.put('/:id', UserGroupController.userGroup_update);

/* API DELETE */
router.delete('/:id', UserGroupController.userGroup_delete);

module.exports = router;
