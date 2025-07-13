const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Order = require('../models/Order'); // Added for purchase verification

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                              process.env.CLOUDINARY_API_KEY && 
                              process.env.CLOUDINARY_API_SECRET;

let storage;
let upload;

if (isCloudinaryConfigured) {
  // Cloudinary config
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Multer-Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'kartik-traders/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
  });
} else {
  // Local file storage for testing
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  });
}

upload = multer({ storage });

// Helper function to get base URL dynamically
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace('https://', 'https://api.') || 'https://your-backend-domain.com';
  }
  return 'http://localhost:5000';
};

// @desc    Fetch all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    // Build filter object
    const filter = { isActive: true, ...keyword };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product && product.isActive) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Request headers:', req.headers);
    
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      sizes,
      sizeStock,
      colors,
      stock,
      sku,
      tags,
      material,
      careInstructions,
      shippingWeight,
      dimensions,
      isActive,
      isFeatured,
      discount,
      highlights,
      fit,
      sleeveType,
      occasion
    } = req.body;

    // req.files is an array of uploaded images
    const images = req.files ? req.files.map(file => {
      if (isCloudinaryConfigured) {
        return file.secure_url;
      } else {
        // Return the full URL for local storage
        const baseUrl = getBaseUrl();
        return `${baseUrl}/uploads/${file.filename}`;
      }
    }) : [];
    console.log('Processed images:', images);
    
    if (images.length < 1) {
      console.log('No images found, returning error');
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    // --- Size handling (optional) ---
    let parsedSizes = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes) : []);
    let parsedSizeStock = Array.isArray(sizeStock) ? sizeStock : (typeof sizeStock === 'string' ? JSON.parse(sizeStock) : []);
    
    // Clean up sizes (remove empty/duplicate)
    parsedSizes = [...new Set(parsedSizes.map(s => s.trim()).filter(Boolean))];
    
    // Clean up sizeStock (remove duplicates and invalid entries)
    const seen = new Set();
    parsedSizeStock = parsedSizeStock.filter(ss => {
      if (!ss.size || seen.has(ss.size)) return false;
      seen.add(ss.size);
      return true;
    });
    
    // Only validate stock if sizeStock is provided
    if (parsedSizeStock.length > 0 && parsedSizeStock.some(ss => ss.stock < 0)) {
      return res.status(400).json({ message: 'Stock cannot be negative.' });
    }
    // --- End size handling ---

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      images,
      sizes: parsedSizes,
      sizeStock: parsedSizeStock,
      colors,
      stock,
      sku,
      tags,
      material,
      careInstructions,
      shippingWeight,
      dimensions,
      isActive,
      isFeatured,
      discount,
      highlights: highlights ? (typeof highlights === 'string' ? JSON.parse(highlights) : highlights) : [],
      fit,
      sleeveType,
      occasion
    });

    console.log('Product object to save:', product);
    const createdProduct = await product.save();
    console.log('Product saved successfully:', createdProduct._id);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Product ID:', req.params.id);
    
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      sizes,
      sizeStock,
      colors,
      stock,
      sku,
      tags,
      material,
      careInstructions,
      shippingWeight,
      dimensions,
      isActive,
      isFeatured,
      discount,
      highlights,
      fit,
      sleeveType,
      occasion
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Update fields only if they are provided (not undefined)
      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = price;
      if (originalPrice !== undefined) product.originalPrice = originalPrice;
      if (category !== undefined) product.category = category;
      if (brand !== undefined) product.brand = brand;
      if (colors !== undefined) product.colors = colors;
      if (stock !== undefined) product.stock = stock;
      if (sku !== undefined) product.sku = sku;
      if (tags !== undefined) product.tags = tags;
      if (material !== undefined) product.material = material;
      if (careInstructions !== undefined) product.careInstructions = careInstructions;
      if (shippingWeight !== undefined) product.shippingWeight = shippingWeight;
      if (dimensions !== undefined) product.dimensions = dimensions;
      if (isActive !== undefined) product.isActive = isActive;
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (discount !== undefined) product.discount = discount;
      if (highlights !== undefined) {
        product.highlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
      }
      if (fit !== undefined) product.fit = fit;
      if (sleeveType !== undefined) product.sleeveType = sleeveType;
      if (occasion !== undefined) product.occasion = occasion;

      // Handle image updates
      console.log('Image update debug:');
      console.log('- req.files:', req.files);
      console.log('- req.body.images:', req.body.images);
      console.log('- Current product images:', product.images);
      
      // If new files are uploaded, replace the images array
      if (req.files && req.files.length > 0) {
        console.log('Updating product images:', req.files.length, 'files uploaded');
        product.images = req.files.map(file => {
          if (isCloudinaryConfigured) {
            return file.secure_url;
          } else {
            // Return the full URL for local storage
            const baseUrl = getBaseUrl();
            return `${baseUrl}/uploads/${file.filename}`;
          }
        });
        console.log('New image URLs:', product.images);
      } 
      // If images are sent as URLs in request body (from frontend)
      else if (req.body.images !== undefined) {
        console.log('Updating images from request body');
        let newImages = req.body.images;
        
        // Handle different formats
        if (typeof newImages === 'string') {
          try {
            newImages = JSON.parse(newImages);
          } catch (e) {
            newImages = [newImages];
          }
        }
        
        if (Array.isArray(newImages)) {
          product.images = newImages.filter(img => img && img.trim() !== '');
          console.log('Updated images from body:', product.images);
        }
      } 
      // If images field is explicitly set to empty array
      else if (req.body.images === '[]' || req.body.images === '') {
        console.log('Clearing all images');
        product.images = [];
      }
      else {
        console.log('No new images uploaded, keeping existing images');
      }

      // --- Size handling (optional) ---
      if (sizes !== undefined) {
        let parsedSizes = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes) : []);
        parsedSizes = [...new Set(parsedSizes.map(s => s.trim()).filter(Boolean))];
        product.sizes = parsedSizes;
      }
      
      if (sizeStock !== undefined) {
        let parsedSizeStock = Array.isArray(sizeStock) ? sizeStock : (typeof sizeStock === 'string' ? JSON.parse(sizeStock) : []);
        if (parsedSizeStock.some(ss => ss.stock < 0)) {
          return res.status(400).json({ message: 'Stock cannot be negative.' });
        }
        product.sizeStock = parsedSizeStock;
      }
      // --- End size handling ---

      console.log('Product before save:', {
        name: product.name,
        price: product.price,
        images: product.images,
        sizes: product.sizes
      });
      
      const updatedProduct = await product.save();
      console.log('Product after save:', {
        name: updatedProduct.name,
        price: updatedProduct.price,
        images: updatedProduct.images,
        sizes: updatedProduct.sizes
      });
      
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(8)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { brand: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    const filter = { 
      isActive: true, 
      category: req.params.category,
      ...keyword 
    };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice, sortBy } = req.query;
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    let filter = { isActive: true };

    // Search query
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (sortBy === 'price-low') sort = { price: 1 };
    if (sortBy === 'price-high') sort = { price: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };
    if (sortBy === 'name') sort = { name: 1 };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sort);

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const products = await Product.find({ stock: { $lt: threshold }, isActive: true }).sort({ stock: 1 });
    res.json({ products });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a product review
