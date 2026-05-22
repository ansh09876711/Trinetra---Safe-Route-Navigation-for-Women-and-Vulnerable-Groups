import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaChartLine, FaShieldAlt, FaHistory, FaUser, FaHome, FaExclamationTriangle } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import SafetyScore from "../components/SafetyScore";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./Dashboard.css";

// --- FUTURISTIC MINI LINE CHART ---
function NeonLineChart({ data, color = "#00e5a0", height = 80 }) {
  if (!data || data.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Insufficient data for trend</div>;
  const max = Math.max(...data, 1);
  const w = 300;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    height - (v / max) * (height - 20) - 10,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height, filter: `drop-shadow(0 0 5px ${color}40)` }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#0a0a0b" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

export default function Analytics() {
  const [sosHistory, setSosHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const firebaseUid = auth.currentUser?.uid || loggedInUser.id;

  useEffect(() => {
    if (!firebaseUid) return;

    const q = query(collection(db, "reports"), where("userId", "==", firebaseUid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().getTime() : new Date(doc.data().timestamp).getTime()
      }));
      reports.sort((a, b) => b.timestamp - a.timestamp);
      setSosHistory(reports);
    });
    return () => unsubscribe();
  }, [firebaseUid]);

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    navigate("/");
  };

  // --- CALCULATE ANALYTICS ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const dailyStats = last7Days.map(date => ({
    label: date.split(' ')[0],
    count: sosHistory.filter(e => new Date(e.timestamp).toDateString() === date).length
  }));

  const trendData = dailyStats.map(d => d.count);
  const todayCount = dailyStats[dailyStats.length - 1].count;

  return (
    <div className="nr-root" style={{ minHeight: "100vh", background: "#0a0a0b", color: "#fff" }}>
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 30px;
          padding: 25px;
          backdrop-filter: blur(20px);
        }
        @media (min-width: 1024px) {
          .analytics-grid {
            display: grid;
            grid-template-columns: 350px 1fr;
            height: calc(100vh - 70px);
          }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 1023px) {
          .analytics-grid { display: flex; flex-direction: column; padding-bottom: 90px; }
          .side-panel { border-right: none !important; border-bottom: 1px solid var(--border); }
        }
        .mobile-nav {
          position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
          background: rgba(15, 15, 20, 0.9); backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 25px;
          border-radius: 30px; display: flex; gap: 30px; z-index: 1000;
        }
        .nav-item { color: rgba(255, 255, 255, 0.4); font-size: 20px; transition: 0.3s; }
        .nav-item.active { color: var(--accent); transform: scale(1.2); }
      `}</style>

      {/* TOPBAR */}
      <header className="nr-topbar" style={{ padding: "15px 25px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><FaBars size={20} /></button>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent)", margin: 0 }}>INTELLIGENCE</h2>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 800, background: "rgba(0,229,160,0.1)", color: "var(--accent)", padding: "5px 15px", borderRadius: "20px" }}>LIVE REPORTS</div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={loggedInUser} onLogout={handleLogout} />

      <div className="analytics-grid">
        
        {/* SIDE PANEL: SCORE & QUICK STATS */}
        <aside className="side-panel" style={{ padding: "30px", borderRight: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", overflowY: "auto" }}>
          <div style={{ marginBottom: "30px" }}>
            <SafetyScore location="Current Zone" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1px" }}>Safety Rating</div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--accent)", margin: "10px 0" }}>A+</div>
              <div style={{ fontSize: "11px", color: "var(--text2)" }}>Top 5% Secure Areas</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="glass-panel" style={{ padding: "15px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{sosHistory.length}</div>
                <div style={{ fontSize: "8px", color: "var(--text3)" }}>INCIDENTS</div>
              </div>
              <div className="glass-panel" style={{ padding: "15px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{todayCount}</div>
                <div style={{ fontSize: "8px", color: "var(--text3)" }}>TODAY</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN ANALYTICS */}
        <main style={{ padding: "40px", overflowY: "auto" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* TREND CHART */}
            <div className="glass-panel">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>Incident Frequency</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text3)" }}>7-Day Safety Trend</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--accent)", fontWeight: 800 }}>STABLE</div>
                  <div style={{ fontSize: "10px", color: "var(--text3)" }}>Current Status</div>
                </div>
              </div>
              <NeonLineChart data={trendData} color="#00e5a0" />
            </div>

            {/* GRID OF INSIGHTS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" }}>
              <div className="glass-panel">
                <div style={{ color: "var(--accent)", fontSize: "20px", marginBottom: "15px" }}><FaChartLine /></div>
                <h4 style={{ margin: "0 0 5px" }}>Response Time</h4>
                <p style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>4.2 min</p>
                <div style={{ fontSize: "10px", color: "#22c55e", marginTop: "5px" }}>↓ 12% faster this week</div>
              </div>
              
              <div className="glass-panel">
                <div style={{ color: "#ff4d4d", fontSize: "20px", marginBottom: "15px" }}><FaShieldAlt /></div>
                <h4 style={{ margin: "0 0 5px" }}>Danger Zones Avoided</h4>
                <p style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>14</p>
                <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "5px" }}>Based on safe-route nav</div>
              </div>
            </div>

            {/* RECENT ACTIVITY SUMMARY */}
            <div className="glass-panel">
              <h4 style={{ marginBottom: "20px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>Recent Risk Activity</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {sosHistory.slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "rgba(255,255,255,0.02)", borderRadius: "15px" }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      <div style={{ width: "40px", height: "40px", background: "rgba(255,77,77,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>🚨</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>SOS Triggered</div>
                        <div style={{ fontSize: "11px", color: "var(--text3)" }}>{item.placeName || "Location Syncing..."}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 700 }}>{new Date(item.timestamp).toLocaleDateString()}</div>
                  </div>
                ))}
                {sosHistory.length === 0 && <p style={{ textAlign: "center", opacity: 0.5 }}>No recent activity to report.</p>}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* MOBILE NAV */}
      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item"><FaHome /></Link>
        <Link to="/sos" className="nav-item"><FaExclamationTriangle /></Link>
        <Link to="/history" className="nav-item"><FaHistory /></Link>
        <Link to="/analytics" className="nav-item active"><FaChartLine /></Link>
        <Link to="/profile" className="nav-item"><FaUser /></Link>
      </nav>
    </div>
  );
}
