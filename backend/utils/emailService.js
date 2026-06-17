const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    console.log('📧 Email Configuration:');
    console.log(`  EMAIL_USER: ${emailUser ? '✅ Set' : '❌ Not set'}`);
    console.log(`  EMAIL_PASS: ${emailPass ? '✅ Set' : '❌ Not set'}`);
    
    if (!emailUser || !emailPass) {
      console.log('⚠️ Email not configured - Using fallback mode');
      return null;
    }

    const cleanPassword = emailPass.replace(/\s/g, '');

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: cleanPassword
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    console.log('✅ Email transporter created');
  }
  return transporter;
};

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTPEmail = async (email, otp, name) => {
  console.log(`📧 OTP for ${email}: ${otp}`);
  
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('✅ OTP generated (email disabled)');
      return true;
    }

    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - EventHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">EventHub</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2>Hello ${name || 'User'},</h2>
            <p>We received a request to reset your password. Use the verification code below:</p>
            <div style="background: #f3f4f6; padding: 24px; text-align: center; margin: 24px 0; border-radius: 16px;">
              <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; min-width: 200px; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea;">${otp}</div>
            </div>
            <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 24px 0; color: #92400e;">
              <p style="margin: 0;">⏰ This OTP is valid for <strong>10 minutes</strong></p>
              <p style="margin: 8px 0 0;">🔒 For security, do not share this code with anyone</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Email sent to ${email}, ID: ${info.messageId}`))
      .catch(err => console.error(`❌ Email failed: ${err.message}`));

    console.log(`✅ OTP response sent for ${email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    return true;
  }
};

exports.sendBookingConfirmationEmail = async (booking) => {
  try {
    console.log(`📧 Booking confirmation for: ${booking.customerEmail}`);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email disabled - skipping');
      return true;
    }

    const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price || 0);
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Booking Confirmed! - ${booking.serviceName || 'Event'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
            <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your booking request has been received</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2>Dear ${booking.customerName || 'Customer'},</h2>
            <p>Thank you for booking with EventHub! Your booking has been submitted successfully.</p>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PENDING CONFIRMATION</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Booking ID:</span>
                <strong>#${booking._id?.toString().slice(-8) || 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Service:</span>
                <strong>${booking.serviceName || 'Event Service'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Event Date:</span>
                <strong>${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Event Type:</span>
                <strong>${booking.eventType?.charAt(0).toUpperCase() + booking.eventType?.slice(1) || 'Birthday'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                <span>Number of Guests:</span>
                <strong>${booking.guestCount || 0} people</strong>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0;">
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block;">View My Bookings →</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">For any queries, contact us at support@eventhub.com</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Booking email sent to ${booking.customerEmail}`))
      .catch(err => console.error(`❌ Booking email failed: ${err.message}`));

    return true;
    
  } catch (error) {
    console.error(`❌ Booking email error: ${error.message}`);
    return true;
  }
};

exports.sendInvoiceEmail = async (booking) => {
  try {
    console.log(`📧 Invoice for: ${booking.customerEmail}`);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email disabled - skipping');
      return true;
    }

    const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price || 0);
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Booking Confirmed & Invoice - ${booking.serviceName || 'Event'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
            <h1 style="margin: 0; font-size: 28px;">Booking Confirmed!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your event is now confirmed</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2>Dear ${booking.customerName || 'Customer'},</h2>
            <p>Great news! Your booking has been confirmed. Here's your invoice:</p>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                <div>
                  <strong>INVOICE</strong><br>
                  <small>INV-${booking._id?.toString().slice(-8) || 'N/A'}</small>
                </div>
                <div>
                  <span style="display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Service:</span>
                <strong>${booking.serviceName || 'Event Service'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Event Date:</span>
                <strong>${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Event Type:</span>
                <strong>${booking.eventType?.charAt(0).toUpperCase() + booking.eventType?.slice(1) || 'Birthday'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                <span>Number of Guests:</span>
                <strong>${booking.guestCount || 0} people</strong>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px; border-top: 2px solid #e2e8f0; font-weight: bold; font-size: 18px;">
                <span>Total Amount:</span>
                <strong style="color: #10b981; font-size: 22px;">₹${formatPrice(booking.totalAmount)}</strong>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 20px 0;">
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block;">View My Bookings →</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">For any queries, contact us at support@eventhub.com</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Invoice email sent to ${booking.customerEmail}`))
      .catch(err => console.error(`❌ Invoice email failed: ${err.message}`));

    return true;
    
  } catch (error) {
    console.error(`❌ Invoice email error: ${error.message}`);
    return true;
  }
};

