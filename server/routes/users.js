const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  getCustomerOrders,
  getAllCustomers,
  blockUser,
  deleteUser
} = require('../controllers/authController');

// Placeholder for future user management routes
// This can be expanded with user management features

router.get('/test', protect, (req, res) => {
  res.json({ message: 'User route working' });
});

router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);
router.put('/addresses/:id', protect, updateAddress);

// Admin user management routes
router.get('/admin/customers', protect, admin, getAllCustomers);
router.get('/admin/customers/:id/orders', protect, admin, getCustomerOrders);
router.put('/admin/users/:id/block', protect, admin, blockUser);
router.delete('/admin/users/:id', protect, admin, deleteUser);

module.exports = router; 