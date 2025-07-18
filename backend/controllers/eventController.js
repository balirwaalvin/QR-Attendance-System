const pool = require('../config/db');
const { generateQRCode } = require('../utils/qrCode');

const generateEventCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createEvent = async (req, res, next) => {
  const { purpose, startDate, endDate, location, startTime, endTime } = req.body;
  const adminId = req.user.id; // Injected by authMiddleware

  if (!purpose) {
    return res.status(400).json({ message: 'Event purpose is required.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Generate a unique event code
    let eventCode;
    let isCodeUnique = false;
    while (!isCodeUnique) {
      eventCode = generateEventCode();
      const [existingEvent] = await connection.query('SELECT id FROM events WHERE event_code = ?', [eventCode]);
      if (existingEvent.length === 0) {
        isCodeUnique = true;
      }
    }

    // 2. Insert the event with the event code
    const [result] = await connection.query(
      'INSERT INTO events (purpose, start_date, end_date, location, admin_id, start_time, end_time, event_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [purpose, startDate || null, endDate || null, location || null, adminId, startTime || null, endTime || null, eventCode]
    );
    const eventId = result.insertId;

    // 3. Generate registration link and QR code for the link
    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/user-register?eventCode=${eventCode}`;
    const qrCode = await generateQRCode(registrationLink);

    // 4. Store registration link and QR code in event_registration_links
    await connection.query(
      'INSERT INTO event_registration_links (event_id, registration_link, qr_code) VALUES (?, ?, ?)',
      [eventId, registrationLink, qrCode]
    );

    await connection.commit();
    console.log('Event registration link:', registrationLink);
    res.status(201).json({ message: 'Event created successfully', eventId, eventCode, registrationLink, qrCode });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error); // Pass to centralized error handler
  } finally {
    if (connection) connection.release();
  }
};

const getEvents = async (req, res, next) => {
  const { id: adminId, role } = req.user; // Injected by authMiddleware

  try {
    let query = 'SELECT id, purpose, event_code, start_date, end_date, location, start_time, end_time FROM events';
    const queryParams = [];

    // Scope events to the admin unless they are a super_admin
    if (role !== 'super_admin') {
      query += ' WHERE admin_id = ?';
      queryParams.push(adminId);
    }

    query += ' ORDER BY start_date DESC, id DESC';

    const [events] = await pool.query(query, queryParams);
    res.json(events);
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

const getEventById = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { id: adminId, role } = req.user;

  try {
    // 1. Fetch the event and verify ownership
    const [eventRows] = await pool.query(
      'SELECT id, purpose, event_code, start_date, end_date, location, start_time, end_time, admin_id FROM events WHERE id = ?',
      [eventId]
    );
    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    // Authorization check: only the creating admin or a super_admin can view
    if (event.admin_id !== adminId && role !== 'super_admin') {
      return res.status(403).json({ message: 'You are not authorized to view this event.' });
    }

    // 2. Fetch registered users for this event
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN registrations r ON u.id = r.user_id
       WHERE r.event_id = ? ORDER BY u.name ASC`,
      [eventId]
    );

    // 3. Combine and send the response
    res.json({ ...event, users });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

const getEventByCode = async (req, res, next) => {
  const { eventCode } = req.params;
  try {
    // Select only the necessary public-facing details for the registration form
    const [eventRows] = await pool.query(
      'SELECT purpose, start_date, end_date, location FROM events WHERE event_code = ?',
      [eventCode]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found for this code.' });
    }

    res.json(eventRows[0]);
  } catch (error) {
    // Pass errors to the centralized error handler
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { id: adminId, role } = req.user;

  try {
    // 1. Fetch the event to verify ownership before deleting
    const [eventRows] = await pool.query('SELECT admin_id FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    // 2. Authorization check: only the creating admin or a super_admin can delete
    if (event.admin_id !== adminId && role !== 'super_admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this event.' });
    }

    // 3. Delete the event (ON DELETE CASCADE/SET NULL will handle related records)
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

const updateEvent = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { id: adminId, role } = req.user;
  const { purpose, startDate, endDate, location, startTime, endTime } = req.body;

  if (!purpose) {
    return res.status(400).json({ message: 'Event purpose is required.' });
  }

  try {
    // 1. Fetch the event to verify ownership before updating
    const [eventRows] = await pool.query('SELECT admin_id FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    // 2. Authorization check: only the creating admin or a super_admin can update
    if (event.admin_id !== adminId && role !== 'super_admin') {
      return res.status(403).json({ message: 'You are not authorized to edit this event.' });
    }

    // 3. Update the event
    await pool.query(
      'UPDATE events SET purpose = ?, start_date = ?, end_date = ?, location = ?, start_time = ?, end_time = ? WHERE id = ?',
      [purpose, startDate || null, endDate || null, location || null, startTime || null, endTime || null, eventId]
    );

    res.json({ message: 'Event updated successfully.' });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

const regenerateEventQRCode = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { id: adminId, role } = req.user;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Fetch the event to verify ownership and get event_code
    const [eventRows] = await connection.query('SELECT admin_id, event_code FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    // 2. Authorization check
    if (event.admin_id !== adminId && role !== 'super_admin') {
      await connection.rollback();
      return res.status(403).json({ message: 'You are not authorized to modify this event.' });
    }

    // 3. Generate new registration link and QR code
    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/user-register?eventCode=${event.event_code}`;
    const newQrCode = await generateQRCode(registrationLink);

    // 4. Update the QR code in the event_registration_links table
    await connection.query(
      'UPDATE event_registration_links SET qr_code = ? WHERE event_id = ?',
      [newQrCode, eventId]
    );

    await connection.commit();
    res.json({ message: 'QR Code regenerated successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error); // Pass to centralized error handler
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { createEvent, getEvents, getEventById, getEventByCode, deleteEvent, updateEvent, regenerateEventQRCode };