import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaMobile, 
  FaUniversity,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaLock,
  FaCheck
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const Checkout = () => {
  const navigate = useNavigate()
  const { getCartItems, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')

  const cartItems = getCartItems()
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = 0 // Set tax to zero - no tax charged
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + tax + shipping

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'zipCode']
    for (const field of required) {
      if (!shippingAddress[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && !validateAddress()) {
      return
    }
    setStep(step + 1)
  }

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      return
    }

    setLoading(true)
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product?._id || item.product || '',
          name: item.product?.name || item.name || '',
          price: item.price ?? 0,
          quantity: item.quantity ?? 1,
          size: item.size || 'default',
          color: item.color || 'default',
          image: item.product?.images?.[0] || item.image || ''
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      }
      console.log('Order items:', orderData.orderItems);

      const response = await axios.post('/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOrderId(response.data._id)
      setOrderPlaced(true)
      clearCart()
      
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-2xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase.</p>
          <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full btn-primary"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full btn-outline"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2">Shipping</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2">Payment</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.name}
                        onChange={(e) => handleAddressChange('name', e.target.value)}
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className="input-field"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className="input-field"
                        placeholder="Enter your street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="input-field"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="input-field"
                        placeholder="Enter your state"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className="input-field"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="input-field"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-3" />
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <div className="text-sm text-gray-500">Pay when you receive your order</div>
                        </div>
                      </div>
                    </label>

                    <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        disabled
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <FaMobile className="text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-500">UPI Payment</div>
                          <div className="text-sm text-gray-400">Coming soon</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        disabled
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <FaCreditCard className="text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-500">Credit/Debit Card</div>
                          <div className="text-sm text-gray-400">Coming soon</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="netbanking"
                        disabled
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <FaUniversity className="text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-500">Net Banking</div>
                          <div className="text-sm text-gray-400">Coming soon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Order Review */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Review</h2>
                  
                  {/* Shipping Address Review */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{shippingAddress.name}</p>
                      <p className="text-gray-600">{shippingAddress.street}</p>
                      <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p className="text-gray-600">{shippingAddress.country}</p>
                      <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium capitalize">{paymentMethod.replace('-', ' ')}</p>
                    </div>
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.product.images[0] || 'https://via.placeholder.com/60x60?text=Product'}
                            alt={item.product.name}
                            className="w-15 h-15 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="btn-primary ml-auto"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-primary ml-auto"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="loading-spinner mr-2"></div>
                        Placing Order...
                      </div>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
              {/* Security Notice */}
            <div className="p-3 bg-blue-50 rounded-lg mt-6">
                <p className="text-xs text-blue-700">
                  🔒 Your payment information is secure and encrypted
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout 