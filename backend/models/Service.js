// backend/models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // ==================== SERVICE PROVIDER INFO ====================
  providerName: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true,
    minlength: [2, 'Provider name must be at least 2 characters'],
    maxlength: [50, 'Provider name cannot exceed 50 characters']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Business name must be at least 2 characters'],
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  alternatePhone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  website: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  
  // ==================== SERVICE DETAILS ====================
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'Birthday Planner', 
      'Wedding Planner', 
      'Corporate Event', 
      'Catering', 
      'Photography', 
      'Decoration', 
      'Music & DJ', 
      'Venue', 
      'Cake Artist', 
      'Return Gifts', 
      'Entertainment', 
      'Transportation',
      'Makeup Artist',
      'Mehendi Artist',
      'Fashion Designer',
      'Security Services'
    ]
  },
  subCategories: [{
    type: String,
    enum: ['Kids Party', 'Adult Party', 'Surprise Party', 'Theme Party', 'Pool Party', 'Cocktail Party']
  }],
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  highlights: [{
    type: String,
    trim: true
  }],
  
  // ==================== PRICING ====================
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  pricePerPerson: {
    type: Number,
    default: 0,
    min: [0, 'Price per person cannot be negative']
  },
  priceNegotiable: {
    type: Boolean,
    default: false
  },
  packages: [{
    name: {
      type: String,
      required: true,
      enum: ['Basic', 'Standard', 'Premium', 'Deluxe', 'Luxury', 'Custom']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    includes: [{
      type: String
    }],
    duration: {
      type: String,
      default: '4 hours'
    },
    isPopular: {
      type: Boolean,
      default: false
    }
  }],
  
  customPricing: [{
    minGuests: Number,
    maxGuests: Number,
    price: Number,
    pricePerPerson: Number
  }],
  
  // ==================== AVAILABILITY ====================
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
  },
  serviceableCities: [{
    type: String,
    trim: true
  }],
  maxCapacity: {
    type: Number,
    default: 100,
    min: [1, 'Max capacity must be at least 1']
  },
  minGuests: {
    type: Number,
    default: 1,
    min: [1, 'Minimum guests must be at least 1']
  },
  availabilityDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  
  businessHours: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    saturday: { open: { type: String, default: '10:00' }, close: { type: String, default: '17:00' }, isOpen: { type: Boolean, default: true } },
    sunday: { open: { type: String, default: '10:00' }, close: { type: String, default: '14:00' }, isOpen: { type: Boolean, default: false } }
  },
  
  bookingLeadDays: {
    type: Number,
    default: 3,
    min: [0, 'Booking lead days cannot be negative'],
    max: [30, 'Booking lead days cannot exceed 30']
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'custom'],
    default: 'moderate'
  },
  cancellationHours: {
    type: Number,
    default: 24
  },
  cancellationFee: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  advancePercentage: {
    type: Number,
    default: 30,
    min: [0, 'Advance percentage cannot be negative'],
    max: [100, 'Advance percentage cannot exceed 100']
  },
  refundableAdvance: {
    type: Boolean,
    default: false
  },
  
  unavailableDates: [{
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      maxlength: 200
    },
    isFullDay: {
      type: Boolean,
      default: true
    }
  }],
  
  timeSlots: [{
    slotTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 60
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    maxBookings: {
      type: Number,
      default: 1
    }
  }],
  
  // ==================== MEDIA ====================
  logo: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  videoUrl: {
    type: String,
    match: [/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/, 'Please enter a valid video URL']
  },
  gallery: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp))$/.test(v);
      },
      message: 'Please enter a valid image URL'
    }
  }],
  
  // ==================== RATINGS & REVIEWS ====================
  ratings: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1, 
      max: 5 
    },
    review: {
      type: String,
      maxlength: 500,
      trim: true
    },
    images: [String],
    response: {
      text: String,
      date: Date
    },
    date: { 
      type: Date, 
      default: Date.now 
    }
  }],
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    '5': { type: Number, default: 0 },
    '4': { type: Number, default: 0 },
    '3': { type: Number, default: 0 },
    '2': { type: Number, default: 0 },
    '1': { type: Number, default: 0 }
  },
  
  // ==================== PROVIDER INFO ====================
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date
  },
  
  // ==================== STATISTICS ====================
  totalBookings: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  
  // ==================== SEO & DISCOVERY ====================
  tags: [{
    type: String,
    trim: true
  }],
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  slug: {
    type: String,
    unique: true, // ✅ Keep this - it creates the index
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
// Single field indexes (REMOVED slug from here since unique: true is in the field)
serviceSchema.index({ serviceType: 1 });
serviceSchema.index({ city: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ featured: -1 });
serviceSchema.index({ averageRating: -1 });
// ✅ REMOVED: serviceSchema.index({ slug: 1 }); - Duplicate with unique: true in field

// Compound indexes
serviceSchema.index({ serviceType: 1, city: 1, isActive: 1 });
serviceSchema.index({ featured: -1, averageRating: -1, isActive: 1 });
serviceSchema.index({ provider: 1, createdAt: -1 });

// Text search index
serviceSchema.index({ businessName: 'text', description: 'text', tags: 'text' });

// ==================== MIDDLEWARE ====================

// Generate slug before saving
serviceSchema.pre('save', function(next) {
  if (this.isModified('businessName') && !this.slug) {
    this.slug = this.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Update average rating and distribution when new rating is added
serviceSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    const total = this.ratings.length;
    if (total > 0) {
      const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
      this.averageRating = parseFloat((sum / total).toFixed(1));
      this.totalReviews = total;
      
      // Reset distribution
      this.ratingDistribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
      this.ratings.forEach(r => {
        const key = Math.floor(r.rating).toString();
        if (this.ratingDistribution[key] !== undefined) {
          this.ratingDistribution[key]++;
        }
      });
    }
  }
  next();
});

// Ensure vendorId is set from provider if not present
serviceSchema.pre('save', function(next) {
  if (!this.vendorId && this.provider) {
    this.vendorId = this.provider;
  }
  next();
});

// ==================== VIRTUAL FIELDS ====================

serviceSchema.virtual('upcomingBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service',
  match: { eventDate: { $gt: new Date() }, status: 'confirmed' },
  options: { limit: 5 }
});

