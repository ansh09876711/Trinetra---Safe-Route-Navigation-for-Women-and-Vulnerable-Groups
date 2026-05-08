-- Add user_id to alerts table
ALTER TABLE alerts ADD COLUMN user_id INT REFERENCES users(id);

-- Add user_id to routes table
ALTER TABLE routes ADD COLUMN user_id INT REFERENCES users(id);

-- If you haven't created the alerts table with correct columns yet:
-- CREATE TABLE alerts (
--   id SERIAL PRIMARY KEY,
--   type TEXT,
--   location TEXT,
--   message TEXT,
--   contacts_notified INT,
--   user_id INT REFERENCES users(id),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
