# Kartik Traders - Backend API

This is the backend API for the Kartik Traders e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT Authentication for customers and admin
- 🛍️ Product management with categories, brands, and filtering
- 🛒 Order management with payment processing
- 📊 Admin dashboard for inventory and order management
- 🔍 Advanced search and filtering capabilities
- 📱 RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kartik-traders
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/create-admin` - Create admin user (setup)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/brands` - Get all brands
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

## Database Models

### User
- Customer and admin roles
- JWT authentication
- Profile management

### Product
- Clothing categories (jeans, shirts, etc.)
- Brand and price filtering
- Stock management
- Image support

### Order
- Order items with product details
- Shipping address
- Payment methods
- Order status tracking

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Development

The server runs on port 5000 by default. Make sure MongoDB is running locally or update the MONGODB_URI in your .env file.

## Production Deployment

1. Set NODE_ENV=production
2. Use a strong JWT_SECRET
3. Configure MongoDB Atlas or your preferred MongoDB hosting
4. Set up proper CORS origins
5. Use environment variables for all sensitive data 