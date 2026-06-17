// backend/controllers/bookingController.js
const Booking = require("../models/Booking");
const User = require("../models/User");
const { 
  sendBookingConfirmationEmail, 
  sendInvoiceEmail, 
  sendRejectionEmail,
  sendRefundEmail
} = require("../utils/emailService");

// Create new booking for service
exports.createBooking = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const {
      serviceId,
      serviceName,
      serviceType,
      providerName,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      eventType,
      guestCount,
      specialRequests,
      basePrice,
      pricePerPerson,
      totalAmount
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide a valid email address' 
      });
    }

    // Validate event date
    const bookingDate = new Date(eventDate);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid event date format' 
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ 
        success: false,
        error: 'Event date cannot be in the past' 
      });
    }

    // Calculate total price
    const finalBasePrice = parseFloat(basePrice) || 0;
    const finalPricePerPerson = parseFloat(pricePerPerson) || 0;
    const finalGuestCount = parseInt(guestCount);
    const finalTotalAmount = parseFloat(totalAmount) || (finalBasePrice + (finalPricePerPerson * finalGuestCount));
    const advanceAmount = finalTotalAmount * 0.3;
    const balanceAmount = finalTotalAmount - advanceAmount;

    // Create booking - handle case when user is not authenticated
    const bookingData = {
      service: serviceId || 'manual-booking',
      serviceName: serviceName || 'Event Service',
      serviceType: serviceType || 'general',
      providerName: providerName || 'Service Provider',
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: customerPhone.toString().trim(),
      eventDate: bookingDate,
      eventType: eventType || 'birthday',
      guestCount: finalGuestCount,
      specialRequests: specialRequests || '',
      basePrice: finalBasePrice,
      pricePerPerson: finalPricePerPerson,
      totalAmount: finalTotalAmount,
      advanceAmount,
      balanceAmount,
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: new Date()
    };

    // Only add user field if authenticated
    if (req.user && req.user.id) {
      bookingData.user = req.user.id;
      console.log('Booking associated with user:', req.user.id);
    } else {
      console.log('Booking created without user authentication');
    }

    const booking = new Booking(bookingData);
    await booking.save();
    console.log('✅ Booking saved successfully:', booking._id);
    console.log('📌 Booking status:', booking.status);

    // Send booking confirmation email
    try {
      const emailSent = await sendBookingConfirmationEmail(booking);
      if (emailSent) {
        console.log('📧 Booking confirmation email sent to:', booking.customerEmail);
      } else {
        console.log('⚠️ Booking confirmation email failed to send');
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Awaiting admin approval.',
      booking: {
        _id: booking._id,
        serviceName: booking.serviceName,
        eventDate: booking.eventDate,
        guestCount: booking.guestCount,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        status: booking.status
      },
      paymentRequired: {
        advanceAmount,
        balanceAmount,
        totalAmount: finalTotalAmount
      }
    });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Duplicate booking detected'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error while creating booking'
    });
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user?.id);
    
    if (req.user && req.user.id) {
      const bookings = await Booking.find({ user: req.user.id })
        .sort({ createdAt: -1 });
      console.log(`Found ${bookings.length} bookings for user ${req.user.id}`);
      return res.json({
        success: true,
        bookings,
        count: bookings.length
      });
    }
    
    const email = req.query.email;
    if (email) {
      const bookings = await Booking.find({ customerEmail: email })
        .sort({ createdAt: -1 });
      console.log(`Found ${bookings.length} bookings for email ${email}`);
      return res.json({
        success: true,
        bookings,
        count: bookings.length
      });
    }
    
    return res.json({
      success: true,
      bookings: [],
      count: 0
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching bookings' 
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    const isOwner = booking.user && req.user && booking.user.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    const emailMatches = booking.customerEmail === req.user?.email;
    
    if (!isOwner && !isAdmin && !emailMatches) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching booking' 
    });
  }
};

// Cancel booking (User)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    const isOwner = booking.user && req.user && booking.user.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';
    const emailMatches = booking.customerEmail === req.user?.email;
    
    if (!isOwner && !isAdmin && !emailMatches) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a completed booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    const wasPaymentMade = booking.paymentId || 
                          booking.paymentStatus === 'completed' || 
                          booking.paymentStatus === 'partial' ||
                          (booking.advanceAmount && booking.advanceAmount > 0);

    console.log(`📧 User cancelling booking ${booking._id}`);
    console.log(`   Payment Made: ${wasPaymentMade}`);

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    if (wasPaymentMade) {
      try {
        const refundAmount = booking.advanceAmount || (booking.totalAmount * 0.3);
        await sendRefundEmail(booking, 'Booking cancelled by user', refundAmount);
        console.log('📧 Refund notification email sent to:', booking.customerEmail);
      } catch (emailError) {
        console.error('Error sending refund email:', emailError.message);
      }
    } else {
      try {
        await sendRejectionEmail(booking, 'Booking cancelled by user');
        console.log('📧 Cancellation email sent to:', booking.customerEmail);
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: wasPaymentMade ? 'Booking cancelled successfully. Refund will be processed within 2-3 working days.' : 'Booking cancelled successfully',
      booking,
      refundInitiated: wasPaymentMade
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error cancelling booking' 
    });
  }
};

