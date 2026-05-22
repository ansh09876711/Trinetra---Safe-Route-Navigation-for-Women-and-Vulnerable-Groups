import React, { useState, useEffect } from "react";
import { 
  FaUserShield, FaGlobe, FaBroadcastTower, FaSatellite, FaBell, FaSignOutAlt, 
  FaShieldAlt, FaUsers, FaExclamationTriangle, FaChartLine, FaCogs, FaMicrochip, 
  FaBullhorn, FaTrash, FaBan, FaBrain, FaServer, FaDatabase, FaBars
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";

export default function CommissionerHeadMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("warroom");
    const [incidents, setIncidents] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const unsubReports = onSnapshot(collection(db, "reports"), s => setIncidents(s.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubAlerts = onSnapshot(query(collection(db, "divisional_alerts"), where("status", "==", "ACTIVE")), s => setAlerts(s.docs.map(d => ({id: d.id, ...d.data()}))));
        const unsubUsers = onSnapshot(collection(db, "users"), s => setUsers(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => { unsubReports(); unsubAlerts(); unsubUsers(); };
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'warroom': return <WarRoomMobile incidents={incidents} alerts={alerts} />;
            case 'teams': return <TeamsMobile users={users} />;
            case 'emergency': return <EmergencyMobile incidents={incidents} />;
            case 'ai': return <AIMobile incidents={incidents} />;
            case 'more': return <MoreHubMobile user={user} onLogout={onLogout} />;
            default: return <WarRoomMobile incidents={incidents} alerts={alerts} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#020305', color: '#fff', paddingBottom: '80px', fontFamily: "'Space Grotesk', sans-serif" }}>
            <header style={{ padding: '20px', background: 'rgba(5, 7, 10, 0.95)', borderBottom: '1px solid rgba(255,215,0,0.1)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Logo height={25} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaShieldAlt color="#ffd700" />
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#000' }}>{user?.name?.[0]}</div>
                </div>
            </header>

            <main style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', color: '#ffd700', fontWeight: 900, letterSpacing: '2px', marginBottom: '5px' }}>WAR ROOM • MOBILE COMMAND</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>Supreme Authority, {user?.name?.split(' ')[0]}</div>
                </div>
                {renderContent()}
            </main>

            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(5, 7, 10, 0.98)', borderTop: '1px solid rgba(255,215,0,0.1)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
                {[
                    { id: 'warroom', icon: <FaGlobe />, label: 'HUD' },
                    { id: 'teams', icon: <FaUsers />, label: 'Teams' },
                    { id: 'emergency', icon: <FaExclamationTriangle />, label: 'SOS' },
                    { id: 'ai', icon: <FaBrain />, label: 'AI' },
                    { id: 'more', icon: <FaBars />, label: 'More' }
                ].map(tab => (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === tab.id ? '#ffd700' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                        <div style={{ fontSize: '20px' }}>{tab.icon}</div>
                        <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{tab.label}</div>
                    </div>
                ))}
            </nav>
            <style>{`
                .w-card { background: rgba(255,215,0,0.03); border: 1px solid rgba(255,215,0,0.1); border-radius: 15px; padding: 15px; }
            `}</style>
        </div>
    );
}

function WarRoomMobile({ incidents, alerts }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="w-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#00e5a0' }}>92%</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>CITY SAFETY</div>
                </div>
                <div className="w-card" style={{ textAlign: 'center', borderColor: alerts.length > 0 ? '#ff4d4d' : 'rgba(255,215,0,0.1)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff4d4d' }}>{alerts.length}</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>ACTIVE ALERTS</div>
                </div>
            </div>

            <div className="w-card" style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.02)', position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaGlobe size={80} color="#00e5a0" style={{ opacity: 0.5 }} />
                <div style={{ position: 'absolute', bottom: '15px', fontSize: '10px', fontWeight: 900, color: '#00e5a0' }}>SATELLITE SYNC ACTIVE</div>
            </div>

            <h3 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px', letterSpacing: '1px' }}>RECENT ESCALATIONS</h3>
            {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', opacity: 0.3, fontSize: '12px' }}>NO ACTIVE ALERTS</div>
            ) : (
                alerts.map(a => (
                    <div key={a.id} className="w-card" style={{ marginBottom: '10px', borderLeft: '3px solid #ff4d4d' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900, color: '#ff4d4d' }}>{a.type}</div>
                        <div style={{ fontSize: '10px', marginTop: '5px' }}>{a.message}</div>
                    </div>
                ))
            )}
        </div>
    );
}

function TeamsMobile({ users }) {
    const handleDelete = async (id) => {
        if(window.confirm("TERMINATE ACCESS?")) await deleteDoc(doc(db, "users", id));
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>TEAM OVERSIGHT</h3>
            {users.map(u => (
                <div key={u.id} className="w-card" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 900 }}>{u.name}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>DIV_{u.divisionId} • {u.accountType}</div>
                    </div>
                    <button onClick={() => handleDelete(u.id)} style={{ padding: '8px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'none', borderRadius: '8px' }}><FaTrash size={12} /></button>
                </div>
            ))}
        </div>
    );
}

function EmergencyMobile({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>GLOBAL SOS FEED</h3>
            {incidents.slice(0, 10).map(i => (
                <div key={i.id} className="w-card" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#ff4d4d' }}>{i.type}</span>
                        <span style={{ fontSize: '10px', opacity: 0.4 }}>{new Date(i.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '11px', marginBottom: '10px' }}>{i.locationName}</div>
                    <button style={{ width: '100%', padding: '10px', background: '#ff4d4d', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>OVERRIDE & ESCALATE</button>
                </div>
            ))}
        </div>
    );
}

function AIMobile({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="w-card" style={{ textAlign: 'center', padding: '40px', marginBottom: '20px' }}>
                <FaBrain size={60} color="#a855f7" />
                <h3 style={{ fontWeight: 900, marginTop: '15px' }}>AI RISK MONITOR</h3>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>City-wide threat scanning active...</p>
            </div>
            <div className="w-card">
                <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '10px' }}>PREDICTIVE DISPATCH</h4>
                <div style={{ fontSize: '11px', padding: '10px', background: 'rgba(0,229,160,0.05)', color: '#00e5a0', borderRadius: '8px' }}>
                    AI suggests Team Beta relocate to Sector 4 (High risk detection)
                </div>
            </div>
        </div>
    );
}

function MoreHubMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="w-card" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: '#000' }}>{user?.name?.[0]}</div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#ffd700', fontWeight: 800, marginTop: '5px', letterSpacing: '2px' }}>LEVEL 10 COMMANDER</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="w-card" style={{ textAlign: 'center' }}><FaChartLine size={20} /><div style={{ fontSize: '10px', marginTop: '5px' }}>Analytics</div></div>
                <div className="w-card" style={{ textAlign: 'center' }}><FaBullhorn size={20} /><div style={{ fontSize: '10px', marginTop: '5px' }}>Broadcast</div></div>
                <div className="w-card" style={{ textAlign: 'center' }}><FaServer size={20} /><div style={{ fontSize: '10px', marginTop: '5px' }}>Security</div></div>
                <div className="w-card" style={{ textAlign: 'center' }}><FaCogs size={20} /><div style={{ fontSize: '10px', marginTop: '5px' }}>Settings</div></div>
            </div>

            <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px' }}>TERMINATE COMMAND</button>
        </div>
    );
}
