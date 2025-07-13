const axios = require('axios');

const testOrderStatusUpdate = async () => {
  try {
    console.log('Testing order status update...');
    
    // Step 1: Admin login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@kartiktraders.com',
      password: 'admin123'
    });
    
    console.log('Admin login successful!');
    const token = loginResponse.data.token;
    
    // Step 2: Get all orders
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Orders fetched:', ordersResponse.data.orders.length);
    
    if (ordersResponse.data.orders.length === 0) {
      console.log('No orders found to test with');
      return;
    }
    
    // Step 3: Test status update on first order
    const firstOrder = ordersResponse.data.orders[0];
    console.log('Testing with order:', { id: firstOrder._id, currentStatus: firstOrder.status });
    
    const updateResponse = await axios.put(`http://localhost:5000/api/orders/${firstOrder._id}/status`, 
      { status: 'shipped' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Status update successful!');
    console.log('Updated order:', { id: updateResponse.data._id, newStatus: updateResponse.data.status });
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testOrderStatusUpdate(); 