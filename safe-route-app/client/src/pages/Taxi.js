import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const NEARBY_TAXI_ZONES = [
  { id: 1, name: "New Market Main Stand", icon: "🚕", lat: 23.2599, lng: 77.4126, types: ["Uber", "Ola", "Auto"] },
  { id: 2, name: "Habibganj Metro Station", icon: "🚗", lat: 23.2333, lng: 77.4340, types: ["Uber", "Ola", "Rapido"] },
  { id: 3, name: "Railway Station Stand", icon: "🚕", lat: 23.2460, lng: 77.4350, types: ["Uber", "Ola", "Auto", "Rapido"] },
  { id: 4, name: "Kolar Road Stand", icon: "🚕", lat: 23.2520, lng: 77.4280, types: ["Ola", "Auto"] },
  { id: 5, name: "MP Nagar Zone 1", icon: "🚗", lat: 23.2470, lng: 77.4390, types: ["Uber", "Ola"] },
];

const calcDist = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const TAXI_APPS = [
  {
    id: 1,
    name: "Uber",
    icon: "🚗",
    color: "#000",
    bg: "rgba(0,0,0,0.5)",
    url: "https://m.uber.com",
    desc: "Available 24/7 in Bhopal",
  },
  {
    id: 2,
    name: "Ola",
    icon: "🚕",
    color: "#00ct4a",
    bg: "rgba(0,195,74,0.12)",
    url: "https://www.olacabs.com",
    desc: "Outstation & Local available",
  },
  {
    id: 3,
    name: "Rapido",
    icon: "🏍️",
    color: "#ffc200",
    bg: "rgba(255,194,0,0.12)",
    url: "https://www.rapido.bike",
    desc: "Bike & Auto available",
  },
  {
    id: 4,
    name: "Auto Rickshaw",
    icon: "🛺",
    color: "#f5a623",
    bg: "rgba(245,166,35,0.12)",
    url: "https://www.olacabs.com",
    desc: "Local city rides",
  },
];

const EMERGENCY_TIPS = [
  { icon: "📍", text: "Always share your ride details with a trusted contact before boarding." },
  { icon: "🔢", text: "Note down the vehicle number and driver's name before starting." },
  { icon: "🛡️", text: "Sit in the back seat. Keep windows slightly open." },
  { icon: "📱", text: "Keep your phone charged and emergency contacts accessible." },
  { icon: "🗺️", text: "Track your route on the map. If deviated, alert someone immediately." },
  { icon: "🆘", text: "If you feel unsafe, tap the SOS button — it will call your first contact." },
];

