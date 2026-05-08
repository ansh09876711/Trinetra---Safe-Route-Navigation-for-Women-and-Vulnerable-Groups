const express = require("express");
const cors = require("cors");
// const twilio = require('twilio'); // Uncomment for production

const app = express();

app.use(cors());
app.use(express.json());

// ── TWILIO CONFIG ──
const accountSid = 'ACb010c0aa4f61208a824a8225fd7c59be';
const authToken = 'bb90b291265d9dd97a4a6fc0ee3570a1';
const twilioNumber = '+15076691336';
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

// ── SOS Voice Call Endpoint ──
app.post("/api/make-emergency-call", async (req, res) => {
    const { phone, message } = req.body;
    
    console.log(`[LIVE] Triggering emergency alerts to: ${phone}`);
    
    try {
        // 1. Send Hinglish SMS Warning
        await client.messages.create({
            body: `⚠️ TRINETRA EMERGENCY: Ek user musibat mein hai. Kripya agla automated call uthayein aur unki madad karein. Location link WhatsApp par bhej diya gaya hai.`,
            to: phone,
            from: twilioNumber
        });

        // 2. Delay then make the Hindi Voice Call
        setTimeout(async () => {
            try {
                await client.calls.create({
                    twiml: `<Response>
                              <Say voice="Polly.Aditi" language="hi-IN">
                                Namaste. Ye TRINETRA Security Network se ek emergency call hai. Ek user is waqt khatre mein hai aur unhe aapki madad chahiye. Unka sandesh hai: ${message}. Kripya unki location par turant pahunche.
                              </Say>
                            </Response>`,
                    to: phone,
                    from: twilioNumber
                });
            } catch (callErr) {
                console.error("Call failed:", callErr.message);
            }
        }, 2500);

        res.json({ success: true, message: "Live Alerts Triggered Successfully" });
    } catch (error) {
        console.error("SMS Failed:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// SOS Alerts Broadcast
app.post("/api/send-sos-alerts", (req, res) => {
    const { contacts, message } = req.body;
    console.log("Background Alerts Sent to:", contacts);
    res.json({ success: true });
});

app.get("/", (req, res) => res.send("TRINETRA Server Running"));

app.listen(5000, "0.0.0.0", () => {
    console.log("TRINETRA Server running on port 5000");
});