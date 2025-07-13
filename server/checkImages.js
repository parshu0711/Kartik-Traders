const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kartik-traders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log('Images:', product.images);
      console.log('First image URL:', product.images[0]);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking images:', error);
    process.exit(1);
  }
};

checkImages(); 