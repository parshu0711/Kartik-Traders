const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'upi', 'card', 'netbanking']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  paymentType: {
    type: String,
    enum: ['cod', 'upi', 'card', 'netbanking'],
    default: 'cod'
  },
  internalNotes: {
    type: String,
    default: ''
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  // Return-related fields
  isReturned: {
    type: Boolean,
    required: true,
    default: false
  },
  returnRequestedAt: {
    type: Date
  },
  returnReason: {
    type: String,
    enum: ['wrong_size', 'defective', 'not_as_described', 'changed_mind', 'other'],
    default: 'other'
  },
  returnStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  returnNotes: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  // Return-related fields
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String
  },
  returnRequestedAt: {
    type: Date
  },
  returnProcessedAt: {
    type: Date
  },
  returnNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `KT${Date.now()}${count + 1}`;
  }
  next();
});

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return this._orderNumber;
});

orderSchema.virtual('orderNumber').set(function(value) {
  this._orderNumber = value;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema); 