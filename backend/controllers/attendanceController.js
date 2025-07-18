const pool = require('../config/db'); // Import database connection
const { sendAttendanceConfirmation } = require('./notificationController');

// Function to record attendance using QR code data
const recordAttendance = async (req, res) => {
  const { qrData } = req.body;
  try {
    const [userId, eventId] = qrData.split(',').map(part => part.split(':')[1]);

    // 1. Fetch event and user details for validation and notifications
    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    const event = eventRows[0];

    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = userRows[0];

    // 2. Authorization check
    if (req.user.role === 'event_admin' && event.admin_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to record attendance for this event' });
    }

    // 3. Check if attendance is already recorded to prevent duplicates
    const [existingAttendance] = await pool.query(
      'SELECT id FROM attendance WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );
    if (existingAttendance.length > 0) {
      return res.status(409).json({ message: `Attendance already recorded for ${user.name}.` });
    }

    // 4. Record attendance
    const [result] = await pool.query(
      'INSERT INTO attendance (user_id, event_id, time) VALUES (?, ?, NOW())',
      [userId, eventId]
    );

    // 5. Asynchronously send attendance confirmation email and log it
    sendAttendanceConfirmation(user, event).catch(err => {
      console.error(`Failed to send attendance confirmation email to ${user.name}:`, err);
    });

    res.json({ message: `Attendance recorded for ${user.name}` });
  } catch (error) {
    res.status(500).json({ message: 'Error recording attendance', error: error.message });
  }
};

// Function to get attendance records
const getAttendance = async (req, res) => {
  const adminId = req.user.id;
  const role = req.user.role;
  try {
    let query = `
      SELECT u.name AS userName, e.purpose AS eventName, a.time
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      JOIN events e ON a.event_id = e.id
    `;
    let params = [];
    if (role === 'event_admin') {
      query += ' WHERE e.admin_id = ?';
      params.push(adminId);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

module.exports = { recordAttendance, getAttendance };