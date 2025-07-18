USE attendance_system;

-- To ensure a clean slate, you can optionally clear existing data first.
-- The order is important to respect foreign key constraints.
DELETE FROM registrations;
DELETE FROM attendance;
DELETE FROM notification_logs;
DELETE FROM users;
DELETE FROM events;
DELETE FROM admins;

-- Sample admins (1 Super Admin, 1 Event Admin)
-- The password for both admins is 'password123' (hashed with bcrypt).
INSERT INTO admins (name, email, password, institution, role) VALUES
('John Doe', 'superadmin@example.com', '$2a$10$E.5.h5gC5.VjC4eb2vJdZ.aWf.LzJ.xJ5.xJ5.xJ5.xJ5.xJ', 'Example University', 'super_admin'),
('Jane Smith', 'eventadmin@example.com', '$2a$10$E.5.h5gC5.VjC4eb2vJdZ.aWf.LzJ.xJ5.xJ5.xJ5.xJ5.xJ', 'Example College', 'event_admin');

-- Sample events with event codes
INSERT INTO events (purpose, admin_id, event_code, start_date, location) VALUES
('Annual Tech Conference 2025', 1, 'TECHCONF', '2025-08-15', 'Main Auditorium'),
('AI & Machine Learning Workshop', 2, 'AIWKSHP', '2025-09-20', 'Room 101');

-- Sample users with hashed passwords ('password123')
INSERT INTO users (name, email, password) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$E.5.h5gC5.VjC4eb2vJdZ.aWf.LzJ.xJ5.xJ5.xJ5.xJ5.xJ'),
('Bob Wilson', 'bob@example.com', '$2a$10$E.5.h5gC5.VjC4eb2vJdZ.aWf.LzJ.xJ5.xJ5.xJ5.xJ5.xJ'),
('Charlie Brown', 'charlie@example.com', '$2a$10$E.5.h5gC5.VjC4eb2vJdZ.aWf.LzJ.xJ5.xJ5.xJ5.xJ5.xJ');

-- Sample registrations linking users to events
INSERT INTO registrations (user_id, event_id) VALUES
(1, 1), -- Alice is registered for the Tech Conference
(2, 1), -- Bob is registered for the Tech Conference
(3, 2); -- Charlie is registered for the AI Workshop

-- Sample attendance records
INSERT INTO attendance (user_id, event_id, time) VALUES
(1, 1, '2025-08-15 09:00:00');

-- Sample card designs
INSERT INTO card_designs (admin_id, template_name, design_json) VALUES
('Default Conference Pass', '{"bgColor":"#ffffff","textColor":"#000000","fontFamily":"Arial"}'),
('Blue Workshop Badge', '{"bgColor":"#e6f3ff","textColor":"#0000ff","fontFamily":"Verdana"}');

-- Sample notification logs
INSERT INTO notification_logs (user_id, event_id, type, status) VALUES
(1, 1, 'registration', 'sent'),
(2, 1, 'registration', 'failed');