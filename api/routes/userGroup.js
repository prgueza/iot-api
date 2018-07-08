const express = require( 'express' )
const router = express.Router()

/* CONTROLLER */
const UserGroupController = require( '../controllers/userGroups.js' )
const checkAuth = require( '../middleware/check-auth' )

/* API GET */
router.get( '/', UserGroupController.userGroups_get_all )
router.get( '/:id', checkAuth, UserGroupController.userGroups_get_one )

/* API POST */
router.post( '/', checkAuth, UserGroupController.userGroup_create )

/* API PUT */
router.put( '/:id', checkAuth, UserGroupController.userGroup_update )

/* API DELETE */
router.delete( '/:id', checkAuth, UserGroupController.userGroup_delete )

module.exports = router
