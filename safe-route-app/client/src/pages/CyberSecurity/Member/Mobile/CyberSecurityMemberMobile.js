import React, { useState } from "react";
import { 
  FaShieldAlt, FaUserSecret, FaBug, FaMobileAlt, FaKey, FaUserShield, 
  FaExclamationTriangle, FaSearch
} from "react-icons/fa";
import Logo from "../../../../components/Logo";

export default function CyberSecurityMemberMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("monitor");

    const tabs = [
        { id: 'monitor', label: 'LIVE', icon: <FaSearch /> },
        { id: 'fake', label: 'FAKE', icon: <FaUserSecret /> },
        { id: 'spam', label: 'SPAM', icon: <FaBug /> },
        { id: 'devices', label: 'DEVICES', icon: <FaMobileAlt /> },
        { id: 'profile', label: 'ME', icon: <FaUserShield /> },
    ];

    return (
        <div style={{ background: '#02040a', minHeight: '100vh', color: '#fff', paddingBottom: '80px' }}>
            {/* MOBILE HEADER */}
            <header style={{ padding: '20px', background: 'rgba(5, 8, 15, 0.95)', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Logo height={25} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900 }}>AGENT_MODE</div>
                        <div style={{ fontSize: '8px', color: '#6366f1', fontWeight: 800 }}>DIV_5_MONITOR</div>
                    </div>
                    <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{user?.name?.[0]}</div>
                </div>
            </header>

            {/* CONTENT */}
            <main style={{ padding: '20px' }}>
                {activeTab === 'monitor' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff4d4d' }}>12</div>
                                <div style={{ fontSize: '8px', opacity: 0.4 }}>FAKE_USERS</div>
                            </div>
                            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffd700' }}>4</div>
                                <div style={{ fontSize: '8px', opacity: 0.4 }}>ACTIVE_SPAM</div>
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px' }}>RECENT LOGINS</h3>
                            {[1,2,3].map(i => (
                                <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '8px', fontSize: '11px' }}>
                                    User_{i}99 ➔ Login from <span style={{ color: '#6366f1' }}>Mumbai</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'fake' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>SUSPICIOUS ACCOUNTS</h3>
                        {[1,2].map(i => (
                            <div key={i} className="glass-panel" style={{ padding: '15px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900 }}>Bot_User_{i}</div>
                                <div style={{ fontSize: '10px', color: '#ff4d4d' }}>Multiple IP Switching Detected</div>
                                <button style={{ marginTop: '10px', width: '100%', padding: '8px', background: 'rgba(255,77,77,0.1)', border: 'none', borderRadius: '6px', color: '#ff4d4d', fontSize: '10px', fontWeight: 900 }}>FLAG ACCOUNT</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'spam' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>SOS SPAM QUEUE</h3>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <FaBug size={30} color="#ffd700" style={{ marginBottom: '10px' }} />
                            <div style={{ fontSize: '12px', fontWeight: 800 }}>NO NEW SPAM DETECTED</div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
                        <div className="glass-panel" style={{ padding: '40px' }}>
                            <h3 style={{ fontWeight: 900 }}>AGENT CLEARANCE</h3>
                            <div style={{ fontSize: '10px', color: '#6366f1', marginTop: '5px' }}>DIVISION 5 • UNIT 2</div>
                            <button onClick={onLogout} style={{ marginTop: '30px', width: '100%', padding: '12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', fontWeight: 800 }}>DISCONNECT AGENT</button>
                        </div>
                    </div>
                )}
            </main>

            {/* BOTTOM NAV */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(5, 8, 15, 0.95)', borderTop: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(20px)', zIndex: 1000 }}>
                {tabs.map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ textAlign: 'center', opacity: activeTab === item.id ? 1 : 0.3 }}>
                        <div style={{ fontSize: '20px', color: activeTab === item.id ? '#6366f1' : '#fff' }}>{item.icon}</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, marginTop: '4px' }}>{item.label}</div>
                    </div>
                ))}
            </nav>

            <style>{`
                .glass-panel { background: rgba(10, 15, 25, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 15px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
