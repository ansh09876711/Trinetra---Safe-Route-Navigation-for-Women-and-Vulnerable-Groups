import React, { useState, useEffect } from "react";
import { 
  FaShieldAlt, FaUserSecret, FaSearch, FaExclamationTriangle, FaDesktop, 
  FaGlobe, FaMobileAlt, FaUserShield, FaBan, FaFlag, FaHistory, 
  FaSignOutAlt, FaBug, FaNetworkWired, FaKey, FaClock, FaCheckCircle
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc } from "firebase/firestore";

export default function CyberSecurityMemberDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("monitor");
    const [stats, setStats] = useState({ fake: 12, suspicious: 4, blocked: 28, spam: 15 });
    const [logs, setLogs] = useState([
        { id: 1, user: "Ansh_77", device: "Android (Emulator)", location: "Mumbai, IN", time: "Just now", risk: "CRITICAL" },
        { id: 2, user: "Pri_Safety", device: "iPhone 15", location: "Delhi, IN", time: "2m ago", risk: "LOW" },
        { id: 3, user: "X_Hacker_9", device: "Unknown (Linux)", location: "Remote/VPN", time: "5m ago", risk: "HIGH" }
    ]);

    const tabs = [
        { id: 'monitor', label: 'LIVE MONITOR', icon: <FaSearch />, color: '#6366f1' },
        { id: 'fake_accounts', label: 'FAKE DETECT', icon: <FaUserSecret />, color: '#ff4d4d' },
        { id: 'devices', label: 'DEVICE LOGS', icon: <FaMobileAlt />, color: '#00e5a0' },
        { id: 'spam', label: 'SPam REports', icon: <FaBug />, color: '#ffd700' },
        { id: 'sessions', label: 'ACTIVE SESSIONS', icon: <FaKey />, color: '#a855f7' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUserShield />, color: '#94a3b8' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'monitor': return <LiveMonitorView logs={logs} stats={stats} />;
            case 'fake_accounts': return <FakeAccountView />;
            case 'devices': return <DeviceMonitoringView logs={logs} />;
            case 'spam': return <SpamReportView />;
            case 'sessions': return <SessionMonitoringView />;
            case 'profile': return <MemberProfileView user={user} onLogout={onLogout} />;
            default: return <LiveMonitorView logs={logs} stats={stats} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#02040a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* CYBER MEMBER SIDEBAR */}
            <aside style={{ width: '260px', background: 'rgba(5, 8, 15, 0.98)', borderRight: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', flexDirection: 'column', padding: '30px 0' }}>
                <div style={{ padding: '0 25px', marginBottom: '40px' }}>
                    <Logo height={30} />
                    <div style={{ marginTop: '15px', padding: '6px 12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#6366f1', letterSpacing: '2px' }}>CYBER_UNIT_AGENT</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px' }}>
                    {tabs.map(item => (
                        <div key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '12px 18px', marginBottom: '4px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.4)',
                                transition: '0.2s'
                            }}>
                            <span style={{ fontSize: '16px', color: activeTab === item.id ? item.color : 'inherit' }}>{item.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '0 20px' }}>
                    <button onClick={onLogout} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '10px', color: '#ff4d4d', cursor: 'pointer', fontSize: '10px', fontWeight: 900 }}>DISCONNECT</button>
                </div>
            </aside>

            {/* MAIN DASHBOARD */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '15px 40px', background: 'rgba(2, 4, 10, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>AGENT_MONITORING_GRID</h2>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>SECURITY STATUS: <span style={{ color: '#00e5a0' }}>ACTIVE</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 800 }}>CLEARANCE: LEVEL 2</div>
                        </div>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#6366f1' }}>{user?.name?.[0]}</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            <style>{`
                .glass-panel { background: rgba(10, 15, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 15px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function LiveMonitorView({ logs, stats }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
                {[
                    { label: 'SUSPICIOUS LOGINS', val: stats.suspicious, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'ACTIVE THREATS', val: '2', color: '#ffd700', icon: <FaBug /> },
                    { label: 'BLOCKED USERS', val: stats.blocked, color: '#94a3b8', icon: <FaBan /> },
                    { label: 'FAKE ALERTS', val: stats.spam, color: '#6366f1', icon: <FaUserSecret /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 900, color: w.color }}>{w.val}</div>
                            <div style={{ fontSize: '8px', fontWeight: 800, opacity: 0.4, letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                        <div style={{ fontSize: '20px', color: w.color, opacity: 0.3 }}>{w.icon}</div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '25px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaHistory /> REAL-TIME ACTIVITY FEED</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {logs.map(l => (
                        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ padding: '10px', background: l.risk === 'CRITICAL' ? 'rgba(255,77,77,0.1)' : 'rgba(99,102,241,0.1)', borderRadius: '8px' }}>
                                    {l.device.includes("Android") ? <FaMobileAlt color={l.risk === 'CRITICAL' ? '#ff4d4d' : '#6366f1'} /> : <FaDesktop color={l.risk === 'CRITICAL' ? '#ff4d4d' : '#6366f1'} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 900 }}>{l.user}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.4 }}>{l.device} • {l.location}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: l.risk === 'CRITICAL' ? '#ff4d4d' : '#00e5a0' }}>{l.risk}</div>
                                <div style={{ fontSize: '9px', opacity: 0.3 }}>{l.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FakeAccountView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>AI FAKE ACCOUNT DETECTION</h3>
            <div className="glass-panel" style={{ padding: '0' }}>
                {[
                    { user: "User_Unknown_99", reason: "Multiple account registration from same IP", risk: "HIGH", score: 89 },
                    { user: "Bot_Tester", reason: "Automated profile behavior detected", risk: "MEDIUM", score: 65 },
                    { user: "Spam_Master", reason: "Duplicate identity details", risk: "HIGH", score: 92 }
                ].map((u, i) => (
                    <div key={i} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 900 }}>{u.user}</div>
                            <div style={{ fontSize: '10px', color: '#ff4d4d', marginTop: '4px' }}>{u.reason}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{u.score}%</div>
                                <div style={{ fontSize: '8px', opacity: 0.4 }}>RISK_SCORE</div>
                            </div>
                            <button style={{ padding: '8px 15px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '6px', color: '#ff4d4d', fontSize: '10px', fontWeight: 900 }}>BLOCK TEMP</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DeviceMonitoringView({ logs }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>SUSPICIOUS DEVICE MONITORING</h3>
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,77,77,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff4d4d' }}>2</div>
                        <div style={{ fontSize: '9px', opacity: 0.4 }}>ROOTED DEVICES</div>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#6366f1' }}>1</div>
                        <div style={{ fontSize: '9px', opacity: 0.4 }}>EMULATOR ACCESS</div>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(0,229,160,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#00e5a0' }}>14</div>
                        <div style={{ fontSize: '9px', opacity: 0.4 }}>VERIFIED DEVICES</div>
                    </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.4, marginBottom: '15px' }}>RECENT HARDWARE LOGS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {logs.map(l => (
                        <div key={l.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{l.user} ➔ {l.device}</span>
                            <span style={{ color: '#ff4d4d' }}>FLAGGED</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SpamReportView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>SPAM & MALICIOUS ACTIVITY REPORTS</h3>
            <div className="glass-panel" style={{ padding: '0' }}>
                {[
                    { type: "FAKE SOS", user: "Gamer_X", count: "4 times", status: "PENDING" },
                    { type: "ABUSE REPORT", user: "Silent_Witch", count: "1 time", status: "INVESTIGATING" },
                    { type: "SPAM FLOOD", user: "Unknown_Bot", count: "128 requests", status: "MITIGATED" }
                ].map((s, i) => (
                    <div key={i} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#ffd700' }}>{s.type}</div>
                            <div style={{ fontSize: '10px', opacity: 0.4 }}>User: {s.user} • Frequency: {s.count}</div>
                        </div>
                        <button style={{ padding: '8px 15px', background: '#ffd700', color: '#000', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: 900 }}>RESOLVE</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SessionMonitoringView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>ACTIVE PLATFORM SESSIONS</h3>
            <div className="glass-panel" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[
                        { u: "Ansh_77", ip: "192.168.1.1", status: "ACTIVE", last: "Now" },
                        { u: "Chief_Office", ip: "10.0.0.1", status: "SECURE", last: "5m ago" }
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '15px', background: 'rgba(99,102,241,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FaCheckCircle color="#00e5a0" />
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 900 }}>{s.u}</div>
                                    <div style={{ fontSize: '10px', opacity: 0.4 }}>IP: {s.ip}</div>
                                </div>
                            </div>
                            <button style={{ padding: '6px 12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'none', borderRadius: '6px', fontSize: '9px', fontWeight: 900 }}>FORCE LOGOUT</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MemberProfileView({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '50px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#6366f1', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>{user?.name?.[0]}</div>
                <h3 style={{ fontWeight: 900 }}>{user?.name}</h3>
                <div style={{ fontSize: '10px', color: '#6366f1', letterSpacing: '2px', marginTop: '5px' }}>CYBER SECURITY AGENT</div>
                <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', textAlign: 'left' }}>
                    <div style={{ fontSize: '9px', opacity: 0.4 }}>CLEARANCE LEVEL</div>
                    <div style={{ fontSize: '14px', fontWeight: 900 }}>LEVEL 2 (AGENT)</div>
                </div>
                <button onClick={onLogout} style={{ marginTop: '30px', width: '100%', padding: '12px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900 }}>LOGOUT AGENT</button>
            </div>
        </div>
    );
}
