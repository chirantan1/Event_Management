// backend/models/EventBooking.js
const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  eventCategory: {
    type: String,
    default: ''
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  specialRequests: {
    type: String,
    default: ''
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
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded'],
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

module.exports = mongoose.model('EventBooking', eventBookingSchema);