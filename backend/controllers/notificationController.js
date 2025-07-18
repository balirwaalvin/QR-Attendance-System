const pool = require('../config/db'); // Import database connection
const transporter = require('../config/email'); // Import email transporter configuration
const qrcode = require('qrcode');

// A reusable function to send a registration confirmation email with a QR code.
const sendRegistrationConfirmation = async (user, event) => {
  const qrData = `userId:${user.id},eventId:${event.id}`;
  
  try {
    const qrImage = await qrcode.toDataURL(qrData);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Registration Confirmation for ${event.purpose}`,
      html: `
        <p>Dear ${user.name},</p>
        <p>You have successfully registered for <strong>${event.purpose}</strong>.</p>
        <p>Please present this QR code at the event for check-in:</p>
        <img src="${qrImage}" alt="Your Event QR Code" />
        <p>We look forward to seeing you there!</p>
      `,
      text: `Dear ${user.name},\n\nYou have successfully registered for ${event.purpose}. Your QR code data is: ${qrData}\n\nPlease present this QR code at the event.`,
    };

    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'registration', 'sent']
    );
    console.log(`Registration email sent to ${user.email} for event ${event.id}`);
  } catch (error) {
    console.error(`Failed to send registration email to ${user.email}:`, error);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'registration', 'failed']
    );
    // Do not re-throw the error, as the user registration itself was successful.
  }
};

// A reusable function to send an event reminder email.
const sendReminderEmail = async (user, event) => {
  const qrData = `userId:${user.id},eventId:${event.id}`;
  try {
    const qrImage = await qrcode.toDataURL(qrData);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Reminder: ${event.purpose}`,
      html: `
        <p>Dear ${user.name},</p>
        <p>This is a friendly reminder for the upcoming event: <strong>${event.purpose}</strong>.</p>
        <p>Date: ${new Date(event.start_date).toLocaleDateString()}</p>
        <p>Please present this QR code at the event for check-in:</p>
        <img src="${qrImage}" alt="Your Event QR Code" />
        <p>We look forward to seeing you there!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'reminder', 'sent']
    );
    console.log(`Reminder email sent to ${user.email} for event ${event.id}`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${user.email}:`, error);
    await pool.query('INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)', [user.id, event.id, 'reminder', 'failed']);
  }
};

// A reusable function to send an attendance confirmation email.
const sendAttendanceConfirmation = async (user, event) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Attendance Recorded for ${event.purpose}`,
      text: `Dear ${user.name},\n\nYour attendance for ${event.purpose} has been recorded on ${new Date().toLocaleString()}.`,
    };

    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'attendance', 'sent']
    );
    console.log(`Attendance email sent to ${user.email} for event ${event.id}`);
  } catch (error) {
    console.error(`Failed to send attendance email to ${user.email}:`, error);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'attendance', 'failed']
    );
  }
};

const getNotifications = async (req, res, next) => {
  const { id: adminId, role } = req.user;

  try {
    // super_admin can see all logs.
    // event_admin can only see logs for events they own.
    let query = `
      SELECT nl.id, nl.user_id, u.name as user_name, nl.event_id, e.purpose as event_name, nl.type, nl.status, nl.sent_at
      FROM notification_logs nl
      JOIN users u ON nl.user_id = u.id
      JOIN events e ON nl.event_id = e.id
    `;
    const queryParams = [];

    if (role === 'event_admin') {
      query += ' WHERE e.admin_id = ?';
      queryParams.push(adminId);
    }

    query += ' ORDER BY nl.sent_at DESC';

    const [notifications] = await pool.query(query, queryParams);
    res.json(notifications);
  } catch (error) {
    // Pass errors to the centralized error handler
    next(error);
  }
};

const resendNotification = async (req, res, next) => {
  const { id: notificationId } = req.params;
  const { id: adminId, role } = req.user;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Get the notification log and verify admin has permission
    const [logRows] = await connection.query(
      `SELECT nl.*, e.admin_id 
       FROM notification_logs nl
       JOIN events e ON nl.event_id = e.id
       WHERE nl.id = ?`,
      [notificationId]
    );

    if (logRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Notification log not found.' });
    }
    const log = logRows[0];

    // Authorization check
    if (role === 'event_admin' && log.admin_id !== adminId) {
      await connection.rollback();
      return res.status(403).json({ message: 'You are not authorized to manage this notification.' });
    }

    // 2. Get user and event details
    const [[user], [event]] = await Promise.all([
      connection.query('SELECT * FROM users WHERE id = ?', [log.user_id]),
      connection.query('SELECT * FROM events WHERE id = ?', [log.event_id]),
    ]);

    if (!user[0] || !event[0]) {
      await connection.rollback();
      return res.status(404).json({ message: 'Associated user or event not found.' });
    }

    // 3. Prepare email based on type
    let mailOptions;
    if (log.type === 'registration') {
      const qrData = `userId:${user[0].id},eventId:${event[0].id}`;
      const qrImage = await qrcode.toDataURL(qrData);
      mailOptions = {
        from: process.env.SMTP_USER,
        to: user[0].email,
        subject: `[Resent] Registration Confirmation for ${event[0].purpose}`,
        html: `<p>Dear ${user[0].name},</p><p>You have successfully registered for <strong>${event[0].purpose}</strong>.</p><p>Please present this QR code at the event for check-in:</p><img src="${qrImage}" alt="Your Event QR Code" /><p>We look forward to seeing you there!</p>`,
      };
    } else if (log.type === 'attendance') {
      mailOptions = {
        from: process.env.SMTP_USER,
        to: user[0].email,
        subject: `[Resent] Attendance Recorded for ${event[0].purpose}`,
        text: `Dear ${user[0].name},\n\nYour attendance for ${event[0].purpose} has been recorded on ${new Date().toLocaleString()}.`,
      };
    } else {
      throw new Error('Unknown notification type.');
    }

    // 4. Attempt to send email and update the log
    await transporter.sendMail(mailOptions);
    await connection.query("UPDATE notification_logs SET status = 'sent', sent_at = NOW() WHERE id = ?", [notificationId]);

    await connection.commit();
    res.json({ message: 'Notification resent successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    // Pass errors to the centralized error handler
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

const sendAttendanceReminders = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { id: adminId, role } = req.user;

  try {
    // 1. Fetch event and verify admin ownership
    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    if (role === 'event_admin' && event.admin_id !== adminId) {
      return res.status(403).json({ message: 'You are not authorized to send reminders for this event.' });
    }

    // 2. Get all registered users for the event
    const [registeredUsers] = await pool.query(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN registrations r ON u.id = r.user_id
       WHERE r.event_id = ?`,
      [eventId]
    );

    // 3. Get all users who have already attended
    const [attendedUsers] = await pool.query('SELECT DISTINCT user_id FROM attendance WHERE event_id = ?', [eventId]);
    const attendedUserIds = new Set(attendedUsers.map(u => u.user_id));

    // 4. Filter out users who have already attended
    const usersToRemind = registeredUsers.filter(user => !attendedUserIds.has(user.id));

    if (usersToRemind.length === 0) {
      return res.json({ message: 'No users to remind. Everyone registered has already attended or there are no registrations.' });
    }

    // 5. Send emails in parallel
    const reminderPromises = usersToRemind.map(user => sendReminderEmail(user, event));
    await Promise.all(reminderPromises);

    res.json({ message: `Successfully sent ${usersToRemind.length} reminder emails.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendRegistrationConfirmation, sendAttendanceConfirmation, getNotifications, resendNotification, sendAttendanceReminders };