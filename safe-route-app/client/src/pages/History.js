import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaHome, FaHistory, FaMapMarkerAlt, FaUser, FaExclamationTriangle } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./Dashboard.css";

export default function History() {
  const [sosHistory, setSosHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const firebaseUid = auth.currentUser?.uid || loggedInUser.id;

  useEffect(() => {
    if (!firebaseUid) return;

    const q = query(
      collection(db, "reports"), 
      where("userId", "==", firebaseUid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        type: "SOS",
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

  const filtered = sosHistory.filter((item) => {
    if (filter === "all") return true;
    return item.type.toLowerCase() === filter;
  });

  // Group by date
  const groups = {};
  filtered.forEach((item) => {
    const d = new Date(item.timestamp);
    const key = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return (
    <div className="nr-root" style={{ minHeight: "100vh", background: "#0a0a0b", color: "#fff" }}>
      <style>{`
        .timeline-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 20px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .timeline-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent);
          transform: translateX(5px);
        }
        
        /* DESKTOP: Side layout */
        @media (min-width: 1024px) {
          .history-container {
            display: grid;
            grid-template-columns: 350px 1fr;
            height: calc(100vh - 70px);
          }
          .mobile-nav { display: none !important; }
        }

        /* MOBILE: Stacked layout */
        @media (max-width: 1023px) {
          .history-container {
            display: flex;
            flex-direction: column;
            padding-bottom: 90px;
          }
          .stats-panel {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
        }

        .mobile-nav {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 15, 20, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 20px;
          border-radius: 25px;
          display: flex;
          gap: 25px;
          z-index: 1000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .nav-item {
          color: rgba(255, 255, 255, 0.5);
          font-size: 20px;
          transition: all 0.3s ease;
        }
        .nav-item.active {
          color: var(--accent);
          transform: scale(1.2);
        }
      `}</style>

      {/* TOPBAR */}
      <header className="nr-topbar" style={{ padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <FaBars size={20} />
          </button>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--accent)" }}>INCIDENT LOG</h2>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text3)", background: "rgba(255,255,255,0.05)", padding: "5px 12px", borderRadius: "20px" }}>
          {sosHistory.length} Events Logged
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={loggedInUser} onLogout={handleLogout} />

      <div className="history-container">
        
        {/* STATS & FILTER PANEL */}
        <aside className="stats-panel" style={{ padding: "30px", background: "rgba(0,0,0,0.2)", borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <h4 style={{ color: "var(--text3)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "20px" }}>Security Overview</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ background: "rgba(255,77,77,0.1)", padding: "20px", borderRadius: "20px", border: "1px solid rgba(255,77,77,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ff4d4d" }}>{sosHistory.length}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,77,77,0.8)", fontWeight: 700 }}>TOTAL SOS</div>
              </div>
              <div style={{ background: "rgba(0,229,160,0.1)", padding: "20px", borderRadius: "20px", border: "1px solid rgba(0,229,160,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent)" }}>{sosHistory.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length}</div>
                <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 700 }}>TODAY</div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--text3)", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px", marginBottom: "20px" }}>Filters</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["all", "sos"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "15px 20px", borderRadius: "18px", border: "1px solid",
                  borderColor: filter === f ? "var(--accent)" : "rgba(255,255,255,0.05)",
                  background: filter === f ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.02)",
                  color: filter === f ? "var(--accent)" : "#fff",
                  textAlign: "left", cursor: "pointer", fontWeight: 700, textTransform: "capitalize", transition: "all 0.3s"
                }}>
                  {f === "all" ? "📋 All Incidents" : "🚨 SOS Reports"}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* TIMELINE VIEW */}
        <main style={{ padding: "40px", overflowY: "auto" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 0", opacity: 0.5 }}>
                <div style={{ fontSize: "80px", marginBottom: "20px" }}>📭</div>
                <h2>No data found</h2>
                <p>Safety incidents will appear here in real-time.</p>
              </div>
            ) : (
              Object.entries(groups).map(([day, items]) => (
                <div key={day} style={{ marginBottom: "40px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--accent)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, var(--accent))" }}></div>
                    {day}
                    <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, var(--accent), transparent)" }}></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {items.map(item => (
                      <div key={item.id} className="timeline-card">
                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                          <div style={{ width: "60px", height: "60px", background: "rgba(255,77,77,0.15)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: "0 10px 20px rgba(255,77,77,0.1)" }}>🚨</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <div style={{ color: "#ff4d4d", fontWeight: 900, fontSize: "16px", letterSpacing: "1px" }}>SOS TRIGGERED</div>
                                <div style={{ fontSize: "14px", color: "#fff", marginTop: "5px", opacity: 0.9 }}>📍 {item.placeName || "Location details pending..."}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "2px" }}>SIGNAL: STABLE</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* MOBILE NAVIGATION BAR */}
      <nav className="mobile-nav">
        <Link to="/dashboard" className="nav-item"><FaHome /></Link>
        <Link to="/sos" className="nav-item"><FaExclamationTriangle /></Link>
        <Link to="/history" className="nav-item active"><FaHistory /></Link>
        <Link to="/stations" className="nav-item"><FaMapMarkerAlt /></Link>
        <Link to="/profile" className="nav-item"><FaUser /></Link>
      </nav>
    </div>
  );
}
