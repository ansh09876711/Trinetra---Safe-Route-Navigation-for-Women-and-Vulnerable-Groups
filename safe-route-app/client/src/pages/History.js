import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const SOS_LOG_KEY = "nr_sos_log";
const ALERT_LOG_KEY = "nr_alert_log";

const INCIDENT_TYPES = {
  SOS: { icon: "🆘", color: "#ff4d4d", label: "SOS Sent" },
  ALERT: { icon: "⚠️", color: "#f5a623", label: "Alert Received" },
};

function getLocationName(lat, lng) {
  if (!lat || !lng) return "Unknown location";
  return `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

function TimelineItem({ item, onDelete }) {
  const type = INCIDENT_TYPES[item.type] || INCIDENT_TYPES.ALERT;
  const isSOS = item.type === "SOS";

  return (
    <div style={{
      display: "flex",
      gap: "12px",
      padding: "14px 0",
      borderBottom: "1px solid var(--border)",
      alignItems: "flex-start",
    }}>
      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: `${type.color}18`,
        border: `1px solid ${type.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        flexShrink: 0,
      }}>
        {type.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: type.color }}>
            {type.label}
          </span>
          <span style={{
            fontSize: "10px",
            color: "var(--text3)",
            background: "var(--bg3)",
            padding: "2px 8px",
            borderRadius: "99px",
            border: "1px solid var(--border)",
          }}>
            {isSOS && item.contacts
              ? `${item.contacts} contact${item.contacts > 1 ? "s" : ""}`
              : item.alertType || "Nearby Alert"}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "5px" }}>
          📍 {item.locationName || getLocationName(item.lat, item.lng)}
        </div>
        {isSOS && item.message && (
          <div style={{
            fontSize: "11px",
            color: "var(--text3)",
            background: "var(--bg3)",
            padding: "6px 10px",
            borderRadius: "8px",
            marginBottom: "5px",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "50px",
          }}>
            "{item.message}"
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: "var(--text3)" }}>
            {formatTime(item.timestamp)}
          </span>
          <span style={{ fontSize: "11px", color: "var(--accent)" }}>
            {formatRelative(item.timestamp)}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          color: "var(--text3)",
          cursor: "pointer",
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "6px",
          alignSelf: "flex-start",
          flexShrink: 0,
        }}
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}

