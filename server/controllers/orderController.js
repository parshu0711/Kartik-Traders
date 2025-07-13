const Order = require('../models/Order');
const Product = require('../models/Product');
const { Parser } = require('json2csv');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentType,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      internalNotes
    } = req.body;

    // Validation
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided.' });
    }
    for (const item of orderItems) {
      if (!item.product || !item.name || item.price == null || item.quantity == null || !item.size || !item.color || !item.image) {
        return res.status(400).json({ message: 'Each order item must have product, name, price, quantity, size, color, and image.' });
      }
    }
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      return res.status(400).json({ message: 'Shipping address is incomplete.' });
    }
    if (!paymentMethod || !['cod', 'upi', 'card', 'netbanking'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid or missing payment method.' });
    }
    if (itemsPrice == null || taxPrice == null || shippingPrice == null || totalPrice == null) {
      return res.status(400).json({ message: 'Order price details are missing.' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Verify stock availability
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}` 
        });
      }
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      paymentType: paymentType || paymentMethod, // fallback for backward compatibility
      itemsPrice,
      taxPrice: 0, // Always set tax to zero - no tax charged
      shippingPrice,
      totalPrice,
      internalNotes: internalNotes || ''
    });

    const createdOrder = await order.save();

    // Update product stock
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error, '\nRequest body:', req.body);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (order) {
      // Check if user is authorized to view this order
      if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order to paid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order to delivered error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'id name email phone')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // No need to populate shippingAddress as it's embedded, but ensure it's included in the response
    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes, internalNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status || order.status;
      order.trackingNumber = trackingNumber || order.trackingNumber;
      order.notes = notes || order.notes;
      order.internalNotes = internalNotes !== undefined ? internalNotes : order.internalNotes;

      // When order is delivered, set delivered flags
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      
      // When order is cancelled, ensure it's not counted as delivered
      if (status === 'cancelled') {
        order.isDelivered = false;
        order.deliveredAt = null;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check if user is authorized to cancel this order
      if (req.user.role === 'admin' || order.user.toString() === req.user._id.toString()) {
        // Only allow cancellation if order is not shipped or delivered
        if (['pending', 'processing'].includes(order.status)) {
          order.status = 'cancelled';
          order.cancelledAt = Date.now();
          order.isDelivered = false; // Ensure cancelled orders don't count in revenue
          order.deliveredAt = null; // Clear delivery timestamp
          
          // Restore product stock
          for (let item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
            });
          }

          const updatedOrder = await order.save();
          res.json(updatedOrder);
        } else {
          res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
        }
      } else {
        res.status(403).json({ message: 'Not authorized to cancel this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export all orders as CSV
// @route   GET /api/orders/export/csv
// @access  Private/Admin
const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    const fields = [
      { label: 'Order ID', value: '_id' },
      { label: 'Customer Name', value: 'user.name' },
      { label: 'Customer Email', value: 'user.email' },
      { label: 'Status', value: 'status' },
      { label: 'Total', value: 'totalPrice' },
      { label: 'Created At', value: 'createdAt' },
      { label: 'Items', value: row => row.orderItems.map(i => `${i.name} x${i.quantity}`).join('; ') },
      { label: 'Shipping Name', value: 'shippingAddress.name' },
      { label: 'Shipping Phone', value: 'shippingAddress.phone' },
      { label: 'Shipping Address', value: row => `${row.shippingAddress.street}, ${row.shippingAddress.city}, ${row.shippingAddress.state}, ${row.shippingAddress.zipCode}, ${row.shippingAddress.country}` },
      { label: 'Payment Type', value: 'paymentType' },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(orders);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export orders CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request return for an order
// @route   POST /api/orders/:id/return
// @access  Private
const requestReturn = async (req, res) => {
  try {
    const { returnReason, returnNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to return this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to return this order' });
    }

    // Check if order is delivered
    if (!order.isDelivered || order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order must be delivered to request return' });
    }

    // Check if 7 days have passed since delivery
    const daysSinceDelivery = Math.floor((Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery > 7) {
      return res.status(400).json({ message: 'Return window has expired. Returns are only allowed within 7 days of delivery' });
    }

    // Check if return is already requested
    if (order.isReturned || order.status === 'return_requested') {
      return res.status(400).json({ message: 'Return already requested for this order' });
    }

    order.isReturned = true;
    order.returnRequestedAt = Date.now();
    order.returnReason = returnReason || 'other';
    order.returnNotes = returnNotes || '';
    order.returnStatus = 'pending';
    order.status = 'return_requested';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Request return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve return request (Admin)
// @route   PUT /api/orders/:id/return/approve
// @access  Private/Admin
const approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.returnStatus !== 'pending') {
      return res.status(400).json({ message: 'Return request is not pending' });
    }

    order.returnStatus = 'approved';
    order.status = 'returned';
    order.isDelivered = false; // Remove from delivered orders for revenue calculation
    order.deliveredAt = null;

    // Restore product stock
    for (let item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Approve return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject return request (Admin)
// @route   PUT /api/orders/:id/return/reject
// @access  Private/Admin
const rejectReturn = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.returnStatus !== 'pending') {
      return res.status(400).json({ message: 'Return request is not pending' });
    }

    order.returnStatus = 'rejected';
    order.status = 'delivered'; // Keep as delivered
    order.returnNotes = adminNotes || '';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Reject return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete return (Admin)
// @route   PUT /api/orders/:id/return/complete
// @access  Private/Admin
const completeReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.returnStatus !== 'approved') {
      return res.status(400).json({ message: 'Return must be approved first' });
    }

    order.returnStatus = 'completed';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Complete return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
}; 