const express = require('express');
const router = express.Router();

const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ created_at: -1 });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to create product'
    });
  }
});

router.delete('/:id', async (req, res) => {

  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Failed to delete product'
    });

  }

});

router.put('/:id', async (req, res) => {

  try {

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Failed to update product'
    });

  }

});
module.exports = router;