serviceSchema.virtual('calculatedEarnings').get(function() {
  return this.totalEarnings || 0;
});

// ==================== INSTANCE METHODS ====================

serviceSchema.methods.isAvailableOnDate = async function(date) {
  if (!date) return true;
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const blocked = this.unavailableDates.some(d => {
    const blockedDate = new Date(d.date);
    blockedDate.setHours(0, 0, 0, 0);
    return blockedDate.getTime() === targetDate.getTime();
  });
  
  return !blocked;
};

serviceSchema.methods.getPriceForGuests = function(guestCount) {
  const count = guestCount || this.minGuests || 1;
  
  const customPrice = this.customPricing?.find(
    p => count >= p.minGuests && count <= p.maxGuests
  );
  
  if (customPrice) {
    return customPrice.price || (customPrice.pricePerPerson * count);
  }
  
  return this.basePrice + (this.pricePerPerson * count);
};

serviceSchema.methods.addRating = async function(userId, rating, review, images = []) {
  this.ratings.push({
    user: userId,
    rating: rating,
    review: review,
    images: images,
    date: new Date()
  });
  
  // Recalculate averages
  const total = this.ratings.length;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = parseFloat((sum / total).toFixed(1));
  this.totalReviews = total;
  
  await this.save();
  return this;
};

// ==================== STATIC METHODS ====================

serviceSchema.statics.findFeatured = function(limit = 6) {
  return this.find({ featured: true, isActive: true })
    .sort({ averageRating: -1, totalBookings: -1 })
    .limit(limit);
};

serviceSchema.statics.findByCityAndType = function(city, serviceType, limit = 20) {
  const query = { isActive: true };
  if (city && city !== 'all') query.city = { $regex: new RegExp(`^${city}$`, 'i') };
  if (serviceType && serviceType !== 'all') query.serviceType = serviceType;
  
  return this.find(query)
    .sort({ featured: -1, averageRating: -1, totalBookings: -1 })
    .limit(limit);
};

serviceSchema.statics.searchServices = function(keyword, filters = {}) {
  const query = {
    isActive: true
  };
  
  if (keyword && keyword.trim()) {
    query.$text = { $search: keyword.trim() };
  }
  
  if (filters.city && filters.city !== 'all') {
    query.city = { $regex: new RegExp(`^${filters.city}$`, 'i') };
  }
  if (filters.serviceType && filters.serviceType !== 'all') {
    query.serviceType = filters.serviceType;
  }
  if (filters.minPrice) {
    query.basePrice = { $gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    query.basePrice = { ...query.basePrice, $lte: filters.maxPrice };
  }
  if (filters.minRating) {
    query.averageRating = { $gte: filters.minRating };
  }
  
  let findQuery = this.find(query);
  
  if (keyword && keyword.trim()) {
    findQuery = findQuery.sort({ score: { $meta: 'textScore' } });
  } else {
    findQuery = findQuery.sort({ featured: -1, averageRating: -1, totalBookings: -1 });
  }
  
  return findQuery;
};

serviceSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ isActive: true, totalReviews: { $gte: 5 } })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit);
};

serviceSchema.statics.getPopularByCity = function(city, limit = 10) {
  return this.find({ city: { $regex: new RegExp(`^${city}$`, 'i') }, isActive: true })
    .sort({ totalBookings: -1, averageRating: -1 })
    .limit(limit);
};

// ==================== EXPORT ====================
module.exports = mongoose.model('Service', serviceSchema);