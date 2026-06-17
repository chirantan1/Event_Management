// backend/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Service = require('../models/Service');

// ==================== PUBLIC ROUTES ====================

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Create service (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { name, description, price, category, image, duration, features } = req.body;
    
    const service = new Service({
      name,
      description,
      price,
      category,
      image,
      duration,
      features,
      createdBy: req.user.id
    });
    
    await service.save();
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update service (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({ success: true, service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete service (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;