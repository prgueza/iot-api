const express = require('express');

const router = express.Router();

/* CONTROLLER */
const ScreenController = require('../controllers/screens.js');
const checkAuth = require('../middleware/check-auth');

/* API GET */
router.get('/', checkAuth, ScreenController.screensGetAll);
router.get('/:id', checkAuth, ScreenController.screensGetOne);

/* API POST */
router.post('/', checkAuth, ScreenController.screenCreate);

/* API PUT */
router.put('/:id', checkAuth, ScreenController.screenUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, ScreenController.screenDelete);

module.exports = router;
