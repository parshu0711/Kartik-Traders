const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      // Clothing
      'shirts', 't-shirts', 'polo-shirts', 'formal-shirts', 'casual-shirts',
      'jeans', 'pants', 'trousers', 'formal-pants', 'casual-pants',
      'jackets', 'blazers', 'sweaters', 'hoodies', 'sweatshirts',
      'dresses', 'tops', 'kurtas', 'ethnic-wear', 'western-wear',
      'suits', 'waistcoats', 'vests', 'shorts', 'track-pants',
      
      // Innerwear & Sleepwear
      'innerwear', 'undergarments', 'briefs', 'boxers',
      'sleepwear', 'pajamas', 'nightwear', 'loungewear',
      
      // Accessories
      'belts', 'wallets', 'watches', 'sunglasses', 'jewelry',
      'scarves', 'ties', 'handkerchiefs', 'socks', 'caps',
      
      // Footwear
      'shoes', 'sneakers', 'formal-shoes', 'casual-shoes', 'sports-shoes',
      'sandals', 'flip-flops', 'boots', 'loafers',
      
      // Bags & Luggage
      'bags', 'backpacks', 'handbags', 'luggage',
      'travel-bags', 'messenger-bags', 'duffle-bags'
    ]
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    trim: true
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required']
  }],
  sizes: [{
    type: String,
    // Allow any string for custom sizes
    trim: true
  }],
  // New: Stock per size
  sizeStock: [{
    size: { type: String, trim: true, required: true },
    stock: { type: Number, min: 0, default: 0 }
  }],
  colors: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'SKU is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews cannot be negative']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%'],
    default: 0
  },
  material: {
    type: String,
    trim: true
  },
  careInstructions: {
    type: String,
    trim: true
  },
  shippingWeight: {
    type: Number,
    min: [0, 'Shipping weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  highlights: [{
    type: String,
    trim: true
  }],
  fit: {
    type: String,
    trim: true
  },
  sleeveType: {
    type: String,
    trim: true
  },
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'party', 'sports', 'ethnic', 'western', 'other'],
    default: 'casual'
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  category: 'text' 
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema); 