export default function History() {
  const [sosLog, setSosLog] = useState([]);
  const [alertLog, setAlertLog] = useState([]);
  const [filter, setFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userName = loggedInUser.name || "User";
  const userInitials = (loggedInUser.name || "M").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("trinetra_user"));
        const userId = user?.id;
        if (!userId) return;

        const response = await fetch(`http://localhost:5000/api/alerts?userId=${userId}`);
        const data = await response.json();
        setAlertLog(data.map(item => ({
          ...item,
          type: item.type || "ALERT",
          timestamp: new Date(item.created_at || item.timestamp).getTime()
        })));
      } catch (err) {
        console.error("Error fetching alerts:", err);
        // Fallback to localStorage if server is down
        const alerts = JSON.parse(localStorage.getItem(ALERT_LOG_KEY) || "[]");
        setAlertLog(alerts);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const entry = e.detail;
      setSosLog((prev) => {
        const updated = [entry, ...prev].slice(0, 100);
        localStorage.setItem(SOS_LOG_KEY, JSON.stringify(updated));
        return updated;
      });
    };
    window.addEventListener("nr:sos", handler);
    return () => window.removeEventListener("nr:sos", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const entry = e.detail;
      setAlertLog((prev) => {
        const updated = [entry, ...prev].slice(0, 200);
        localStorage.setItem(ALERT_LOG_KEY, JSON.stringify(updated));
        return updated;
      });
    };
    window.addEventListener("nr:alert", handler);
    return () => window.removeEventListener("nr:alert", handler);
  }, []);

  const deleteEntry = (id, type) => {
    if (type === "SOS") {
      const updated = sosLog.filter((e) => e.id !== id);
      setSosLog(updated);
      localStorage.setItem(SOS_LOG_KEY, JSON.stringify(updated));
    } else {
      const updated = alertLog.filter((e) => e.id !== id);
      setAlertLog(updated);
      localStorage.setItem(ALERT_LOG_KEY, JSON.stringify(updated));
    }
  };

  const clearAll = () => {
    if (filter === "all" || filter === "sos") {
      setSosLog([]);
      localStorage.setItem(SOS_LOG_KEY, "[]");
    }
    if (filter === "all" || filter === "alerts") {
      setAlertLog([]);
      localStorage.setItem(ALERT_LOG_KEY, "[]");
    }
    setConfirmClear(false);
  };

  const combined = [
    ...sosLog.map((e) => ({ ...e, itemType: "SOS" })),
    ...alertLog.map((e) => ({ ...e, itemType: "ALERT" })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filtered = combined.filter((item) => {
    if (filter === "all") return true;
    if (filter === "sos") return item.itemType === "SOS";
    if (filter === "alerts") return item.itemType === "ALERT";
    return true;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySos = sosLog.filter((e) => e.timestamp >= today.getTime()).length;
  const todayAlerts = alertLog.filter((e) => e.timestamp >= today.getTime()).length;

  const groups = {};
  filtered.forEach((item) => {
    const d = new Date(item.timestamp);
    const key = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const activeFilterCount = {
    all: filtered.length,
    sos: filtered.filter((i) => i.itemType === "SOS").length,
    alerts: filtered.filter((i) => i.itemType === "ALERT").length,
  };

  return (
    <div className="nr-root" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hist-panel { animation: slideUp 0.35s ease; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📜</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>History</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* ── DESKTOP: 2-col grid | MOBILE: stacked ── */}
      <div className="hist-grid" style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        flex: 1,
        minHeight: "calc(100vh - 57px)",
      }}>

        {/* ═══ LEFT — Stats + Filters ═══ */}
        <aside className="hist-panel" style={{
          background: "var(--bg2)",
          borderRight: "1px solid var(--border)",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}>
          {/* Stats */}
          <div>
            <div className="panel-title" style={{ marginBottom: 12 }}>Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { icon: "🆘", label: "Total SOS", value: sosLog.length, color: "#ff4d4d" },
                { icon: "⚠️", label: "Total Alerts", value: alertLog.length, color: "#f5a623" },
                { icon: "📅", label: "Today's SOS", value: todaySos, color: "#ff4d4d" },
                { icon: "🔔", label: "Today's Alerts", value: todayAlerts, color: "#f5a623" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  padding: "12px 10px",
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "20px", marginBottom: 4 }}>{stat.icon}</div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: stat.color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <div className="panel-title" style={{ marginBottom: 12 }}>Filter</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { key: "all", label: "All Events", icon: "📋" },
                { key: "sos", label: "SOS Only", icon: "🆘" },
                { key: "alerts", label: "Alerts Only", icon: "⚠️" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid",
                    borderColor: filter === f.key ? "var(--accent)" : "var(--border)",
                    background: filter === f.key ? "rgba(0,229,160,0.1)" : "var(--bg3)",
                    color: filter === f.key ? "var(--accent)" : "var(--text2)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ flex: 1 }}>{f.label}</span>
                  <span style={{
                    fontSize: 11,
                    background: filter === f.key ? "rgba(0,229,160,0.2)" : "var(--bg2)",
                    padding: "2px 8px",
                    borderRadius: 99,
                    color: filter === f.key ? "var(--accent)" : "var(--text3)",
                  }}>
                    {f.key === "all" ? filtered.length : f.key === "sos" ? activeFilterCount.sos : activeFilterCount.alerts}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          <div style={{ marginTop: "auto" }}>
            {confirmClear ? (
              <div style={{
                padding: "12px",
                background: "rgba(255,77,77,0.08)",
                border: "1px solid rgba(255,77,77,0.2)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, textAlign: "center" }}>
                  Clear all {filter === "all" ? "events" : filter + "s"}?
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={clearAll}
                    style={{ flex: 1, padding: "7px", background: "rgba(255,77,77,0.15)", border: "1px solid rgba(255,77,77,0.3)", borderRadius: 7, color: "var(--danger)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    style={{ flex: 1, padding: "7px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text2)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                style={{
                  width: "100%", padding: "9px",
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  color: "var(--text3)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Clear {filter === "all" ? "All" : filter === "sos" ? "SOS" : "Alerts"}
              </button>
            )}
          </div>
        </aside>

        {/* ═══ RIGHT — Timeline ═══ */}
        <main className="hist-panel" style={{
          background: "var(--bg)",
          padding: "20px",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Timeline</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                  {filtered.length} event{filtered.length !== 1 ? "s" : ""} shown
                </div>
              </div>
            </div>

            {/* Timeline */}
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>📭</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>No events yet</div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  SOS sends and nearby alerts will appear here
                </div>
              </div>
            ) : (
              <div style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "4px 16px",
              }}>
                {Object.entries(groups).map(([day, items]) => (
                  <div key={day}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text3)",
                      padding: "14px 0 8px",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: 4,
                    }}>
                      {day}
                    </div>
                    {items.map((item) => (
                      <TimelineItem
                        key={item.id}
                        item={item}
                        onDelete={(id) => deleteEntry(id, item.itemType)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav" style={{ display: "flex" }}>
        {[
          { to: "/", icon: "🏠", label: "Home" },
          { to: "/sos", icon: "🆘", label: "SOS" },
          { to: "/history", icon: "📜", label: "History", active: true },
          { to: "/stations", icon: "🚉", label: "Stations" },
          { to: "/profile", icon: "👤", label: "Profile" },
        ].map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`mob-tab ${tab.active ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="mob-tab-icon">{tab.icon}</span>
            <span className="mob-tab-label">{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* Responsive CSS */}
      <style>{`
        /* Mobile: stacked */
        @media (max-width: 900px) {
          .hist-grid {
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
            padding-bottom: 70px !important;
          }
          .hist-grid > aside {
            order: 0;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .hist-grid > main {
            order: 1;
            min-height: 400px;
          }
          .mobile-bottom-nav { display: flex !important; }
        }
        /* Desktop: hide bottom nav */
        @media (min-width: 901px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
