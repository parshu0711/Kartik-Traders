const express = require('express');
const path = require('path');

// Test the SPA routing setup
const app = express();

// Simulate production environment
process.env.NODE_ENV = 'production';

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// API routes (simulated)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is working' });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('\n📋 Test these routes:');
  console.log(`   http://localhost:${PORT}/`);
  console.log(`   http://localhost:${PORT}/login`);
  console.log(`   http://localhost:${PORT}/admin`);
  console.log(`   http://localhost:${PORT}/shop`);
  console.log(`   http://localhost:${PORT}/product/123`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log('\n✅ All routes should serve index.html (except /api/health)');
  console.log('❌ If you see 404 errors, the SPA routing is not working');
}); 