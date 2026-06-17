// backend/controllers/passwordResetController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide an email address' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid email address' 
      });
    }

    console.log('🔍 Looking for user:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`⚠️ User not found: ${email}`);
      return res.status(200).json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive an OTP'
      });
    }

    console.log('✅ User found:', user.email);

    if (!user.password) {
      console.log(`⚠️ OAuth user (${email}) trying to reset password.`);
      return res.status(400).json({ 
        success: false, 
        error: 'This account uses Google/GitHub login. Please login using your social account.'
      });
    }

    // Check rate limiting
    if (user.lastOTPRequestTime && Date.now() - user.lastOTPRequestTime < 60000) {
      const secondsLeft = Math.ceil((60000 - (Date.now() - user.lastOTPRequestTime)) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${secondsLeft} seconds before requesting a new OTP`
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🎯 Generated OTP:', otp);
    
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    user.lastOTPRequestTime = Date.now();
    
    console.log('💾 Saving OTP to user...');
    await user.save();
    console.log('✅ OTP saved to user');

    console.log('📧 Attempting to send OTP email...');
    let emailSent = false;
    try {
      emailSent = await emailService.sendOTPEmail(user.email, otp, user.name);
      console.log(`📧 Email sent result: ${emailSent}`);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (check server logs)',
      ...(process.env.NODE_ENV === 'development' && { debugOTP: otp })
    });
    
  } catch (error) {
    console.error('❌ Forgot password error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Verify OTP - FIXED comparison
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔐 Verify OTP request:', { email, otp });

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and OTP' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired OTP' 
      });
    }

    // FIXED: Better null check and comparison
    if (!user.resetPasswordOTP) {
      console.log(`❌ No OTP found for user: ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: 'No OTP requested. Please request a new one.' 
      });
    }

    // FIXED: Proper string comparison with null check
    if (String(user.resetPasswordOTP).trim() !== String(otp).trim()) {
      console.log(`❌ OTP mismatch for ${email}. Expected: ${user.resetPasswordOTP}, Got: ${otp}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid OTP. Please check and try again.' 
      });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      console.log(`❌ OTP expired for ${email}`);
      user.resetPasswordOTP = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(400).json({ 
        success: false, 
        error: 'OTP has expired. Please request a new one.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`✅ OTP verified for ${email}`);

    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
    
  } catch (error) {
    console.error('❌ Verify OTP error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    console.log('🔄 Reset password request received');

    if (!resetToken || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide reset token and new password' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken
    });

    if (!user) {
      console.log(`❌ Invalid reset token`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      });
    }

    // ✅ FIXED: Let pre-save hook handle hashing (don't hash here)
    user.password = newPassword; // Raw password - pre-save hook will hash it
    
    user.resetPasswordToken = null;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    console.log(`✅ Password reset successful for ${user.email}`);

    try {
      await emailService.sendPasswordResetSuccessEmail(user.email, user.name);
    } catch (err) {
      console.error('Failed to send confirmation email:', err.message);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.'
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Resend OTP - FIXED rate limiting
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide an email address' 
      });
    }

    console.log(`📧 Resend OTP request for: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If an account exists, you will receive an OTP'
      });
    }

    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        error: 'This account uses Google/GitHub login. Please login using your social account.'
      });
    }

    // FIXED: Rate limiting check using the field we added to User model
    if (user.lastOTPRequestTime && Date.now() - user.lastOTPRequestTime < 60000) {
      const secondsLeft = Math.ceil((60000 - (Date.now() - user.lastOTPRequestTime)) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${secondsLeft} seconds before requesting a new OTP`
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    user.lastOTPRequestTime = Date.now();
    await user.save();

    console.log(`🎯 Generated new OTP for ${user.email}: ${otp}`);

    let emailSent = false;
    try {
      emailSent = await emailService.sendOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: emailSent ? 'New OTP sent to your email' : 'New OTP generated',
      ...(process.env.NODE_ENV === 'development' && { debugOTP: otp })
    });
    
  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again later.'
    });
  }
};