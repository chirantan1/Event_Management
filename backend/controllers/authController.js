// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ FIXED: Register function - NO double hashing
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

    // ✅ FIXED: Create user with RAW password (pre-save hook will hash it)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // ✅ Raw password - NOT hashed here
      phone: phone || '',
      role: 'user',
      isAdmin: false,
      isActive: true
    });

    // Save user - pre-save hook will hash the password
    await user.save();
    console.log('✅ User created successfully:', user._id, user.email);
    console.log('🔑 Password hashed by pre-save hook');

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

// ✅ FIXED: Login function with better debugging
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
    console.log('🔑 Has password?', !!user.password);
    console.log('🔑 Password hash length:', user.password?.length || 0);

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      console.log('⚠️ OAuth user trying to login with password:', email);
      return res.status(401).json({ 
        success: false,
        error: 'This account uses Google/GitHub login. Please use social login.'
      });
    }

    // ✅ Verify password with try-catch
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
    
    // ✅ FIXED: Let pre-save hook handle hashing (don't hash here)
    user.password = newPassword; // Raw password - pre-save hook will hash it
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