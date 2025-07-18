const express = require('express');
const router = express.Router();
const { getAttendanceSummary } = require('../controllers/analyticsController');
 
// Import consistent authentication and role middleware
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
 
router.get('/attendance-summary', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), getAttendanceSummary);
 
module.exports = router;