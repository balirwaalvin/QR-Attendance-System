const pool = require('../config/db');

/**
 * @desc    Get overall attendance summary
 * @route   GET /api/analytics/attendance-summary
 * @access  Private/Admin
 */
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    // Count all user registrations for all events.
    // This assumes the 'users' table represents registrations.
    const [registeredResult] = await pool.query('SELECT COUNT(id) as totalRegistered FROM users');
    const totalRegistered = registeredResult[0].totalRegistered;

    // Count all recorded attendances.
    const [attendedResult] = await pool.query('SELECT COUNT(id) as totalAttended FROM attendance');
    const totalAttended = attendedResult[0].totalAttended;

    res.json({ totalRegistered, totalAttended });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    // Pass error to the centralized error handler in server.js
    next(error);
  }
};