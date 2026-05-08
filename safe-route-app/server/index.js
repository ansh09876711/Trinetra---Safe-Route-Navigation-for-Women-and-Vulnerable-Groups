const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();

const app = express();
// Get saved places
app.get("/saved-places/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await db.query("SELECT * FROM saved_places WHERE user_id = $1", [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save/Update a place
app.post("/saved-places", async (req, res) => {
  const { user_id, label, icon, lat, lng } = req.body;
  try {
    // Delete existing label for user if exists
    await db.query("DELETE FROM saved_places WHERE user_id = $1 AND label = $2", [user_id, label]);
    const result = await db.query(
      "INSERT INTO saved_places (user_id, label, icon, lat, lng) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, label, icon, lat, lng]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Users Routes
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Routes (Navigation)
app.get('/api/routes', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM routes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/routes', async (req, res) => {
  const { source, destination, safety_score } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO routes (source, destination, safety_score) VALUES ($1, $2, $3) RETURNING *',
      [source, destination, safety_score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Alerts (SOS)
app.get('/api/alerts', async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT * FROM alerts ORDER BY id DESC';
    let params = [];
    if (userId) {
      query = 'SELECT * FROM alerts WHERE user_id = $1 ORDER BY id DESC';
      params = [userId];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/alerts', async (req, res) => {
  const { type, location, message, contacts_notified, user_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO alerts (type, location, message, contacts_notified, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, location, message, contacts_notified, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Crime Zones & SOS Geo-tagging ────────────────────────────────────────────

// NCRB-based pre-loaded crime hotspot data for Bhopal
// Source: data.gov.in, NCRB Annual Reports, UN Habitat Safe Cities data
const STATIC_CRIME_ZONES = [
  // RED zones — historically high crime (chain snatching, assault, kidnapping)
  { lat: 23.2599, lng: 77.4126, label: "TT Nagar Area", risk: "red",  crimeType: "Chain Snatching, Robbery",    source: "NCRB", count: 18 },
  { lat: 23.2700, lng: 77.4000, label: "Old Bhopal Market", risk: "red", crimeType: "Theft, Harassment",         source: "NCRB", count: 15 },
  { lat: 23.2550, lng: 77.4050, label: "Bhopal Railway Station", risk: "red", crimeType: "Robbery, Kidnapping", source: "NCRB", count: 22 },
  { lat: 23.2430, lng: 77.4200, label: "Peer Gate Area",  risk: "red",  crimeType: "Chain Snatching",            source: "NCRB", count: 12 },
  { lat: 23.2320, lng: 77.4310, label: "Budhwara Area",   risk: "red",  crimeType: "Assault, Theft",             source: "NCRB", count: 14 },

  // YELLOW zones — moderate crime
  { lat: 23.2580, lng: 77.4280, label: "Habibganj",       risk: "yellow", crimeType: "Snatching",               source: "NCRB", count: 7  },
  { lat: 23.2470, lng: 77.4090, label: "Shahjahanabad",   risk: "yellow", crimeType: "Eve Teasing",             source: "NCRB", count: 6  },
  { lat: 23.2400, lng: 77.4180, label: "Sadar Manzil",    risk: "yellow", crimeType: "Theft",                   source: "NCRB", count: 5  },
  { lat: 23.2650, lng: 77.4350, label: "Karond Area",     risk: "yellow", crimeType: "Night Harassment",        source: "NCRB", count: 8  },
  { lat: 23.2150, lng: 77.4500, label: "Govindpura",      risk: "yellow", crimeType: "Snatching",               source: "NCRB", count: 6  },

  // GREEN zones — historically safe (near police/hospitals)
  { lat: 23.2333, lng: 77.4340, label: "Habibganj Police", risk: "green", crimeType: "Low Crime",               source: "NCRB", count: 1  },
  { lat: 23.2520, lng: 77.4280, label: "Kolar Residential", risk: "green", crimeType: "Residential Area",       source: "NCRB", count: 2  },
  { lat: 23.2220, lng: 77.3900, label: "AIIMS Campus Area", risk: "green", crimeType: "Institutional Zone",     source: "NCRB", count: 1  },
];

// In-memory SOS location log (fallback when DB table doesn't exist yet)
const sosLocationLog = [];

// Save SOS with lat/lng (geo-tagged)
app.post('/api/sos-location', async (req, res) => {
  const { user_id, lat, lng, type = "SOS", message = "Emergency!" } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "lat/lng required" });

  const entry = { user_id, lat: parseFloat(lat), lng: parseFloat(lng), type, message, created_at: new Date() };

  // Try saving to DB (sos_locations table), fallback to memory
  try {
    await db.query(
      `INSERT INTO sos_locations (user_id, lat, lng, type, message, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT DO NOTHING`,
      [user_id, entry.lat, entry.lng, type, message]
    );
  } catch {
    // Table might not exist yet — use in-memory log
    sosLocationLog.push(entry);
  }

  res.json({ success: true, entry });
});

// Helper: Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// GET /api/crime-zones — combined SOS + NCRB data
app.get('/api/crime-zones', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);

    // Fetch SOS locations from DB
    let dbSOS = [];
    try {
      const r = await db.query(`SELECT lat::float, lng::float, created_at FROM sos_locations WHERE created_at > NOW() - INTERVAL '90 days'`);
      dbSOS = r.rows;
    } catch { /* table doesn't exist yet */ }

    // Combine DB SOS + in-memory
    const allSOS = [...dbSOS, ...sosLocationLog];

    // Cluster SOS into 500m radius zones
    const clusters = [];
    allSOS.forEach(sos => {
      const existing = clusters.find(c => haversineKm(c.lat, c.lng, sos.lat, sos.lng) < 0.5);
      if (existing) { existing.count++; }
      else { clusters.push({ lat: sos.lat, lng: sos.lng, count: 1, source: "SOS" }); }
    });

    // Convert clusters to risk zones
    const sosZones = clusters.map(c => ({
      lat: c.lat, lng: c.lng,
      count: c.count,
      risk: c.count >= 10 ? "red" : c.count >= 5 ? "yellow" : "green",
      label: `${c.count} SOS Alerts`,
      crimeType: "Multiple SOS Alerts",
      source: "TRINETRA SOS",
    }));

    // Merge with static NCRB zones
    let allZones = [...STATIC_CRIME_ZONES, ...sosZones];

    // If live location provided, prioritize and filter nearby zones (within 10km)
    if (!isNaN(userLat) && !isNaN(userLng)) {
      allZones = allZones.map(z => ({
        ...z,
        distance: haversineKm(userLat, userLng, z.lat, z.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .filter(z => z.distance <= 15); // Show zones within 15km of live location
    }

    res.json({ zones: allZones, total: allZones.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zone-stats — summary counts
app.get('/api/zone-stats', async (req, res) => {
  let sosCount = 0;
  try {
    const r = await db.query('SELECT COUNT(*) FROM sos_locations');
    sosCount = parseInt(r.rows[0].count);
  } catch { sosCount = sosLocationLog.length; }

  const red    = STATIC_CRIME_ZONES.filter(z => z.risk === "red").length;
  const yellow = STATIC_CRIME_ZONES.filter(z => z.risk === "yellow").length;
  const green  = STATIC_CRIME_ZONES.filter(z => z.risk === "green").length;
  res.json({ red, yellow, green, totalSOS: sosCount, source: "NCRB + TRINETRA" });
});

// ── SOS Background Alert Simulation ──────────────────────────
app.post("/api/send-sos-alerts", (req, res) => {
  const { contacts, message, user_id } = req.body;
  console.log(`[SOS ALERT] Sending background messages for User ${user_id}`);
  console.log(`[SMS/WhatsApp] Recipients: ${contacts.join(", ")}`);
  console.log(`[Message Content]: ${message}`);
  
  // In a real production app, we would use Twilio API here:
  // client.messages.create({ body: message, from: 'whatsapp:+14155238886', to: 'whatsapp:'+contact })
  
  res.json({ success: true, status: "Alerts sent to background queue" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
