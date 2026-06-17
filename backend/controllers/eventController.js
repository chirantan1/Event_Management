const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get all events with advanced filtering
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, date, location, sortBy } = req.query;
    let query = {};
    
    // Filter by category
    if (category && category !== '') {
      query.category = category;
    }
    
    // Search in title and description
    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by date
    if (date && date !== '') {
      query.date = date;
    }
    
    // Filter by location
    if (location && location !== '') {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Get current date for upcoming events filter
    const today = new Date().toISOString().split('T')[0];
    
    // Default to showing upcoming events only
    query.date = { $gte: today };
    
    // Determine sort order
    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'date_asc':
        sortOptions = { date: 1 };
        break;
      case 'date_desc':
        sortOptions = { date: -1 };
        break;
      default:
        sortOptions = { date: 1, createdAt: -1 };
    }
    
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions);
    
    // Get booking counts for each event
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const bookingCount = await Booking.countDocuments({ 
        event: event._id,
        status: 'confirmed'
      });
      const availableSeats = event.capacity - bookingCount;
      return {
        ...event.toObject(),
        stats: {
          totalBookings: bookingCount,
          availableSeats: availableSeats > 0 ? availableSeats : 0,
          isAvailable: availableSeats > 0
        }
      };
    }));
    
    res.json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get booking count for this event
    const bookingCount = await Booking.countDocuments({ 
      event: req.params.id,
      status: 'confirmed'
    });
    
    const availableSeats = event.capacity - bookingCount;
    
    // Get recent bookings for this event (for admin view)
    let recentBookings = [];
    if (req.user && req.user.isAdmin) {
      recentBookings = await Booking.find({ 
        event: req.params.id,
        status: 'confirmed'
      })
      .populate('user', 'name email')
      .limit(10)
      .sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      event: {
        ...event.toObject(),
        stats: {
          totalBookings: bookingCount,
          availableSeats: availableSeats > 0 ? availableSeats : 0,
          occupancyRate: ((bookingCount / event.capacity) * 100).toFixed(2)
        }
      },
      recentBookings: req.user?.isAdmin ? recentBookings : undefined
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
exports.createEvent = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Access denied. Admin rights required.' 
      });
    }
    
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      price, 
      capacity, 
      category,
      image 
    } = req.body;
    
    // Validation
    if (!title || !description || !date || !time || !location || !price || !capacity) {
      return res.status(400).json({ 
        error: 'Please provide all required fields' 
      });
    }
    
    // Validate date is not in the past
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return res.status(400).json({ 
        error: 'Event date cannot be in the past' 
      });
    }
    
    // Validate capacity is positive
    if (capacity <= 0) {
      return res.status(400).json({ 
        error: 'Capacity must be greater than 0' 
      });
    }
    
    // Validate price is non-negative
    if (price < 0) {
      return res.status(400).json({ 
        error: 'Price cannot be negative' 
      });
    }
    
    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      price: parseFloat(price),
      capacity: parseInt(capacity),
      category: category || 'Other',
      image: image || 'https://via.placeholder.com/300x200?text=Event',
      createdBy: req.user.id
    });
    
    await event.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
exports.updateEvent = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Access denied. Admin rights required.' 
      });
    }
    
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const allowedUpdates = ['title', 'description', 'date', 'time', 'location', 'price', 'capacity', 'category', 'image'];
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        // Validate date if it's being updated
        if (key === 'date') {
          const newDate = new Date(req.body.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (newDate < today) {
            throw new Error('Event date cannot be in the past');
          }
        }
        // Validate capacity if it's being updated
        if (key === 'capacity' && req.body.capacity <= 0) {
          throw new Error('Capacity must be greater than 0');
        }
        // Validate price if it's being updated
        if (key === 'price' && req.body.price < 0) {
          throw new Error('Price cannot be negative');
        }
        event[key] = req.body[key];
      }
    });
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (error.message === 'Event date cannot be in the past' || 
        error.message === 'Capacity must be greater than 0' ||
        error.message === 'Price cannot be negative') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
exports.deleteEvent = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'Access denied. Admin rights required.' 
      });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if there are any confirmed bookings for this event
    const confirmedBookings = await Booking.find({ 
      event: req.params.id,
      status: 'confirmed'
    });
    
    if (confirmedBookings.length > 0) {
      // Cancel all confirmed bookings first
      await Booking.updateMany(
        { event: req.params.id, status: 'confirmed' },
        { status: 'cancelled' }
      );
    }
    
    await event.deleteOne();
    
    res.json({
      success: true,
      message: 'Event deleted successfully',
      bookingsCancelled: confirmedBookings.length
    });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
exports.getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const events = await Event.find({ 
      category,
      date: { $gte: today }
    })
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    
    res.json({
      success: true,
      category,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const limit = parseInt(req.query.limit) || 10;
    
    const events = await Event.find({ date: { $gte: today } })
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .limit(limit);
    
    // Add availability stats
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const bookingCount = await Booking.countDocuments({ 
        event: event._id,
        status: 'confirmed'
      });
      const availableSeats = event.capacity - bookingCount;
      return {
        ...event.toObject(),
        availableSeats: availableSeats > 0 ? availableSeats : 0
      };
    }));
    
    res.json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get event categories (distinct)
// @route   GET /api/events/categories/all
// @access  Public
exports.getEventCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.json({
      success: true,
      categories: categories.filter(c => c && c !== '')
    });
  } catch (error) {
    console.error('Get event categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};