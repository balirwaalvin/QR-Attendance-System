const pool = require('../config/db'); // Import database connection
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const fs = require('fs').promises;

// User registration controller
const registerUser = async (req, res) => {
  const { name, email, password, eventCode } = req.body;

  // 1. Input validation
  if (!name || !email || !password || !eventCode) {
    return res.status(400).json({ message: 'Name, email, password, and event code are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  // TODO: Add password strength validation here to match the admin registration.

  let connection;
  try {
    // Use a transaction for data integrity
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 2. Check if the event exists using the event code
    const [eventRows] = await connection.query('SELECT id FROM events WHERE event_code = ?', [eventCode]);
    if (eventRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Event not found for the provided code.' });
    }
    const eventId = eventRows[0].id;

    // 3. Check if user exists by email. If not, create one.
    let [users] = await connection.query('SELECT id, password FROM users WHERE email = ?', [email]);
    let userId;

    if (users.length > 0) {
      // User exists, validate their password before adding a new event registration.
      const user = users[0];
      const isMatch = await bcryptjs.compare(password, user.password);

      if (!isMatch) {
        // The password provided does not match the existing account's password.
        await connection.rollback();
        // Using 409 Conflict as it's a conflict with an existing resource's state (the password).
        return res.status(409).json({ message: 'An account with this email already exists, but the password was incorrect. Please try again with the correct password.' });
      }
      userId = user.id;
    } else {
      // User does not exist, create a new user.
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const [newUserResult] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      userId = newUserResult.insertId;
    }

    // 4. Check if the user is already registered for this specific event
    const [registrations] = await connection.query(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (registrations.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'You are already registered for this event.' });
    }

    // 5. Register the user for the event in the junction table
    await connection.query(
      'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)',
      [userId, eventId]
    );

    // Commit the transaction
    await connection.commit();

    res.status(201).json({ message: 'Registration successful! You can now log in.' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('User registration error:', error);
    // Handle potential duplicate email error if a race condition occurs
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'An internal error occurred during registration.' });
  } finally {
    if (connection) connection.release();
  }
};

// User login controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    // 1. Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = users[0];

    // 2. Compare password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Get user's registered events
    const [events] = await pool.query(
      `SELECT e.id, e.purpose, e.start_date, e.location 
       FROM events e
       JOIN registrations r ON e.id = r.event_id
       WHERE r.user_id = ?`,
      [user.id]
    );

    // 4. Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        name: user.name, // Ensure 'name' is selected in the query
        email: user.email,
      },
    };

    // 5. Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { ...payload.user, events } });
      }
    );
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Import users from a file and register them for events
const importUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const usersToImport = xlsx.utils.sheet_to_json(sheet);

    if (usersToImport.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'The uploaded file is empty or in an invalid format.' });
    }

    const errors = [];
    let successfulImports = 0;

    for (const [index, row] of usersToImport.entries()) {
      const { email, eventCode } = row;
      const rowNum = index + 2; // For user-friendly error messages (assuming header row)

      if (!email || !eventCode) {
        errors.push(`Row ${rowNum}: Missing required columns (email, eventCode).`);
        continue;
      }

      // Find user by email
      const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        errors.push(`Row ${rowNum}: User with email '${email}' not found. Please ask the user to register first.`);
        continue;
      }
      const userId = users[0].id;

      // Find event by eventCode
      const [events] = await connection.query('SELECT id FROM events WHERE event_code = ?', [eventCode]);
      if (events.length === 0) {
        errors.push(`Row ${rowNum}: Event with code '${eventCode}' not found.`);
        continue;
      }
      const eventId = events[0].id;

      // Check for existing registration to avoid duplicates
      const [registrations] = await connection.query('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
      if (registrations.length > 0) continue; // Skip if already registered

      // Create the registration
      await connection.query('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)', [userId, eventId]);
      successfulImports++;
    }

    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Import failed due to validation errors. No users were imported.', errors });
    }

    await connection.commit();
    res.status(201).json({ message: `${successfulImports} new user registrations were imported successfully.` });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('User import error:', error);
    res.status(500).json({ message: 'An internal error occurred during user import.' });
  } finally {
    if (connection) connection.release();
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(err => console.error("Error deleting uploaded file:", err));
    }
  }
};

// Get events for the logged-in user
const getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const [events] = await pool.query(
      `SELECT e.id, e.purpose, e.start_date, e.end_date, e.location
       FROM events e
       JOIN registrations r ON e.id = r.event_id
       WHERE r.user_id = ?`,
      [userId]
    );
    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Failed to fetch user events.' });
  }
};

module.exports = { registerUser, loginUser, importUsers, getUserEvents };