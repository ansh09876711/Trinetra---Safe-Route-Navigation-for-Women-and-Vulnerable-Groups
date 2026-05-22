const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixDb() {
  try {
    console.log("Checking users table...");
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20)');
    console.log("✅ Column 'mobile' added or already exists.");
    
    // Also check if any existing users need a dummy number for testing
    await pool.query("UPDATE users SET mobile = '+91 99999-88888' WHERE mobile IS NULL");
    console.log("✅ Updated existing users with dummy mobile.");
    
  } catch (err) {
    console.error("❌ Error fixing DB:", err.message);
  } finally {
    await pool.end();
  }
}

fixDb();
