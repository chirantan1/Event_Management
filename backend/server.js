// backend/server.js
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

const app = express();

// ==================== ENVIRONMENT CONFIGURATION ====================
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

// ==================== CORS CONFIGURATION ====================
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

// ==================== MIDDLEWARE ====================

if (NODE_ENV === 'production') {
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
}

app.use(compression());
app.use(cors(corsOptions));

// ✅ FIXED: Removed the problematic app.options('*', ...) handler
// The cors() middleware already handles OPTIONS preflight requests automatically

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

// ==================== ROUTES ====================
console.log('\n🔧 Registering routes...');

app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Event Management API is running',
    environment: NODE_ENV,
    frontendUrl: FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/event-bookings', eventBookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vendor', vendorRoutes);

console.log('✅ All routes registered\n');

// ==================== ERROR HANDLERS ====================

// Handle 404 - Route not found
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found`,
    method: req.method,
    availableEndpoints: ['/', '/api/health', '/api/test-cors', '/api/auth', '/api/events', '/api/bookings', '/api/admin', '/api/services', '/api/vendor']
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

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
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

// ==================== START SERVER ====================
const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 SERVER STARTED');
    console.log('='.repeat(50));
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🔗 Backend URL: http://localhost:${PORT}`);
    console.log(`🎨 Frontend URL: ${FRONTEND_URL}`);
    console.log(`✅ CORS Enabled for: ${uniqueOrigins.join(', ')}`);
    console.log('='.repeat(50) + '\n');
    
    console.log('🔍 Available endpoints:');
    console.log(`  ✅ GET  http://localhost:${PORT}/`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/health`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/test-cors`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  ✅ POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/events`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/services`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/vendor/bookings`);
    console.log(`  ✅ GET  http://localhost:${PORT}/api/admin/stats`);
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