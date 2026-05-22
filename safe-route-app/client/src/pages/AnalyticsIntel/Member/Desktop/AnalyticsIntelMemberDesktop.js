import React, { useState, useEffect } from "react";
import { 
  FaSatellite, FaMicrochip, FaSearch, FaHistory, FaSignOutAlt, 
  FaBell, FaUser, FaClipboardList, FaUsers, FaThermometerHalf, FaCogs
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function AnalyticsIntelMemberDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("queue");
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(30));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(data);
        });
        return () => unsubscribe();
    }, []);

    const tabs = [
        { id: 'queue', label: 'INTEL QUEUE', icon: <FaClipboardList />, color: '#00e5a0' },
        { id: 'analysis', label: 'PATTERN ANALYSIS', icon: <FaMicrochip />, color: '#a855f7' },
        { id: 'sensors', label: 'SENSOR DIAGNOSTICS', icon: <FaCogs />, color: '#fbbc04' },
        { id: 'history', label: 'PROCESSED LOGS', icon: <FaHistory />, color: '#4285F4' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'queue': return <IntelQueueView incidents={incidents} />;
            case 'analysis': return <PatternAnalysisView />;
            case 'sensors': return <SensorDiagnosticsView />;
            case 'history': return <ProcessedLogsView incidents={incidents} />;
            case 'profile': return <ProfileView user={user} />;
            default: return <IntelQueueView incidents={incidents} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(0,229,160,0.1)', borderRadius: '8px', border: '1px solid rgba(0,229,160,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#00e5a0' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#00e5a0', letterSpacing: '2px' }}>INTEL OPS</span>
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

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input placeholder="SEARCH INTEL DATA..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#00e5a0', fontWeight: 800, letterSpacing: '1px' }}>INTEL ANALYST • ANALYTICS & MONITORING</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #00e5a0, #00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#000', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>
            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function IntelQueueView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>UNPROCESSED INTEL QUEUE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {incidents.length > 0 ? incidents.map((inc, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{inc.userName[0]}</div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{inc.userName} - Raw Signal</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Coordinates: {inc.lat?.toFixed(4)}, {inc.lng?.toFixed(4)}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900 }}>ANALYZE</button>
                            <button style={{ padding: '10px 20px', background: '#00e5a0', border: 'none', borderRadius: '10px', color: '#000', fontSize: '11px', fontWeight: 900 }}>PROCESS</button>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.1)' }}>QUEUE IS EMPTY</div>
                )}
            </div>
        </div>
    );
}

function PatternAnalysisView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>PATTERN ANALYSIS TOOLS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <FaMicrochip size={40} color="#a855f7" style={{ marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '10px' }}>HEATMAP GENERATOR</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Generate city-wide crime/safety heatmaps for public consumption.</p>
                    <button style={{ width: '100%', padding: '12px', background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f7', borderRadius: '10px', color: '#a855f7', fontSize: '11px', fontWeight: 900 }}>OPEN TOOL</button>
                </div>
            </div>
        </div>
    );
}

function SensorDiagnosticsView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>SENSOR NETWORK DIAGNOSTICS</h2>
            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '10px' }}>NODE_{100 + i}</div>
                            <div style={{ width: '10px', height: '10px', background: '#00e5a0', borderRadius: '50%', margin: '0 auto 10px' }}></div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>LATENCY: 12ms</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProcessedLogsView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>PROCESSED INTEL LOGS</h2>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['SIGNAL ID', 'TIMESTAMP', 'ANALYST', 'DECISION'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.slice(0, 10).map((inc, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontSize: '12px', fontFamily: 'monospace' }}>{inc.id.substring(0, 12)}</td>
                                <td style={{ padding: '20px', fontSize: '12px' }}>{new Date(inc.timestamp).toLocaleString()}</td>
                                <td style={{ padding: '20px', fontWeight: 800 }}>AI_CORE_01</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ padding: '5px 12px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>VERIFIED</span>
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
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #00bfa5)', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#000', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '5px' }}>{user?.name}</h2>
                <div style={{ color: '#00e5a0', fontWeight: 800, fontSize: '11px', letterSpacing: '1px' }}>CERTIFIED INTEL ANALYST</div>
            </div>
        </div>
    );
}
