const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const fixImagePaths = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kartik-traders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all products with local image paths
    const products = await Product.find({
      images: { $regex: /^\/uploads\// }
    });

    console.log(`Found ${products.length} products with local image paths`);

    for (const product of products) {
      const updatedImages = product.images.map(imagePath => {
        if (imagePath.startsWith('/uploads/')) {
          return `http://localhost:5000${imagePath}`;
        }
        return imagePath;
      });

      await Product.findByIdAndUpdate(product._id, {
        images: updatedImages
      });

      console.log(`Updated product: ${product.name}`);
    }

    console.log('Image paths fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing image paths:', error);
    process.exit(1);
  }
};

fixImagePaths(); 