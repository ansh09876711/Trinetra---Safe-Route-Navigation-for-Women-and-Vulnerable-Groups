import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import SafetyScore from "../components/SafetyScore";
import "./Dashboard.css";
import './Analytics.css'; // Assuming you have a CSS file for styling

const SOS_LOG_KEY = "nr_sos_log";
const ALERT_LOG_KEY = "nr_alert_log";

// ── SVG Chart Components ──────────────────────────────────────

function MiniLineChart({ data, color = "#00e5a0", height = 60 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const norm = data.map((v) => ((v - min) / range) * (height - 10));
  const pts = norm.map((v, i) => [
    (i / (data.length - 1)) * w,
    height - 5 - v,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaD = `${pathD} L${w},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
      ))}
    </svg>
  );
}

function BarChart({ data, color = "#00e5a0", height = 120 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value));
  const barW = Math.floor((180 - 8) / data.length);
  return (
    <svg viewBox="0 0 200 130" style={{ width: "100%", height }}>
      {data.map((d, i) => {
        const barH = max > 0 ? (d.value / max) * (height - 20) : 0;
        const x = i * (200 / data.length) + 4;
        const y = height - barH - 10;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={Math.max(barW - 4, 4)}
              height={barH}
              rx="4"
              fill={color}
              opacity="0.85"
            />
            <text
              x={x + (barW - 4) / 2}
              y={height}
              textAnchor="middle"
              fill="var(--text3)"
              fontSize="8"
            >
              {d.label}
            </text>
            <text
              x={x + (barW - 4) / 2}
              y={y - 3}
              textAnchor="middle"
              fill={color}
              fontSize="9"
              fontWeight="600"
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments, size = 120 }) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="700">
        {segments.reduce((s, seg) => s + seg.value, 0)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text3)" fontSize="8">
        Total
      </text>
    </svg>
  );
}

function ScoreRing({ score }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#00e5a0" : score >= 50 ? "#f5a623" : "#ff4d4d";
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle
        cx="55" cy="55" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="55" y="50" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700">
        {score}
      </text>
      <text x="55" y="66" textAnchor="middle" fill="var(--text3)" fontSize="9" textTransform="uppercase">
        Safety Score
      </text>
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 140,
      padding: "16px 14px",
      background: "var(--bg3)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--text3)" }}>{sub}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Analytics() {
  const [sosLog, setSosLog] = useState([]);
  const [alertLog, setAlertLog] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userName = loggedInUser.name || "User";
  const userInitials = (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  useEffect(() => {
    try {
      setSosLog(JSON.parse(localStorage.getItem(SOS_LOG_KEY) || "[]"));
      setAlertLog(JSON.parse(localStorage.getItem(ALERT_LOG_KEY) || "[]"));
    } catch {}
  }, []);

  // ── Compute stats ──
  const totalSOS = sosLog.length;
  const totalAlerts = alertLog.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySOS = sosLog.filter((e) => e.timestamp >= today.getTime()).length;
  const todayAlerts = alertLog.filter((e) => e.timestamp >= today.getTime()).length;

  // Week data — last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), key, sos: 0, alerts: 0 };
  });

  sosLog.forEach((e) => {
    const d = new Date(e.timestamp);
    d.setHours(0, 0, 0, 0);
    const idx = last7Days.findIndex((x) => x.key === d.toDateString());
    if (idx >= 0) last7Days[idx].sos++;
  });
  alertLog.forEach((e) => {
    const d = new Date(e.timestamp);
    d.setHours(0, 0, 0, 0);
    const idx = last7Days.findIndex((x) => x.key === d.toDateString());
    if (idx >= 0) last7Days[idx].alerts++;
  });

  const sosTrend = last7Days.map((d) => d.sos);
  const alertTrend = last7Days.map((d) => d.alerts);
  const scoreHistory = [72, 80, 65, 87, 90, 78, 87];

  // Alert type breakdown
  const typeCount = {};
  alertLog.forEach((e) => {
    const t = e.alertType || "Unknown";
    typeCount[t] = (typeCount[t] || 0) + 1;
  });
  const alertTypes = Object.entries(typeCount).map(([label, value], i) => ({
    label,
    value,
    color: ["#ff4d4d", "#f5a623", "#0095ff", "#00e5a0", "#9b59b6"][i % 5],
    pct: Math.round((value / (totalAlerts || 1)) * 100),
  }));

  // Safety score (mock + real)
  const avgScore = scoreHistory[scoreHistory.length - 1];

  return (
    <div className="nr-root" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .an-panel { animation: slideUp 0.35s ease; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Analytics</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          TRINETRA Report
        </div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* ── DESKTOP: 2-col grid | MOBILE: stacked ── */}
      <div className="an-grid" style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        flex: 1,
        minHeight: "calc(100vh - 57px)",
      }}>

        {/* ═══ LEFT — Score + Stats + Alert Types ═══ */}
        <aside className="an-panel" style={{
          background: "var(--bg2)",
          borderRight: "1px solid var(--border)",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          overflowY: "auto",
        }}>
          {/* Safety Score (reusable component) */}
          <div style={{ padding: 0 }}>
            <SafetyScore location={"Current Area"} />
          </div>

          {/* Key Stats */}
          <div>
            <div className="panel-title" style={{ marginBottom: 12 }}>Key Metrics</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <StatCard icon="🆘" label="Total SOS" value={totalSOS} sub={`${todaySOS} today`} color="#ff4d4d" />
              <StatCard icon="⚠️" label="Alerts Received" value={totalAlerts} sub={`${todayAlerts} today`} color="#f5a623" />
              <StatCard icon="📅" label="Days Tracked" value={Math.max(...[...sosLog.map(e => new Date(e.timestamp).getDate()), ...alertLog.map(e => new Date(e.timestamp).getDate()), 1])} sub="Since first event" color="var(--accent)" />
            </div>
          </div>

          {/* Alert Types Donut */}
          {alertTypes.length > 0 && (
            <div>
              <div className="panel-title" style={{ marginBottom: 12 }}>Alert Types</div>
              <div style={{
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}>
                <DonutChart segments={alertTypes} size={110} />
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                  {alertTypes.map((t) => (
                    <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, color: "var(--text2)" }}>{t.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ═══ RIGHT — Charts + Trends ═══ */}
        <main className="an-panel" style={{
          background: "var(--bg)",
          padding: "20px",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Safety Score Trend */}
            <div style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Safety Score Trend</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>Last 7 days</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
                  Avg: {Math.round(scoreHistory.reduce((s, v) => s + v, 0) / scoreHistory.length)}
                </div>
              </div>
              <MiniLineChart data={scoreHistory} color="#00e5a0" height={70} />
            </div>

            {/* SOS + Alert Bars */}
            <div style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 16px",
            }}>
              <div className="panel-title" style={{ marginBottom: 10 }}>SOS & Alerts — Last 7 Days</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4d4d" }} />
                    <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>SOS Sent</span>
                  </div>
                  <BarChart data={last7Days.map(d => ({ label: d.label, value: d.sos }))} color="#ff4d4d" height={90} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f5a623" }} />
                    <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>Alerts Nearby</span>
                  </div>
                  <BarChart data={last7Days.map(d => ({ label: d.label, value: d.alerts }))} color="#f5a623" height={90} />
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 16px",
            }}>
              <div className="panel-title" style={{ marginBottom: 14 }}>This Week</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "Total Events", value: sosLog.length + alertLog.length, icon: "📋", color: "var(--accent)" },
                  { label: "Most Active Day", value: last7Days.reduce((m, d) => (d.sos + d.alerts > (m?.sos + m?.alerts || 0) ? d : m), null)?.label || "—", icon: "📅", color: "#0095ff" },
                  { label: "Last SOS", value: sosLog.length > 0 ? formatRel(sosLog[0]?.timestamp) : "—", icon: "🆘", color: "#ff4d4d" },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: "12px 10px",
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2, textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 16px",
            }}>
              <div className="panel-title" style={{ marginBottom: 14 }}>Recent Activity</div>
              {sosLog.length === 0 && alertLog.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 13 }}>
                  No activity yet. Send an SOS or receive an alert to see data here.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[...sosLog.map(e => ({ ...e, itemType: "SOS" })), ...alertLog.map(e => ({ ...e, itemType: "ALERT" }))]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 5)
                    .map((item, i) => {
                      const isSOS = item.itemType === "SOS";
                      const color = isSOS ? "#ff4d4d" : "#f5a623";
                      return (
                        <div key={i} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 0",
                          borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `${color}18`, border: `1px solid ${color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, flexShrink: 0,
                          }}>
                            {isSOS ? "🆘" : "⚠️"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: color }}>
                              {isSOS ? "SOS Sent" : item.alertType || "Alert"}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>
                              {item.locationName || "Unknown location"} · {formatRel(item.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
          { to: "/analytics", icon: "📊", label: "Analytics", active: true },
          { to: "/profile", icon: "👤", label: "Profile" },
        ].map((tab) => (
          <Link key={tab.to} to={tab.to} className={`mob-tab ${tab.active ? "active" : ""}`} style={{ textDecoration: "none" }}>
            <span className="mob-tab-icon">{tab.icon}</span>
            <span className="mob-tab-label">{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .an-grid {
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
            padding-bottom: 70px !important;
          }
          .an-grid > aside {
            order: 0;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .an-grid > main { order: 1; min-height: 400px; }
          .mobile-bottom-nav { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-bottom-nav { display: none !important; }
        }
        .panel-title {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--text3);
        }
      `}</style>
    </div>
  );
}

function formatRel(ts) {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}
