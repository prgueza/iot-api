const express = require('express');

const router = express.Router();

/* CONTROLLER */
const GatewayController = require('../controllers/gateways.js');
const checkAuth = require('../middleware/check-auth');

/* API GET */
router.get('/', checkAuth, GatewayController.gatewaysGetAll);
router.get('/:id', checkAuth, GatewayController.gatewaysGetOne);

/* API POST */
router.post('/', checkAuth, GatewayController.gatewayCreate);

/* API PUT */
router.put('/:id', checkAuth, GatewayController.gatewayUpdate);

/* API DELETE */
router.delete('/:id', checkAuth, GatewayController.gatewayDelete);

module.exports = router;
