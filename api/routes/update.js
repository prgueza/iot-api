const express = require('express');
const router = express.Router();

/* CONTROLLER */
const UpdateController = require('../controllers/update.js');

/* API GET */
router.get('/', UpdateController.update);

module.exports = router;
