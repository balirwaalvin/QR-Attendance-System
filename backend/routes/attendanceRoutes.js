const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); // Import authentication middleware
const { recordAttendance, getAttendance } = require('../controllers/attendanceController'); // Import attendance controller functions

// Record attendance (Event Admin only)
// router.post('/record', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), recordAttendance);
router.post('/record', authMiddleware, roleMiddleware(['event_admin']), recordAttendance);

// Get attendance records (Event Admin only)
// router.get('/', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), getAttendance);
router.get('/', authMiddleware, roleMiddleware(['event_admin']), getAttendance);

module.exports = router;