const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Classic White T-Shirt',
    description: 'Premium cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
    price: 499,
    originalPrice: 599,
    category: 't-shirts',
    brand: 'FashionCo',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray'],
    stock: 50,
    sku: 'TS-WHT-001',
    rating: 4.5,
    numReviews: 12,
    isActive: true,
    isFeatured: true,
    discount: 17,
    tags: ['casual', 'cotton', 'basic']
  },
  {
    name: 'Denim Blue Jeans',
    description: 'High-quality denim jeans with perfect fit and durability.',
    price: 1299,
    originalPrice: 1499,
    category: 'jeans',
    brand: 'DenimPro',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black'],
    stock: 30,
    sku: 'JN-BLU-001',
    rating: 4.2,
    numReviews: 8,
    isActive: true,
    isFeatured: true,
    discount: 13,
    tags: ['denim', 'casual', 'durable']
  },
  {
    name: 'Formal White Shirt',
    description: 'Elegant formal shirt perfect for office wear and special occasions.',
    price: 899,
    originalPrice: 999,
    category: 'shirts',
    brand: 'FormalWear',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Light Blue', 'Pink'],
    stock: 25,
    sku: 'SH-WHT-001',
    rating: 4.7,
    numReviews: 15,
    isActive: true,
    isFeatured: false,
    discount: 10,
    tags: ['formal', 'office', 'elegant']
  },
  {
    name: 'Leather Jacket',
    description: 'Stylish leather jacket for a bold and confident look.',
    price: 2499,
    originalPrice: 2999,
    category: 'jackets',
    brand: 'UrbanStyle',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    stock: 15,
    sku: 'JK-BLK-001',
    rating: 4.8,
    numReviews: 6,
    isActive: true,
    isFeatured: true,
    discount: 17,
    tags: ['leather', 'stylish', 'premium']
  },
  {
    name: 'Casual Pants',
    description: 'Comfortable casual pants perfect for everyday wear.',
    price: 799,
    originalPrice: 899,
    category: 'pants',
    brand: 'ComfortZone',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'
    ],
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Khaki', 'Black', 'Gray'],
    stock: 40,
    sku: 'PT-KHK-001',
    rating: 4.3,
    numReviews: 10,
    isActive: true,
    isFeatured: false,
    discount: 11,
    tags: ['casual', 'comfortable', 'versatile']
  },
  {
    name: 'Summer Dress',
    description: 'Beautiful summer dress perfect for warm weather and special occasions.',
    price: 1499,
    originalPrice: 1799,
    category: 'dresses',
    brand: 'Elegance',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral', 'Blue', 'Pink'],
    stock: 20,
    sku: 'DR-FLR-001',
    rating: 4.6,
    numReviews: 7,
    isActive: true,
    isFeatured: true,
    discount: 17,
    tags: ['summer', 'elegant', 'floral']
  },
  {
    name: 'Leather Wallet',
    description: 'Premium leather wallet with multiple card slots and coin pocket.',
    price: 799,
    originalPrice: 999,
    category: 'accessories',
    brand: 'LeatherCraft',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400'
    ],
    sizes: [],
    colors: ['Brown', 'Black'],
    stock: 35,
    sku: 'WL-BRN-001',
    rating: 4.4,
    numReviews: 9,
    isActive: true,
    isFeatured: false,
    discount: 20,
    tags: ['leather', 'accessory', 'premium']
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes with excellent cushioning and support.',
    price: 1899,
    originalPrice: 2199,
    category: 'shoes',
    brand: 'SportMax',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400'
    ],
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Red'],
    stock: 25,
    sku: 'SH-WHT-001',
    rating: 4.9,
    numReviews: 18,
    isActive: true,
    isFeatured: true,
    discount: 14,
    tags: ['sports', 'running', 'comfortable']
  },
  {
    name: 'Canvas Backpack',
    description: 'Durable canvas backpack perfect for daily use and travel.',
    price: 599,
    originalPrice: 699,
    category: 'bags',
    brand: 'TravelPro',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400'
    ],
    sizes: [],
    colors: ['Navy', 'Gray', 'Black'],
    stock: 30,
    sku: 'BG-NVY-001',
    rating: 4.1,
    numReviews: 11,
    isActive: true,
    isFeatured: false,
    discount: 14,
    tags: ['canvas', 'travel', 'durable']
  },
  {
    name: 'Polo T-Shirt',
    description: 'Classic polo t-shirt with a sophisticated look.',
    price: 649,
    originalPrice: 749,
    category: 't-shirts',
    brand: 'ClassicWear',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'Red', 'Green'],
    stock: 45,
    sku: 'PL-NVY-001',
    rating: 4.3,
    numReviews: 14,
    isActive: true,
    isFeatured: false,
    discount: 13,
    tags: ['polo', 'classic', 'sophisticated']
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Modern slim fit jeans with stretch comfort.',
    price: 1099,
    originalPrice: 1299,
    category: 'jeans',
    brand: 'ModernFit',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Dark Blue', 'Black'],
    stock: 35,
    sku: 'JN-DBL-001',
    rating: 4.5,
    numReviews: 16,
    isActive: true,
    isFeatured: false,
    discount: 15,
    tags: ['slim', 'modern', 'stretch']
  },
  {
    name: 'Casual Shirt',
    description: 'Relaxed fit casual shirt perfect for weekend wear.',
    price: 749,
    originalPrice: 849,
    category: 'shirts',
    brand: 'WeekendWear',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'White', 'Gray'],
    stock: 30,
    sku: 'SH-BLU-001',
    rating: 4.2,
    numReviews: 9,
    isActive: true,
    isFeatured: false,
    discount: 12,
    tags: ['casual', 'weekend', 'comfortable']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kartik-traders');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 