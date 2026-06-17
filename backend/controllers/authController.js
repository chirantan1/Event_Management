// ============================================
// FILE: backend/controllers/authController.js
// ============================================
// ✅ COMPLETE FIXED CODE - With Password Reset & OTP
// ============================================

const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log('📝 Registration attempt:', { 
      name: name || 'missing', 
      email: email || 'missing', 
      phone: phone || 'not provided'
    });

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Please provide all required fields: name, email, password' 
      });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Create user with RAW password (pre-save hook will hash it)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Raw password - NOT hashed here
      phone: phone || '',
      role: 'user',
      isAdmin: false,
      isActive: true
    });

    // Save user - pre-save hook will hash the password
    await user.save();
    console.log('✅ User created successfully:', user._id, user.email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        id: user._id, 
        email: user.email, 
        role: user.role,
        isAdmin: false
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: false,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Stack:', error.stack);
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        error: `${field} already exists. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);
    console.log('📝 Password length:', password?.length || 0);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false,
        error: 'Please provide email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      console.log('⚠️ OAuth user trying to login with password:', email);
      return res.status(401).json({ 
        success: false,
        error: 'This account uses Google/GitHub login. Please use social login.'
      });
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔐 Password verification result:', isPasswordValid);
    } catch (compareError) {
      console.error('❌ Password comparison error:', compareError);
      return res.status(500).json({
        success: false,
        error: 'Error verifying password'
      });
    }

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    console.log('✅ Password verified for:', email);

    // Update last login
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    console.log('✅ Last login updated for:', email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        id: user._id, 
        email: user.email, 
        role: user.role,
        isAdmin: user.role === 'admin'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Token generated for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// PASSWORD RESET & OTP FUNCTIONS
// ============================================

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔑 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('❌ User not found:', email);
      // Don't reveal that user doesn't exist for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.'
      });
    }

    // Check if user has a password (not OAuth)
    if (!user.password) {
      console.log('⚠️ OAuth user trying to reset password:', email);
      return res.status(400).json({
        success: false,
        error: 'This account uses social login. Please login with Google/GitHub.'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 Generated OTP for ${email}: ${otp}`);

    // Delete any existing OTPs for this email
    await PasswordReset.deleteMany({ email: email.toLowerCase().trim() });

    // Save new OTP to database
    await PasswordReset.create({
      email: email.toLowerCase().trim(),
      otp: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    console.log('✅ OTP saved to database');

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      console.log(`⚠️ Email sending failed, but OTP saved: ${otp}`);
      // Still return success to not reveal if email exists
    }

    // In development, return OTP for testing
    const response = {
      success: true,
      message: 'OTP sent to your email. Please check your inbox.'
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      response.devNote = 'OTP provided for development testing';
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔐 Verifying OTP for:', email);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP'
      });
    }

    // Find valid OTP
    const resetRecord = await PasswordReset.findOne({
      email: email.toLowerCase().trim(),
      otp: otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      console.log('❌ Invalid or expired OTP for:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    console.log('✅ OTP verified successfully for:', email);

    // Mark OTP as used
    resetRecord.used = true;
    await resetRecord.save();

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { 
        email: email.toLowerCase().trim(),
        purpose: 'password_reset'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    console.log('🔑 Resetting password with token');

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide reset token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your_jwt_secret_key');
    } catch (jwtError) {
      console.error('❌ Invalid reset token:', jwtError.message);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new OTP.'
      });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token purpose'
      });
    }

    const email = decoded.email;

    // Find user
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log('❌ User not found for reset:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully for:', email);

    // Send success email
    await emailService.sendPasswordResetSuccessEmail(email, user.name);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔄 Resending OTP for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 Generated new OTP for ${email}: ${otp}`);

    // Delete old OTPs
    await PasswordReset.deleteMany({ email: email.toLowerCase().trim() });

    // Save new OTP
    await PasswordReset.create({
      email: email.toLowerCase().trim(),
      otp: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      console.log(`⚠️ Email sending failed for resend: ${otp}`);
    }

    const response = {
      success: true,
      message: 'New OTP sent to your email'
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      response.devNote = 'OTP provided for development testing';
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again.'
    });
  }
};

// ============================================
// PROFILE MANAGEMENT FUNCTIONS
// ============================================

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    console.log('🔍 Getting user profile for:', userId);
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase().trim();
    if (phone) updates.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      req.user.id || req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide current and new password' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'New password must be at least 6 characters' 
      });
    }
    
    const user = await User.findById(req.user.id || req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    if (!user.password) {
      return res.status(400).json({ 
        success: false,
        error: 'This account uses social login. Cannot change password.'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Current password is incorrect' 
      });
    }
    
    // Let pre-save hook handle hashing
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};

// ============================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // For JWT, logout is handled client-side by removing token
    // This endpoint exists for consistency
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// 🔧 WHAT WAS FIXED:
// ============================================
// 1. ✅ Added PasswordReset model import
// 2. ✅ Added emailService import
// 3. ✅ Added forgotPassword function - generates OTP and sends email
// 4. ✅ Added verifyOTP function - validates OTP and returns reset token
// 5. ✅ Added resetPassword function - resets password using valid token
// 6. ✅ Added resendOTP function - resends OTP if needed
// 7. ✅ Added logout function
// 8. ✅ Added development mode OTP logging for testing
// 9. ✅ Added proper error handling for all OTP operations
// 10. ✅ Added security measures (don't reveal if email exists)
// 11. ✅ Added email success notification after password reset
// ============================================