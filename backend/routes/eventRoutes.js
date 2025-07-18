const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEventById,
  getEventByCode,
  updateEvent,
  deleteEvent,
  regenerateEventQRCode,
} = require('../controllers/eventController');
const { sendAttendanceReminders } = require('../controllers/notificationController');
 
// Base route: /api/events
 
router.route('/')
  .post(authMiddleware, createEvent)
  .get(authMiddleware, getEvents);
 
// Public route for fetching event details on the user registration page
router.get('/by-code/:eventCode', getEventByCode);
 
router.route('/:id')
  .get(authMiddleware, getEventById)
  .put(authMiddleware, updateEvent)
  .delete(authMiddleware, deleteEvent);
 
router.post('/:id/regenerate-qr', authMiddleware, regenerateEventQRCode);

// Route to send reminder emails to users who haven't attended
router.post('/:id/send-reminders', authMiddleware, sendAttendanceReminders);
 
module.exports = router;