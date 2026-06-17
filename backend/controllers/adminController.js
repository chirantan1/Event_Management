// backend/controllers/adminController.js
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Event = require('../models/Event');
const { sendInvoiceEmail, sendRejectionEmail, sendRefundEmail, sendBookingConfirmationEmail } = require('../utils/emailService');

// ==================== DASHBOARD STATS ====================
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    const formattedRecentBookings = recentBookings.map(booking => ({
      _id: booking._id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      serviceName: booking.serviceName,
      eventDate: booking.eventDate,
      guestCount: booking.guestCount,
      totalAmount: booking.totalAmount,
      status: booking.status,
      createdAt: booking.createdAt,
      providerName: booking.providerName,
      eventType: booking.eventType
    }));
    
    // Calculate monthly revenue for chart
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    const stats = {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      totalUsers,
      totalEvents: totalServices + totalEvents,
      totalServices,
      recentBookings: formattedRecentBookings,
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
        count: item.count
      }))
    };
    
    console.log('✅ Stats fetched successfully');
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== GET ALL BOOKINGS ====================
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search, startDate, endDate } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { providerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate) query.eventDate = { $gte: new Date(startDate) };
    if (endDate) query.eventDate = { ...query.eventDate, $lte: new Date(endDate) };
    
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    
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
      advanceAmount: booking.advanceAmount || Math.floor(booking.totalAmount * 0.3),
      balanceAmount: booking.balanceAmount || Math.floor(booking.totalAmount * 0.7),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      createdAt: booking.createdAt,
      specialRequests: booking.specialRequests
    }));
    
    res.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== GET SINGLE BOOKING ====================
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    res.json({ 
      success: true, 
      booking: {
        _id: booking._id,
        user: booking.user,
        service: booking.service,
        serviceName: booking.serviceName,
        serviceType: booking.serviceType,
        providerName: booking.providerName,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        eventDate: booking.eventDate,
        eventType: booking.eventType,
        guestCount: booking.guestCount,
        specialRequests: booking.specialRequests,
        basePrice: booking.basePrice,
        pricePerPerson: booking.pricePerPerson,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount || Math.floor(booking.totalAmount * 0.3),
        balanceAmount: booking.balanceAmount || Math.floor(booking.totalAmount * 0.7),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        bookingDate: booking.bookingDate,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        adminNotes: booking.adminNotes
      }
    });
  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== UPDATE BOOKING STATUS ====================
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
    
    const oldStatus = booking.status;
    booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    booking.updatedAt = new Date();
    
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      booking.confirmedAt = new Date();
    }
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      booking.cancelledAt = new Date();
    }
    if (status === 'completed' && oldStatus !== 'completed') {
      booking.completedAt = new Date();
    }
    
    await booking.save();
    
    // Send email notifications
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      try {
        await sendBookingConfirmationEmail(booking);
        console.log(`✅ Booking confirmation email sent to ${booking.customerEmail}`);
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError.message);
      }
    } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const wasPaymentMade = booking.paymentId || booking.paymentStatus === 'completed' || booking.paymentStatus === 'partial';
      
      if (wasPaymentMade) {
        try {
          const refundAmount = booking.advanceAmount || (booking.totalAmount * 0.3);
          await sendRefundEmail(booking, adminNotes || 'Booking cancelled by admin', refundAmount);
          console.log(`✅ Refund notification email sent to ${booking.customerEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to send refund email:', emailError.message);
        }
      } else {
        try {
          await sendRejectionEmail(booking, adminNotes || 'Booking cancelled by admin');
          console.log(`✅ Rejection email sent to ${booking.customerEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to send rejection email:', emailError.message);
        }
      }
    }
    
    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: {
        _id: booking._id,
        status: booking.status,
        customerEmail: booking.customerEmail,
        customerName: booking.customerName
      }
    });
  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== ACCEPT BOOKING ====================
