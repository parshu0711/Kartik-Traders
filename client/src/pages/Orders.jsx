import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEye,
  FaCalendarAlt
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/orders/myorders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'shipped': return 'text-purple-600 bg-purple-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock />
      case 'processing': return <FaCheckCircle />
      case 'shipped': return <FaTruck />
      case 'delivered': return <FaCheckCircle />
      case 'cancelled': return <FaTimesCircle />
      default: return <FaClock />
    }
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending': return 'Your order is being reviewed'
      case 'processing': return 'Your order is being prepared'
      case 'shipped': return 'Your order is on its way'
      case 'delivered': return 'Your order has been delivered'
      case 'cancelled': return 'Your order has been cancelled'
      default: return 'Order status unknown'
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingOrderId(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and view order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaBox className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <FaCalendarAlt className="mr-2" />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{order.totalPrice.toFixed(2)}
                      </p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img
                          src={item.image || 'https://via.placeholder.com/60x60?text=Product'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
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

                {/* Order Details */}
                <div className="bg-gray-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FaMapMarkerAlt className="mr-2" />
                        Shipping Address
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p className="flex items-center mt-2">
                          <FaPhone className="mr-2" />
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₹{order.itemsPrice.toFixed(2)}</span>
                        </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>₹0.00</span>
                    </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span className="text-green-600">Free</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                    
                    {/* Order Dates */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Important Dates</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Placed:</span>
                          <span className="text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {order.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Received:</span>
                            <span className="text-gray-900">
                              {new Date(order.paidAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivered:</span>
                            <span className="text-gray-900">
                              {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        {order.cancelledAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cancelled:</span>
                            <span className="text-red-600">
                              {new Date(order.cancelledAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                        {/* Cancel Order Button */}
                        {['pending', 'processing'].includes(order.status) && order.status !== 'cancelled' && (
                          <button
                            className="btn-outline mt-4 w-full"
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingOrderId === order._id}
                          >
                            {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="p-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Order Status</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 capitalize">{order.status}</p>
                        <p className="text-sm text-gray-500">{getStatusDescription(order.status)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${order.status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {order.status !== 'cancelled' && (
                      <>
                        <div className="flex items-center space-x-4 mt-4">
                          <div className={`w-3 h-3 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Processing</p>
                            <p className="text-xs text-gray-500">Order is being prepared</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-4">
                          <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Shipped</p>
                            <p className="text-xs text-gray-500">Order is on its way</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-4">
                          <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Delivered</p>
                            <p className="text-xs text-gray-500">
                              {order.deliveredAt 
                                ? new Date(order.deliveredAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Order has been delivered'
                              }
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div>
                          <p className="text-sm font-medium text-red-600">Cancelled</p>
                          <p className="text-xs text-gray-500">
                            {order.cancelledAt 
                              ? new Date(order.cancelledAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Order has been cancelled'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Payment Method: <span className="font-medium capitalize">{order.paymentMethod}</span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                      className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <FaEye className="mr-2" />
                      {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders 