const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    default: 'general'
  },
  providerName: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    default: 'birthday'
  },
  guestCount: {
    type: Number,
    required: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    default: 0
  },
  pricePerPerson: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);