exports.acceptBooking = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    booking.updatedAt = new Date();
    if (adminNotes) booking.adminNotes = adminNotes;
    await booking.save();
    
    try {
      await sendBookingConfirmationEmail(booking);
      console.log(`✅ Booking confirmation email sent to ${booking.customerEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Booking accepted successfully. Confirmation email sent.',
      booking
    });
  } catch (error) {
    console.error('❌ Accept booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== REJECT BOOKING ====================
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    const wasPaymentMade = booking.paymentId || booking.paymentStatus === 'completed' || booking.paymentStatus === 'partial';
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.updatedAt = new Date();
    if (reason) booking.adminNotes = reason;
    await booking.save();
    
    if (wasPaymentMade) {
      try {
        await sendRefundEmail(booking, reason || 'Booking rejected by admin');
        res.json({
          success: true,
          message: 'Booking rejected successfully. Refund notification sent.',
          booking,
          refundInitiated: true
        });
      } catch (emailError) {
        res.json({
          success: true,
          message: 'Booking rejected but refund email failed to send.',
          booking,
          refundInitiated: false
        });
      }
    } else {
      try {
        await sendRejectionEmail(booking, reason || 'Booking rejected by admin');
        res.json({
          success: true,
          message: 'Booking rejected successfully.',
          booking,
          refundInitiated: false
        });
      } catch (emailError) {
        res.json({
          success: true,
          message: 'Booking rejected but email failed to send.',
          booking,
          refundInitiated: false
        });
      }
    }
  } catch (error) {
    console.error('❌ Reject booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== SEND INVOICE ====================
exports.sendInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    if (!booking.customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Booking has no customer email address'
      });
    }
    
    try {
      await sendInvoiceEmail(booking);
      res.json({
        success: true,
        message: `Invoice sent successfully to ${booking.customerEmail}`
      });
    } catch (emailError) {
      console.error('❌ Failed to send invoice email:', emailError.message);
      res.json({
        success: false,
        error: 'Failed to send invoice email.',
        manualDownload: true,
        bookingId: booking._id
      });
    }
  } catch (error) {
    console.error('❌ Send invoice error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== GENERATE INVOICE PDF ====================
exports.generateInvoicePDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-IN').format(price || 0);
    };
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${booking.serviceName}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .invoice-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .invoice-header h1 { font-size: 32px; margin-bottom: 10px; }
          .invoice-header p { opacity: 0.9; }
          .invoice-body { padding: 30px; }
          .info-section { margin-bottom: 25px; }
          .info-section h3 { color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .detail-row:last-child { border-bottom: none; }
          .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #667eea; padding-top: 15px; margin-top: 10px; }
          .status-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-confirmed { background: #d4edda; color: #155724; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .status-completed { background: #cce5ff; color: #004085; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          .footer strong { color: #667eea; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>📄 INVOICE</h1>
            <p>Event Management Platform</p>
            <p style="font-size:14px; margin-top:5px;">Invoice #INV-${booking._id.toString().slice(-8)}</p>
          </div>
          <div class="invoice-body">
            <div class="info-section">
              <h3>📋 Invoice Details</h3>
              <div class="detail-row"><span>Invoice Number:</span><strong>INV-${booking._id.toString().slice(-8)}</strong></div>
              <div class="detail-row"><span>Date:</span><strong>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
              <div class="detail-row"><span>Status:</span><strong><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></strong></div>
            </div>
            <div class="info-section">
              <h3>👤 Customer Information</h3>
              <div class="detail-row"><span>Name:</span><strong>${booking.customerName}</strong></div>
              <div class="detail-row"><span>Email:</span><strong>${booking.customerEmail}</strong></div>
              <div class="detail-row"><span>Phone:</span><strong>${booking.customerPhone || 'N/A'}</strong></div>
            </div>
            <div class="info-section">
              <h3>🎯 Booking Details</h3>
              <div class="detail-row"><span>Service:</span><strong>${booking.serviceName}</strong></div>
              <div class="detail-row"><span>Provider:</span><strong>${booking.providerName || 'N/A'}</strong></div>
              <div class="detail-row"><span>Event Date:</span><strong>${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
              <div class="detail-row"><span>Guests:</span><strong>${booking.guestCount || 0}</strong></div>
              ${booking.specialRequests ? `<div class="detail-row"><span>Special Requests:</span><strong>${booking.specialRequests}</strong></div>` : ''}
            </div>
            <div class="info-section">
              <h3>💰 Payment Summary</h3>
              <div class="detail-row"><span>Total Amount:</span><strong>₹${formatPrice(booking.totalAmount)}</strong></div>
              <div class="detail-row"><span>Advance Paid:</span><strong>₹${formatPrice(booking.advanceAmount || booking.totalAmount * 0.3)}</strong></div>
              <div class="detail-row"><span>Balance Due:</span><strong>₹${formatPrice(booking.balanceAmount || booking.totalAmount * 0.7)}</strong></div>
              <div class="detail-row total-row"><span>Payment Status:</span><strong>${booking.paymentStatus ? booking.paymentStatus.toUpperCase() : 'PENDING'}</strong></div>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing <strong>EventHub</strong>!</p>
            <p style="margin-top:8px; font-size:11px;">This is a system-generated invoice. For any queries, contact us at support@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHTML);
  } catch (error) {
    console.error('❌ Generate PDF error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires -emailVerificationOTP -emailVerificationExpires')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== GET USER BY ID ====================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires -emailVerificationOTP -emailVerificationExpires');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== UPDATE USER ROLE ====================
exports.updateUserRole = async (req, res) => {
  try {
    console.log('🔄 UPDATE USER ROLE');
    console.log('User ID:', req.params.id);
    console.log('New Role:', req.body.role);
    
    const { role } = req.body;
    const userId = req.params.id;
    
    if (!role) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role is required' 
      });
    }
    
    const validRoles = ['user', 'vendor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role. Must be user, vendor, or admin' 
      });
    }
    
    // Use findByIdAndUpdate to bypass all pre-save middleware
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        role: role,
        isAdmin: role === 'admin'
      },
      { 
        new: true,
        runValidators: false
      }
    ).select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: `User not found with ID: ${userId}` 
      });
    }
    
    console.log(`✅ User ${user.email} role updated to ${role}`);
    
    return res.status(200).json({ 
      success: true, 
      message: `User role updated to ${role} successfully`, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('❌ Update user role error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== DELETE USER ====================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Prevent deleting the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (user.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete the last admin user' 
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== CANCEL BOOKING WITH REFUND ====================
exports.cancelBookingWithRefund = async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
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
    
    const wasPaymentMade = booking.paymentId || booking.paymentStatus === 'completed' || booking.paymentStatus === 'partial';
    const advanceAmountPaid = booking.advanceAmount || (booking.totalAmount * 0.3);
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.updatedAt = new Date();
    booking.refundAmount = refundAmount || (wasPaymentMade ? advanceAmountPaid : 0);
    booking.refundStatus = wasPaymentMade ? 'processing' : 'not_applicable';
    if (reason) booking.adminNotes = reason;
    await booking.save();
    
    if (wasPaymentMade) {
      try {
        await sendRefundEmail(booking, reason || 'Booking cancelled by admin', refundAmount || advanceAmountPaid);
        res.json({
          success: true,
          message: 'Booking cancelled. Refund will be processed within 2-3 working days.',
          booking
        });
      } catch (emailError) {
        console.error('❌ Failed to send refund email:', emailError.message);
        res.json({
          success: true,
          message: 'Booking cancelled but refund email failed to send.',
          booking
        });
      }
    } else {
      res.json({
        success: true,
        message: 'Booking cancelled successfully.',
        booking
      });
    }
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ==================== TEST REFUND EMAIL ====================
exports.testRefundEmail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }
    
    const emailSent = await sendRefundEmail(booking, 'Test refund notification');
    
    res.json({
      success: emailSent,
      message: emailSent ? 'Test refund email sent successfully' : 'Failed to send test refund email',
      booking: {
        id: booking._id,
        customerEmail: booking.customerEmail,
        paymentStatus: booking.paymentStatus,
        hasPaymentId: !!booking.paymentId
      }
    });
  } catch (error) {
    console.error('❌ Test refund email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = exports;