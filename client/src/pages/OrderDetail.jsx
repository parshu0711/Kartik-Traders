import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { 
  FaArrowLeft, 
  FaTruck, 
  FaCheck, 
  FaTimes, 
  FaUndo,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaBox
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnReason, setReturnReason] = useState('other')
  const [returnNotes, setReturnNotes] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnRequest = async () => {
    try {
      setSubmittingReturn(true)
      await axios.post(`/api/orders/${id}/return`, {
        returnReason,
        returnNotes
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      toast.success('Return request submitted successfully')
      setShowReturnModal(false)
      fetchOrder() // Refresh order data
    } catch (error) {
      console.error('Error submitting return request:', error)
      toast.error(error.response?.data?.message || 'Failed to submit return request')
    } finally {
      setSubmittingReturn(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      const token = user?.role === 'admin' ? localStorage.getItem('adminToken') : localStorage.getItem('token')
      
      await axios.put(`/api/orders/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrder() // Refresh order data
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const canRequestReturn = () => {
    if (!order || !order.isDelivered || order.status !== 'delivered') return false
    if (order.isReturned || order.status === 'return_requested') return false
    
    const daysSinceDelivery = Math.floor((Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceDelivery <= 7
  }

  const getDaysLeftForReturn = () => {
    if (!order || !order.deliveredAt) return 0
    const daysSinceDelivery = Math.floor((Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 7 - daysSinceDelivery)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '🔧'
      case 'shipped':
        return '🚚'
      case 'delivered':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '📦'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cod':
        return '💵'
      case 'upi':
        return '📱'
      case 'card':
        return '💳'
      case 'netbanking':
        return '🏦'
      default:
        return '💰'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/orders" className="btn-primary">
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={user?.role === 'admin' ? "/admin/orders" : "/orders"} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to {user?.role === 'admin' ? 'Admin Orders' : 'Orders'}
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order #{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                <span className="mr-2">{getStatusIcon(order.status)}</span>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/80x80?text=Product'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        {item.size && (
                          <span>Size: {item.size}</span>
                        )}
                        {item.color && (
                          <span>Color: {item.color}</span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheck className="text-green-600 text-sm" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {order.status !== 'pending' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaBox className="text-blue-600 text-sm" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-500">Processing your order</p>
                    </div>
                  </div>
                )}

                {['shipped', 'delivered'].includes(order.status) && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaTruck className="text-purple-600 text-sm" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                      <p className="text-sm text-gray-500">
                        {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'On its way to you'}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheck className="text-green-600 text-sm" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                      <p className="text-sm text-gray-500">
                        {order.deliveredAt ? formatDate(order.deliveredAt) : 'Successfully delivered'}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <FaTimes className="text-red-600 text-sm" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Order Cancelled</p>
                      <p className="text-sm text-gray-500">Order has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Controls */}
            {user?.role === 'admin' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Controls</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate('processing')}
                        disabled={updatingStatus}
                        className="btn-primary"
                      >
                        {updatingStatus ? 'Updating...' : 'Mark as Processing'}
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => handleStatusUpdate('shipped')}
                        disabled={updatingStatus}
                        className="btn-primary"
                      >
                        {updatingStatus ? 'Updating...' : 'Mark as Shipped'}
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleStatusUpdate('delivered')}
                        disabled={updatingStatus}
                        className="btn-primary"
                      >
                        {updatingStatus ? 'Updating...' : 'Mark as Delivered'}
                      </button>
                    )}
                    {['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={() => handleStatusUpdate('cancelled')}
                        disabled={updatingStatus}
                        className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {updatingStatus ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Return Request Section */}
            {order.status === 'delivered' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Request</h2>
                
                {order.isReturned ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaUndo className="text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Return Requested</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Reason:</strong> {order.returnReason.replace('_', ' ')}</p>
                      {order.returnNotes && <p><strong>Notes:</strong> {order.returnNotes}</p>}
                      <p><strong>Status:</strong> {order.returnStatus}</p>
                      <p><strong>Requested on:</strong> {formatDate(order.returnRequestedAt)}</p>
                    </div>
                  </div>
                ) : canRequestReturn() ? (
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2" />
                      <span>You have {getDaysLeftForReturn()} days left to request a return</span>
                    </div>
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Request Return
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>Return window has expired (7 days from delivery)</p>
                  </div>
                )}
              </div>
            )}

            {/* Return Request Modal */}
            {showReturnModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Return</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason *</label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="wrong_size">Wrong Size</option>
                        <option value="defective">Defective Product</option>
                        <option value="not_as_described">Not As Described</option>
                        <option value="changed_mind">Changed Mind</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                      <textarea
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        rows="3"
                        placeholder="Please provide additional details about your return request..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setShowReturnModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReturnRequest}
                      disabled={submittingReturn}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submittingReturn ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({order.orderItems.length} items)</span>
                  <span>₹{order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₹0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getPaymentMethodIcon(order.paymentMethod)}</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     order.paymentMethod === 'upi' ? 'UPI Payment' :
                     order.paymentMethod === 'card' ? 'Card Payment' :
                     order.paymentMethod === 'netbanking' ? 'Net Banking' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status</span>
                  <span className={order.isPaid ? 'text-green-600' : 'text-yellow-600'}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {order.isPaid && order.paidAt && (
                  <div className="text-sm text-gray-500">
                    Paid on {formatDate(order.paidAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-2">
                <div className="flex items-start">
                  <FaUser className="text-gray-400 mt-1 mr-2" />
                  <span className="text-sm text-gray-900">{order.shippingAddress.name}</span>
                </div>
                <div className="flex items-start">
                  <FaPhone className="text-gray-400 mt-1 mr-2" />
                  <span className="text-sm text-gray-900">{order.shippingAddress.phone}</span>
                </div>
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-400 mt-1 mr-2" />
                  <div className="text-sm text-gray-900">
                    <div>{order.shippingAddress.street}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Date</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Date</span>
                    <span className="font-medium">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered Date</span>
                    <span className="font-medium">{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cancelled Date</span>
                    <span className="font-medium text-red-600">{formatDate(order.cancelledAt)}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking Number</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-500">Notes</span>
                    <p className="text-sm text-gray-900 mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail 