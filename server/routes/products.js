const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
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
  upload,
  getLowStockProducts,
  addReview,
  getProductReviews,
  canReviewProduct
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/category/:category', getProductsByCategory);

// Admin routes - specific routes must come before parameterized routes
router.get('/low-stock', protect, admin, getLowStockProducts);

// Parameterized routes must come last
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Customer routes (require authentication)
router.get('/:id/can-review', protect, canReviewProduct);
router.post('/:id/review', protect, addReview);

// Admin routes
router.post('/', protect, admin, upload.array('images', 6), createProduct);
router.put('/:id', protect, admin, upload.array('images', 6), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router; 