import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaShieldAlt,
  FaHistory,
  FaHeart,
  FaMapMarkerAlt
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth()
  const { wishlist } = useWishlist(); // <-- Get wishlist from context
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [orders, setOrders] = useState([]) // <-- Add orders state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const navigate = useNavigate();

  // Sync formData with user when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      })
    }
  }, [user])

  // Fetch orders for order count
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders/myorders')
        setOrders(response.data || [])
      } catch (error) {
        setOrders([])
      }
    }
    if (user) fetchOrders()
  }, [user])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSaveProfile = async () => {
    // Frontend validation
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Valid email is required')
      return
    }
    if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Phone number must be 10 digits')
      return
    }
    try {
      setLoading(true)
      console.log('Profile update payload:', formData)
      const result = await updateProfile(formData)
      if (result.success) {
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      setLoading(true)
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }
    })
    setEditing(false)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Helper for safe date display
  const memberSince = user.createdAt && !isNaN(new Date(user.createdAt))
    ? new Date(user.createdAt).toLocaleDateString()
    : 'N/A';

  // Helper for safe address display
  const address = user.address || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-outline flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="btn-primary flex items-center"
                    >
                      <FaSave className="mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-outline flex items-center"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editing}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    className="input-field"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Address
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address?.street || ''}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        disabled={!editing}
                        className="input-field"
                        placeholder="Enter street address"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.address?.city || ''}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        disabled={!editing}
                        className="input-field"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.address?.state || ''}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        disabled={!editing}
                        className="input-field"
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.address?.zipCode || ''}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        disabled={!editing}
                        className="input-field"
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.address?.country || ''}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        disabled={!editing}
                        className="input-field"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FaShieldAlt className="mr-2" />
                Change Password
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="btn-primary"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {memberSince}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaHistory className="text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Total Orders</span>
                  </div>
                  <span className="text-sm text-gray-900">{orders.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaHeart className="text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Wishlist Items</span>
                  </div>
                  <span className="text-sm text-gray-900">{wishlist.length}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => navigate('/orders')}
                  >
                    View Order History
                  </button>
                  <button
                    className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => navigate('/addresses')}
                  >
                    Manage Addresses
                  </button>
                  <button
                    className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => navigate('/notifications')}
                  >
                    Notification Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 