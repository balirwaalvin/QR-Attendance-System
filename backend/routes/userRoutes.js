const express = require('express');
const router = express.Router();
const { registerUser, loginUser, importUsers, getUserEvents } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// @route   POST /api/users/register
// @desc    Register a user for an event
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & get token/QR data
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/users/import
// @desc    Import users from a file and register them for an event
// @access  Private (Admin)
router.post('/import', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), uploadMiddleware, importUsers);

// Add this route:
router.get('/events', authMiddleware, getUserEvents);

module.exports = router;