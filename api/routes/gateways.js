const express = require('express');
const router = express.Router();

/* CONTROLLER */
const GatewayController = require('../controllers/gateways.js');
const checkAuth = require('../middleware/check-auth');

/* API GET */
router.get('/', checkAuth, GatewayController.gateways_get_all);
router.get('/:id', GatewayController.gateways_get_one);

/* API POST */
router.post('/', GatewayController.gateway_create);

/* API PUT */
router.put('/:id', GatewayController.gateway_update);

/* API DELETE */
router.delete('/:id', GatewayController.gateway_delete);

module.exports = router;
