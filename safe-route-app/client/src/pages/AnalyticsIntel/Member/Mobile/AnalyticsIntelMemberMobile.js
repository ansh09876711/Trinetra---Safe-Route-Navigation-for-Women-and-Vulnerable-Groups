import React, { useState, useEffect } from "react";
import { 
  FaClipboardList, FaMicrochip, FaCogs, FaUser, 
  FaExclamationTriangle, FaBell, FaSignOutAlt, FaSearch
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function AnalyticsIntelMemberMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("queue");
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
            case 'queue': return <QueueMobile incidents={incidents} />;
            case 'analysis': return <AnalysisMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <QueueMobile incidents={incidents} />;
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
                    <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 900, letterSpacing: '2px', marginBottom: '5px' }}>INTEL ANALYST • FIELD</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>Hello, {user?.name?.split(' ')[0]}</div>
                </div>
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10, 12, 18, 0.98)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
                {[
                    { id: 'queue', icon: <FaClipboardList />, label: 'Queue' },
                    { id: 'analysis', icon: <FaMicrochip />, label: 'Analysis' },
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
            `}</style>
        </div>
    );
}

function QueueMobile({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>UNPROCESSED INTEL</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incidents.slice(0, 8).map((inc, i) => (
                    <div key={i} className="m-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{inc.userName}</div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>{new Date(inc.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <button style={{ padding: '8px 15px', background: '#00e5a0', border: 'none', borderRadius: '8px', color: '#000', fontSize: '10px', fontWeight: 900 }}>ANALYZE</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalysisMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '10px' }}>AI PATTERN DETECTION</h4>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Scanning city-wide signals for anomalies...</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '15px', overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', background: '#00e5a0' }} />
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
                <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 800, marginTop: '5px' }}>FIELD ANALYST</div>
            </div>
            <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px' }}>LOGOUT</button>
        </div>
    );
}