// @route   POST /api/products/:id/review
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.length < 10 || comment.length > 500) {
      return res.status(400).json({ message: 'Comment must be between 10 and 500 characters' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      user: userId,
      'orderItems.product': productId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ message: 'You can only review products you have purchased and received' });
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(review => review.user.toString() === userId.toString());
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add the review
    const newReview = {
      user: userId,
      name: req.user.name,
      rating: parseInt(rating),
      comment: comment.trim()
    };

    product.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();

    res.json({
      message: 'Review added successfully',
      product: {
        _id: product._id,
        rating: product.rating,
        numReviews: product.numReviews,
        reviews: product.reviews
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name')
      .select('reviews rating numReviews');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      rating: product.rating,
      numReviews: product.numReviews,
      reviews: product.reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if user can review product
// @route   GET /api/products/:id/can-review
// @access  Private
const canReviewProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      user: userId,
      'orderItems.product': productId,
      status: 'delivered'
    });

    if (!order) {
      return res.json({ canReview: false, reason: 'You can only review products you have purchased and received' });
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(review => review.user.toString() === userId.toString());
    if (existingReview) {
      return res.json({ canReview: false, reason: 'You have already reviewed this product' });
    }

    res.json({ canReview: true });
  } catch (error) {
    console.error('Check can review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  getBrands,
  searchProducts,
  upload, // Export upload middleware
  getLowStockProducts,
  addReview,
  getProductReviews,
  canReviewProduct
}; 