// ✅ FIXED: Update payment status - Better email matching
exports.updatePaymentStatus = async (req, res) => {
  try {
    console.log('=== UPDATE PAYMENT STATUS ===');
    console.log('HTTP Method:', req.method);
    console.log('Booking ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { paymentStatus, paymentId, amount } = req.body;
    const bookingId = req.params.id;
    
    if (!bookingId) {
      return res.status(400).json({ 
        success: false,
        error: 'Booking ID is required' 
      });
    }
    
    if (!paymentStatus) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment status is required' 
      });
    }
    
    const validStatuses = ['pending', 'partial', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        success: false,
        error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.log('❌ Booking not found:', bookingId);
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    console.log('Found booking:', {
      id: booking._id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      currentStatus: booking.status,
      currentPaymentStatus: booking.paymentStatus,
      user: booking.user
    });

    // ✅ FIXED: Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.log('❌ No authenticated user');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // ✅ FIXED: Get user email from token or database
    let userEmail = req.user.email;
    if (!userEmail) {
      // Try to get email from database
      const user = await User.findById(req.user.id);
      if (user) {
        userEmail = user.email;
        console.log('📧 Retrieved user email from DB:', userEmail);
      }
    }

    console.log('📧 User email from token:', req.user.email);
    console.log('📧 User email from DB:', userEmail);
    console.log('📧 Booking customer email:', booking.customerEmail);

    // ✅ FIXED: Check authorization
    const isOwner = booking.user && booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const emailMatches = booking.customerEmail && userEmail && booking.customerEmail.toLowerCase() === userEmail.toLowerCase();
    const noUserAssigned = !booking.user;

    console.log('Authorization checks:', {
      isOwner,
      isAdmin,
      emailMatches,
      noUserAssigned,
      bookingUser: booking.user,
      currentUser: req.user.id,
      bookingEmail: booking.customerEmail,
      userEmail: userEmail
    });

    // ✅ Allow if: owner, admin, or email matches (even if no user assigned)
    if (!isOwner && !isAdmin && !emailMatches) {
      console.log('❌ Unauthorized access attempt');
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized to update this booking.' 
      });
    }

    // ✅ If no user assigned but email matches, assign the user
    if (noUserAssigned && emailMatches) {
      booking.user = req.user.id;
      console.log('✅ User assigned to booking:', req.user.id);
    }
    
    const oldPaymentStatus = booking.paymentStatus;
    
    // Update ONLY payment fields - NOT booking status
    booking.paymentStatus = paymentStatus;
    
    if (paymentId) {
      booking.paymentId = paymentId;
      console.log('📝 Payment ID saved:', paymentId);
    } else if (paymentStatus === 'completed' && !booking.paymentId) {
      booking.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      console.log('📝 Auto-generated Payment ID:', booking.paymentId);
    }
    
    if (amount && amount > 0) {
      booking.advanceAmount = amount;
      booking.balanceAmount = booking.totalAmount - amount;
      console.log('💰 Amount updated:', { advanceAmount: amount, balanceAmount: booking.balanceAmount });
    }
    
    console.log(`💰 Payment status updated from ${oldPaymentStatus} to: ${paymentStatus}`);
    console.log(`📌 Booking status remains: ${booking.status} (pending admin approval)`);

    await booking.save();
    console.log('✅ Booking updated successfully');

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}. Booking is pending admin approval.`,
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        advanceAmount: booking.advanceAmount,
        balanceAmount: booking.balanceAmount,
        totalAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error('❌ Update payment error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error updating payment status' 
    });
  }
};

// Admin: Update booking status (confirm/reject)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        error: 'Booking not found' 
      });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    booking.adminNotes = adminNotes || '';
    await booking.save();

    console.log(`Booking ${booking._id} status changed from ${oldStatus} to ${status}`);

    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      try {
        await sendInvoiceEmail(booking);
        console.log('📧 Confirmation invoice email sent to:', booking.customerEmail);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError.message);
      }
    } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const wasPaymentMade = booking.paymentId || 
                            booking.paymentStatus === 'completed' || 
                            booking.paymentStatus === 'partial' ||
                            (booking.advanceAmount && booking.advanceAmount > 0);
      
      if (wasPaymentMade) {
        try {
          const refundAmount = booking.advanceAmount || (booking.totalAmount * 0.3);
          await sendRefundEmail(booking, adminNotes || 'Booking cancelled by admin', refundAmount);
          console.log('📧 Refund notification email sent to:', booking.customerEmail);
        } catch (emailError) {
          console.error('Error sending refund email:', emailError.message);
        }
      } else {
        try {
          await sendRejectionEmail(booking, adminNotes || 'Booking cancelled by admin');
          console.log('📧 Rejection email sent to:', booking.customerEmail);
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError.message);
        }
      }
    }

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

// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Booking.countDocuments(query);
    
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      serviceName: booking.serviceName,
      serviceType: booking.serviceType,
      providerName: booking.providerName,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      eventDate: booking.eventDate,
      eventType: booking.eventType,
      guestCount: booking.guestCount,
      totalAmount: booking.totalAmount,
      advanceAmount: booking.advanceAmount,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      createdAt: booking.createdAt,
      specialRequests: booking.specialRequests,
      user: booking.user
    }));
    
    res.json({
      success: true,
      bookings: formattedBookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching bookings' 
    });
  }
};

// Get booking statistics (Admin only)
exports.getBookingStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    const revenueAggregation = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueAggregation[0]?.total || 0;
    const totalUsers = await User.countDocuments();
    const totalServices = await Booking.distinct('serviceName').then(services => services.length);
    
    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        totalUsers,
        totalEvents: totalServices
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