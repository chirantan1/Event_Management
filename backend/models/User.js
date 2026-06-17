// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    },
    minlength: 6
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  lastOTPRequestTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ✅ Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login timestamp
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Don't return sensitive fields when converting to JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.resetPasswordOTP;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.emailVerificationOTP;
    delete ret.emailVerificationExpires;
    return ret;
  }
});

// ✅ Only index non-unique fields
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);