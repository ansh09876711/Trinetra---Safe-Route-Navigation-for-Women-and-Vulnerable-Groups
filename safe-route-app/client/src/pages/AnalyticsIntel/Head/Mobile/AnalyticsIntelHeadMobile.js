import React, { useState, useEffect } from "react";
import { 
  FaSatellite, FaChartBar, FaMicrochip, FaCogs, FaUser, 
  FaExclamationTriangle, FaBell, FaSignOutAlt, FaMapMarkedAlt
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function AnalyticsIntelHeadMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("intel");
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(20));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(data);
        });
        return () => unsubscribe();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'intel': return <IntelMobile incidents={incidents} />;
            case 'metrics': return <MetricsMobile />;
            case 'risk': return <RiskMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <IntelMobile incidents={incidents} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', paddingBottom: '80px', fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* Header */}
            <header style={{ padding: '20px', background: 'rgba(10, 12, 18, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Logo height={25} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaBell color="#00e5a0" />
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #00e5a0, #00bfa5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#000' }}>{user?.name?.[0]}</div>
                </div>
            </header>

            <main style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 900, letterSpacing: '2px', marginBottom: '5px' }}>INTEL COMMAND • MOBILE</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>Systems Nominal, {user?.name?.split(' ')[0]}</div>
                </div>
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10, 12, 18, 0.98)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
                {[
                    { id: 'intel', icon: <FaSatellite />, label: 'Intel' },
                    { id: 'metrics', icon: <FaChartBar />, label: 'Stats' },
                    { id: 'risk', icon: <FaMicrochip />, label: 'Risk' },
                    { id: 'profile', icon: <FaUser />, label: 'Me' }
                ].map(tab => (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === tab.id ? '#00e5a0' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                        <div style={{ fontSize: '20px' }}>{tab.icon}</div>
                        <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{tab.label}</div>
                    </div>
                ))}
            </nav>
            <style>{`
                .m-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 15px; }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

function IntelMobile({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ height: '200px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'rgba(0,229,160,0.02)' }}>
                <FaMapMarkedAlt size={40} color="rgba(0,229,160,0.1)" />
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: 900, color: '#00e5a0' }}>LIVE MAP HUD</div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>LIVE INTEL STREAM</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incidents.slice(0, 5).map((inc, i) => (
                    <div key={i} className="m-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{inc.userName}</div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{inc.locationName?.substring(0, 30)}...</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900 }}>SOS</div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{new Date(inc.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MetricsMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="m-card">
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#00e5a0' }}>88</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>SAFETY INDEX</div>
                </div>
                <div className="m-card">
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#4285F4' }}>4.2m</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>AVG RESPONSE</div>
                </div>
            </div>
            <div className="m-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px' }}>UNIT PERFORMANCE</h4>
                {[
                    { unit: 'SOS ALPHA', perf: 98 },
                    { unit: 'TAXI UNIT', perf: 92 },
                    { unit: 'WOMEN SUPPORT', perf: 95 }
                ].map((u, i) => (
                    <div key={i} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px' }}>
                            <span>{u.unit}</span>
                            <span>{u.perf}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                            <div style={{ width: `${u.perf}%`, height: '100%', background: '#00e5a0', borderRadius: '2px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RiskMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ borderLeft: '4px solid #a855f7', marginBottom: '15px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#a855f7', marginBottom: '5px' }}>AI PREDICTION</div>
                <div style={{ fontSize: '16px', fontWeight: 900 }}>SECTOR 4-B RISK INCREASE</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>Probability: High | Window: 18:00 - 21:00</div>
            </div>
            <div className="m-card">
                <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px' }}>PREVENTIVE MEASURES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button style={{ width: '100%', padding: '12px', background: 'rgba(0,229,160,0.1)', border: '1px solid #00e5a0', borderRadius: '10px', color: '#00e5a0', fontSize: '11px', fontWeight: 900 }}>RE-ROUTE PATROLS</button>
                    <button style={{ width: '100%', padding: '12px', background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f7', borderRadius: '10px', color: '#a855f7', fontSize: '11px', fontWeight: 900 }}>ISSUE BROADCAST</button>
                </div>
            </div>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #00bfa5)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#000' }}>{user?.name?.[0]}</div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 800, marginTop: '5px', letterSpacing: '1px' }}>ANALYTICS DIRECTOR</div>
            </div>
            <div className="m-card">
                <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Access:</span>
                    <span>LEVEL 5 INTEL</span>
                </div>
                <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px' }}>TERMINATE SESSION</button>
            </div>
        </div>
    );
}
