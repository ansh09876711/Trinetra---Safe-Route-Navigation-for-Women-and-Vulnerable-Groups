import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Persisted Settings
  const [dark, setDark] = useState(JSON.parse(localStorage.getItem("trinetra_dark") !== null ? localStorage.getItem("trinetra_dark") : "true"));
  const [voiceAlerts, setVoiceAlerts] = useState(JSON.parse(localStorage.getItem("trinetra_voice") !== null ? localStorage.getItem("trinetra_voice") : "true"));
  const [shakeSOS, setShakeSOS] = useState(JSON.parse(localStorage.getItem("trinetra_shake") !== null ? localStorage.getItem("trinetra_shake") : "true"));
  const [backgroundAI, setBackgroundAI] = useState(JSON.parse(localStorage.getItem("trinetra_background") !== null ? localStorage.getItem("trinetra_background") : "false"));
  const [autoShare, setAutoShare] = useState(JSON.parse(localStorage.getItem("trinetra_autoshare") !== null ? localStorage.getItem("trinetra_autoshare") : "false"));
  const [notifBadge, setNotifBadge] = useState(JSON.parse(localStorage.getItem("trinetra_badge") !== null ? localStorage.getItem("trinetra_badge") : "true"));

  const updateSetting = (key, val, setter) => {
    setter(val);
    localStorage.setItem(`trinetra_${key}`, JSON.stringify(val));
    
    // Dispatch custom event to notify other components (like Dashboard)
    window.dispatchEvent(new Event('trinetra_settings_changed'));
  };

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");

  const user = {
    name: loggedInUser.name || "User",
    phone: loggedInUser.phone || "+91-00000-00000",
    email: loggedInUser.email || "user@example.com",
    initials: (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase(),
  };

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  return (
    <div className="nr-root" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pr-panel { animation: slideUp 0.35s ease; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>👤</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Profile</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>Settings</div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* ── DESKTOP: 2-col | MOBILE: stacked ── */}
      <div className="pr-grid" style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        flex: 1,
        minHeight: "calc(100vh - 57px)",
      }}>

        {/* ═══ LEFT — User Card + Quick Stats ═══ */}
        <aside className="pr-panel" style={{
          background: "var(--bg2)", borderRight: "1px solid var(--border)",
          padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto",
        }}>
          {/* User Avatar */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,149,255,0.15))",
            border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 16, padding: "24px 16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5a0, #0095ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "#0a0c10",
            }}>
              {user.initials}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{user.phone}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{user.email}</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 12px",
              background: "rgba(0,229,160,0.1)",
              border: "1px solid rgba(0,229,160,0.25)",
              borderRadius: 99,
              fontSize: 11, color: "var(--accent)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              Verified Account
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <div className="panel-title" style={{ marginBottom: 10 }}>Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "🆘", label: "SOS Sent", value: JSON.parse(localStorage.getItem("nr_sos_log") || "[]").length, color: "#ff4d4d" },
                { icon: "⚠️", label: "Alerts Received", value: JSON.parse(localStorage.getItem("nr_alert_log") || "[]").length, color: "#f5a623" },
                { icon: "🗺️", label: "Zones Marked", value: JSON.parse(localStorage.getItem("nr_safe_zones") || "[]").length, color: "#00e5a0" },
                { icon: "👥", label: "Contacts", value: JSON.parse(localStorage.getItem("nr_sos_contacts") || "[]").length, color: "#0095ff" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px",
                  background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10,
                }}>
                  <span style={{ fontSize: 18 }}>{stat.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text2)" }}>{stat.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{
            padding: "14px",
            background: "rgba(255,77,77,0.05)",
            border: "1px solid rgba(255,77,77,0.15)",
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Emergency
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/sos" style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px",
                background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.25)",
                borderRadius: 9, color: "var(--danger)",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                fontFamily: "inherit",
              }}>
                🆘 Open SOS Emergency
              </Link>
              <Link to="/stations" style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px",
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 9, color: "var(--text2)",
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                fontFamily: "inherit",
              }}>
                🚉 View Safe Stations
              </Link>
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT — Settings ═══ */}
        <main className="pr-panel" style={{
          background: "var(--bg)", padding: "20px", overflowY: "auto",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* App Settings */}
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>⚙️ App Settings</div>

              {[
                { id: "dark", icon: dark ? "🌙" : "☀️", label: "Dark Mode", desc: "Dark theme for night usage", value: dark, setter: setDark },
                { id: "voice", icon: "🔊", label: "Voice Alerts", desc: "Speak safety warnings aloud", value: voiceAlerts, setter: setVoiceAlerts },
                { id: "shake", icon: "📳", label: "Shake for SOS", desc: "Shake phone 3 times to trigger SOS", value: shakeSOS, setter: setShakeSOS },
                { id: "background", icon: "🤖", label: "Background Protection", desc: "Keep AI active when app is closed", value: backgroundAI, setter: setBackgroundAI },
                { id: "badge", icon: "🔔", label: "Notification Badge", desc: "Show alert count on icon", value: notifBadge, setter: setNotifBadge },
              ].map((setting) => (
                <div key={setting.label} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 20 }}>{setting.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{setting.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{setting.desc}</div>
                  </div>
                  <button
                    onClick={() => updateSetting(setting.id, !setting.value, setting.setter)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: setting.value ? "var(--accent)" : "var(--border)",
                      border: "none", cursor: "pointer", position: "relative",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: setting.value ? "#0a0c10" : "var(--text3)",
                      position: "absolute", top: 3,
                      left: setting.value ? "unset" : 3,
                      right: setting.value ? 3 : "unset",
                      transition: "all 0.2s",
                    }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Privacy & Safety */}
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>🔒 Privacy & Safety</div>

              {[
                { id: "autoshare", icon: "📍", label: "Auto-share Location", desc: "Share location with trusted contacts", value: autoShare, setter: setAutoShare },
              ].map((setting) => (
                <div key={setting.label} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 20 }}>{setting.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{setting.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{setting.desc}</div>
                  </div>
                  <button
                    onClick={() => updateSetting(setting.id, !setting.value, setting.setter)}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: setting.value ? "var(--accent)" : "var(--border)",
                      border: "none", cursor: "pointer", position: "relative",
                      transition: "background 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: setting.value ? "#0a0c10" : "var(--text3)",
                      position: "absolute", top: 3,
                      left: setting.value ? "unset" : 3,
                      right: setting.value ? 3 : "unset",
                      transition: "all 0.2s",
                    }} />
                  </button>
                </div>
              ))}

              <div style={{ paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6 }}>
                  🔐 Your location data is stored locally on your device and is never shared without your consent. SOS alerts include your live location.
                </div>
              </div>
            </div>

            {/* About */}
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>ℹ️ About</div>
              {[
                { icon: "🛡️", label: "App Name", value: "TRINETRA" },
                { icon: "🏷️", label: "Version", value: "2.1.0" },
                { icon: "🎯", label: "Purpose", value: "Safe-Route Navigation for Women" },
                { icon: "🏅", label: "Made in", value: "India 🇮🇳" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text2)" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.value}</span>
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
          { to: "/history", icon: "📜", label: "History" },
          { to: "/stations", icon: "🚉", label: "Stations" },
          { to: "/profile", icon: "👤", label: "Profile", active: true },
        ].map((tab) => (
          <Link key={tab.to} to={tab.to} className={`mob-tab ${tab.active ? "active" : ""}`} style={{ textDecoration: "none" }}>
            <span className="mob-tab-icon">{tab.icon}</span>
            <span className="mob-tab-label">{tab.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .pr-grid { display: flex !important; flex-direction: column !important; min-height: auto !important; padding-bottom: 70px !important; }
          .pr-grid > aside { order: 0; border-right: none !important; border-bottom: 1px solid var(--border); }
          .pr-grid > main { order: 1; min-height: 400px; }
          .mobile-bottom-nav { display: flex !important; }
        }
        @media (min-width: 901px) { .mobile-bottom-nav { display: none !important; } }
        .panel-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
      `}</style>
    </div>
  );
}
