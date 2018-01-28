const express = require('express');
const router = express.Router();

/* CONTROLLER */
const GroupsController = require('../controllers/groups.js');

/* API GET */
router.get('/', GroupsController.group_get_all);
router.get('/:id', GroupsController.group_get_one);

/* API POST */
router.post('/', GroupsController.group_create);

/* API PUT */
router.put('/:id', GroupsController.group_update);

/* API DELETE */
router.delete('/:id', GroupsController.group_delete);

module.exports = router;
