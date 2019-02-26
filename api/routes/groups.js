const express = require('express');

const router = express.Router();

/* CONTROLLER */
const GroupsController = require('../controllers/groups.js');
const checkAuth = require('../middleware/check-auth');

/* API GET */
router.get('/', checkAuth, GroupsController.groupGetAll);
router.get('/:id', checkAuth, GroupsController.groupGetOne);

/* API POST */
router.post('/', checkAuth, GroupsController.groupCreate);

/* API PUT */
router.put('/:id', checkAuth, GroupsController.groupUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, GroupsController.groupDelete);

module.exports = router;
