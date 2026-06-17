// backend/middleware/requireAdmin.js
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    console.log('🔐 Admin check - Request to:', req.originalUrl);
    console.log('📋 User object:', req.user);

    // Check if user exists from auth middleware
    if (!req.user) {
      console.log('❌ No user object - authentication required');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      console.log('❌ No user ID in request');
      return res.status(401).json({
        success: false,
        error: 'Invalid user session'
      });
    }

    console.log('📋 User ID:', userId);
    console.log('📋 User role from token:', req.user.role);
    console.log('📋 User isAdmin from token:', req.user.isAdmin);

    // Fetch full user data from database to verify admin role
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found in database:', userId);
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('📋 Database user role:', user.role);
    console.log('📋 Database user isAdmin:', user.isAdmin);

    // Check if user has admin role
    if (user.role !== 'admin') {
      console.log(`❌ Access denied: ${user.email} (${user.role}) attempted to access admin route`);
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    // ✅ Update req.user with fresh data from database
    req.user = {
      id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'
    };

    console.log(`✅ Admin access granted: ${user.email}`);
    next();
  } catch (error) {
    console.error('❌ requireAdmin error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Server error during authorization'
    });
  }
};

module.exports = requireAdmin;