import React from 'react'
import { Link } from 'react-router-dom'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import ProductRating from './ProductRating'

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const discountedPrice = product.discount > 0 
    ? product.price - (product.price * product.discount / 100)
    : product.price

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block relative">
        <img
          src={product.images[0] || 'https://via.placeholder.com/300x300?text=Product'}
          alt={product.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            -{product.discount}%
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            Featured
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
          {product.brand}
        </p>

        {/* Product Name */}
        <Link 
          to={`/product/${product._id}`}
          className="block text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <ProductRating rating={product.rating} numReviews={product.numReviews} size="sm" />
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            ₹{discountedPrice.toFixed(2)}
          </span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FaShoppingCart className="text-sm" />
            <span>Add to Cart</span>
          </button>
          
          <button
            onClick={() => onToggleWishlist(product)}
            className={`ml-2 p-2 rounded-lg transition-colors ${
              isInWishlist 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaHeart className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard 