const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kartik-traders')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get all products
      const products = await Product.find({});
      console.log(`Found ${products.length} products to check`);
      
      let updatedCount = 0;
      
      for (const product of products) {
        let needsUpdate = false;
        const newImages = [];
        
        // Check each image in the product
        for (const image of product.images) {
          // If it's a local file path or invalid URL, replace with a placeholder
          if (image.includes('C:\\') || image.includes('file://') || 
              image.includes('google.com') || image.includes('search?') ||
              !image.startsWith('http://localhost:5000/uploads/')) {
            
            // Use a placeholder image for now
            newImages.push('http://localhost:5000/uploads/placeholder.jpg');
            needsUpdate = true;
            console.log(`Product "${product.name}" has invalid image: ${image}`);
          } else {
            // Keep valid images
            newImages.push(image);
          }
        }
        
        // Update the product if needed
        if (needsUpdate) {
          await Product.findByIdAndUpdate(product._id, { images: newImages });
          updatedCount++;
          console.log(`Updated product: ${product.name}`);
        }
      }
      
      console.log(`\n✅ Fixed ${updatedCount} products with invalid image URLs`);
      console.log('📝 Note: Invalid images were replaced with placeholder URLs');
      console.log('💡 To add proper images, edit each product and upload new images');
      
    } catch (error) {
      console.error('Error fixing product images:', error);
    } finally {
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 