const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Get buyer's orders
router.get('/buyer', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer_id: req.user.userId })
      .sort({ created_at: -1 })
      .populate('store_id', 'store_name')
      .select('-commission_amount -seller_payout -payment_reference');

    res.json({ success: true, orders, count: orders.length });
  } catch (err) {
    console.error('Get buyer orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Get seller's orders
router.get('/seller', auth, async (req, res) => {
  try {
    const orders = await Order.find({ seller_id: req.user.userId })
      .sort({ created_at: -1 })
      .populate('buyer_id', 'name email')
      .select('-payment_reference');

    res.json({ success: true, orders, count: orders.length });
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Get single order (only buyer or seller)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer_id', 'name email')
      .populate('store_id', 'store_name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only buyer or seller can view
    const buyerId = order.buyer_id._id ? order.buyer_id._id.toString() : order.buyer_id.toString();
    if (buyerId !== req.user.userId && order.seller_id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Buyer cannot see commission details
    if (buyerId === req.user.userId) {
      order.commission_amount = undefined;
      order.seller_payout = undefined;
      order.payment_reference = undefined;
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Update order status (seller only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, tracking_number } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.seller_id.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the seller can update order status' });
    }

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be: ' + validStatuses.join(', ') });
    }

    order.order_status = status;
    if (tracking_number) order.tracking_number = tracking_number;
    await order.save();

    res.json({ success: true, message: 'Order status updated to ' + status, order });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

module.exports = router;
