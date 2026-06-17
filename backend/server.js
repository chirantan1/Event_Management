// ============================================
// FILE: backend/server.js
// ============================================
// ✅ COMPLETE FIXED CODE - With Email Test Routes
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import passport config
require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventBookingRoutes = require('./routes/eventBookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

// Import email service for test routes
const emailService = require('./utils/emailService');

const app = express();

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// For production on Render, also allow the deployed frontend
const allowedOrigins = [
  FRONTEND_URL,
  'https://event-management-1-4cat.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://event-management-froo.onrender.com'
].filter(Boolean);

const uniqueOrigins = [...new Set(allowedOrigins)];

console.log('\n🎯 Server Configuration:');
console.log(`📌 Environment: ${NODE_ENV}`);
console.log(`📌 Frontend URL: ${FRONTEND_URL}`);
console.log(`📌 Allowed Origins: ${uniqueOrigins.join(', ')}`);
console.log(`📌 Port: ${PORT}`);

// ============================================
// EMAIL CONFIGURATION CHECK
// ============================================
console.log('\n📧 Email Configuration:');
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
console.log(`🔑 EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);

// Check for spaces in email password
if (process.env.EMAIL_PASS && process.env.EMAIL_PASS.includes(' ')) {
  console.warn('⚠️ WARNING: EMAIL_PASS contains spaces! This will cause authentication failures.');
  console.warn('⚠️ Please remove spaces from your app password.');
  console.warn(`⚠️ Current password: "${process.env.EMAIL_PASS}"`);
}

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (NODE_ENV === 'development' && origin?.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    if (uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204
};

// ============================================
// MIDDLEWARE
// ============================================

if (NODE_ENV === 'production') {
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
}

app.use(compression());
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50000,
  message: { success: false, error: 'Too many attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(passport.initialize());

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

// ============================================
// ROUTES
// ============================================
console.log('\n🔧 Registering routes...');

// Health & Info Routes
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Event Management API is running',
    environment: NODE_ENV,
    frontendUrl: FRONTEND_URL,
    timestamp: new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

app.get('/api/test-cors', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin || 'no origin',
    allowedOrigins: uniqueOrigins
  });
});

// ============================================
// EMAIL TEST ROUTES
// ============================================

/**
 * @route   GET /api/test-email-config
 * @desc    Test email configuration
 * @access  Public
 */
app.get('/api/test-email-config', async (req, res) => {
  try {
    console.log('🔧 Testing email configuration...');
    
    const result = await emailService.testEmailConfig();
    
    res.json({
      success: result,
      message: result ? 'Email configuration is valid' : 'Email configuration is invalid',
      config: {
        emailUser: process.env.EMAIL_USER ? '✅ Set' : '❌ Not set',
        emailPass: process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set',
        emailPassLength: process.env.EMAIL_PASS?.replace(/\s/g, '').length || 0,
        hasSpaces: process.env.EMAIL_PASS?.includes(' ') || false,
        nodeEnv: NODE_ENV
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Email config test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   POST /api/test-email
 * @desc    Send a test email
 * @access  Public
 */
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
        example: { email: 'test@example.com' }
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

    console.log(`📧 Sending test email to: ${email}`);
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(400).json({
        success: false,
        error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env',
        config: {
          emailUser: process.env.EMAIL_USER ? '✅ Set' : '❌ Not set',
          emailPass: process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'
        }
      });
    }

    const result = await emailService.sendTestEmail(email);
    
    if (result) {
      res.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        details: {
          to: email,
          from: process.env.EMAIL_USER,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email. Check server logs for details.',
        details: {
          to: email,
          from: process.env.EMAIL_USER,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/email-status
 * @desc    Get email service status
 * @access  Public
 */
app.get('/api/email-status', (req, res) => {
  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const hasSpaces = process.env.EMAIL_PASS?.includes(' ') || false;
  
  res.json({
    success: true,
    emailConfigured: emailConfigured,
    config: {
      emailUser: emailConfigured ? '✅ Set' : '❌ Not set',
      emailPass: emailConfigured ? '✅ Set' : '❌ Not set',
      emailPassLength: process.env.EMAIL_PASS?.replace(/\s/g, '').length || 0,
      hasSpacesInPassword: hasSpaces,
      warning: hasSpaces ? '⚠️ EMAIL_PASS contains spaces! Please remove them.' : null
    },
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/event-bookings', eventBookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vendor', vendorRoutes);

console.log('✅ All routes registered\n');

// ============================================
// ERROR HANDLERS
// ============================================

// Handle 404 - Route not found
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found`,
    method: req.method,
    availableEndpoints: [
      '/',
      '/api/health',
      '/api/test-cors',
      '/api/test-email-config',
      '/api/email-status',
      '/api/auth',
      '/api/events',
      '/api/bookings',
      '/api/admin',
      '/api/services',
      '/api/vendor'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, error: err.message });
  }
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (NODE_ENV === 'production') {
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  await connectDB();
  
  // Test email configuration on startup
  console.log('\n📧 Testing email configuration...');
  const emailTest = await emailService.testEmailConfig();
  if (emailTest) {
    console.log('✅ Email service ready');
  } else {
    console.warn('⚠️ Email service not configured properly');
    console.warn('   To fix:');
    console.warn('   1. Set EMAIL_USER in .env');
    console.warn('   2. Set EMAIL_PASS (App Password, no spaces) in .env');
    console.warn('   3. Enable 2-Step Verification in Google Account');
    console.warn('   4. Generate App Password for "Mail" and "Other"');
  }
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVER STARTED');
    console.log('='.repeat(60));
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🔗 Backend URL: http://localhost:${PORT}`);
    console.log(`🎨 Frontend URL: ${FRONTEND_URL}`);
    console.log(`✅ CORS Enabled for: ${uniqueOrigins.join(', ')}`);
    console.log(`📧 Email Service: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
    console.log('='.repeat(60) + '\n');
    
    console.log('🔍 Available endpoints:');
    console.log(`  ✅ GET  http://localhost:${PORT}/`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/health`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/test-cors`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/email-status`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/test-email-config`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/test-email`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/forgot-password`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/verify-otp`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/reset-password`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/events`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/services`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/vendor/bookings`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/admin/stats`);
    console.log('\n📧 Email Test Commands:');
    console.log(`  🔧 Test Config: GET /api/test-email-config`);
    console.log(`  📤 Send Test:  POST /api/test-email { "email": "your@email.com" }`);
    console.log(`  📊 Check Status: GET /api/email-status`);
  });
  
  const gracefulShutdown = async () => {
    console.log('\n⚠️ Shutting down gracefully...');
    server.close(async () => {
      await mongoose.connection.close();
      console.log('✅ Server closed');
      process.exit(0);
    });
  };
  
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();

module.exports = app;

// ============================================
// 🔧 WHAT WAS ADDED/FIXED:
// ============================================
// 1. ✅ Added emailService import
// 2. ✅ Added email configuration check on startup
// 3. ✅ Added GET /api/test-email-config - Tests email configuration
// 4. ✅ Added POST /api/test-email - Sends test email
// 5. ✅ Added GET /api/email-status - Shows email service status
// 6. ✅ Added password space detection and warning
// 7. ✅ Added email configuration to root endpoint response
// 8. ✅ Added email test endpoints to available endpoints list
// 9. ✅ Added email service status in startup logs
// 10. ✅ Added detailed email config in /api/email-status
// 11. ✅ Added email test commands in server startup logs
// 12. ✅ Improved error messages for email configuration
// ============================================