export default function Taxi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rideActive, setRideActive] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userPos, setUserPos] = useState(null);
  const [nearbyZones, setNearbyZones] = useState([]);

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userName = loggedInUser.name || "User";
  const userInitials = (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const posArr = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(posArr);
          const sorted = NEARBY_TAXI_ZONES
            .map(z => ({ ...z, dist: calcDist(posArr[0], posArr[1], z.lat, z.lng) }))
            .sort((a, b) => a.dist - b.dist);
          setNearbyZones(sorted);
        },
        () => setNearbyZones(NEARBY_TAXI_ZONES)
      );
    } else {
      setNearbyZones(NEARBY_TAXI_ZONES);
    }
  }, []);

  const shareRideDetails = () => {
    const text = `🚕 My Ride Details:\nApp: ${selectedApp?.name || "Taxi"}\nTime: ${new Date().toLocaleString("en-IN")}\n📍 Live Location: https://maps.google.com/?q=${23.2599},${77.4126}`;
    if (navigator.share) {
      navigator.share({ title: "My Ride", text });
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="nr-root" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .tx-panel { animation: slideUp 0.35s ease; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚕</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Safe Taxi</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>Ride safe</div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* ── DESKTOP: 2-col | MOBILE: stacked ── */}
      <div className="tx-grid" style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        flex: 1,
        minHeight: "calc(100vh - 57px)",
      }}>

        {/* ═══ LEFT — Book Ride ═══ */}
        <aside className="tx-panel" style={{
          background: "var(--bg2)", borderRight: "1px solid var(--border)",
          padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0,229,160,0.12), rgba(0,149,255,0.1))",
            border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 14, padding: "16px 14px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
              🚕 Book a Safe Ride
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
              Always verify your driver and share ride details with trusted contacts before boarding.
            </div>
          </div>

          {/* Nearby Pickup Zones */}
          <div>
            <div className="panel-title" style={{ marginBottom: 10 }}>📍 Nearby Pickup Zones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {nearbyZones.slice(0, 4).map((zone) => (
                <div key={zone.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px",
                  background: "var(--bg3)", border: "1px solid var(--border)",
                  borderRadius: 10, cursor: "default",
                }}>
                  <span style={{ fontSize: 20 }}>{zone.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{zone.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>
                      {zone.types.join(" · ")}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "'JetBrains Mono',monospace" }}>
                    {zone.dist !== undefined ? `${zone.dist.toFixed(1)}km` : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* App Selection */}
          <div>
            <div className="panel-title" style={{ marginBottom: 10 }}>Select Ride Type</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TAXI_APPS.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px",
                    background: selectedApp?.id === app.id ? app.bg : "var(--bg3)",
                    border: `2px solid ${selectedApp?.id === app.id ? app.color : "var(--border)"}`,
                    borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 28 }}>{app.icon}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: selectedApp?.id === app.id ? app.color : "var(--text)" }}>
                      {app.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{app.desc}</div>
                  </div>
                  {selectedApp?.id === app.id && (
                    <div style={{ fontSize: 16 }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Book Button */}
          {selectedApp && (
            <a
              href={selectedApp.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px",
                background: `linear-gradient(135deg, ${selectedApp.color}, ${selectedApp.color}cc)`,
                border: "none", borderRadius: 12,
                color: selectedApp.id === 1 ? "#fff" : selectedApp.id === 2 ? "#fff" : "#000",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                fontFamily: "inherit",
                boxShadow: `0 4px 16px ${selectedApp.color}44`,
              }}
            >
              Open {selectedApp.name} 🚀
            </a>
          )}

          {/* Share Ride */}
          {selectedApp && (
            <button
              onClick={shareRideDetails}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px",
                background: copied ? "rgba(0,229,160,0.15)" : "rgba(0,149,255,0.1)",
                border: `1px solid ${copied ? "rgba(0,229,160,0.3)" : "rgba(0,149,255,0.25)"}`,
                borderRadius: 10, color: copied ? "var(--accent)" : "#60b8ff",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {copied ? "✅ Copied to clipboard!" : "📤 Share Ride Details"}
            </button>
          )}

          {/* Active Ride Toggle */}
          <div style={{
            padding: "14px",
            background: rideActive ? "rgba(0,229,160,0.08)" : "var(--bg3)",
            border: `1px solid ${rideActive ? "rgba(0,229,160,0.25)" : "var(--border)"}`,
            borderRadius: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                🚗 Active Ride
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 11,
                background: rideActive ? "var(--accent)" : "var(--border)",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 0.2s",
              }}
                onClick={() => setRideActive(!rideActive)}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff",
                  position: "absolute", top: 3,
                  left: rideActive ? "unset" : 3,
                  right: rideActive ? 3 : "unset",
                  transition: "all 0.2s",
                }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>
              {rideActive
                ? "Ride tracking is active. Your location is being monitored."
                : "Enable to auto-share location with contacts during your ride."}
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT — Tips + Panic ═══ */}
        <main className="tx-panel" style={{
          background: "var(--bg)", padding: "20px", overflowY: "auto",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Safety Tips */}
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
                🛡️ Women's Ride Safety Tips
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {EMERGENCY_TIPS.map((tip, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "10px 12px",
                    background: "var(--bg3)", borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                    <span style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panic Button */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,45,45,0.15), rgba(200,0,0,0.1))",
              border: "2px solid rgba(255,77,77,0.3)",
              borderRadius: 14, padding: "24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 40 }}>🆘</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--danger)", marginBottom: 6 }}>
                  Emergency Panic
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
                  If you feel unsafe during a ride, tap the panic button.<br />
                  It will immediately call your first emergency contact and send your live location via SMS.
                </div>
              </div>
              <Link
                to="/sos"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #ff2d2d, #cc0000)",
                  border: "none", borderRadius: 12,
                  color: "#fff", fontSize: 14, fontWeight: 800,
                  textDecoration: "none", fontFamily: "inherit",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 20px rgba(255,45,45,0.4)",
                }}
              >
                🚨 TRIGGER PANIC — OPEN SOS
              </Link>
            </div>

            {/* Checklist */}
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
                ✅ Pre-Ride Checklist
              </div>
              {[
                "Share ride details with a trusted contact",
                "Verify driver name & vehicle number",
                "Keep phone charged above 50%",
                "Enable active ride tracking (left panel)",
                "Know the emergency SOS button location",
                "Keep emergency contacts accessible",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0", borderBottom: i < 5 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: "rgba(0,229,160,0.1)",
                    border: "1px solid rgba(0,229,160,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "var(--accent)", flexShrink: 0,
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav" style={{ display: "flex" }}>
        {[
          { to: "/", icon: "🏠", label: "Home" },
          { to: "/sos", icon: "🆘", label: "SOS" },
          { to: "/stations", icon: "🚉", label: "Stations" },
          { to: "/taxi", icon: "🚕", label: "Taxi", active: true },
          { to: "/profile", icon: "👤", label: "Profile" },
        ].map((tab) => (
          <Link key={tab.to} to={tab.to} className={`mob-tab ${tab.active ? "active" : ""}`} style={{ textDecoration: "none" }}>
            <span className="mob-tab-icon">{tab.icon}</span>
            <span className="mob-tab-label">{tab.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .tx-grid { display: flex !important; flex-direction: column !important; min-height: auto !important; padding-bottom: 70px !important; }
          .tx-grid > aside { order: 0; border-right: none !important; border-bottom: 1px solid var(--border); }
          .tx-grid > main { order: 1; min-height: 400px; }
          .mobile-bottom-nav { display: flex !important; }
        }
        @media (min-width: 901px) { .mobile-bottom-nav { display: none !important; } }
        .panel-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
      `}</style>
    </div>
  );
}
