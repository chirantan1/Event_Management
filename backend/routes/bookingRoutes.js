// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

console.log('🔧 Loading booking routes...');

// ==================== USER ROUTES ====================

// Create booking
router.post('/', auth, bookingController.createBooking);
router.post('/create', auth, bookingController.createBooking);

// Get user's bookings
router.get('/my-bookings', auth, bookingController.getMyBookings);

// Get booking by ID
router.get('/:id', auth, bookingController.getBookingById);

// Cancel booking
router.put('/:id/cancel', auth, bookingController.cancelBooking);

// Update payment status - SUPPORT ALL METHODS
router.put('/:id/payment', auth, bookingController.updatePaymentStatus);    // ← PUT for frontend
router.patch('/:id/payment', auth, bookingController.updatePaymentStatus);  // PATCH for RESTful
router.post('/:id/payment', auth, bookingController.updatePaymentStatus);   // POST for compatibility

// ==================== ADMIN ROUTES ====================

// Get all bookings (admin only)
router.get('/admin/all', auth, bookingController.getAllBookings);

// Get booking statistics (admin only)
router.get('/admin/stats', auth, bookingController.getBookingStats);

// Update booking status (admin only)
router.put('/admin/:id/status', auth, bookingController.updateBookingStatus);

console.log('✅ Booking routes loaded successfully');
console.log('   POST   /api/bookings/');
console.log('   POST   /api/bookings/create');
console.log('   GET    /api/bookings/my-bookings');
console.log('   GET    /api/bookings/:id');
console.log('   PUT    /api/bookings/:id/cancel');
console.log('   PUT    /api/bookings/:id/payment  ← Payment route added');
console.log('   PATCH  /api/bookings/:id/payment');
console.log('   POST   /api/bookings/:id/payment');
console.log('   GET    /api/bookings/admin/all');
console.log('   GET    /api/bookings/admin/stats');
console.log('   PUT    /api/bookings/admin/:id/status');

module.exports = router;