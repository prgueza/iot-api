const express = require('express');

const router = express.Router();

/* CONTROLLER */
const DisplayController = require('../controllers/displays.js');
const checkAuth = require('../middleware/check-auth.js');

/* API GET */
router.get('/', checkAuth, DisplayController.displaysGetAll);
router.get('/:id', checkAuth, DisplayController.displaysGetOne);

/* API POST */
router.post('/', checkAuth, DisplayController.displayCreate);

/* API PUT */
router.put('/:id', checkAuth, DisplayController.displayUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, DisplayController.displayDelete);

module.exports = router;
