const express = require('express');
const router = express.Router();

/* CONTROLLER */
const UpdateController = require('../controllers/update.js');

/* API GET */
router.post('/', UpdateController.update);

module.exports = router;
