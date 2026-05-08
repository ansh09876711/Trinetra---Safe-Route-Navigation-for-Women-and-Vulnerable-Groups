const express = require("express");
const cors = require("cors");

const app = express();

// Standard CORS for development
app.use(cors());

app.use(express.json());

// Main route
app.get("/", (req, res) => {
  res.send("TRINETRA Backend is ONLINE.");
});

// Fix for 500 errors - correctly structured stubs
app.get("/saved-places/:id", (req, res) => {
  res.json({ success: true, places: [] });
});

app.get("/alert", (req, res) => {
  res.json({ success: true, alerts: [] });
});

app.get("/reports", (req, res) => {
  res.json({ success: true, reports: [] });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));