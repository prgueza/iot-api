const express = require('express');
const router = express.Router();

/* CONTROLLER */
const GatewayController = require('../controllers/gateways.js');

/* API GET */
router.get('/', GatewayController.gateways_get_all);
router.get('/:id', GatewayController.gateways_get_one);

/* API POST */
router.post('/', GatewayController.gateway_create);

/* API PUT */
router.put('/:id', GatewayController.gateway_update);

/* API DELETE */
router.delete('/:id', GatewayController.gateway_delete);

module.exports = router;
