// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter with better configuration
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env');
      return null;
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter error:', error);
      } else {
        console.log('✅ Email service configured successfully');
      }
    });
  }
  return transporter;
};

// Generate random OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn(`⚠️ Email service not configured. OTP for ${email}: ${otp}`);
      return process.env.NODE_ENV === 'development';
    }

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address:', email);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - EventHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', Arial, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', Arial, sans-serif;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">EventHub</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Password Reset Request</p>
            </div>
            
            <div style="padding: 40px 32px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 22px; font-weight: 600;">Hello ${name || 'User'},</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password. Use the verification code below:
              </p>
              
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 24px; text-align: center; margin: 24px 0; border-radius: 16px;">
                <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; min-width: 200px;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea;">${otp}</span>
                </div>
              </div>
              
              <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 24px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">⏰ This OTP is valid for <strong>10 minutes</strong></p>
                <p style="color: #92400e; margin: 8px 0 0; font-size: 14px;">🔒 For security, do not share this code with anyone</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                If you didn't request this, please ignore this email.
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return false;
  }
};

// Send Booking Confirmation Email (when booking is created)
exports.sendBookingConfirmationEmail = async (booking) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn(`⚠️ Email service not configured. Booking confirmation would be sent to: ${booking.customerEmail}`);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Booking Confirmed! - ${booking.serviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: white; }
            .content { padding: 40px 32px; }
            .booking-details { background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .status-badge { display: inline-block; background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block; margin-top: 20px; }
            .payment-box { background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
              <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Your booking request has been received</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Dear ${booking.customerName},</h2>
              <p style="color: #4b5563;">Thank you for booking with EventHub! Your booking request has been submitted successfully.</p>
              
              <div class="booking-details">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span class="status-badge">PENDING CONFIRMATION</span>
                </div>
                
                <div class="detail-row">
                  <span>Booking ID:</span>
                  <strong>#${booking._id.toString().slice(-8)}</strong>
                </div>
                <div class="detail-row">
                  <span>Service:</span>
                  <strong>${booking.serviceName}</strong>
                </div>
                <div class="detail-row">
                  <span>Provider:</span>
                  <strong>${booking.providerName || 'EventHub Partner'}</strong>
                </div>
                <div class="detail-row">
                  <span>Event Date:</span>
                  <strong>${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div class="detail-row">
                  <span>Event Type:</span>
                  <strong>${booking.eventType?.charAt(0).toUpperCase() + booking.eventType?.slice(1) || 'Birthday'}</strong>
                </div>
                <div class="detail-row">
                  <span>Number of Guests:</span>
                  <strong>${booking.guestCount} people</strong>
                </div>
              </div>
              
              <div class="payment-box">
                <h4 style="margin: 0 0 10px; color: #92400e;">💰 Payment Summary</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Total Amount:</span>
                  <strong>₹${formatPrice(booking.totalAmount)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Advance Payment (30%):</span>
                  <strong>₹${formatPrice(booking.advanceAmount || booking.totalAmount * 0.3)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Balance to be paid:</span>
                  <strong>₹${formatPrice(booking.balanceAmount || booking.totalAmount * 0.7)}</strong>
                </div>
              </div>
              
              <div style="background: #dbeafe; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px; color: #1e40af;">📋 Next Steps</h4>
                <p style="margin: 5px 0; color: #1e3a8a;">1. Complete the advance payment to confirm your booking</p>
                <p style="margin: 5px 0; color: #1e3a8a;">2. The service provider will contact you within 24 hours</p>
                <p style="margin: 5px 0; color: #1e3a8a;">3. Balance payment can be made on the event day</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/dashboard" class="button">View My Bookings →</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                For any queries, contact us at support@eventhub.com
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${booking.customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Booking confirmation email error:', error.message);
    return false;
  }
};

// Send Invoice Email for Booking Confirmation (when admin confirms)
exports.sendInvoiceEmail = async (booking) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn(`⚠️ Email service not configured. Invoice would be sent to: ${booking.customerEmail}`);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Booking Confirmed & Invoice - ${booking.serviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed & Invoice</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: white; }
            .content { padding: 40px 32px; }
            .invoice-box { background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .total-row { display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px; border-top: 2px solid #e2e8f0; font-weight: bold; font-size: 18px; }
            .status-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block; margin-top: 20px; }
            .payment-box { background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
              <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Your event is now confirmed</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Dear ${booking.customerName},</h2>
              <p style="color: #4b5563;">Great news! Your booking has been confirmed. Here's your invoice:</p>
              
              <div class="invoice-box">
                <div class="invoice-header">
                  <div>
                    <strong>INVOICE</strong><br>
                    <small>INV-${booking._id.toString().slice(-8)}</small>
                  </div>
                  <div>
                    <span class="status-badge">CONFIRMED</span>
                  </div>
                </div>
                
                <div class="detail-row">
                  <span>Service:</span>
                  <strong>${booking.serviceName}</strong>
                </div>
                <div class="detail-row">
                  <span>Provider:</span>
                  <strong>${booking.providerName || 'EventHub Partner'}</strong>
                </div>
                <div class="detail-row">
                  <span>Event Date:</span>
                  <strong>${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div class="detail-row">
                  <span>Event Type:</span>
                  <strong>${booking.eventType?.charAt(0).toUpperCase() + booking.eventType?.slice(1) || 'Birthday'}</strong>
                </div>
                <div class="detail-row">
                  <span>Number of Guests:</span>
                  <strong>${booking.guestCount} people</strong>
                </div>
                
                <div class="total-row">
                  <span>Total Amount:</span>
                  <strong style="color: #10b981; font-size: 22px;">₹${formatPrice(booking.totalAmount)}</strong>
                </div>
              </div>
              
              <div class="payment-box">
                <h4 style="margin: 0 0 10px; color: #92400e;">💰 Payment Summary</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Advance Paid (30%):</span>
                  <strong>₹${formatPrice(booking.advanceAmount || booking.totalAmount * 0.3)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Balance to be paid:</span>
                  <strong>₹${formatPrice(booking.balanceAmount || booking.totalAmount * 0.7)}</strong>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/dashboard" class="button">View My Bookings →</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                For any queries, contact us at support@eventhub.com
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent to ${booking.customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Invoice email error:', error.message);
    return false;
  }
};

// Send Booking Rejection Email
exports.sendRejectionEmail = async (booking, reason) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn(`⚠️ Email service not configured. Rejection email would be sent to: ${booking.customerEmail}`);
      return false;
    }

    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Booking Cancelled - ${booking.serviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Booking Cancelled</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
            .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center; color: white; }
            .content { padding: 40px 32px; }
            .reason-box { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; color: #92400e; }
            .no-refund-box { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px;">📢</div>
              <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
              <h2>Dear ${booking.customerName},</h2>
              <p>We regret to inform you that your booking has been cancelled.</p>
              
              ${reason ? `
              <div class="reason-box">
                <strong>📋 Cancellation Reason:</strong><br>
                ${reason}
              </div>
              ` : ''}
              
              <div class="no-refund-box">
                <div style="font-size: 32px; margin-bottom: 10px;">ℹ️</div>
                <h3 style="margin: 0 0 10px; color: #92400e;">No Payment Was Processed</h3>
                <p style="margin: 0; color: #78350f;">
                  Since no advance payment was made for this booking, there is no refund to process.
                  You can make a new booking anytime!
                </p>
              </div>
              
              <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <p><strong>Booking Details:</strong></p>
                <p>Service: ${booking.serviceName}<br>
                Event Date: ${new Date(booking.eventDate).toLocaleDateString()}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events" class="button">Browse Other Services →</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Cancellation email sent to ${booking.customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Cancellation email error:', error.message);
    return false;
  }
};

// Send Refund Notification Email (ONLY when payment was actually made)
exports.sendRefundEmail = async (booking, reason, refundAmount = null) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn(`⚠️ Email service not configured. Refund email would be sent to: ${booking.customerEmail}`);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);
    
    // CHECK IF PAYMENT WAS ACTUALLY MADE
    const wasPaymentMade = !!(booking.paymentId || 
                          booking.paymentStatus === 'completed' || 
                          booking.paymentStatus === 'partial' ||
                          (booking.advanceAmount && booking.advanceAmount > 0));
    
    const refundAmountValue = refundAmount || booking.advanceAmount || (booking.totalAmount * 0.3);
    
    // If no payment was made, don't send refund email - send regular cancellation instead
    if (!wasPaymentMade) {
      console.log(`⚠️ No payment found for booking ${booking._id}, sending regular cancellation email instead`);
      return await exports.sendRejectionEmail(booking, reason || 'Booking cancelled');
    }
    
    console.log(`💰 Sending REFUND email to ${booking.customerEmail} - Amount: ₹${refundAmountValue}`);
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Refund Initiated - Booking Cancelled (${booking._id.toString().slice(-8)})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Refund Initiated</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center; color: white; }
            .content { padding: 40px 32px; }
            .refund-box { background: #e8f5e9; padding: 24px; border-radius: 16px; margin: 24px 0; border-left: 4px solid #4caf50; }
            .booking-details { background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .reason-box { background: #fee2e2; padding: 16px; border-radius: 12px; margin: 20px 0; color: #991b1b; }
            .timeline-box { background: #fff3cd; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 8px;">💰</div>
              <h1 style="margin: 0; font-size: 28px;">Refund Initiated</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">Your refund is being processed</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Dear ${booking.customerName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                We regret to inform you that your booking has been <strong style="color: #dc3545;">CANCELLED</strong>.
                Since you made an advance payment, we have initiated your refund.
              </p>
              
              ${reason ? `
              <div class="reason-box">
                <strong>📋 Cancellation Reason:</strong><br>
                ${reason}
              </div>
              ` : ''}
              
              <div class="booking-details">
                <h3 style="margin: 0 0 15px; color: #333;">Booking Details</h3>
                <div class="detail-row">
                  <span>Booking ID:</span>
                  <strong>#${booking._id.toString().slice(-8)}</strong>
                </div>
                <div class="detail-row">
                  <span>Service:</span>
                  <strong>${booking.serviceName}</strong>
                </div>
                <div class="detail-row">
                  <span>Event Date:</span>
                  <strong>${new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div class="detail-row">
                  <span>Total Amount:</span>
                  <strong>₹${formatPrice(booking.totalAmount)}</strong>
                </div>
                <div class="detail-row">
                  <span>Amount Paid:</span>
                  <strong>₹${formatPrice(booking.advanceAmount || (booking.totalAmount * 0.3))}</strong>
                </div>
              </div>
              
              <div class="refund-box">
                <h3 style="margin: 0 0 15px; color: #2e7d32;">💵 Refund Information</h3>
                <div class="detail-row">
                  <span>Refund Amount:</span>
                  <strong style="color: #2e7d32; font-size: 20px;">₹${formatPrice(refundAmountValue)}</strong>
                </div>
                <div class="detail-row">
                  <span>Refund Method:</span>
                  <strong>Original Payment Method</strong>
                </div>
                <div class="detail-row">
                  <span>Refund Status:</span>
                  <strong>Processing</strong>
                </div>
              </div>
              
              <div class="timeline-box">
                <h4 style="margin: 0 0 10px; color: #856404;">⏰ Refund Timeline</h4>
                <p style="margin: 0; color: #856404;">
                  Your refund has been initiated and will be credited to your original payment method within 
                  <strong>2-3 working days</strong>. Please check your bank account/credit card statement after this period.
                </p>
              </div>
              
              <div style="background: #dbeafe; padding: 16px; border-radius: 12px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px; color: #1e40af;">📝 Need Help?</h4>
                <p style="margin: 5px 0; color: #1e3a8a;">If you have any questions about the refund:</p>
                <ul style="margin: 10px 0 0 20px; color: #1e3a8a;">
                  <li>Contact our support team at support@eventhub.com</li>
                  <li>Include your booking ID: #${booking._id.toString().slice(-8)}</li>
                  <li>Response time: 24-48 hours</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/dashboard" class="button">View My Dashboard →</a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Thank you for understanding. We hope to serve you better in the future.
              </p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Refund email sent to ${booking.customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Refund email error:', error.message);
    return false;
  }
};

// Send Password Reset Success Email
exports.sendPasswordResetSuccessEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn(`⚠️ Email service not configured. Success email would be sent to: ${email}`);
      return false;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const mailOptions = {
      from: `"EventHub Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - EventHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Password Changed</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
            .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 32px; text-align: center; color: white; }
            .content { padding: 40px 32px; }
            .button { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px;">✓</div>
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <h2>Hello ${name || 'User'},</h2>
              <p>Your password has been successfully changed.</p>
              
              <div style="background: #d1fae5; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p>✅ If you made this change, no further action is needed.</p>
                <p>🔒 Your account is now secured with your new password.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${frontendUrl}/login" class="button">Login to Your Account →</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset success email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send success email:', error.message);
    return false;
  }
};

// Test email configuration
exports.testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('❌ Email service not configured');
      return false;
    }
    
    await transporter.verify();
    console.log('✅ Email service configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration invalid:', error.message);
    return false;
  }
};