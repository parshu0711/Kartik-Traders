import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaUpload,
  FaTimes
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useRef } from 'react';
import getImageUrl from '../utils/getImageUrl'

const AdminProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    images: [''],
    sizes: [],
    colors: [],
    stock: '',
    sku: '',
    discount: 0,
    isActive: true,
    isFeatured: false,
    tags: [],
    material: '',
    careInstructions: '',
    shippingWeight: '',
    dimensions: '',
    highlights: [], // Added for highlights
    fit: '', // Added for fit
    sleeveType: '', // Added for sleeve type
    occasion: '' // Added for occasion
  })
  const [imageFiles, setImageFiles] = useState([]); // For add modal
  const [editImageFiles, setEditImageFiles] = useState([]); // For edit modal
  const [sizeStock, setSizeStock] = useState([]); // Added for size stock
  const [customSize, setCustomSize] = useState(''); // Added for custom size
  const [highlightInput, setHighlightInput] = useState(''); // Added for highlights
  const [fit, setFit] = useState(''); // Added for fit
  const [sleeveType, setSleeveType] = useState(''); // Added for sleeve type
  const [occasion, setOccasion] = useState(''); // Added for occasion
  const fileInputRef = useRef();
  const editFileInputRef = useRef();

  const categories = [
    // Clothing
    'shirts', 't-shirts', 'polo-shirts', 'formal-shirts', 'casual-shirts',
    'jeans', 'pants', 'trousers', 'formal-pants', 'casual-pants',
    'jackets', 'blazers', 'sweaters', 'hoodies', 'sweatshirts',
    'dresses', 'tops', 'kurtas', 'ethnic-wear', 'western-wear',
    'suits', 'waistcoats', 'vests', 'shorts', 'track-pants',
    
    // Innerwear & Sleepwear
    'innerwear', 'undergarments', 'vests', 'briefs', 'boxers',
    'sleepwear', 'pajamas', 'nightwear', 'loungewear',
    
    // Accessories
    'belts', 'wallets', 'watches', 'sunglasses', 'jewelry',
    'scarves', 'ties', 'handkerchiefs', 'socks', 'caps',
    
    // Footwear
    'shoes', 'sneakers', 'formal-shoes', 'casual-shoes', 'sports-shoes',
    'sandals', 'flip-flops', 'boots', 'loafers',
    
    // Bags & Luggage
    'bags', 'backpacks', 'handbags', 'wallets', 'luggage',
    'travel-bags', 'messenger-bags', 'duffle-bags'
  ]

  // Update getSizesForCategory to include kids-wear and handle 'others' (custom only)
  const getSizesForCategory = (category) => {
    const sizeMap = {
      // Shirts, T-shirts, Polo shirts, etc.
      'shirts': ['S', 'M', 'L', 'XL', 'XXL'],
      't-shirts': ['S', 'M', 'L', 'XL', 'XXL'],
      'polo-shirts': ['S', 'M', 'L', 'XL', 'XXL'],
      'formal-shirts': ['S', 'M', 'L', 'XL', 'XXL'],
      'casual-shirts': ['S', 'M', 'L', 'XL', 'XXL'],
      // Jeans and Pants
      'jeans': ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
      'pants': ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
      'trousers': ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
      'formal-pants': ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
      'casual-pants': ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
      // Shoes
      'shoes': ['6', '7', '8', '9', '10', '11', '12'],
      'sneakers': ['6', '7', '8', '9', '10', '11', '12'],
      'formal-shoes': ['6', '7', '8', '9', '10', '11', '12'],
      'casual-shoes': ['6', '7', '8', '9', '10', '11', '12'],
      'sports-shoes': ['6', '7', '8', '9', '10', '11', '12'],
      // Kids wear
      'kids-wear': ['XS', 'S', 'M', 'L', '2-4 yrs', '5-6 yrs', '7-8 yrs', '9-10 yrs', '11-12 yrs'],
      // Accessories and other categories
      'belts': ['S', 'M', 'L', 'XL'],
      'wallets': ['One Size'],
      'watches': ['One Size'],
      'sunglasses': ['One Size'],
      'jewelry': ['One Size'],
      'scarves': ['One Size'],
      'ties': ['One Size'],
      'handkerchiefs': ['One Size'],
      'socks': ['S', 'M', 'L', 'XL'],
      'caps': ['S', 'M', 'L', 'XL'],
      'bags': ['One Size'],
      'backpacks': ['One Size'],
      'handbags': ['One Size'],
      'luggage': ['One Size'],
      'travel-bags': ['One Size'],
      'messenger-bags': ['One Size'],
      'duffle-bags': ['One Size'],
      'sandals': ['6', '7', '8', '9', '10', '11', '12'],
      'flip-flops': ['6', '7', '8', '9', '10', '11', '12'],
      'boots': ['6', '7', '8', '9', '10', '11', '12'],
      'loafers': ['6', '7', '8', '9', '10', '11', '12'],
      // Default for any other category
      'default': ['One Size']
    };
    if (!category) return [];
    return sizeMap[category] || sizeMap['default'] || [];
  };

  const isCustomSizeCategory = (category) => {
    // If not in the sizeMap, treat as custom
    const allowed = [
      'shirts', 't-shirts', 'polo-shirts', 'formal-shirts', 'casual-shirts',
      'jeans', 'pants', 'trousers', 'formal-pants', 'casual-pants',
      'shoes', 'sneakers', 'formal-shoes', 'casual-shoes', 'sports-shoes',
      'kids-wear'
    ];
    return !allowed.includes(category);
  };

  // Remove the entire size section and all related logic from the Add Product modal form
  // Remove all state and handlers related to sizes, sizeStock, customSize, and related warnings/instructions

  useEffect(() => {
    fetchProducts()
  }, [])

  // Debug: Log when modal opens
  useEffect(() => {
    if (showAddModal) {
      console.log('🔴 Add Product Modal opened');
      console.log('🔴 Current newProduct:', newProduct);
      // console.log('🔴 Current sizes:', sizes); // Removed
    }
  }, [showAddModal, newProduct.category])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        toast.error('No admin token found')
        return
      }
      
      const response = await axios.get('/api/products?all=true', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Debug logging
    console.log('Form submission - newProduct:', newProduct);
    // console.log('Form submission - sizeStock:', sizeStock); // Removed
    console.log('Form submission - imageFiles:', imageFiles);
    
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (key === 'sizes' || key === 'colors' || key === 'tags') {
          value.forEach(v => formData.append(key, v));
        } else if (key !== 'images') {
          formData.append(key, value);
        }
      });
      imageFiles.forEach(file => formData.append('images', file));
      // formData.append('sizeStock', JSON.stringify(sizeStock)); // Removed
      formData.append('highlights', JSON.stringify(newProduct.highlights || []));
      // formData.append('fit', fit); // Removed
      // formData.append('sleeveType', sleeveType); // Removed
      // formData.append('occasion', occasion); // Removed
      
      // Debug: Log what's being sent
      // console.log('Sending sizes:', newProduct.sizes); // Removed
      // console.log('Sending sizeStock:', sizeStock); // Removed
      
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        } 
      };
      await axios.post('/api/products', formData, config);
      toast.success('Product added successfully!');
      setShowAddModal(false);
      resetForm();
      setImageFiles([]);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData();
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (key === 'sizes' || key === 'colors' || key === 'tags') {
          value.forEach(v => formData.append(key, v));
        } else if (key !== 'images') {
          formData.append(key, value);
        }
      });
      
      // Handle images properly
      if (editImageFiles.length > 0) {
        // If new files are selected, upload them
        editImageFiles.forEach(file => formData.append('images', file));
        console.log('Uploading new image files:', editImageFiles.length);
      } else {
        // If no new files, send existing image URLs
        const existingImages = editingProduct.images.filter(img => img && img.trim() !== '');
        formData.append('images', JSON.stringify(existingImages));
        console.log('Sending existing image URLs:', existingImages);
      }
      
      formData.append('highlights', JSON.stringify(editingProduct.highlights || []));
      
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        } 
      };
      
      console.log('Sending update request with formData:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      await axios.put(`/api/products/${editingProduct._id}`, formData, config);
      toast.success('Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      setEditImageFiles([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      toast.success('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await axios.put(`/api/products/${productId}`, {
        isActive: !currentStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      toast.success(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
      fetchProducts()
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast.error('Failed to update product status')
    }
  }

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      brand: '',
      images: [''],
      sizes: [],
      colors: [],
      stock: '',
      sku: '',
      discount: 0,
      isActive: true,
      isFeatured: false,
      tags: [],
      material: '',
      careInstructions: '',
      shippingWeight: '',
      dimensions: '',
      highlights: [], // Reset highlights
      fit: '', // Reset fit
      sleeveType: '', // Reset sleeve type
      occasion: '' // Reset occasion
    })
    // setSizeStock([]); // Removed
    // setCustomSize(''); // Removed
    setHighlightInput(''); // Reset highlight input
    // setFit(''); // Removed
    // setSleeveType(''); // Removed
    // setOccasion(''); // Removed
  }

  const openEditModal = (product) => {
    setEditingProduct({
      ...product,
      images: product.images.length ? product.images : [''],
      colors: product.colors.length ? product.colors : ['']
    })
    // Initialize sizeStock with existing product data
    // if (product.sizeStock && product.sizeStock.length > 0) { // Removed
    //   setSizeStock(product.sizeStock); // Removed
    // } else if (product.sizes && product.sizes.length > 0) { // Removed
    //   // If no sizeStock but sizes exist, create sizeStock entries // Removed
    //   const initialSizeStock = product.sizes.map(size => ({ size, stock: 0 })); // Removed
    //   setSizeStock(initialSizeStock); // Removed
    // } else { // Removed
    //   setSizeStock([]); // Removed
    // } // Removed
    setShowEditModal(true)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImageFiles(files);
    setNewProduct(prev => ({ ...prev, images: [] }));
  };
  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setEditImageFiles(files);
    setEditingProduct(prev => ({ ...prev, images: [] }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setNewProduct(prev => ({ ...prev, tags }));
  };
  const handleEditTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setEditingProduct(prev => ({ ...prev, tags }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setNewProduct(prev => ({ 
      ...prev, 
      category,
      // sizes: [] // Reset sizes when category changes // Removed
    }));
  };

  const handleEditCategoryChange = (e) => {
    const category = e.target.value;
    setEditingProduct(prev => ({ 
      ...prev, 
      category,
      // sizes: [] // Reset sizes when category changes // Removed
    }));
  };

  const addImageField = () => {
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const updateImage = (index, value) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  const removeImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addColorField = () => {
    setNewProduct(prev => ({
      ...prev,
      colors: [...prev.colors, '']
    }))
  }

  const updateColor = (index, value) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => i === index ? value : color)
    }))
  }

  const removeColor = (index) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
  }

  // Remove all size-related UI and logic from the Add Product modal form
  // Remove all state and handlers related to sizes, sizeStock, customSize, and related warnings/instructions

  // In Add modal, update size checkbox handler to use toggleSize
  // In Edit modal, update size checkbox handler to use toggleEditSize

  // In Add modal, update addCustomSize to also update sizeStock
  const addEditCustomSize = () => {
    // if (customSize && !editingProduct.sizes.includes(customSize)) { // Removed
    //   setEditingProduct(prev => ({ ...prev, sizes: [...prev.sizes, customSize] })); // Removed
    //   setSizeStock(prev => [...prev, { size: customSize, stock: 0 }]); // Removed
    //   setCustomSize(''); // Removed
    // } // Removed
  };

  if (loading && products.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    Tags
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
                            src={getImageUrl(product.images[0])}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {product.tags && product.tags.map((tag, idx) => (
                          <span key={idx} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
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

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Add New Product</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
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
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={handleCategoryChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  </div>

                {/* Sizes Section - Always Visible and Prominent */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50" style={{border: '3px solid red'}}>
                  {/* DEBUG ELEMENT - REMOVE AFTER TESTING */}
                  <div style={{background: 'red', color: 'white', padding: '10px', marginBottom: '10px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold'}}>
                    🔴 SIZE SECTION IS HERE - SHOULD BE VISIBLE
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Sizes</h3>
                  <p className="text-sm text-gray-600 mb-2">At least one size is required for the product.</p>
                  
                  {/* Debug info */}
                  <div style={{background: 'yellow', padding: '5px', marginBottom: '10px', fontSize: '12px'}}>
                    Debug: Category = "{newProduct.category}", Sizes = {/* Removed */}
                  </div>

                  {/* Clear Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 font-medium">
                      📋 Instructions:
                    </p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Select standard sizes from the checkboxes below (if available for this category)</li>
                      <li>• OR add custom sizes using the input field</li>
                      <li>• Set stock quantity for each selected size</li>
                    </ul>
                  </div>

                  {/* Category Selection Notice */}
                  {!newProduct.category && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 font-medium">
                        ℹ️ Please select a category first to see standard size options
                      </p>
                    </div>
                  )}

                  {/* Standard Sizes (if category has presets) */}
                  {/* Removed */}

                  {/* Custom Size Input - Always Visible */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {/* Removed */}
                    </label>
                    <div className="flex gap-2">
                      {/* Removed */}
                      <button
                        type="button"
                        onClick={addEditCustomSize}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {/* Removed */}
                    
                    {/* Quick Add Buttons */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Quick add:</p>
                      <div className="flex flex-wrap gap-1">
                        {/* Removed */}
                      </div>
                    </div>
                  </div>

                  {/* Selected Sizes and Stock */}
                  {/* Removed */}

                  {/* Removed */}

                  {/* Removed */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
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
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
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
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newProduct.discount}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, discount: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      value={newProduct.material || ''}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, material: e.target.value }))}
                      placeholder="e.g. Cotton, Polyester, Denim"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Care Instructions
                    </label>
                    <input
                      type="text"
                      value={newProduct.careInstructions || ''}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, careInstructions: e.target.value }))}
                      placeholder="e.g. Machine wash cold"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newProduct.shippingWeight || ''}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, shippingWeight: e.target.value }))}
                      placeholder="0.5"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions (L x W x H cm)
                    </label>
                    <input
                      type="text"
                      value={newProduct.dimensions || ''}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, dimensions: e.target.value }))}
                      placeholder="e.g. 30 x 20 x 5"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newProduct.tags ? newProduct.tags.join(', ') : ''}
                    onChange={handleTagsChange}
                    placeholder="e.g. summer, sale, trending"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images * (up to 6)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="input-field"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageFiles.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Colors
                  </label>
                  {newProduct.colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        placeholder="Color name"
                        className="input-field flex-1"
                      />
                      {newProduct.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addColorField}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Another Color
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highlights (comma separated)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {newProduct.highlights && newProduct.highlights.map((highlight, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {highlight}
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addHighlight();
                        }
                      }}
                      placeholder="e.g., Best Seller, Trending"
                      className="input-field flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit
                  </label>
                  <input
                    type="text"
                    value={newProduct.fit || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, fit: e.target.value }))}
                    placeholder="e.g., Regular, Slim, Oversized"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleeve Type
                  </label>
                  <input
                    type="text"
                    value={newProduct.sleeveType || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sleeveType: e.target.value }))}
                    placeholder="e.g., Full Sleeve, Half Sleeve"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={newProduct.occasion || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, occasion: e.target.value }))}
                    placeholder="e.g., Casual, Formal, Party"
                    className="input-field"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.isActive}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    Active
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.isFeatured}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Edit Product</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
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
                      value={editingProduct.brand}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, brand: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={editingProduct.category}
                      onChange={handleEditCategoryChange}
                      className="input-field"
                    >
                      <option value="">Select Category</option>
                      <optgroup label="Clothing">
                        <option value="shirts">Shirts</option>
                        <option value="t-shirts">T-Shirts</option>
                        <option value="polo-shirts">Polo Shirts</option>
                        <option value="formal-shirts">Formal Shirts</option>
                        <option value="casual-shirts">Casual Shirts</option>
                        <option value="jeans">Jeans</option>
                        <option value="pants">Pants</option>
                        <option value="trousers">Trousers</option>
                        <option value="formal-pants">Formal Pants</option>
                        <option value="casual-pants">Casual Pants</option>
                        <option value="jackets">Jackets</option>
                        <option value="blazers">Blazers</option>
                        <option value="sweaters">Sweaters</option>
                        <option value="hoodies">Hoodies</option>
                        <option value="sweatshirts">Sweatshirts</option>
                        <option value="dresses">Dresses</option>
                        <option value="tops">Tops</option>
                        <option value="kurtas">Kurtas</option>
                        <option value="ethnic-wear">Ethnic Wear</option>
                        <option value="western-wear">Western Wear</option>
                        <option value="suits">Suits</option>
                        <option value="waistcoats">Waistcoats</option>
                        <option value="vests">Vests</option>
                        <option value="shorts">Shorts</option>
                        <option value="track-pants">Track Pants</option>
                      </optgroup>
                      <optgroup label="Innerwear & Sleepwear">
                        <option value="innerwear">Innerwear</option>
                        <option value="undergarments">Undergarments</option>
                        <option value="briefs">Briefs</option>
                        <option value="boxers">Boxers</option>
                        <option value="sleepwear">Sleepwear</option>
                        <option value="pajamas">Pajamas</option>
                        <option value="nightwear">Nightwear</option>
                        <option value="loungewear">Loungewear</option>
                      </optgroup>
                      <optgroup label="Accessories">
                        <option value="belts">Belts</option>
                        <option value="wallets">Wallets</option>
                        <option value="watches">Watches</option>
                        <option value="sunglasses">Sunglasses</option>
                        <option value="jewelry">Jewelry</option>
                        <option value="scarves">Scarves</option>
                        <option value="ties">Ties</option>
                        <option value="handkerchiefs">Handkerchiefs</option>
                        <option value="socks">Socks</option>
                        <option value="caps">Caps</option>
                      </optgroup>
                      <optgroup label="Footwear">
                        <option value="shoes">Shoes</option>
                        <option value="sneakers">Sneakers</option>
                        <option value="formal-shoes">Formal Shoes</option>
                        <option value="casual-shoes">Casual Shoes</option>
                        <option value="sports-shoes">Sports Shoes</option>
                        <option value="sandals">Sandals</option>
                        <option value="flip-flops">Flip Flops</option>
                        <option value="boots">Boots</option>
                        <option value="loafers">Loafers</option>
                      </optgroup>
                      <optgroup label="Bags & Luggage">
                        <option value="bags">Bags</option>
                        <option value="backpacks">Backpacks</option>
                        <option value="handbags">Handbags</option>
                        <option value="luggage">Luggage</option>
                        <option value="travel-bags">Travel Bags</option>
                        <option value="messenger-bags">Messenger Bags</option>
                        <option value="duffle-bags">Duffle Bags</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, sku: e.target.value }))}
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
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, price: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingProduct.originalPrice}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
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
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingProduct.discount}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, discount: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.tags ? editingProduct.tags.join(', ') : ''}
                    onChange={handleEditTagsChange}
                    placeholder="e.g. summer, sale, trending"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images * (up to 6)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={editFileInputRef}
                    onChange={handleEditImageChange}
                    className="input-field"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct && editingProduct.images && editingProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                    {editImageFiles.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selection Section */}
                <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <label className="block text-sm font-bold text-blue-900 mb-2">
                    Available Sizes
                  </label>
                  {isCustomSizeCategory(editingProduct.category) ? (
                    <div>
                      <div className="mb-2 text-xs text-blue-700 font-semibold">Custom Size Mode</div>
                      <label className="block text-xs text-gray-500 mb-1">Add any size (e.g., 3XL, 4XL, 2-4 yrs, etc.)</label>
                      <div className="flex space-x-2 mb-2">
                        <input
                          type="text"
                          value={customSize}
                          onChange={(e) => setCustomSize(e.target.value)}
                          placeholder="e.g., 3XL, 4XL, 2-4 yrs, etc."
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={addEditCustomSize}
                          className="btn-outline"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editingProduct.sizes.map((size) => (
                          <span key={size} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {size}
                            <button
                              type="button"
                              className="ml-1 text-red-500 hover:text-red-700"
                              onClick={() => setEditingProduct(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }))}
                            >
                              <FaTimes />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 text-xs text-blue-700 font-semibold">
                        {(() => {
                          switch (editingProduct.category) {
                            case 'jeans':
                            case 'pants':
                            case 'trousers':
                            case 'formal-pants':
                            case 'casual-pants':
                              return 'Standard Jeans/Pants Sizes: 26, 28, 30, 32, 34, 36, etc.';
                            case 'shirts':
                            case 't-shirts':
                            case 'polo-shirts':
                            case 'formal-shirts':
                            case 'casual-shirts':
                              return 'Standard Shirt Sizes: S, M, L, XL, XXL';
                            case 'shoes':
                            case 'sneakers':
                            case 'formal-shoes':
                            case 'casual-shoes':
                            case 'sports-shoes':
                              return 'Standard Shoe Sizes: 6, 7, 8, 9, 10, 11, etc.';
                            case 'kids-wear':
                              return 'Kids Sizes: XS, S, M, L, 2-4 yrs, 5-6 yrs, etc.';
                            default:
                              return '';
                          }
                        })()}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {getSizesForCategory(editingProduct.category)?.map((size) => (
                      <label key={size} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingProduct.sizes.includes(size)}
                              onChange={() => toggleEditSize(size)}
                              className="mr-1"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
                  )}
                </div>
                {/* Stock per Size Section */}
                {editingProduct.sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-blue-900 mb-2">
                      Stock per Size
                    </label>
                    {editingProduct.sizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{size}:</span>
                        <input
                          type="number"
                          min="0"
                          value={sizeStock.find(ss => ss.size === size)?.stock || 0}
                          onChange={(e) => handleSizeStockChange(size, e.target.value)}
                          className="input-field w-24"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Colors
                  </label>
                  {editingProduct.colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setEditingProduct(prev => ({
                          ...prev,
                          colors: prev.colors.map((c, i) => i === index ? e.target.value : c)
                        }))}
                        placeholder="Color name"
                        className="input-field flex-1"
                      />
                      {editingProduct.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditingProduct(prev => ({
                            ...prev,
                            colors: prev.colors.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditingProduct(prev => ({
                      ...prev,
                      colors: [...prev.colors, '']
                    }))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Another Color
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highlights (comma separated)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editingProduct.highlights && editingProduct.highlights.map((highlight, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {highlight}
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addHighlight();
                        }
                      }}
                      placeholder="e.g., Best Seller, Trending"
                      className="input-field flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fit
                  </label>
                  <input
                    type="text"
                    value={editingProduct.fit || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, fit: e.target.value }))}
                    placeholder="e.g., Regular, Slim, Oversized"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleeve Type
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sleeveType || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, sleeveType: e.target.value }))}
                    placeholder="e.g., Full Sleeve, Half Sleeve"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={editingProduct.occasion || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, occasion: e.target.value }))}
                    placeholder="e.g., Casual, Formal, Party"
                    className="input-field"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.isActive}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="mr-2"
                    />
                    Active
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.isFeatured}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || editingProduct.sizes.length === 0}
                    className="btn-primary"
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts 
