const transporter = require('../config/email');
const pool = require('../config/db');

const sendRegistrationEmail = async (userId, eventId, qrData) => {
  try {
    const [user] = await pool.query('SELECT name, email FROM users WHERE id = ?', [userId]);
    const [event] = await pool.query('SELECT purpose FROM events WHERE id = ?', [eventId]);
    if (!user.length || !event.length) {
      throw new Error('User or event not found');
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user[0].email,
      subject: `Registration Confirmation for ${event[0].purpose}`,
      text: `Dear ${user[0].name},\n\nYou have successfully registered for ${event[0].purpose}. Your QR code data is: ${qrData}\n\nPlease present this QR code at the event.`,
    };
    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [userId, eventId, 'registration', 'sent']
    );
  } catch (error) {
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [userId, eventId, 'registration', 'failed']
    );
    throw new Error('Error sending registration email: ' + error.message);
  }
};

const sendAttendanceEmail = async (userId, eventId) => {
  try {
    const [user] = await pool.query('SELECT name, email FROM users WHERE id = ?', [userId]);
    const [event] = await pool.query('SELECT purpose FROM events WHERE id = ?', [eventId]);
    if (!user.length || !event.length) {
      throw new Error('User or event not found');
    }
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user[0].email,
      subject: `Attendance Recorded for ${event[0].purpose}`,
      text: `Dear ${user[0].name},\n\nYour attendance for ${event[0].purpose} has been recorded on ${new Date().toLocaleString()}.`,
    };
    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [userId, eventId, 'attendance', 'sent']
    );
  } catch (error) {
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [userId, eventId, 'attendance', 'failed']
    );
    throw new Error('Error sending attendance email: ' + error.message);
  }
};

module.exports = { sendRegistrationEmail, sendAttendanceEmail };