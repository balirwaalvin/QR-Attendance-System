require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../config/db');
const { generateQRCode } = require('../utils/qrCode');

// This function is a copy of the one in your eventController.js
const generateEventCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const backfillEventData = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Database connected. Starting backfill process...');

    // Find all events that are missing an event_code
    const [eventsToUpdate] = await connection.query('SELECT id FROM events WHERE event_code IS NULL');

    if (eventsToUpdate.length === 0) {
      console.log('All events already have an event_code. No action needed.');
      return;
    }

    console.log(`Found ${eventsToUpdate.length} events to update.`);
    await connection.beginTransaction();

    for (const event of eventsToUpdate) {
      const eventId = event.id;
      let eventCode;
      let isCodeUnique = false;

      // Generate a unique event code, ensuring it doesn't already exist
      while (!isCodeUnique) {
        eventCode = generateEventCode();
        const [existingEvent] = await connection.query('SELECT id FROM events WHERE event_code = ?', [eventCode]);
        if (existingEvent.length === 0) {
          isCodeUnique = true;
        }
      }

      // 1. Update the event with the new unique code
      await connection.query('UPDATE events SET event_code = ? WHERE id = ?', [eventCode, eventId]);
      console.log(`- Updated event ID ${eventId} with code ${eventCode}`);

      // 2. Generate registration link and QR code data
      const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/user-register?eventCode=${eventCode}`;
      const qrCode = await generateQRCode(registrationLink);

      // 3. Insert/update the registration link and QR code
      await connection.query(
        'INSERT INTO event_registration_links (event_id, registration_link, qr_code) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE registration_link = VALUES(registration_link), qr_code = VALUES(qr_code)',
        [eventId, registrationLink, qrCode]
      );
      console.log(`  - Created/Updated registration link for event ID ${eventId}.`);
    }

    await connection.commit();
    console.log('\nSuccessfully backfilled all events with unique codes and registration links.');
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('\nAn error occurred during the backfill process:', error);
  } finally {
    if (connection) connection.release();
    await pool.end(); // Close the pool to allow the script to exit
    console.log('Database connection pool closed.');
  }
};

backfillEventData();