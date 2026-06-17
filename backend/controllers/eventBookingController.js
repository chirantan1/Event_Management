// backend/controllers/eventBookingController.js
const EventBooking = require('../models/EventBooking');

// Create new event booking
exports.createEventBooking = async (req, res) => {
  try {
    console.log('=== CREATE EVENT BOOKING ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const {
      eventId,
      eventName,
      eventCategory,
      eventDate,
      customerName,
      customerEmail,
      customerPhone,
      guestCount,
      specialRequests,
      totalAmount,
      location,
      pricePerPerson
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide name, email and phone' 
      });
    }

    if (!eventDate) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide event date' 
      });
    }

    if (!guestCount || guestCount < 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide valid guest count' 
      });
    }

    if (!eventId) {
      return res.status(400).json({ 
        success: false,
        error: 'Event ID is required' 
      });
    }

    // Validate event date is not in the past
    const bookingDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ 
        success: false,
        error: 'Event date cannot be in the past' 
      });
    }

    const advanceAmount = totalAmount * 0.3;
    const balanceAmount = totalAmount - advanceAmount;

    const booking = new EventBooking({
      user: req.user.id,
      eventId: eventId,
      eventName: eventName,
      eventCategory: eventCategory || 'general',
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      eventDate: bookingDate,
      guestCount: parseInt(guestCount),
      specialRequests: specialRequests || '',
      pricePerPerson: pricePerPerson || 0,
      totalAmount: totalAmount,
      advanceAmount,
      balanceAmount,
      location: location || '',
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: new Date()
    });

    await booking.save();

    console.log('Event booking saved successfully:', booking._id);

    res.status(201).json({
      success: true,
      message: 'Event booking created successfully',
      booking: {
        _id: booking._id,
        eventName: booking.eventName,
        eventDate: booking.eventDate,
        guestCount: booking.guestCount,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        status: booking.status
      },
      paymentRequired: {
        advanceAmount,
        balanceAmount,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Create event booking error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error while creating event booking'
    });
  }
};

// Get user's event bookings
exports.getMyEventBookings = async (req, res) => {
  try {
    console.log('Fetching event bookings for user:', req.user?.id);
    
    const bookings = await EventBooking.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} event bookings`);

    res.json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching event bookings' 
    });
  }
};

// Get event booking by ID
exports.getEventBookingById = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Event booking not found' 
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to view this booking' 
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get event booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching event booking' 
    });
  }
};

// Cancel event booking
exports.cancelEventBooking = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Event booking not found' 
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to cancel this booking' 
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        error: 'Booking is already cancelled' 
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Event booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel event booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error cancelling event booking' 
    });
  }
};

// Update payment status
exports.updateEventPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const booking = await EventBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Event booking not found' 
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to update payment' 
      });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentId) {
      booking.paymentId = paymentId;
    }
    
    if (paymentStatus === 'completed') {
      booking.status = 'confirmed';
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error updating payment status' 
    });
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Get all event bookings (Admin only)
exports.getAllEventBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const { status, page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await EventBooking.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await EventBooking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all event bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching event bookings' 
    });
  }
};

// Update booking status (Admin only)
exports.updateEventBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const { status } = req.body;
    const booking = await EventBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Event booking not found' 
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error updating booking status' 
    });
  }
};

// Get booking statistics (Admin only)
exports.getEventBookingStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const totalBookings = await EventBooking.countDocuments();
    const pendingBookings = await EventBooking.countDocuments({ status: 'pending' });
    const confirmedBookings = await EventBooking.countDocuments({ status: 'confirmed' });
    const completedBookings = await EventBooking.countDocuments({ status: 'completed' });
    const cancelledBookings = await EventBooking.countDocuments({ status: 'cancelled' });
    
    const totalRevenue = await EventBooking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching statistics' 
    });
  }
};