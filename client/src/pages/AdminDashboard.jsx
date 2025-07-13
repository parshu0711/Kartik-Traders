import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaRupeeSign,
  FaChartLine,
  FaSignOutAlt,
  FaBell,
  FaCog,
  FaTachometerAlt,
  FaUser
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: []
  });

  // Products
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    images: [''],
    sizes: [],
    colors: [],
    stock: '',
    sku: '',
    discount: 0,
    isActive: true,
    isFeatured: false
  });

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderFilters, setOrderFilters] = useState({
    status: '',
    dateRange: ''
  });

  // Customers
  const [customers, setCustomers] = useState([]);

  const navigate = useNavigate();

  // Add at the top:
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState('');
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderInternalNotes, setOrderInternalNotes] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderPaymentType, setOrderPaymentType] = useState('');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const prevOrdersRef = useRef([]);
  const [exportingOrders, setExportingOrders] = useState(false);

  // Poll for new orders every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        
        const res = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const newOrders = res.data.orders || [];
        if (prevOrdersRef.current.length && newOrders.length > prevOrdersRef.current.length) {
          setNewOrderCount(newOrders.length - prevOrdersRef.current.length);
          toast.success('New order received!');
        }
        prevOrdersRef.current = newOrders;
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Set up admin authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    
    if (!token || !adminInfo) {
      navigate('/admin-login');
      return;
    }

    try {
      setAdmin(JSON.parse(adminInfo));
      fetchDashboardData();
    } catch (error) {
      console.error('Error parsing admin info:', error);
      navigate('/admin-login');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No admin token found');
        navigate('/admin-login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch dashboard stats
      try {
        const statsResponse = await axios.get('/api/admin/stats', { headers });
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0, recentOrders: [] });
      }

      // Fetch products
      try {
        const productsResponse = await axios.get('/api/products', { headers });
        setProducts(productsResponse.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }

      // Fetch orders
      try {
        const ordersResponse = await axios.get('/api/orders', { headers });
        setOrders(ordersResponse.data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      }

      // Fetch customers
      try {
        const customersResponse = await axios.get('/api/users/admin/customers', { headers });
        setCustomers(customersResponse.data.customers || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!imageFiles.length) {
      setError('Please select at least one image.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      formData.append('brand', newProduct.brand);
      formData.append('sku', newProduct.sku);
      formData.append('stock', newProduct.stock);
      formData.append('discount', newProduct.discount);
      formData.append('isActive', newProduct.isActive);
      formData.append('isFeatured', newProduct.isFeatured);

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      newProduct.sizes.forEach((size) => {
        formData.append('sizes', size);
      });
      newProduct.colors.forEach((color) => {
        formData.append('colors', color);
      });
      if (newProduct.tags) {
        newProduct.tags.forEach((tag) => {
          formData.append('tags', tag);
        });
      }

      await axios.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Product added successfully!');
      setShowAddProduct(false);
      resetProductForm();
      setImageFiles([]);
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding product:', error);
      const message = error.response?.data?.message || 'Failed to add product';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('description', editingProduct.description);
      formData.append('price', editingProduct.price);
      formData.append('category', editingProduct.category);
      formData.append('brand', editingProduct.brand);
      formData.append('sku', editingProduct.sku);
      formData.append('stock', editingProduct.stock);
      formData.append('discount', editingProduct.discount);
      formData.append('isActive', editingProduct.isActive);
      formData.append('isFeatured', editingProduct.isFeatured);

      if (editImageFiles.length > 0) {
        editImageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      editingProduct.sizes.forEach((size) => {
        formData.append('sizes', size);
      });
      editingProduct.colors.forEach((color) => {
        formData.append('colors', color);
      });
      if (editingProduct.tags) {
        editingProduct.tags.forEach((tag) => {
          formData.append('tags', tag);
        });
      }

      await axios.put(`/api/products/${editingProduct._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      setEditImageFiles([]);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating product:', error);
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting product:', error);
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await axios.put(`/api/products/${productId}`, {
        isActive: !currentStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      images: [''],
      sizes: [],
      colors: [],
      stock: '',
      sku: '',
      discount: 0,
      isActive: true,
      isFeatured: false
    });
  };

  const openEditProduct = (product) => {
    setEditingProduct({
      ...product,
      images: product.images.length ? product.images : [''],
      colors: product.colors.length ? product.colors : ['']
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin-login');
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Order detail modal logic
  const openOrderDetail = async (orderId) => {
    setOrderDetailLoading(true);
    setOrderDetailError('');
    setOrderDetail(null);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setOrderDetailError('No admin token found');
        return;
      }
      
      const res = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetail(res.data);
      setOrderNotes(res.data.notes || '');
      setOrderInternalNotes(res.data.internalNotes || '');
    } catch (err) {
      setOrderDetailError('Failed to load order details');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setOrderDetail(null);
    setOrderNotes('');
    setOrderInternalNotes('');
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    setOrderStatusUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No admin token found');
        return;
      }
      
      await axios.put(`/api/orders/${orderId}/status`, {
        status,
        notes: orderNotes,
        internalNotes: orderInternalNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order updated');
      closeOrderDetail();
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setOrderStatusUpdating(false);
    }
  };

  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);
  const [customerOrdersError, setCustomerOrdersError] = useState('');

  const openCustomerOrders = async (customer) => {
    setViewingCustomer(customer);
    setCustomerOrders([]);
    setCustomerOrdersLoading(true);
    setCustomerOrdersError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setCustomerOrdersError('No admin token found');
        return;
      }
      
      const res = await axios.get(`/api/users/admin/customers/${customer._id}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerOrders(res.data.orders || []);
    } catch (err) {
      setCustomerOrdersError('Failed to load orders');
    } finally {
      setCustomerOrdersLoading(false);
    }
  };
  const closeCustomerOrders = () => {
    setViewingCustomer(null);
    setCustomerOrders([]);
    setCustomerOrdersError('');
  };

  const handleExportOrdersCSV = async () => {
    setExportingOrders(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/orders/export/csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to export orders');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to export orders');
    } finally {
      setExportingOrders(false);
    }
  };

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [imageFiles, setImageFiles] = useState([]); // For add modal
  const [editImageFiles, setEditImageFiles] = useState([]); // For edit modal
  const fileInputRef = useRef();
  const editFileInputRef = useRef();

  useEffect(() => {
    if (activeTab === 'products') {
      fetchLowStockProducts();
    }
  }, [activeTab]);
  const fetchLowStockProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/products/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLowStockProducts(res.data.products || []);
    } catch {
      setLowStockProducts([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLowStockProducts, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImageFiles(files);
  };
  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setEditImageFiles(files);
  };
  const removeImageFile = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };
  const removeEditImageFile = (idx) => {
    setEditImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  if (loading && !admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Kartik Traders Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <FaBell className="text-xl" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <FaCog className="text-xl" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {admin.name}!</h2>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaTachometerAlt className="inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBox className="inline mr-2" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaShoppingCart className="inline mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Customers
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser className="inline mr-2" />
              Profile
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaRupeeSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaBox className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUsers className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Customers</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentOrders?.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.shippingAddress?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.totalPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
              <button
                onClick={() => setShowAddProduct(true)}
                className="btn-primary flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Product
              </button>
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddProduct || editingProduct) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct ? editingProduct.name : newProduct.name}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, name: e.target.value });
                            } else {
                              setNewProduct({ ...newProduct, name: e.target.value });
                            }
                          }}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct ? editingProduct.brand : newProduct.brand}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, brand: e.target.value });
                            } else {
                              setNewProduct({ ...newProduct, brand: e.target.value });
                            }
                          }}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          required
                          value={editingProduct ? editingProduct.category : newProduct.category}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, category: e.target.value });
                            } else {
                              setNewProduct({ ...newProduct, category: e.target.value });
                            }
                          }}
                          className="input-field"
                        >
                          <option value="">Select Category</option>
                          <option value="jeans">Jeans</option>
                          <option value="shirts">Shirts</option>
                          <option value="t-shirts">T-Shirts</option>
                          <option value="jackets">Jackets</option>
                          <option value="pants">Pants</option>
                          <option value="dresses">Dresses</option>
                          <option value="accessories">Accessories</option>
                          <option value="shoes">Shoes</option>
                          <option value="bags">Bags</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SKU *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct ? editingProduct.sku : newProduct.sku}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, sku: e.target.value });
                            } else {
                              setNewProduct({ ...newProduct, sku: e.target.value });
                            }
                          }}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={editingProduct ? editingProduct.price : newProduct.price}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, price: e.target.value });
                            } else {
                              setNewProduct({ ...newProduct, price: e.target.value });
                            }
                          }}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={editingProduct ? editingProduct.stock : newProduct.stock}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, stock: e.target.value });
                            } else {
                              setNewProduct({ ...newProduct, stock: e.target.value });
                            }
                          }}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        rows="3"
                        value={editingProduct ? editingProduct.description : newProduct.description}
                        onChange={(e) => {
                          if (editingProduct) {
                            setEditingProduct({ ...editingProduct, description: e.target.value });
                          } else {
                            setNewProduct({ ...newProduct, description: e.target.value });
                          }
                        }}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL *
                      </label>
                      <div
                        className="border-2 border-dashed rounded p-4 mb-2 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        onDrop={e => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files).slice(0, 6);
                          setImageFiles(files);
                        }}
                        onDragOver={e => e.preventDefault()}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="text-gray-600">Drag & drop images here, or <span className="underline">click to select</span> (up to 6)</div>
                        <div className="flex flex-wrap gap-2 mt-2 justify-center">
                          {imageFiles.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); removeImageFile(idx); }}
                                className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingProduct ? editingProduct.isActive : newProduct.isActive}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, isActive: e.target.checked });
                            } else {
                              setNewProduct({ ...newProduct, isActive: e.target.checked });
                            }
                          }}
                          className="mr-2"
                        />
                        Active
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingProduct ? editingProduct.isFeatured : newProduct.isFeatured}
                          onChange={(e) => {
                            if (editingProduct) {
                              setEditingProduct({ ...editingProduct, isFeatured: e.target.checked });
                            } else {
                              setNewProduct({ ...newProduct, isFeatured: e.target.checked });
                            }
                          }}
                          className="mr-2"
                        />
                        Featured
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProduct(false);
                          setEditingProduct(null);
                        }}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0] || 'https://via.placeholder.com/48x48?text=No+Image'}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.brand}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{product.price}
                          {product.discount > 0 && (
                            <span className="ml-2 text-xs text-green-600">
                              -{product.discount}%
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(product._id, product.isActive)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? (
                              <>
                                <FaEye className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <FaEyeSlash className="mr-1" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {lowStockProducts.length > 0 && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded flex items-center justify-between">
                <div>
                  <b>Low Stock Alert:</b> {lowStockProducts.length} product(s) below threshold.
                  <button className="ml-4 underline text-sm" onClick={() => setShowLowStock(s => !s)}>
                    {showLowStock ? 'Hide List' : 'Show List'}
                  </button>
                </div>
                {showLowStock && (
                  <div className="ml-8">
                    <ul className="list-disc ml-4">
                      {lowStockProducts.map(p => (
                        <li key={p._id}>{p.name} (Stock: {p.stock})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
              <button className="btn-outline ml-2" onClick={handleExportOrdersCSV} disabled={exportingOrders}>
                {exportingOrders ? 'Exporting...' : 'Export Orders (CSV)'}
              </button>
              <button className="btn-outline" onClick={fetchDashboardData}>Refresh</button>
              <div className="flex flex-wrap gap-2 mb-4">
                <select value={orderFilters.status} onChange={e => setOrderFilters({ ...orderFilters, status: e.target.value })} className="input-field">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input type="text" placeholder="Customer name" value={orderCustomer} onChange={e => setOrderCustomer(e.target.value)} className="input-field" />
                <select value={orderPaymentType} onChange={e => setOrderPaymentType(e.target.value)} className="input-field">
                  <option value="">All Payment Types</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Netbanking</option>
                </select>
                <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={update => setDateRange(update)} isClearable placeholderText="Date range" className="input-field" />
              </div>
              {newOrderCount > 0 && <div className="text-green-600 font-bold mb-2">{newOrderCount} new order(s) received!</div>}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders
                      .filter(order =>
                        (!orderFilters.status || order.status === orderFilters.status) &&
                        (!orderCustomer || (order.shippingAddress?.name || '').toLowerCase().includes(orderCustomer.toLowerCase())) &&
                        (!orderPaymentType || order.paymentType === orderPaymentType) &&
                        (!startDate || !endDate || (new Date(order.createdAt) >= startDate && new Date(order.createdAt) <= endDate))
                      )
                      .map((order) => (
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
                            {order.shippingAddress?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingAddress?.phone}
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
                            ₹{order.totalPrice?.toFixed(2)}
                          </div>
                          {order.isPaid ? (
                            <div className="text-xs text-green-600">Paid</div>
                          ) : (
                            <div className="text-xs text-yellow-600">Pending</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openOrderDetail(order._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEye />
                            </button>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'processing')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Process
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Ship
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Deliver
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
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Customer Management</h3>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.orderCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(customer.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="btn-outline text-xs"
                            onClick={() => openCustomerOrders(customer)}
                          >
                            View Purchase History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Profile</h2>
            <ProfileSection />
          </div>
        )}
      </div>
      {orderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order #{orderDetail._id.slice(-8).toUpperCase()}</h2>
              <button onClick={closeOrderDetail} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            {orderDetailLoading ? <div>Loading...</div> : orderDetailError ? <div className="text-red-600">{orderDetailError}</div> : (
              <>
                <div className="mb-2"><b>Status:</b> <span className={getStatusColor(orderDetail.status)}>{orderDetail.status}</span></div>
                <div className="mb-2"><b>Customer:</b> {orderDetail.shippingAddress?.name} ({orderDetail.user?.email})</div>
                <div className="mb-2"><b>Phone:</b> {orderDetail.shippingAddress?.phone}</div>
                <div className="mb-2"><b>Address:</b> {orderDetail.shippingAddress?.street}, {orderDetail.shippingAddress?.city}, {orderDetail.shippingAddress?.state}, {orderDetail.shippingAddress?.zipCode}, {orderDetail.shippingAddress?.country}</div>
                <div className="mb-2"><b>Payment:</b> {orderDetail.paymentType || orderDetail.paymentMethod}</div>
                <div className="mb-2"><b>Order Date:</b> {formatDate(orderDetail.createdAt)}</div>
                <div className="mb-2"><b>Items:</b>
                  <ul className="list-disc ml-6">
                    {orderDetail.orderItems.map(item => (
                      <li key={item._id}>{item.name} ({item.size}, {item.color}) x {item.quantity} - ₹{item.price}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2"><b>Total:</b> ₹{orderDetail.totalPrice}</div>
                <div className="mb-2"><b>Notes:</b> <textarea className="input-field" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} /></div>
                <div className="mb-2"><b>Internal Notes (admin only):</b> <textarea className="input-field" value={orderInternalNotes} onChange={e => setOrderInternalNotes(e.target.value)} /></div>
                <div className="flex gap-2 mt-4">
                  {['pending','processing','shipped','delivered','cancelled'].map(status => (
                    <button key={status} className="btn-outline" disabled={orderStatusUpdating} onClick={() => handleOrderStatusUpdate(orderDetail._id, status)}>{status}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{viewingCustomer.name}'s Orders</h2>
              <button onClick={closeCustomerOrders} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            {customerOrdersLoading ? <div>Loading...</div> : customerOrdersError ? <div className="text-red-600">{customerOrdersError}</div> : (
              customerOrders.length === 0 ? <div>No orders found for this customer.</div> : (
                <table className="min-w-full divide-y divide-gray-200 mb-2">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerOrders.map(order => (
                      <tr key={order._id}>
                        <td className="px-4 py-2">#{order._id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-2">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-2">₹{order.totalPrice?.toFixed(2)}</td>
                        <td className="px-4 py-2">{order.status}</td>
                        <td className="px-4 py-2">{order.orderItems.map(item => item.name).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSection() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setProfile(res.data);
      setForm({ name: res.data.name, email: res.data.email });
    } catch (err) {
      setProfileError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    try {
      await axios.put('/api/auth/profile', form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setProfileSuccess('Profile updated!');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div className="text-red-600">{profileError || 'Profile not found'}</div>;

  return (
    <div>
      <form onSubmit={handleProfileSave} className="space-y-4 mb-8">
        <div>
          <label className="form-label">Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editMode} />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={!editMode} />
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className="btn-outline" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>
        {profileSuccess && <div className="text-green-600">{profileSuccess}</div>}
        {profileError && <div className="text-red-600">{profileError}</div>}
      </form>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <div>
          <label className="form-label">Current Password</label>
          <input className="input-field" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
        </div>
        <div>
          <label className="form-label">New Password</label>
          <input className="input-field" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
        </div>
        <div>
          <label className="form-label">Confirm New Password</label>
          <input className="input-field" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
        </div>
        <button type="submit" className="btn-primary" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
        {pwSuccess && <div className="text-green-600">{pwSuccess}</div>}
        {pwError && <div className="text-red-600">{pwError}</div>}
      </form>
    </div>
  );
}