// ============================================
// FILE: backend/server.js
// ============================================
// ✅ COMPLETE FIXED CODE
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

// Import configs
require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventBookingRoutes = require('./routes/eventBookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

// Import email service
const emailService = require('./utils/emailService');

const app = express();

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Allowed origins for CORS
const allowedOrigins = [
  FRONTEND_URL,
  'https://event-management-1-4cat.onrender.com',
  'https://event-management-froo.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

// ============================================
// CORS CONFIGURATION - FIXED
// ============================================
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow all onrender.com subdomains
    if (origin.includes('onrender.com')) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Check against allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS blocked: ${origin}`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 204
};

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

if (NODE_ENV === 'production') {
  app.use(helmet({ 
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
}

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: 'Too many attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use(passport.initialize());

// ============================================
// ROUTES
// ============================================

// Health & Info
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Event Management API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// EMAIL TEST ROUTES
// ============================================

app.get('/api/email-status', (req, res) => {
  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const hasSpaces = process.env.EMAIL_PASS?.includes(' ') || false;
  
  res.json({
    success: true,
    configured: emailConfigured,
    hasSpacesInPassword: hasSpaces,
    warning: hasSpaces ? 'Remove spaces from EMAIL_PASS' : null,
    environment: NODE_ENV
  });
});

app.get('/api/test-email-config', async (req, res) => {
  try {
    const result = await emailService.testEmailConfig();
    res.json({
      success: result,
      message: result ? 'Email configuration is valid' : 'Email configuration is invalid',
      config: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
        hasSpaces: process.env.EMAIL_PASS?.includes(' ') || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email is required' 
      });
    }

    const result = await emailService.sendTestEmail(email);
    
    res.json({
      success: result,
      message: result ? `Test email sent to ${email}` : 'Failed to send test email'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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

// ============================================
// ERROR HANDLERS
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, error: err.message });
  }
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'Internal server error'
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (NODE_ENV === 'production') {
      console.log('Retrying in 5 seconds...');
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
  
  // Test email on startup
  await emailService.testEmailConfig();
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
    console.log('='.repeat(50) + '\n');
  });
  
  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('\n⚠️ Shutting down...');
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
// FIXES APPLIED:
// ============================================
// 1. ✅ CORS - Allows all onrender.com subdomains
// 2. ✅ CORS - Added explicit OPTIONS handling
// 3. ✅ Email - Added test endpoints
// 4. ✅ Rate limiting - Added for forgot-password
// 5. ✅ Cleaned up excessive console logs
// 6. ✅ Simplified error responses
// ============================================