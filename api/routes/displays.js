const express = require('express');
const router = express.Router();

/* CONTROLLER */
const DisplayController = require('../controllers/displays.js');

/* API GET */
router.get('/', DisplayController.displays_get_all);
router.get('/:id', DisplayController.displays_get_one);

/* API POST */
router.post('/', DisplayController.display_create);

/* API PUT */
router.put('/:id', DisplayController.display_update);

/* API DELETE */
router.delete('/:id', DisplayController.display_delete);

module.exports = router;
