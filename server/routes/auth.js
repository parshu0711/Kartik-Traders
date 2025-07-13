const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  createAdmin,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

// @route   POST /api/auth/create-admin
router.post('/create-admin', createAdmin);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateUserProfile);

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

// @route   GET /api/admin/stats
router.get('/admin/stats', protect, require('../middleware/auth').admin, require('../controllers/authController').getAdminStats);

module.exports = router; 