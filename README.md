# 🛍️ Kartik Traders - E-commerce Platform

A production-ready, full-stack e-commerce website for "Kartik Traders" - a premium fashion store specializing in clothing, jeans, shirts, and accessories.

## 🚀 Features

### Customer Features
- 🔐 Secure user authentication and registration
- 🛍️ Browse products with advanced filtering and search
- 🛒 Shopping cart with size/color selection
- 💳 Multiple payment options (COD, UPI, Card, Net Banking)
- 📦 Order tracking and management
- 📱 Responsive mobile-first design
- ⭐ Product ratings and reviews
- 🔍 Advanced search with filters

### Admin Features
- 📊 Admin dashboard for inventory management
- ➕ Add, edit, and delete products
- 📋 Order management and status updates
- 👥 Customer order tracking
- 📈 Sales analytics and reporting

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers

## 📁 Project Structure

```
kartik-traders/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── styles/        # CSS and styling
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kartik-traders
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Install frontend dependencies**
```bash
cd ../client
npm install
```

5. **Start the development servers**

In the server directory:
```bash
npm run dev
```

In the client directory:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kartik-traders
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### Database Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in your `.env` file
3. The database and collections will be created automatically

### Admin Setup

Create an admin user by making a POST request to `/api/auth/create-admin`:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@kartiktraders.com",
    "password": "admin123",
    "phone": "9876543210"
  }'
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Mark order as paid
- `GET /api/orders` - Get all orders (Admin)

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#64748B)
- **Accent**: Red (#EF4444)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- XSS protection

## 📦 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform

### Backend (Railway/Render)
1. Set environment variables
2. Deploy to your preferred platform
3. Update CORS origins for production

### Database
- Use MongoDB Atlas for production
- Set up proper indexes for performance
- Configure backup and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@kartiktraders.com
- Phone: +91 98765 43210

## 🚀 Roadmap

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] PWA features
- [ ] Social media login
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Advanced search with filters
- [ ] Bulk order management
- [ ] Inventory alerts
- [ ] Sales reports and analytics

---

**Built with ❤️ for Kartik Traders** 