import React, { useState, useEffect } from "react";
import { 
  FaShieldAlt, FaBug, FaUserSecret, FaUserShield, FaPowerOff, 
  FaFingerprint, FaBars, FaTimes, FaExclamationTriangle, FaTerminal
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function CyberSecurityHeadMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [threats, setThreats] = useState([
        { id: 1, type: "Brute Force", status: "BLOCKED", time: "2m ago" },
        { id: 2, type: "SQL Injection", status: "MITIGATED", time: "5m ago" }
    ]);

    const tabs = [
        { id: 'command', label: 'HUB', icon: <FaShieldAlt /> },
        { id: 'threats', label: 'THREATS', icon: <FaBug /> },
        { id: 'admin_watch', label: 'WATCH', icon: <FaUserShield /> },
        { id: 'lockdown', label: 'LOCK', icon: <FaPowerOff /> },
        { id: 'profile', label: 'CLEARANCE', icon: <FaFingerprint /> },
    ];

    return (
        <div style={{ background: '#02040a', minHeight: '100vh', color: '#fff', paddingBottom: '80px' }}>
            {/* MOBILE HEADER */}
            <header style={{ padding: '20px', background: 'rgba(5, 8, 15, 0.95)', borderBottom: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Logo height={25} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900 }}>CYBER_CHIEF</div>
                        <div style={{ fontSize: '8px', color: '#6366f1', fontWeight: 800 }}>DIV_5_SECURED</div>
                    </div>
                    <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                </div>
            </header>

            {/* CONTENT */}
            <main style={{ padding: '20px' }}>
                {activeTab === 'command' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', marginBottom: '20px', borderLeft: '4px solid #ff4d4d' }}>
                            <FaExclamationTriangle size={30} color="#ff4d4d" style={{ marginBottom: '10px' }} />
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>LOW</div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>CURRENT THREAT LEVEL</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>SECURITY ANALYTICS</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e5a0' }}>420ms</div>
                                    <div style={{ fontSize: '8px', opacity: 0.4 }}>MITIGATION TIME</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#6366f1' }}>98.4%</div>
                                    <div style={{ fontSize: '8px', opacity: 0.4 }}>AI ACCURACY</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'threats' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>ACTIVE THREAT FEED</h3>
                        {threats.map(t => (
                            <div key={t.id} className="glass-panel" style={{ padding: '15px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 900, color: '#ff4d4d' }}>{t.type}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.4 }}>Detected {t.time}</div>
                                    </div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#00e5a0' }}>{t.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'lockdown' && (
                    <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', padding: '40px 0' }}>
                        <div className="glass-panel" style={{ padding: '40px' }}>
                            <FaPowerOff size={60} color="#ff4d4d" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontWeight: 900 }}>EMERGENCY LOCKDOWN</h3>
                            <p style={{ fontSize: '11px', opacity: 0.4, margin: '15px 0 30px' }}>Restricts all platform access immediately.</p>
                            <button style={{ width: '100%', padding: '15px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900 }}>EXECUTE LOCKDOWN</button>
                        </div>
                    </div>
                )}

                {activeTab === 'admin_watch' && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>ADMIN AUDIT LOGS</h3>
                        {[
                            { e: "Supreme Login", u: "Chief", t: "10m ago" },
                            { e: "Perm Change", u: "Admin", t: "25m ago" }
                        ].map((l, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '15px', marginBottom: '10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900 }}>{l.e}</div>
                                <div style={{ fontSize: '10px', opacity: 0.4 }}>{l.u} • {l.t}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
                        <div className="glass-panel" style={{ padding: '40px' }}>
                            <FaFingerprint size={50} color="#6366f1" style={{ marginBottom: '20px' }} />
                            <h3 style={{ fontWeight: 900 }}>CLEARANCE LEVEL 9</h3>
                            <div style={{ fontSize: '10px', color: '#6366f1', marginTop: '5px', letterSpacing: '2px' }}>BLACK-OPS ACCESS</div>
                            <button onClick={onLogout} style={{ marginTop: '30px', width: '100%', padding: '12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', fontWeight: 800 }}>LOGOUT SECURITY</button>
                        </div>
                    </div>
                )}
            </main>

            {/* BOTTOM NAV */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(5, 8, 15, 0.95)', borderTop: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(20px)', zIndex: 1000 }}>
                {tabs.map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ textAlign: 'center', opacity: activeTab === item.id ? 1 : 0.3, transition: '0.3s' }}>
                        <div style={{ fontSize: '20px', color: activeTab === item.id ? '#6366f1' : '#fff' }}>{item.icon}</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, marginTop: '4px', textTransform: 'uppercase' }}>{item.label}</div>
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
