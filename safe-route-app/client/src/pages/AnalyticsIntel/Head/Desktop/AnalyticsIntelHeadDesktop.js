import React, { useState, useEffect } from "react";
import { 
  FaChartBar, FaMapMarkedAlt, FaMicrochip, FaExclamationTriangle, 
  FaHistory, FaSignOutAlt, FaSearch, FaBell, FaUser, FaSatellite,
  FaCogs, FaUsers, FaThermometerHalf, FaWind, FaEye, FaLock, FaShieldAlt,
  FaDatabase, FaTrash
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, where } from "firebase/firestore";

export default function AnalyticsIntelHeadDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("intel");
    const [searchQuery, setSearchQuery] = useState("");
    const [incidents, setIncidents] = useState([]);
    const [intelMetrics, setIntelMetrics] = useState({
        globalScore: 88,
        activeSensors: 1420,
        responseRate: "94%",
        threatLevel: "LOW"
    });

    useEffect(() => {
        const q = query(collection(db, "reports"), where("status", "!=", "DELETED"), orderBy("status"), orderBy("timestamp", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(data);
        });
        return () => unsubscribe();
    }, []);

    const tabs = [
        { id: 'intel', label: 'CITY INTEL', icon: <FaSatellite />, color: '#00e5a0' },
        { id: 'metrics', label: 'OPERATIONAL METRICS', icon: <FaChartBar />, color: '#4285F4' },
        { id: 'trinetra_data', label: 'TRINETRA DATA', icon: <FaDatabase />, color: '#fbbc04' },
        { id: 'predictive', label: 'AI RISK PREDICTION', icon: <FaMicrochip />, color: '#a855f7' },
        { id: 'sensors', label: 'SENSOR NETWORK', icon: <FaCogs />, color: '#fbbc04' },
        { id: 'history', label: 'HISTORICAL DATA', icon: <FaHistory />, color: '#ff4d4d' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'intel': return <CityIntelView incidents={incidents} />;
            case 'metrics': return <MetricsView />;
            case 'trinetra_data': return <TrinetraDataView />;
            case 'predictive': return <PredictiveView incidents={incidents} />;
            case 'sensors': return <SensorNetworkView />;
            case 'history': return <HistoricalDataView incidents={incidents} />;
            case 'profile': return <ProfileView user={user} />;
            default: return <CityIntelView incidents={incidents} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* SIDEBAR */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(0,229,160,0.1)', borderRadius: '8px', border: '1px solid rgba(0,229,160,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#00e5a0', animation: 'pulse 2s infinite' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#00e5a0', letterSpacing: '2px' }}>INTEL COMMAND</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
                    {tabs.map(item => (
                        <div key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '14px 20px', marginBottom: '6px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderLeft: `3px solid ${activeTab === item.id ? item.color : 'transparent'}`,
                                transition: '0.2s'
                            }}>
                            <span style={{ fontSize: '18px', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.3)' }}>{item.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '0 20px', marginTop: '20px' }}>
                    <button onClick={onLogout} style={{ width: '100%', padding: '16px', background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.1)', borderRadius: '12px', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '11px', fontWeight: 900 }}>
                        <FaSignOutAlt /> TERMINATE SESSION
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input placeholder="SEARCH INTEL, METRICS, OR SENSORS..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#00e5a0', fontWeight: 800, letterSpacing: '1px' }}>DIRECTOR OF ANALYTICS & INTEL</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #00e5a0, #00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#000', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                .metric-card { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function CityIntelView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'GLOBAL SAFETY INDEX', val: '88/100', color: '#00e5a0', icon: <FaShieldAlt /> },
                    { label: 'ACTIVE INCIDENTS', val: incidents.length, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'RESPONSE DENSITY', val: 'HIGH', color: '#4285F4', icon: <FaUsers /> },
                    { label: 'INTEL CONFIDENCE', val: '99.2%', color: '#a855f7', icon: <FaMicrochip /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${w.color}10`, borderRadius: '15px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '550px', padding: '30px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '2px' }}>CITY-WIDE INTEL HEATMAP</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '9px', background: '#00e5a020', color: '#00e5a0', padding: '5px 10px', borderRadius: '5px', fontWeight: 900 }}>LOW RISK AREA</span>
                            <span style={{ fontSize: '9px', background: '#ff4d4d20', color: '#ff4d4d', padding: '5px 10px', borderRadius: '5px', fontWeight: 900 }}>CRITICAL ZONE</span>
                        </div>
                    </div>
                    {/* Simulated Map View */}
                    <div style={{ position: 'absolute', inset: '80px 30px 30px 30px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaMapMarkedAlt style={{ fontSize: '120px', color: 'rgba(255,255,255,0.03)' }} />
                        {incidents.slice(0, 15).map((inc, idx) => (
                            <div key={idx} style={{ 
                                position: 'absolute', 
                                top: `${20 + Math.random() * 60}%`, 
                                left: `${10 + Math.random() * 80}%`, 
                                color: idx < 3 ? '#ff4d4d' : '#fbbc04' 
                            }}>
                                <div style={{ width: '12px', height: '12px', background: 'currentColor', borderRadius: '50%', boxShadow: '0 0 15px currentColor', animation: 'pulse 2s infinite' }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #00e5a0' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#00e5a0', letterSpacing: '2px', marginBottom: '15px' }}>THREAT ASSESSMENT</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>CURRENT LEVEL</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e5a0' }}>MODERATE SECURITY</div>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>Normal operations authorized. No city-wide threats detected.</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', marginBottom: '15px' }}>LIVE INTEL STREAM</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {incidents.slice(0, 6).map((e, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: 800 }}>{e.locationName?.split(',')[0]}</div>
                                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>SIGNAL: {String(e.id).substring(0, 8)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '9px', color: '#ff4d4d', fontWeight: 900 }}>SOS</div>
                                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>{new Date(e.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricsView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>OPERATIONAL PERFORMANCE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, marginBottom: '10px' }}>AVG RESPONSE TIME</div>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: '#00e5a0' }}>4.2m</div>
                    <div style={{ fontSize: '11px', color: '#00e5a0', marginTop: '10px' }}>↓ 0.8m improved</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, marginBottom: '10px' }}>RESOLVE RATE</div>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: '#4285F4' }}>98.4%</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>Across all divisions</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, marginBottom: '10px' }}>PREVENTIVE RATIO</div>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: '#a855f7' }}>72%</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>AI-Intervened cases</div>
                </div>
            </div>
            {/* Charts would go here */}
            <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '14px', letterSpacing: '5px' }}>
                PERFORMANCE_GRAPH_SECURE_CHANNEL
            </div>
        </div>
    );
}

function PredictiveView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>AI RISK PREDICTION ENGINE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', color: '#a855f7' }}>PROACTIVE RISK MAPPING</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { sector: "Sector 4-B", probability: "High", time: "18:00 - 21:00", factor: "Lighting Outage" },
                            { sector: "Metro East", probability: "Medium", time: "22:00 - 00:00", factor: "Large Event" },
                            { sector: "Industrial Link", probability: "Low", time: "02:00 - 04:00", factor: "Isolated Zone" }
                        ].map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 900 }}>{r.sector}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Factor: {r.factor}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 900, color: r.probability === 'High' ? '#ff4d4d' : '#00e5a0' }}>{r.probability} Risk</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{r.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px', textAlign: 'center' }}>
                        <FaMicrochip size={40} color="#a855f7" style={{ marginBottom: '20px' }} />
                        <h4 style={{ fontWeight: 900 }}>AI AGENT STATUS</h4>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#00e5a0', margin: '10px 0' }}>OPTIMIZED</div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Learning from {incidents.length} recent data points.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SensorNetworkView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>CITY SENSOR NETWORK (IoT)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {[
                    { label: 'SMART POLES', count: '1,240', status: 'ACTIVE', icon: <FaSatellite />, color: '#00e5a0' },
                    { label: 'CCTV NODES', count: '4,850', status: 'ACTIVE', icon: <FaEye />, color: '#4285F4' },
                    { label: 'SOS KIOSKS', count: '150', status: '8 OFFLINE', icon: <FaExclamationTriangle />, color: '#ff4d4d' },
                    { label: 'AIR SENSORS', count: '320', status: 'ACTIVE', icon: <FaWind />, color: '#fbbc04' }
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ color: s.color, marginBottom: '15px' }}>{s.icon}</div>
                        <div style={{ fontSize: '20px', fontWeight: 900 }}>{s.count}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, margin: '5px 0' }}>{s.label}</div>
                        <div style={{ fontSize: '10px', color: s.status.includes('OFFLINE') ? '#ff4d4d' : '#00e5a0', fontWeight: 900 }}>{s.status}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HistoricalDataView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>HISTORICAL INCIDENT LOGS</h3>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['TIME', 'USER', 'LOCATION', 'COORDINATES', 'STATUS'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.slice(0, 10).map((inc, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontSize: '12px' }}>{new Date(inc.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '20px', fontWeight: 800 }}>{inc.userName}</td>
                                <td style={{ padding: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{String(inc.locationName || "").substring(0, 30)}...</td>
                                <td style={{ padding: '20px', fontSize: '12px', fontFamily: 'monospace' }}>{inc.lat?.toFixed(4)}, {inc.lng?.toFixed(4)}</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ padding: '5px 12px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>LOGGED</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TrinetraDataView() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(u => !u.accountType || u.accountType.toLowerCase() === 'citizen');
            setAllUsers(users);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const requestDeletion = async (targetUser) => {
        const reason = prompt(`CRITICAL ACTION: ENTER REASON FOR PERMANENT DELETION OF ${targetUser.name}:`);
        if (!reason) return;

        try {
            await addDoc(collection(db, "deletion_requests"), {
                userId: targetUser.id,
                userName: targetUser.name,
                userEmail: targetUser.email,
                requestedBy: "Director of Analytics & Intel",
                reason: reason,
                status: "PENDING",
                timestamp: serverTimestamp(),
                originalData: targetUser
            });
            alert("DELETION REQUEST DISPATCHED TO COMMISSIONER FOR APPROVAL.");
        } catch (err) {
            console.error(err);
            alert("REQUEST FAILED. CHECK SYSTEM LOGS.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#00e5a0' }}>ACCESSING SECURE DATA REPOSITORY...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>GLOBAL USER DIRECTORY</h3>
                <div style={{ background: 'rgba(251,188,4,0.1)', color: '#fbbc04', padding: '8px 15px', borderRadius: '10px', fontSize: '11px', fontWeight: 900, border: '1px solid rgba(251,188,4,0.2)' }}>
                    {allUsers.length} TOTAL CITIZENS REGISTERED
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['CITIZEN NAME', 'EMAIL IDENTIFIER', 'ACCOUNT TYPE', 'STATUS', 'TACTICAL ACTION'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map((u, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>{u.name?.[0]}</div>
                                        <span style={{ fontWeight: 800 }}>{u.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{u.email}</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#4285F4', background: 'rgba(66,133,244,0.1)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>{u.accountType || 'Citizen'}</span>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', background: u.status === 'active' ? '#00e5a0' : '#fbbc04', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>{u.status || 'Active'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <button 
                                        onClick={() => requestDeletion(u)}
                                        style={{ 
                                            background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', 
                                            padding: '8px 15px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,77,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,77,77,0.1)'}
                                    >
                                        <FaTrash size={10} /> REQUEST DELETION
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ProfileView({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #00bfa5)', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#000', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px' }}>{user?.name}</h2>
                <div style={{ color: '#00e5a0', fontWeight: 800, letterSpacing: '2px', fontSize: '12px', marginBottom: '40px' }}>DIRECTOR OF ANALYTICS & CITY INTEL</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                    <div className="metric-card">
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: '5px' }}>EMAIL</div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{user?.email}</div>
                    </div>
                    <div className="metric-card">
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: '5px' }}>CLEARANCE</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#00e5a0' }}>LEVEL 5 (DIRECTOR)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
