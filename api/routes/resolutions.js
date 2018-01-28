const express = require('express');
const router = express.Router();

/* CONTROLLER */
const ResolutionController = require('../controllers/resolutions.js');

/* API GET */
router.get('/', ResolutionController.resolutions_get_all);
router.get('/:id', ResolutionController.resolutions_get_one);

/* API POST */
router.post('/', ResolutionController.resolution_create);

/* API PUT */
router.put('/:id', ResolutionController.resolution_update);

/* API DELETE */
router.delete('/:id', ResolutionController.resolution_delete);

module.exports = router;
