const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Remove the hardcoded adminAccounts array and all related logic
// Update adminLogin to check the database for a user with role: 'admin' and use user.comparePassword(password)

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find admin user
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }
    
    // Verify password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Issue JWT token with user ID
    const token = generateToken(user._id);
    
    return res.status(200).json({ 
      token, 
      admin: { 
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'customer' } = req.body;
    console.log('Register request:', req.body);

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields (name, email, password, phone) are required.' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // In register logic, block admin registration
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    if (adminEmails.includes(email)) {
      return res.status(400).json({ message: 'Admin registration is restricted.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    // Improved error logging
    console.error('Register error:', error, error.stack);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', req.body);

    if (!email || !password) {
      console.log('Login error: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login error: User not found for email', email);
      return res.status(401).json({ message: 'No user found with this email' });
    }

    if (!user.isActive) {
      console.log('Login error: User account is deactivated', email);
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // In login logic, only allow admin login for configured admin emails
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    if (adminEmails.includes(email)) {
      const admin = await User.findOne({ email, role: 'admin' });
      if (!admin) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      const passwordMatch = await admin.comparePassword(password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      // Issue JWT token with user ID
      const token = generateToken(admin._id);
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        token: token,
      });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      console.log('Login error: Incorrect password for email', email);
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
        createdAt: updatedUser.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create admin user (for initial setup)
// @route   POST /api/auth/create-admin
// @access  Public (should be protected in production)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }
    const token = user.generatePasswordReset();
    await user.save();
    // Send email (for dev, log to console)
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
    // Use nodemailer (for dev, use ethereal or log)
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      }
    });
    const mailOptions = {
      from: 'no-reply@kartiktraders.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p>Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    user.password = newPassword;
    user.clearPasswordReset();
    await user.save();
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all addresses for current user
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ addresses: user.addresses, defaultAddress: user.defaultAddress });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.addresses.length >= 5) {
      return res.status(400).json({ message: 'You can only save up to 5 addresses.' });
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ addresses: user.addresses, defaultAddress: user.defaultAddress });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    // If default address was deleted, unset it
    if (user.defaultAddress && user.defaultAddress.toString() === req.params.id) {
      user.defaultAddress = null;
    }
    await user.save();
    res.json({ addresses: user.addresses, defaultAddress: user.defaultAddress });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    user.defaultAddress = address._id;
    await user.save();
    res.json({ addresses: user.addresses, defaultAddress: user.defaultAddress });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    Object.assign(address, req.body);
    await user.save();
    res.json({ addresses: user.addresses, defaultAddress: user.defaultAddress });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalRevenue, totalOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
      // Only count revenue from successfully delivered orders
      (await Order.aggregate([
        { 
          $match: { 
            status: 'delivered',
            isDelivered: true 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: "$totalPrice" } 
          } 
        } 
      ]))[0]?.total || 0,
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.find({}).sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
    ]);
    res.json({ totalRevenue, totalOrders, totalProducts, totalCustomers, recentOrders });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').lean();
    // Add order count for each customer
    const customerIds = customers.map(c => c._id);
    const orders = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } }
    ]);
    const orderMap = {};
    orders.forEach(o => { orderMap[o._id] = o.count; });
    customers.forEach(c => { c.orderCount = orderMap[c._id] || 0; });
    res.json({ customers });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully` });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for a specific customer (admin)
// @route   GET /api/users/admin/customers/:id/orders
// @access  Private/Admin
const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  createAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  adminLogin,
  getAdminStats,
  getAllCustomers,
  blockUser,
  deleteUser,
  getCustomerOrders
}; 