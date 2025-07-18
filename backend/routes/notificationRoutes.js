const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { getNotifications, resendNotification } = require('../controllers/notificationController');

// GET /api/notifications - Get all notification logs (for admins)
router.get('/', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), getNotifications);

// POST /api/notifications/:id/resend - Resend a failed notification (for admins)
router.post('/:id/resend', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), resendNotification);

module.exports = router;