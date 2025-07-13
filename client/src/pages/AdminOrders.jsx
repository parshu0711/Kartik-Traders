import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaUpload,
  FaTimes,
  FaUndo,
  FaCheck,
  FaBan,
  FaTruck, 
  FaFilter,
  FaDownload
} from 'react-icons/fa'
import toast from 'react-hot-toast'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateRange: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [returnAction, setReturnAction] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [processingReturn, setProcessingReturn] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        toast.error('No admin token found')
        return
      }
      
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        toast.error('No admin token found')
        return
      }
      
      await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    }
  }

  const handleReturnAction = async (orderId, action) => {
    try {
      setProcessingReturn(true)
      let endpoint = ''
      let data = {}
      
      switch (action) {
        case 'approve':
          endpoint = `/api/orders/${orderId}/return/approve`
          break
        case 'reject':
          endpoint = `/api/orders/${orderId}/return/reject`
          data = { adminNotes }
          break
        case 'complete':
          endpoint = `/api/orders/${orderId}/return/complete`
          break
        default:
          return
      }

      await axios.put(endpoint, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      toast.success(`Return ${action}d successfully`)
      setShowReturnModal(false)
      setSelectedOrder(null)
      setReturnAction('')
      setAdminNotes('')
      fetchOrders()
    } catch (error) {
      console.error('Error processing return:', error)
      toast.error(error.response?.data?.message || 'Failed to process return')
    } finally {
      setProcessingReturn(false)
    }
  }

  const openReturnModal = (order, action) => {
    setSelectedOrder(order)
    setReturnAction(action)
    setShowReturnModal(true)
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

  const getReturnStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getReturnStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaUndo className="text-yellow-600" />
      case 'approved': return <FaCheck className="text-green-600" />
      case 'rejected': return <FaBan className="text-red-600" />
      case 'completed': return <FaCheck className="text-blue-600" />
      default: return <FaUndo className="text-gray-600" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false
    if (filters.paymentMethod && order.paymentMethod !== filters.paymentMethod) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600">Manage customer orders and track deliveries</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            <button className="btn-primary flex items-center">
              <FaDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Methods</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.orderItems.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.shippingAddress.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.orderItems.slice(0, 2).map(item => item.name).join(', ')}
                        {order.orderItems.length > 2 && ` +${order.orderItems.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.totalPrice.toFixed(2)}
                      </div>
                      {order.isPaid ? (
                        <div className="text-xs text-green-600">Paid</div>
                      ) : (
                        <div className="text-xs text-yellow-600">Pending</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {getPaymentMethodIcon(order.paymentMethod)}
                        </span>
                        <span className="text-sm text-gray-900 capitalize">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {/* Return Status */}
                      {order.isReturned && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getReturnStatusColor(order.returnStatus)}`}>
                            {getReturnStatusIcon(order.returnStatus)}
                            <span className="ml-1">Return {order.returnStatus}</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Placed:</span> {formatDate(order.createdAt)}
                        </div>
                        {order.paidAt && (
                          <div className="text-xs text-green-600">
                            <span className="font-medium">Paid:</span> {formatDate(order.paidAt)}
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="text-xs text-blue-600">
                            <span className="font-medium">Delivered:</span> {formatDate(order.deliveredAt)}
                          </div>
                        )}
                        {order.cancelledAt && (
                          <div className="text-xs text-red-600">
                            <span className="font-medium">Cancelled:</span> {formatDate(order.cancelledAt)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye />
                        </Link>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'processing')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Mark as Processing"
                          >
                            <FaTruck />
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'shipped')}
                            className="text-purple-600 hover:text-purple-900"
                            title="Mark as Shipped"
                          >
                            <FaTruck />
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Delivered"
                          >
                            <FaCheck />
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Order"
                          >
                            <FaTimes />
                          </button>
                        )}
                        {/* Return Management */}
                        {order.isReturned && order.returnStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => openReturnModal(order, 'approve')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve Return"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => openReturnModal(order, 'reject')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject Return"
                            >
                              <FaBan />
                            </button>
                          </>
                        )}
                        {order.isReturned && order.returnStatus === 'approved' && (
                          <button
                            onClick={() => openReturnModal(order, 'complete')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Complete Return"
                          >
                            <FaCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaEye className="text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaTruck className="text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTimes className="text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Management Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {returnAction === 'approve' && 'Approve Return Request'}
              {returnAction === 'reject' && 'Reject Return Request'}
              {returnAction === 'complete' && 'Complete Return'}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Return Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Order ID:</strong> #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                  <p><strong>Customer:</strong> {selectedOrder.shippingAddress.name}</p>
                  <p><strong>Reason:</strong> {selectedOrder.returnReason.replace('_', ' ')}</p>
                  {selectedOrder.returnNotes && (
                    <p><strong>Notes:</strong> {selectedOrder.returnNotes}</p>
                  )}
                  <p><strong>Requested:</strong> {formatDate(selectedOrder.returnRequestedAt)}</p>
                </div>
              </div>

              {returnAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Please provide a reason for rejecting this return request..."
                  />
                </div>
              )}

              {returnAction === 'approve' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Approving this return will:
                  </p>
                  <ul className="text-sm text-yellow-800 mt-2 list-disc list-inside">
                    <li>Remove the order from delivered orders</li>
                    <li>Restore product stock</li>
                    <li>Update revenue calculations</li>
                  </ul>
                </div>
              )}

              {returnAction === 'complete' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> This will mark the return as completed.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReturnModal(false)
                  setSelectedOrder(null)
                  setReturnAction('')
                  setAdminNotes('')
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturnAction(selectedOrder._id, returnAction)}
                disabled={processingReturn}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 ${
                  returnAction === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' :
                  returnAction === 'reject' ? 'bg-red-600 text-white hover:bg-red-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {processingReturn ? 'Processing...' : 
                 returnAction === 'approve' ? 'Approve Return' :
                 returnAction === 'reject' ? 'Reject Return' :
                 'Complete Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders 