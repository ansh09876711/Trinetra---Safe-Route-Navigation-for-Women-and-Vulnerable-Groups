import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const STEPS = [
  {
    id: 1, icon: "📱", color: "#00e5a0", bg: "rgba(0,229,160,0.12)", border: "rgba(0,229,160,0.3)",
    title: "Register / Login",
    desc: "Create your TRINETRA account with your name, email & phone. Takes less than 2 minutes.",
    sub: ["Fill your name & phone", "Set a secure password", "Verify your mobile number"],
    link: "/register", linkLabel: "Register Now →",
  },
  {
    id: 2, icon: "👥", color: "#4285F4", bg: "rgba(66,133,244,0.12)", border: "rgba(66,133,244,0.3)",
    title: "Add Trusted Contacts",
    desc: "Add family members or friends who will be auto-alerted during emergencies.",
    sub: ["Add up to 5 contacts", "Save emergency SMS message", "Contacts get live location link"],
    link: "/sos", linkLabel: "Manage Contacts →",
  },
  {
    id: 3, icon: "📍", color: "#fbbc04", bg: "rgba(251,188,4,0.12)", border: "rgba(251,188,4,0.3)",
    title: "Enable GPS & Dashboard",
    desc: "Allow location access. Your live position appears on the interactive safety map.",
    sub: ["Real-time GPS tracking", "View safe/danger zones", "Offline map tiles cached"],
    link: "/dashboard", linkLabel: "Open Dashboard →",
  },
  {
    id: 4, icon: "🗺️", color: "#0095ff", bg: "rgba(0,149,255,0.12)", border: "rgba(0,149,255,0.3)",
    title: "Navigate Safely",
    desc: "Get turn-by-turn voice navigation avoiding high-risk areas. Works offline too.",
    sub: ["Search any destination", "Voice-guided directions", "Safe route algorithm"],
    link: "/dashboard", linkLabel: "Start Navigation →",
  },
  {
    id: 5, icon: "🚉", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)",
    title: "Find Nearby Safe Stations",
    desc: "Instantly see police stations, hospitals & fire stations near your current location.",
    sub: ["Sorted by distance", "Real data from OpenStreetMap", "Call or SMS directly"],
    link: "/stations", linkLabel: "View Stations →",
  },
  {
    id: 6, icon: "🆘", color: "#ff4d4d", bg: "rgba(255,77,77,0.12)", border: "rgba(255,77,77,0.3)",
    title: "SOS Emergency Alert",
    desc: "One tap (or shake your phone) to send live location SMS to all trusted contacts.",
    sub: ["Shake-to-SOS gesture", "Auto calls first contact", "Police siren sound plays"],
    link: "/sos", linkLabel: "SOS Setup →",
  },
  {
    id: 7, icon: "🚕", color: "#ff8c00", bg: "rgba(255,140,0,0.12)", border: "rgba(255,140,0,0.3)",
    title: "Book Safe Taxi",
    desc: "Find verified, TRINETRA-rated taxi drivers with tracked rides and shared trip links.",
    sub: ["Verified driver profiles", "Share ride with contacts", "Rate driver after trip"],
    link: "/taxi", linkLabel: "Book Taxi →",
  },
  {
    id: 8, icon: "📊", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)",
    title: "Safety Analytics",
    desc: "View your safety history, SOS logs, and route patterns. Stay informed.",
    sub: ["SOS & trip history", "Safety score trends", "Area risk heatmap"],
    link: "/analytics", linkLabel: "View Analytics →",
  },
];

const CONNECTIONS = [
  { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
  { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 },
];

export default function HowItWorks() {
  const [visible, setVisible] = useState(new Set());
  const [activeStep, setActiveStep] = useState(null);

  useEffect(() => {
    // Stagger reveal each card
    STEPS.forEach((s, i) => {
      setTimeout(() => setVisible(prev => new Set([...prev, s.id])), 150 + i * 120);
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #06080d)",
      color: "var(--text, #e8eaf0)",
      fontFamily: "'Inter', 'Space Grotesk', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
        :root { --bg:#06080d; --bg2:#0d1117; --bg3:#161b22; --text:#e8eaf0; --text2:#9ca3b0; --text3:#5c6370; --accent:#00e5a0; --border:rgba(255,255,255,0.08); }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.4);opacity:0.6;} }
        @keyframes flow { 0%{stroke-dashoffset:200;} 100%{stroke-dashoffset:0;} }
        .hiw-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .hiw-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .connector-line { stroke-dasharray: 200; stroke-dashoffset: 200; animation: flow 1s ease forwards; }
        @media (max-width: 700px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
          .hiw-connector { display: none !important; }
        }
      `}</style>

      {/* Topbar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,8,13,0.9)", backdropFilter: "blur(20px)",
      }}>
        <Link to="/" style={{ textDecoration: "none" }}><Logo height={28} /></Link>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "none", color: "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "inherit",
            }}>← Back</button>
          </Link>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: "var(--accent)", color: "#06080d", cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            }}>Get Started →</button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "72px 24px 48px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 99,
          background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
          fontSize: 12, color: "var(--accent)", fontWeight: 600,
          marginBottom: 24, letterSpacing: "0.05em",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: "pulse-dot 1.5s infinite", display: "inline-block" }} />
          PLATFORM WALKTHROUGH
        </div>
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15,
          background: "linear-gradient(135deg, #e8eaf0 0%, #00e5a0 60%, #0095ff 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 20,
        }}>
          How TRINETRA Works
        </h1>
        <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
          A complete step-by-step guide to every feature — from registration to real-time SOS emergency response.
        </p>
      </section>

      {/* Flowchart */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>

        {/* Flow legend */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20, marginBottom: 48,
          justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { color: "#00e5a0", label: "Setup" },
            { color: "#4285F4", label: "Safety Layer" },
            { color: "#ff4d4d", label: "Emergency" },
            { color: "#06b6d4", label: "Analytics" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 12, color: "var(--text3)" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Steps Grid */}
        <div className="hiw-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
          position: "relative",
        }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{
              opacity: visible.has(step.id) ? 1 : 0,
              transform: visible.has(step.id) ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
            }}>
              <div
                className="hiw-card"
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeStep === step.id ? step.border : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 20, padding: "28px",
                  cursor: "pointer", position: "relative",
                  boxShadow: activeStep === step.id ? `0 0 40px ${step.bg}` : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Step number */}
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  fontSize: 11, fontWeight: 700, color: "var(--text3)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {String(step.id).padStart(2, "0")}
                </div>

                {/* Arrow connector to next */}
                {i < STEPS.length - 1 && (
                  <div className="hiw-connector" style={{
                    position: "absolute", bottom: -13, left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    width: 24, height: 24,
                    background: "var(--bg2)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "var(--text3)",
                  }}>
                    {i % 2 === 1 ? "↓" : "→"}
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: step.bg, border: `1px solid ${step.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, marginBottom: 16,
                }}>
                  {step.icon}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 17, fontWeight: 700, color: "var(--text)",
                  marginBottom: 8,
                }}>{step.title}</h3>

                {/* Description */}
                <p style={{
                  fontSize: 13, color: "var(--text2)", lineHeight: 1.65, marginBottom: 16,
                }}>{step.desc}</p>

                {/* Sub-features */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {step.sub.map((s, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text3)" }}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Link */}
                <Link to={step.link} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 600, color: step.color,
                    padding: "6px 14px",
                    background: step.bg, border: `1px solid ${step.border}`,
                    borderRadius: 8,
                    transition: "opacity 0.2s",
                  }}>
                    {step.linkLabel}
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* End node */}
        <div style={{
          marginTop: 56, textAlign: "center",
          padding: "48px 32px",
          background: "linear-gradient(135deg, rgba(0,229,160,0.06), rgba(0,149,255,0.06))",
          border: "1px solid rgba(0,229,160,0.15)",
          borderRadius: 24,
          maxWidth: 640, marginLeft: "auto", marginRight: "auto",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛡️</div>
          <h2 style={{
            fontSize: 24, fontWeight: 800,
            background: "linear-gradient(135deg, #00e5a0, #0095ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 12,
          }}>You're Fully Protected</h2>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 28 }}>
            TRINETRA runs 24/7 in the background — monitoring, protecting, and ready to respond in any emergency.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "12px 28px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #00e5a0, #0095ff)",
                color: "#06080d", fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "inherit",
              }}>🚀 Get Started Free</button>
            </Link>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "12px 28px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text2)", fontWeight: 600, fontSize: 14,
                cursor: "pointer", fontFamily: "inherit",
              }}>🗺️ Open Dashboard</button>
            </Link>
          </div>
        </div>

        {/* Feature Summary Table */}
        <div style={{ marginTop: 72 }}>
          <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 32 }}>
            All Features at a Glance
          </h2>
          <div style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, overflow: "hidden",
          }}>
            {[
              { feature: "Live GPS Tracking", desc: "Real-time position on interactive map", status: "✅ Active", link: "/dashboard" },
              { feature: "Voice Navigation", desc: "Turn-by-turn audio directions", status: "✅ Active", link: "/dashboard" },
              { feature: "SOS Emergency", desc: "Shake or tap to alert contacts", status: "✅ Active", link: "/sos" },
              { feature: "Police Siren", desc: "Loud deterrent sound on your phone", status: "✅ Active", link: "/sos" },
              { feature: "Safe Stations", desc: "Nearby police, hospitals, fire stations", status: "✅ Active", link: "/stations" },
              { feature: "Safe Taxi", desc: "Verified drivers with trip tracking", status: "✅ Active", link: "/taxi" },
              { feature: "Safety Analytics", desc: "History, trends & safety score", status: "✅ Active", link: "/analytics" },
              { feature: "Offline Map", desc: "Map tiles cached for offline use", status: "✅ Active", link: "/dashboard" },
              { feature: "Shake-to-SOS", desc: "Hardware gesture emergency trigger", status: "✅ Active", link: "/sos" },
              { feature: "Trusted Contacts", desc: "Emergency contact management", status: "✅ Active", link: "/sos" },
            ].map((row, i) => (
              <Link key={i} to={row.link} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderBottom: i < 9 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  transition: "background 0.2s",
                  flexWrap: "wrap", gap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{row.feature}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>{row.desc}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#00e5a0", fontWeight: 600 }}>{row.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
