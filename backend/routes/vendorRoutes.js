// backend/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// Middleware to check if user is vendor or admin
const requireVendor = (req, res, next) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Vendor access required' });
  }
  next();
};

// Get vendor's services
router.get('/services', auth, requireVendor, async (req, res) => {
  try {
    const services = await Service.find({ vendorId: req.user.id });
    res.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching vendor services:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create vendor service
router.post('/services', auth, requireVendor, async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      vendorId: req.user.id,
      createdBy: req.user.id
    });
    await service.save();
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error('Error creating vendor service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update vendor service
router.put('/services/:id', auth, requireVendor, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, vendorId: req.user.id });
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    Object.assign(service, req.body);
    await service.save();
    res.json({ success: true, service });
  } catch (error) {
    console.error('Error updating vendor service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete vendor service
router.delete('/services/:id', auth, requireVendor, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, vendorId: req.user.id });
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vendor's bookings
router.get('/bookings', auth, requireVendor, async (req, res) => {
  try {
    const bookings = await Booking.find({ vendorId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking status (vendor)
router.put('/bookings/:id/status', auth, requireVendor, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, vendorId: req.user.id });
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    booking.status = status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;