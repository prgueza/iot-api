const express = require('express')
const router = express.Router()

/* CONTROLLER */
const GroupsController = require('../controllers/groups.js')
const checkAuth = require('../middleware/check-auth')

/* API GET */
router.get('/', checkAuth, GroupsController.group_get_all)
router.get('/:id', checkAuth, GroupsController.group_get_one)

/* API POST */
router.post('/', checkAuth, GroupsController.group_create)

/* API PUT */
router.put('/:id', checkAuth, GroupsController.group_update)

/* API DELETE */
router.delete('/:id', checkAuth, GroupsController.group_delete)

module.exports = router
