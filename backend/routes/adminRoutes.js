// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const emailService = require('../utils/emailService');

// ==================== DASHBOARD STATS ====================
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching admin stats...');
    
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalEvents = await Event.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get monthly revenue for chart
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const stats = {
      totalUsers,
      totalBookings,
      totalEvents,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      recentBookings: recentBookings.map(b => ({
        id: b._id,
        customerName: b.customerName,
        serviceName: b.serviceName,
        status: b.status,
        totalAmount: b.totalAmount,
        createdAt: b.createdAt
      })),
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
        count: item.count
      }))
    };

    console.log('✅ Stats fetched successfully');
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    console.log('👥 Fetching all users...');
    const users = await User.find()
      .select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires -emailVerificationOTP -emailVerificationExpires')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
router.get('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires -emailVerificationOTP -emailVerificationExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user role
router.put('/users/:userId/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    console.log(`🔄 Updating user ${req.params.userId} role to ${role}`);
    
    if (!['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role, isAdmin: role === 'admin' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log('✅ User role updated:', user.email, '->', user.role);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', auth, requireAdmin, async (req, res) => {
  try {
    console.log(`🗑️ Deleting user ${req.params.userId}`);
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    console.log('✅ User deleted:', user.email);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// Get all bookings with pagination and filters
router.get('/bookings', auth, requireAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10, startDate, endDate } = req.query;
    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
        { providerName: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate) query.eventDate = { $gte: new Date(startDate) };
    if (endDate) query.eventDate = { ...query.eventDate, $lte: new Date(endDate) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get booking by ID
router.get('/bookings/:id', auth, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking status
router.put('/bookings/:id/status', auth, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    console.log(`🔄 Updating booking ${req.params.id} status to ${status}`);
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminNotes: adminNotes || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Send email notifications
    try {
      if (status === 'confirmed') {
        await emailService.sendBookingConfirmationEmail(booking);
      } else if (status === 'cancelled') {
        await emailService.sendRejectionEmail(booking, adminNotes);
      }
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError.message);
    }

    console.log('✅ Booking status updated:', booking._id, '->', status);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Accept booking
router.post('/bookings/:id/accept', auth, requireAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    console.log(`✅ Accepting booking ${req.params.id}`);
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'confirmed',
        adminNotes: adminNotes || 'Booking accepted by admin',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    try {
      await emailService.sendBookingConfirmationEmail(booking);
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError.message);
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error accepting booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject booking
router.post('/bookings/:id/reject', auth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    console.log(`❌ Rejecting booking ${req.params.id}`);
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        adminNotes: reason || 'Booking rejected by admin',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    try {
      await emailService.sendRejectionEmail(booking, reason);
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError.message);
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error rejecting booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send invoice email
router.post('/bookings/:id/send-invoice', auth, requireAdmin, async (req, res) => {
  try {
    console.log(`📧 Sending invoice for booking ${req.params.id}`);
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    await emailService.sendInvoiceEmail(booking);
    console.log('✅ Invoice sent successfully');
    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('❌ Error sending invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download invoice PDF
router.get('/bookings/:id/invoice', auth, requireAdmin, async (req, res) => {
  try {
    console.log(`📄 Generating invoice for booking ${req.params.id}`);
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-IN').format(price || 0);
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${booking._id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
            background: #f8f9fa;
          }
          .invoice-container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #667eea; 
            margin: 0; 
            font-size: 32px;
            font-weight: 700;
          }
          .header p { 
            color: #6c757d; 
            margin: 5px 0 0; 
            font-size: 14px;
          }
          .booking-details { 
            background: #f8f9fa; 
            padding: 20px 24px; 
            border-radius: 12px; 
            margin: 20px 0; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e9ecef;
            font-size: 14px;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-row strong { color: #1a1a2e; }
          .detail-row span { color: #495057; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th, td { 
            border: 1px solid #e9ecef; 
            padding: 12px 16px; 
            text-align: left; 
          }
          th { 
            background: #f8f9fa; 
            font-weight: 600;
            color: #1a1a2e;
          }
          .total { 
            font-size: 22px; 
            font-weight: 700; 
            text-align: right; 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 2px solid #667eea;
            color: #1a1a2e;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #adb5bd; 
            font-size: 12px; 
            border-top: 1px solid #e9ecef; 
            padding-top: 20px; 
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-confirmed { background: #d4edda; color: #155724; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .status-completed { background: #cce5ff; color: #004085; }
          .company-name { color: #667eea; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>🎉 EventHub</h1>
            <p>Invoice #${booking._id.toString().slice(-8)}</p>
            <p>Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          
          <div class="booking-details">
            <div class="detail-row"><strong>Customer:</strong><span>${booking.customerName}</span></div>
            <div class="detail-row"><strong>Email:</strong><span>${booking.customerEmail}</span></div>
            <div class="detail-row"><strong>Phone:</strong><span>${booking.customerPhone || 'N/A'}</span></div>
            <div class="detail-row"><strong>Service:</strong><span>${booking.serviceName}</span></div>
            <div class="detail-row"><strong>Provider:</strong><span>${booking.providerName || 'N/A'}</span></div>
            <div class="detail-row"><strong>Event Date:</strong><span>${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div class="detail-row"><strong>Guests:</strong><span>${booking.guestCount || 0}</span></div>
            <div class="detail-row"><strong>Status:</strong><span><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></span></div>
          </div>

          <table>
            <thead>
              <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.serviceName}${booking.eventType ? ` (${booking.eventType})` : ''}</td>
                <td style="text-align:right">₹${formatPrice(booking.totalAmount)}</td>
              </tr>
              ${booking.advanceAmount ? `
                <tr>
                  <td>Advance Payment</td>
                  <td style="text-align:right">₹${formatPrice(booking.advanceAmount)}</td>
                </tr>
              ` : ''}
              ${booking.balanceAmount ? `
                <tr>
                  <td>Balance Due</td>
                  <td style="text-align:right">₹${formatPrice(booking.balanceAmount)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="total">
            Total: ₹${formatPrice(booking.totalAmount)}
          </div>

          <div class="footer">
            <p>Thank you for choosing <span class="company-name">EventHub</span>!</p>
            <p>© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
            <p style="margin-top:8px; font-size:11px;">This is a system-generated invoice. For any queries, please contact us at support@eventhub.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== EMAIL TEMPLATE MANAGEMENT ====================

// Get all email templates
router.get('/email-templates', auth, requireAdmin, async (req, res) => {
  try {
    const templates = [
      { name: 'booking_confirmation', subject: 'Booking Confirmation', isActive: true },
      { name: 'invoice', subject: 'Your Invoice', isActive: true },
      { name: 'password_reset', subject: 'Password Reset', isActive: true },
      { name: 'welcome', subject: 'Welcome to EventHub', isActive: true },
      { name: 'booking_rejection', subject: 'Booking Update', isActive: true }
    ];
    res.json({ success: true, templates });
  } catch (error) {
    console.error('❌ Error fetching email templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update email template
router.put('/email-templates/:templateName', auth, requireAdmin, async (req, res) => {
  try {
    const { templateName } = req.params;
    const { subject, content, isActive } = req.body;
    
    console.log(`📝 Updating template ${templateName}:`, { subject, isActive });
    
    // In production, save to database
    res.json({ success: true, message: 'Template updated successfully' });
  } catch (error) {
    console.error('❌ Error updating email template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email template
router.post('/email-templates/test', auth, requireAdmin, async (req, res) => {
  try {
    const { templateName, testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ success: false, error: 'Test email required' });
    }
    
    if (templateName === 'booking_confirmation') {
      await emailService.sendBookingConfirmationEmail({
        customerEmail: testEmail,
        customerName: 'Test User',
        serviceName: 'Test Service',
        eventDate: new Date(),
        totalAmount: 1000,
        _id: 'TEST123'
      });
    } else if (templateName === 'invoice') {
      await emailService.sendInvoiceEmail({
        customerEmail: testEmail,
        customerName: 'Test User',
        serviceName: 'Test Service',
        eventDate: new Date(),
        totalAmount: 1000,
        _id: 'TEST123'
      });
    } else {
      await emailService.sendOTPEmail(testEmail, '123456', 'Test User');
    }
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('❌ Error testing email template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BULK EMAIL MANAGEMENT ====================

// Send bulk email
router.post('/emails/bulk', auth, requireAdmin, async (req, res) => {
  try {
    const { subject, content, userFilter } = req.body;
    
    let users = [];
    if (userFilter === 'all') {
      users = await User.find().select('email name');
    } else if (userFilter === 'users') {
      users = await User.find({ role: 'user' }).select('email name');
    } else if (userFilter === 'vendors') {
      users = await User.find({ role: 'vendor' }).select('email name');
    } else if (userFilter === 'admins') {
      users = await User.find({ role: 'admin' }).select('email name');
    }
    
    console.log(`📧 Sending bulk email to ${users.length} users`);
    
    // In production, use a queue system
    res.json({ 
      success: true, 
      message: `Bulk email initiated for ${users.length} recipients`,
      recipientCount: users.length
    });
  } catch (error) {
    console.error('❌ Error sending bulk email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get email logs
router.get('/emails/logs', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Return mock data for now
    res.json({
      success: true,
      logs: [],
      pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 0 }
    });
  } catch (error) {
    console.error('❌ Error fetching email logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;