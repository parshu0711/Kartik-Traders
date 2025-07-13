const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { getAdminStats } = require('../controllers/authController');

router.get('/stats', protect, admin, getAdminStats);

module.exports = router; 