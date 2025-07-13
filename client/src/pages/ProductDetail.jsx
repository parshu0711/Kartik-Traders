import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { 
  FaShoppingCart, 
  FaHeart, 
  FaStar, 
  FaTruck, 
  FaShieldAlt, 
  FaArrowLeft,
  FaShare,
  FaCheck,
  FaStarHalfAlt,
  FaUser
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import ProductRating from '../components/ProductRating';
import ReviewModal from '../components/ReviewModal';

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [error, setError] = useState(null);
  
  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    if (isAuthenticated) {
      checkCanReview()
    }
  }, [id, isAuthenticated])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/api/products/${id}`)
      setProduct(response.data)
      if (response.data.colors && response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Product not found or an error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const checkCanReview = async () => {
    try {
      const response = await axios.get(`/api/products/${id}/can-review`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setCanReview(response.data.canReview)
    } catch (error) {
      console.error('Error checking review eligibility:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/products/${id}/reviews`)
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleSubmitReview = async (reviewData) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    try {
      setSubmittingReview(true)
      await axios.post(`/api/products/${id}/review`, {
        rating: reviewData.rating,
        comment: reviewData.comment
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      toast.success('Review submitted successfully!')
      setShowReviewModal(false)
      setCanReview(false)
      
      // Refresh product and reviews
      fetchProduct()
      fetchReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    setAddingToCart(true)
    
    // Simulate API call delay
    setTimeout(() => {
      addToCart(product, quantity, selectedSize, selectedColor)
      setAddingToCart(false)
      toast.success('Added to cart successfully!')
    }, 1000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    setTimeout(() => {
      navigate('/checkout')
    }, 1500)
  }

  const isProductInCart = isInCart(product?._id, selectedSize, selectedColor)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    )
  }

  // Only compute these after product is loaded
  const availableSizes = product.sizeStock && product.sizeStock.length > 0
    ? product.sizeStock.filter(ss => ss.stock > 0).map(ss => ss.size)
    : (product.sizes || []);
  const getStockForSize = (size) => {
    if (!product.sizeStock) return null;
    const found = product.sizeStock.find(ss => ss.size === size);
    return found ? found.stock : null;
  };

  const discountedPrice = product.discount > 0 
    ? product.price - (product.price * product.discount / 100)
    : product.price

  const renderStars = (rating, interactive = false, onChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`cursor-pointer ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onChange && onChange(i)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Swiper Main Gallery */}
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation
              thumbs={{ swiper: thumbsSwiper }}
              className="w-full h-96 rounded-lg shadow-lg"
            >
              {product.images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Swiper Thumbnails */}
            {product.images.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                slidesPerView={Math.min(product.images.length, 4)}
                spaceBetween={8}
                watchSlidesProgress
                className="w-full mt-2 h-24"
              >
                {product.images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border cursor-pointer"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand and Rating */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 uppercase">{product.brand}</span>
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating} ({product.numReviews} reviews)</span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Product Rating */}
            <div className="flex items-center space-x-4 mb-4">
              <ProductRating rating={product.rating} numReviews={product.numReviews} size="md" />
              {product.numReviews > 0 && (
                <span className="text-sm text-gray-600">
                  {product.rating.toFixed(1)} out of 5 stars
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">₹{discountedPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                    -{product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Badges for tags and featured */}
            <div className="flex flex-wrap gap-2 mb-2">
              {product.isFeatured && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Featured</span>
              )}
              {product.tags && product.tags.map((tag, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{tag}</span>
              ))}
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <ul className="list-disc pl-5 text-gray-700 mb-2">
                {product.highlights.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            )}
            {/* Fit, Sleeve Type, Occasion */}
            <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-2">
              {product.fit && <span><b>Fit:</b> {product.fit}</span>}
              {product.sleeveType && <span><b>Sleeve:</b> {product.sleeveType}</span>}
              {product.occasion && <span><b>Occasion:</b> {product.occasion}</span>}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            {availableSizes && availableSizes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizeStock && product.sizeStock.length > 0
                    ? product.sizeStock.map(({ size, stock }) => {
                        const isDisabled = stock === 0;
                        const isLowStock = stock > 0 && stock <= 3;
                        return (
                          <div key={size} className="relative group">
                            <button
                              type="button"
                              className={`px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${selectedSize === size ? 'bg-primary-600 text-white' : 'bg-white text-gray-900'} ${isDisabled ? 'opacity-50 cursor-not-allowed line-through' : 'hover:bg-primary-100'} ${isLowStock ? 'border-yellow-500' : ''}`}
                              onClick={() => !isDisabled && setSelectedSize(size)}
                              disabled={isDisabled}
                              aria-disabled={isDisabled}
                              aria-label={isDisabled ? `${size} (Out of stock)` : `${size} (${stock} left)`}
                              tabIndex={0}
                            >
                              {size}
                              {isDisabled && <span className="text-xs text-red-500 ml-1">(Out of stock)</span>}
                              {isLowStock && !isDisabled && <span className="text-xs text-yellow-600 ml-1">Only {stock} left!</span>}
                              {!isLowStock && !isDisabled && <span className="text-xs text-gray-500 ml-1">({stock} left)</span>}
                            </button>
                            {/* Tooltip for out-of-stock */}
                            {isDisabled && (
                              <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity">
                                Out of stock
                              </span>
                            )}
                          </div>
                        );
                      })
                    : (product.sizes || []).map(size => (
                    <button
                      key={size}
                          type="button"
                          className={`px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${selectedSize === size ? 'bg-primary-600 text-white' : 'bg-white text-gray-900'} hover:bg-primary-100`}
                      onClick={() => setSelectedSize(size)}
                          aria-label={size}
                          tabIndex={0}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Color</h3>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-300 hover:border-primary-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || isProductInCart}
                  className={`flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-colors ${
                    isProductInCart
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {addingToCart ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Adding...
                    </div>
                  ) : isProductInCart ? (
                    <div className="flex items-center">
                      <FaCheck className="mr-2" />
                      Added to Cart
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </div>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <FaHeart className="mr-2" />
                  Wishlist
                </button>
                <button className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <FaShare className="mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaTruck className="text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-500">On orders over ₹500</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaShieldAlt className="text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-500">100% secure checkout</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            {product.material && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {product.material && (
                    <p><span className="font-medium">Material:</span> {product.material}</p>
                  )}
                  {product.careInstructions && (
                    <p><span className="font-medium">Care:</span> {product.careInstructions}</p>
                  )}
                  {product.shippingWeight && (
                    <p><span className="font-medium">Weight:</span> {product.shippingWeight}g</p>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                {isAuthenticated && canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-600 mb-4">
                  <Link to="/login" className="text-primary-600 hover:underline">
                    Login
                  </Link> to leave a review
                </p>
              )}
              
              {isAuthenticated && !canReview && (
                <p className="text-sm text-gray-600 mb-4">
                  You can only review products you have purchased and received
                </p>
              )}
              
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to leave one!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <ProductRating rating={review.rating} showCount={false} />
                          <span className="text-sm font-medium text-gray-900">
                            {review.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Modal */}
            <ReviewModal
              isOpen={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              onSubmit={handleSubmitReview}
              productName={product?.name || ''}
              loading={submittingReview}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 