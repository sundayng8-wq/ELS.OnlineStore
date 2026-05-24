const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ public: true }).sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE product (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { name, price, category, description, images, primary_image, image_data } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = new Product({
      name,
      price,
      category: category || 'Other',
      description: description || '',
      seller: req.user.email,
      images: images || [],
      primary_image: primary_image || '',
      image_data: image_data || ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product (protected — only seller)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller !== req.user.email) {
      return res.status(403).json({ error: 'You can only edit your own products' });
    }

    const updates = req.body;
    delete updates._id;
    delete updates.seller;
    delete updates.created_at;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (protected — only seller)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller !== req.user.email) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET my products (protected)
router.get('/seller/mine', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.email }).sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({ error: 'Failed to fetch your products' });
  }
});

module.exports = router;
