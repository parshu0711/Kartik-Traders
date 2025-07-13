import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa'

const Cart = () => {
  const { getCartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, isInitialized, loading, debugCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const cartItems = getCartItems()
  const total = getCartTotal()

  // Show loading state while cart is being initialized
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
          {/* Debug button for development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={debugCart}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded"
            >
              Debug Cart
            </button>
          )}
        </div>
      </div>
    )
  }

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(index, newQuantity)
    }
  }

  const handleRemoveItem = (index) => {
    removeFromCart(index)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    navigate('/shop')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/shop"
            className="btn-primary inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Items</h2>
                
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.images[0] || 'https://via.placeholder.com/80x80?text=Product'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product._id}`}
                          className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500">{item.product.brand}</p>
                        
                        {/* Size and Color */}
                        <div className="flex items-center space-x-4 mt-2">
                          {item.size && (
                            <span className="text-sm text-gray-600">
                              Size: <span className="font-medium">{item.size}</span>
                            </span>
                          )}
                          {item.color && (
                            <span className="text-sm text-gray-600">
                              Color: <span className="font-medium">{item.color}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Clear Cart */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {checkoutLoading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full btn-outline"
                >
                  <FaArrowLeft className="mr-2" />
                  Continue Shopping
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart 