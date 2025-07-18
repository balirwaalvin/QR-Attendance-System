CREATE DATABASE attendance_system;
USE attendance_system;

-- Admins table (for admin users with roles)
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  role ENUM('super_admin', 'event_admin') DEFAULT 'event_admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (for events/purposes created by admins)
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purpose VARCHAR(255) NOT NULL,
  admin_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Users table (for attendees registered for events)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table (records scanned QR codes)
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_id INT,
  time DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Card Designs table (stores card templates for QR codes)
CREATE TABLE card_designs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  template_name VARCHAR(255) NOT NULL,
  design_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Notification Logs table (tracks email notifications)
CREATE TABLE notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_id INT,
  type ENUM('registration', 'attendance') NOT NULL,
  status ENUM('sent', 'failed') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Create a junction table for registrations (Many-to-Many between Users and Events)
CREATE TABLE registrations (
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Add columns to events table for more details
ALTER TABLE events
  ADD COLUMN location VARCHAR(255) NULL,
  ADD COLUMN event_code VARCHAR(10) UNIQUE AFTER admin_id,
  ADD COLUMN start_date DATE NULL,
  ADD COLUMN end_date DATE NULL,
  ADD COLUMN start_time TIME NULL,
  ADD COLUMN end_time TIME NULL;

CREATE TABLE event_registration_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  registration_link VARCHAR(512) NOT NULL,
  qr_code LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Add optional profile fields to admins table
ALTER TABLE admins
  ADD COLUMN profile_photo_url VARCHAR(512) NULL,
  ADD COLUMN phone_number VARCHAR(25) NULL,
  ADD COLUMN job_title VARCHAR(255) NULL,
  ADD COLUMN linkedin_url VARCHAR(512) NULL,
  ADD COLUMN last_login TIMESTAMP NULL;

-- Add optional profile fields to users table
ALTER TABLE users
  ADD COLUMN profile_photo_url VARCHAR(512) NULL,
  ADD COLUMN phone_number VARCHAR(25) NULL,
  ADD COLUMN company VARCHAR(255) NULL,
  ADD COLUMN job_title VARCHAR(255) NULL;

drop TABLE users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
  ADD COLUMN password VARCHAR(255) NOT NULL,
  ADD COLUMN password_reset_token VARCHAR(255) NULL;

  CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_registration (user_id, event_id),  -- Prevent duplicate registrations
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Assuming you have a users table
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE  -- Assuming you have an events table
);

ALTER TABLE attendance MODIFY COLUMN event_id VARCHAR(50);
ALTER TABLE registrations MODIFY COLUMN event_id VARCHAR(50);
ALTER TABLE notification_logs MODIFY COLUMN event_id VARCHAR(50);