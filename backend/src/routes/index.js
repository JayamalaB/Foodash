const express = require('express');
const router = express.Router();
const { getMenu, getMenuItem } = require('../controllers/menuController');
const {
  placeOrder,
  fetchOrder,
  fetchAllOrders,
  patchOrderStatus,
  streamOrderStatus,
} = require('../controllers/ordersController');
const { validateOrder, validateStatusUpdate } = require('../middleware/validation');

// Menu
router.get('/menu', getMenu);
router.get('/menu/:id', getMenuItem);

// Orders
router.get('/orders', fetchAllOrders);
router.post('/orders', validateOrder, placeOrder);
router.get('/orders/:id', fetchOrder);
router.patch('/orders/:id/status', validateStatusUpdate, patchOrderStatus);
router.get('/orders/:id/stream', streamOrderStatus);

module.exports = router;
