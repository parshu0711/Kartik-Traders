const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  exportOrdersCSV,
  requestReturn,
  approveReturn,
  rejectReturn,
  completeReturn
} = require('../controllers/orderController');

// Customer routes
router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, requestReturn);

// Admin routes
router.get('/', protect, admin, getOrders);
router.get('/export/csv', protect, admin, exportOrdersCSV);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/return/approve', protect, admin, approveReturn);
router.put('/:id/return/reject', protect, admin, rejectReturn);
router.put('/:id/return/complete', protect, admin, completeReturn);

module.exports = router; 