import React, { useState, useEffect } from "react";
import { 
  FaShieldAlt, FaLock, FaUserShield, FaSkull, FaServer, FaTerminal, 
  FaDatabase, FaMicrochip, FaChartLine, FaHistory, FaUserSecret, 
  FaExclamationTriangle, FaSignOutAlt, FaGhost, FaNetworkWired, FaBug,
  FaFileShield, FaUserPlus, FaTrash, FaFingerprint, FaPowerOff, FaBolt, FaSearchLocation, FaEnvelope
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db, auth } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit, where, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword as firebaseCreateUser } from "firebase/auth";

export default function CyberSecurityHeadDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [threatLevel, setThreatLevel] = useState("LOW");
    const [isLockdown, setIsLockdown] = useState(false);
    const [threats, setThreats] = useState([
        { id: 1, type: "Brute Force", source: "192.168.1.45", target: "Admin Login", status: "BLOCKED", time: "2m ago" },
        { id: 2, type: "SQL Injection", source: "45.23.11.90", target: "Citizen DB", status: "QUARANTINED", time: "5m ago" },
        { id: 3, type: "DDoS Simulation", source: "Botnet-X7", target: "SOS API", status: "MITIGATED", time: "12m ago" }
    ]);
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "reports"),
            where("type", "==", "CYBER ABUSE"),
            orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(list);
        });
        return () => unsubscribe();
    }, []);

    const tabs = [
        { id: 'command', label: 'SECURITY HUB', icon: <FaShieldAlt />, color: '#6366f1' },
        { id: 'threats', label: 'THREAT FEED', icon: <FaBug />, color: '#ff4d4d' },
        { id: 'team', label: 'SECURITY TEAM', icon: <FaUserSecret />, color: '#00e5a0' },
        { id: 'admin_watch', label: 'ADMIN WATCH', icon: <FaUserShield />, color: '#ffd700' },
        { id: 'data_protection', label: 'ENCRYPTION', icon: <FaLock />, color: '#a855f7' },
        { id: 'lockdown', label: 'LOCKDOWN', icon: <FaPowerOff />, color: '#ff4d4d' },
        { id: 'analytics', label: 'SECURITY LOGS', icon: <FaTerminal />, color: '#94a3b8' },
        { id: 'profile', label: 'MY CLEARANCE', icon: <FaFingerprint />, color: '#6366f1' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'command': return <SecurityHubView threats={threats} incidents={incidents} threatLevel={threatLevel} user={user} />;
            case 'threats': return <ThreatFeedView threats={threats} incidents={incidents} user={user} />;
            case 'team': return <SecurityTeamView />;
            case 'admin_watch': return <AdminWatchView />;
            case 'data_protection': return <EncryptionView />;
            case 'lockdown': return <LockdownView isLockdown={isLockdown} setIsLockdown={setIsLockdown} />;
            case 'analytics': return <SecurityAnalyticsView />;
            case 'profile': return <SecurityProfileView user={user} />;
            default: return <SecurityHubView threats={threats} threatLevel={threatLevel} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#02040a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            <aside style={{ width: '280px', background: 'rgba(5, 8, 15, 0.98)', borderRight: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', flexDirection: 'column', padding: '30px 0' }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot-cyber"></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#6366f1', letterSpacing: '2px' }}>CYBER HEADQUARTERS</span>
                    </div>
                </div>
                <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
                    {tabs.map(item => (
                        <div key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '14px 20px', marginBottom: '6px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                borderLeft: `3px solid ${activeTab === item.id ? item.color : 'transparent'}`,
                                transition: '0.2s'
                            }}>
                            <span style={{ fontSize: '18px', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.2)' }}>{item.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div style={{ padding: '0 20px' }}>
                    <button onClick={onLogout} style={{ width: '100%', padding: '16px', background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.1)', borderRadius: '12px', color: '#ff4d4d', cursor: 'pointer', fontSize: '11px', fontWeight: 900 }}>TERMINATE SESSION</button>
                </div>
            </aside>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(2, 4, 10, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px', color: '#6366f1' }}>CYBER SECURITY COMMAND</h1>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>VULNERABILITY SCAN: <span style={{ color: '#00e5a0' }}>CLEAN</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#6366f1', fontWeight: 800, letterSpacing: '1px' }}>CHIEF OF SECURITY OPERATIONS</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            <style>{`
                .glass-panel { background: rgba(10, 15, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; }
                .status-dot-cyber { width: 8px; height: 8px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 10px #6366f1; animation: blink 1.5s infinite; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function SecurityHubView({ threats, incidents, threatLevel, user }) {
    const activeCyberReports = incidents.filter(i => i.status !== "DELETED").length;
    
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'SYSTEM THREAT LEVEL', val: threatLevel, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'ACTIVE CYBER REPORTS', val: activeCyberReports, color: '#6366f1', icon: <FaBug /> },
                    { label: 'ADMIN SECURITY', val: 'OPTIMAL', color: '#ffd700', icon: <FaUserShield /> },
                    { label: 'DB ENCRYPTION', val: 'AES-256', color: '#6366f1', icon: <FaDatabase /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', borderLeft: `4px solid ${w.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 900 }}>{w.val}</div>
                                <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                            </div>
                            <div style={{ fontSize: '24px', color: w.color, opacity: 0.5 }}>{w.icon}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '500px', padding: '30px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}><FaSearchLocation color="#6366f1" /> CITIZEN CYBER REPORTS</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', height: '400px' }}>
                        {incidents.filter(i => i.status !== "DELETED").map(i => (
                            <div key={i.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', borderLeft: '3px solid #6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 900 }}>{i.userName}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{i.description?.substring(0, 100)}...</div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={async () => {
                                            try { await updateDoc(doc(db, "reports", i.id), { status: "INVESTIGATING", assignedAt: Date.now(), assignedBy: user.name }); }
                                            catch(e) {}
                                        }}
                                        style={{ padding: '8px 15px', background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '8px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
                                    >
                                        INVESTIGATE
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if(window.confirm("CLEAR REPORT?")) {
                                                try { await updateDoc(doc(db, "reports", i.id), { status: "DELETED", deletedAt: Date.now() }); }
                                                catch(e) {}
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {incidents.filter(i => i.status !== "DELETED").length === 0 && (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.1)', marginTop: '100px', fontWeight: 900, letterSpacing: '2px' }}>NO ACTIVE CYBER THREATS REPORTED</div>
                        )}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px' }}><FaBolt color="#ffd700" /> SYSTEM THREAT FEED</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {threats.map(t => (
                            <div key={t.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: t.status === 'BLOCKED' ? '#ff4d4d' : '#00e5a0' }}>{t.type}</span>
                                    <span style={{ fontSize: '9px', opacity: 0.4 }}>{t.time}</span>
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700 }}>Source: {t.source}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThreatFeedView({ threats }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>TACTICAL THREAT ANALYSIS</h3>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '20px', fontSize: '11px', color: '#6366f1' }}>ID</th>
                            <th style={{ padding: '20px', fontSize: '11px', color: '#6366f1' }}>TYPE</th>
                            <th style={{ padding: '20px', fontSize: '11px', color: '#6366f1' }}>SOURCE</th>
                            <th style={{ padding: '20px', fontSize: '11px', color: '#6366f1' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {threats.map((t, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '20px', color: 'rgba(255,255,255,0.4)' }}>#T-{100 + i}</td>
                                <td style={{ padding: '20px', fontWeight: 800 }}>{t.type}</td>
                                <td style={{ padding: '20px', color: '#00e5a0' }}>{t.source}</td>
                                <td style={{ padding: '20px' }}><div style={{ padding: '4px 10px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '4px', fontSize: '10px', fontWeight: 900, width: 'fit-content' }}>{t.status}</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SecurityTeamView() {
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [status, setStatus] = useState("");
    useEffect(() => {
        const q = query(collection(db, "users"), where("divisionId", "==", "5"), where("accountType", "==", "divisional_member"));
        return onSnapshot(q, s => setMembers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    }, []);
    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const cred = await firebaseCreateUser(auth, form.email, form.password);
            await setDoc(doc(db, "users", cred.user.uid), {
                name: form.name, email: form.email, role: "member", accountType: "divisional_member", divisionId: "5", designation: "ANALYST", createdAt: Date.now()
            });
            setForm({ name: "", email: "", password: "" });
        } catch (err) { console.error(err); }
    };
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>PROVISION AGENT</h3>
                <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <input type="text" placeholder="NAME" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <input type="email" placeholder="EMAIL" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <input type="password" placeholder="PASSWORD" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 900 }}>PROVISION</button>
                </form>
            </div>
            <div className="glass-panel" style={{ padding: '30px' }}>
                <table style={{ width: '100%', textAlign: 'left' }}>
                    <thead><tr style={{ opacity: 0.4, fontSize: '11px' }}><th style={{ padding: '15px' }}>AGENT</th><th style={{ padding: '15px' }}>STATUS</th><th style={{ padding: '15px' }}>ACTIONS</th></tr></thead>
                    <tbody>
                        {members.map(m => (
                            <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '15px', fontWeight: 700 }}>{m.name}</td>
                                <td style={{ padding: '15px', color: '#00e5a0' }}>ACTIVE</td>
                                <td style={{ padding: '15px' }}><button onClick={() => deleteDoc(doc(db, "users", m.id))} style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'none', padding: '8px', borderRadius: '6px' }}><FaTrash /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminWatchView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>ADMIN AUDIT</h3>
            <div className="glass-panel" style={{ padding: '20px' }}>
                {[ { e: "Supreme Login", u: "Chief", t: "10m ago" }, { e: "Sensitive Access", u: "Admin", t: "1h ago" } ].map((l, i) => (
                    <div key={i} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontWeight: 900 }}>{l.e}</div>
                        <div style={{ fontSize: '11px', opacity: 0.4 }}>{l.u} • {l.t}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EncryptionView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>ENCRYPTION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[ { l: "DATABASE", s: "SECURE", a: "AES-256", i: <FaDatabase /> } ].map((e, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '30px', color: '#6366f1' }}>{e.i}</div>
                        <div style={{ fontWeight: 900, marginTop: '10px' }}>{e.l}</div>
                        <div style={{ fontSize: '10px', color: '#00e5a0' }}>{e.s}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LockdownView({ isLockdown, setIsLockdown }) {
    const handleLockdown = () => {
        const pass = prompt("KEY:");
        if (pass === "OMEGA") { setIsLockdown(!isLockdown); }
    };
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="glass-panel" style={{ padding: '60px' }}>
                <FaPowerOff size={80} color={isLockdown ? "#ff4d4d" : "#fff"} />
                <h2 style={{ fontWeight: 900, marginTop: '20px' }}>{isLockdown ? "LOCKED" : "LOCKDOWN"}</h2>
                <button onClick={handleLockdown} style={{ marginTop: '30px', width: '100%', padding: '20px', background: isLockdown ? '#00e5a0' : '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900 }}>{isLockdown ? "UNLOCK" : "LOCK"}</button>
            </div>
        </div>
    );
}

function SecurityAnalyticsView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>ANALYTICS</h3>
            <div className="glass-panel" style={{ padding: '30px', height: '300px' }}>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                    {[30, 80, 45, 90].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: '#6366f1', borderRadius: '4px' }}></div>)}
                </div>
            </div>
        </div>
    );
}

function SecurityProfileView({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '50px' }}>
                <div style={{ width: '100px', height: '100px', background: '#6366f1', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>{user?.name?.[0]}</div>
                <h2 style={{ fontWeight: 900 }}>{user?.name}</h2>
                <div style={{ color: '#6366f1' }}>CHIEF SECURITY OFFICER</div>
            </div>
        </div>
    );
}