exports.sendRejectionEmail = async (booking, reason) => {
  try {
    console.log(`📧 Rejection for: ${booking.customerEmail}`);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email disabled - skipping');
      return true;
    }

    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Booking Cancelled - ${booking.serviceName || 'Event'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center; color: white;">
            <div style="font-size: 48px;">📢</div>
            <h1 style="margin: 0;">Booking Cancelled</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2>Dear ${booking.customerName || 'Customer'},</h2>
            <p>We regret to inform you that your booking has been cancelled.</p>
            
            ${reason ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; color: #92400e;">
              <strong>📋 Cancellation Reason:</strong><br>
              ${reason}
            </div>
            ` : ''}
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">ℹ️</div>
              <h3 style="margin: 0 0 10px; color: #92400e;">No Payment Was Processed</h3>
              <p style="margin: 0; color: #78350f;">Since no advance payment was made for this booking, there is no refund to process. You can make a new booking anytime!</p>
            </div>
            
            <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <p><strong>Booking Details:</strong></p>
              <p>Service: ${booking.serviceName || 'Event Service'}<br>
              Event Date: ${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block;">Browse Other Services →</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Rejection email sent to ${booking.customerEmail}`))
      .catch(err => console.error(`❌ Rejection email failed: ${err.message}`));

    return true;
    
  } catch (error) {
    console.error(`❌ Rejection email error: ${error.message}`);
    return true;
  }
};

exports.sendRefundEmail = async (booking, reason, refundAmount = null) => {
  try {
    console.log(`📧 Refund for: ${booking.customerEmail}`);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email disabled - skipping');
      return true;
    }

    const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price || 0);
    
    const wasPaymentMade = !!(booking.paymentId || 
                          booking.paymentStatus === 'completed' || 
                          booking.paymentStatus === 'partial' ||
                          (booking.advanceAmount && booking.advanceAmount > 0));
    
    const refundAmountValue = refundAmount || booking.advanceAmount || (booking.totalAmount * 0.3);
    
    if (!wasPaymentMade) {
      console.log(`⚠️ No payment found for booking ${booking._id}, sending cancellation email instead`);
      return await exports.sendRejectionEmail(booking, reason || 'Booking cancelled');
    }
    
    console.log(`💰 Sending REFUND email - Amount: ₹${refundAmountValue}`);
    
    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `Refund Initiated - Booking Cancelled (${booking._id?.toString().slice(-8) || 'N/A'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center; color: white;">
            <div style="font-size: 48px; margin-bottom: 8px;">💰</div>
            <h1 style="margin: 0; font-size: 28px;">Refund Initiated</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your refund is being processed</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2>Dear ${booking.customerName || 'Customer'},</h2>
            
            <p>We regret to inform you that your booking has been <strong style="color: #dc3545;">CANCELLED</strong>. Since you made an advance payment, we have initiated your refund.</p>
            
            ${reason ? `
            <div style="background: #fee2e2; padding: 16px; border-radius: 12px; margin: 20px 0; color: #991b1b;">
              <strong>📋 Cancellation Reason:</strong><br>
              ${reason}
            </div>
            ` : ''}
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px; color: #333;">Booking Details</h3>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Booking ID:</span>
                <strong>#${booking._id?.toString().slice(-8) || 'N/A'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Service:</span>
                <strong>${booking.serviceName || 'Event Service'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Event Date:</span>
                <strong>${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Total Amount:</span>
                <strong>₹${formatPrice(booking.totalAmount)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span>Amount Paid:</span>
                <strong>₹${formatPrice(booking.advanceAmount || booking.totalAmount * 0.3)}</strong>
              </div>
            </div>
            
            <div style="background: #e8f5e9; padding: 24px; border-radius: 16px; margin: 24px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin: 0 0 15px; color: #2e7d32;">💵 Refund Information</h3>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #c8e6c9;">
                <span>Refund Amount:</span>
                <strong style="color: #2e7d32; font-size: 20px;">₹${formatPrice(refundAmountValue)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #c8e6c9;">
                <span>Refund Method:</span>
                <strong>Original Payment Method</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span>Refund Status:</span>
                <strong>Processing</strong>
              </div>
            </div>
            
            <div style="background: #fff3cd; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="margin: 0 0 10px; color: #856404;">⏰ Refund Timeline</h4>
              <p style="margin: 0; color: #856404;">Your refund will be credited to your original payment method within <strong>2-3 working days</strong>.</p>
            </div>
            
            <div style="background: #dbeafe; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px; color: #1e40af;">📝 Need Help?</h4>
              <p style="margin: 5px 0; color: #1e3a8a;">Contact our support team at support@eventhub.com</p>
              <p style="margin: 5px 0; color: #1e3a8a;">Include your booking ID: #${booking._id?.toString().slice(-8) || 'N/A'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block;">View My Dashboard →</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">Thank you for understanding. We hope to serve you better in the future.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Refund email sent to ${booking.customerEmail}`))
      .catch(err => console.error(`❌ Refund email failed: ${err.message}`));

    return true;
    
  } catch (error) {
    console.error(`❌ Refund email error: ${error.message}`);
    return true;
  }
};

