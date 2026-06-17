// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('❌ Auth: No Authorization header provided');
      return res.status(401).json({ 
        success: false,
        error: 'No token provided, authorization denied' 
      });
    }

    // Check if header starts with Bearer
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth: Invalid Authorization header format');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token format. Expected: Bearer <token>' 
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      console.log('❌ Auth: Empty token');
      return res.status(401).json({ 
        success: false,
        error: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      console.log('✅ Auth: Token verified successfully');
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        console.log('❌ Auth: Invalid token -', jwtError.message);
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token. Please login again.' 
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        console.log('❌ Auth: Token expired');
        return res.status(401).json({ 
          success: false,
          error: 'Token expired, please login again' 
        });
      }
      console.log('❌ Auth: JWT verification error -', jwtError.message);
      throw jwtError;
    }
    
    // Get user ID from token
    const userId = decoded.userId || decoded.id || decoded._id;
    
    if (!userId) {
      console.log('❌ Auth: No user ID in token');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token structure. Please login again.' 
      });
    }
    
    // Find user in database
    const user = await User.findById(userId).select('-password -resetPasswordOTP -resetPasswordToken -resetPasswordExpires -emailVerificationOTP -emailVerificationExpires');
    
    if (!user) {
      console.log(`❌ Auth: User not found with ID: ${userId}`);
      return res.status(401).json({ 
        success: false,
        error: 'User not found. Please login again.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ Auth: User account is deactivated: ${user.email}`);
      return res.status(403).json({ 
        success: false,
        error: 'Your account has been deactivated. Please contact support.' 
      });
    }
    
    // Attach user to request object
    req.user = {
      id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.role === 'admin',
      isActive: user.isActive
    };
    
    console.log(`✅ Auth: User authenticated - ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('❌ Auth: Unexpected error -', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Authentication failed due to server error. Please try again.' 
    });
  }
};

module.exports = auth;