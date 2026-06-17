const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getUpcomingEvents
} = require('../controllers/eventController');

// Public routes
router.get('/', getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/category/:category', getEventsByCategory);
router.get('/:id', getEventById);

// Private routes (Admin only)
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;