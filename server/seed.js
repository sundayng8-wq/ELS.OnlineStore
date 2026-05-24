require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Store = require('./models/Store');
const Product = require('./models/Product');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional — comment out to keep)
    console.log('Clearing old seed data...');
    await User.deleteMany({ email: { $in: ['seller1@test.com', 'seller2@test.com', 'seller3@test.com', 'buyer@test.com'] } });
    await Store.deleteMany({ store_name: { $in: ['Tech Hub', 'Fashion Spot', 'Home Essentials'] } });
    await Product.deleteMany({ name: { $in: ['Wireless Earbuds', 'Phone Stand', 'USB-C Cable', 'Denim Jacket', 'Running Shoes', 'Leather Bag', 'Table Lamp', 'Wall Clock', 'Throw Pillow'] } });

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create 3 sellers
    const seller1 = await User.create({ name: 'Alice Muthoni', email: 'seller1@test.com', password });
    const seller2 = await User.create({ name: 'Brian Ochieng', email: 'seller2@test.com', password });
    const seller3 = await User.create({ name: 'Carol Wanjiku', email: 'seller3@test.com', password });

    // Create buyer
    const buyer = await User.create({ name: 'David Buyer', email: 'buyer@test.com', password });

    console.log('Users created');

    // Create stores
    const store1 = await Store.create({
      owner_id: seller1._id, store_name: 'Tech Hub',
      description: 'Latest gadgets and accessories. Fast delivery Nairobi-wide.',
      bank_account_name: 'Alice Muthoni', bank_account_number: '1111222233', bank_name: 'KCB',
      logo_url: '', banner_url: '', status: 'active'
    });

    const store2 = await Store.create({
      owner_id: seller2._id, store_name: 'Fashion Spot',
      description: 'Trendy fashion for every occasion. Quality guaranteed.',
      bank_account_name: 'Brian Ochieng', bank_account_number: '4444555566', bank_name: 'Equity',
      logo_url: '', banner_url: '', status: 'active'
    });

    const store3 = await Store.create({
      owner_id: seller3._id, store_name: 'Home Essentials',
      description: 'Beautiful home decor and essentials. Make your house a home.',
      bank_account_name: 'Carol Wanjiku', bank_account_number: '7777888899', bank_name: 'Co-operative',
      logo_url: '', banner_url: '', status: 'active'
    });

    console.log('Stores created');

    // Create products for each store
    const products = [
      // Tech Hub
      { name: 'Wireless Earbuds', price: 2500, category: 'Electronics', description: 'Premium sound quality with noise cancellation. 24hr battery life.', seller: 'seller1@test.com', store_id: store1._id },
      { name: 'Phone Stand', price: 800, category: 'Electronics', description: 'Adjustable aluminum stand for desk or bedside.', seller: 'seller1@test.com', store_id: store1._id },
      { name: 'USB-C Cable', price: 500, category: 'Electronics', description: 'Fast charging braided cable. 2 meters long.', seller: 'seller1@test.com', store_id: store1._id },

      // Fashion Spot
      { name: 'Denim Jacket', price: 3500, category: 'Fashion', description: 'Classic blue denim jacket. Available in all sizes.', seller: 'seller2@test.com', store_id: store2._id },
      { name: 'Running Shoes', price: 4500, category: 'Fashion', description: 'Lightweight running shoes with cushioned sole.', seller: 'seller2@test.com', store_id: store2._id },
      { name: 'Leather Bag', price: 2800, category: 'Fashion', description: 'Genuine leather crossbody bag. Multiple compartments.', seller: 'seller2@test.com', store_id: store2._id },

      // Home Essentials
      { name: 'Table Lamp', price: 1500, category: 'Home', description: 'Modern LED table lamp with warm light. Touch control.', seller: 'seller3@test.com', store_id: store3._id },
      { name: 'Wall Clock', price: 1200, category: 'Home', description: 'Minimalist silent wall clock. 30cm diameter.', seller: 'seller3@test.com', store_id: store3._id },
      { name: 'Throw Pillow', price: 900, category: 'Home', description: 'Soft cotton throw pillow. Multiple colors available.', seller: 'seller3@test.com', store_id: store3._id },
    ];

    await Product.insertMany(products);
    console.log('Products created');

    console.log('\n✅ SEED COMPLETE!');
    console.log('\n--- TEST ACCOUNTS ---');
    console.log('Seller 1: seller1@test.com / password123  (Tech Hub)');
    console.log('Seller 2: seller2@test.com / password123  (Fashion Spot)');
    console.log('Seller 3: seller3@test.com / password123  (Home Essentials)');
    console.log('Buyer:    buyer@test.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