exports.sendPasswordResetSuccessEmail = async (email, name) => {
  try {
    console.log(`📧 Password reset success for: ${email}`);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email disabled - skipping');
      return true;
    }

    const mailOptions = {
      from: `"EventHub Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - EventHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 32px; text-align: center; color: white;">
            <div style="font-size: 48px;">✓</div>
            <h1 style="margin: 0;">Password Changed</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2>Hello ${name || 'User'},</h2>
            <p>Your password has been successfully changed.</p>
            
            <div style="background: #d1fae5; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p>✅ If you made this change, no further action is needed.</p>
              <p>🔒 Your account is now secured with your new password.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; display: inline-block;">Login to Your Account →</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Success email sent to ${email}`))
      .catch(err => console.error(`❌ Success email failed: ${err.message}`));

    return true;
    
  } catch (error) {
    console.error(`❌ Success email error: ${error.message}`);
    return true;
  }
};

exports.testEmailConfig = async () => {
  try {
    console.log('🔧 Testing email configuration...');
    const transporter = createTransporter();
    if (!transporter) {
      console.log('❌ Email service not configured');
      return false;
    }
    console.log('✅ Email service configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration invalid:', error.message);
    return false;
  }
};

exports.sendTestEmail = async (email) => {
  try {
    console.log(`📧 Sending test email to: ${email}`);
    
    const transporter = createTransporter();
    if (!transporter) {
      console.log('❌ Email service not configured');
      return false;
    }
    
    const mailOptions = {
      from: `"EventHub Test" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Test Email - EventHub Email Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center; color: white; border-radius: 16px 16px 0 0; margin: -40px -40px 30px -40px;">
            <h1 style="margin: 0;">✅ Test Email</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">EventHub Email Service is Working!</p>
          </div>
          <h2>Hello,</h2>
          <p>This is a test email from EventHub to verify that the email service is configured correctly.</p>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="font-size: 24px; margin: 0;">🎉</p>
            <p style="margin: 10px 0 0; font-weight: bold; color: #2e7d32;">Email service is working properly!</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">Test sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions)
      .then(info => console.log(`✅ Test email sent to ${email}`))
      .catch(err => console.error(`❌ Test email failed: ${err.message}`));

    return true;
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    return true;
  }
};