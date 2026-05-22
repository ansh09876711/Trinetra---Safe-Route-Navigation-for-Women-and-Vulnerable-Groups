import React, { useState, useEffect } from "react";
import { 
  FaExclamationCircle, FaUsers, FaRobot, FaMapMarkedAlt, 
  FaArrowUp, FaBroadcastTower, FaChartLine, FaUnlockAlt, 
  FaBrain, FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaThLarge, 
  FaSearch, FaUser, FaTrash, FaTimes, FaShieldAlt, FaPlus, FaFilter, FaChartBar, FaEnvelope, FaLock, FaEye, FaEyeSlash
} from "react-icons/fa";
import Logo from "../../../components/Logo";
import { db } from "../../../firebase";
import { doc, updateDoc, collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

export default function SOSDashboardMobile({ user, sosAlerts, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [menuOpen, setMenuOpen] = useState(false);
    const [latestSos, setLatestSos] = useState(null);

    const tabs = [
        { id: 'command', label: 'COMMAND CENTER', icon: <FaThLarge />, color: '#4285F4' },
        { id: 'team', label: 'TEAM MANAGEMENT', icon: <FaUsers />, color: '#00e5a0' },
        { id: 'assignment', label: 'SMART ASSIGNMENT', icon: <FaRobot />, color: '#fbbc04' },
        { id: 'monitoring', label: 'LIVE MONITORING', icon: <FaMapMarkedAlt />, color: '#ff4d4d' },
        { id: 'escalation', label: 'PRIORITY CONTROL', icon: <FaArrowUp />, color: '#ff8a00' },
        { id: 'broadcast', label: 'BROADCAST SYSTEM', icon: <FaBroadcastTower />, color: '#60b8ff' },
        { id: 'analytics', label: 'ANALYTICS & REPORTS', icon: <FaChartLine />, color: '#d442f5' },
        { id: 'override', label: 'OVERRIDE ACCESS', icon: <FaUnlockAlt />, color: '#ff2d55' },
        { id: 'ai', label: 'AI INTELLIGENCE', icon: <FaBrain />, color: '#00fff2' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    useEffect(() => {
        const qLatest = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SOS"), orderBy("timestamp", "desc"), limit(1));
        const unsubLatest = onSnapshot(qLatest, (snap) => {
            if (!snap.empty) setLatestSos({ id: snap.docs[0].id, ...snap.docs[0].data() });
            else setLatestSos(null);
        });
        return () => unsubLatest();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'command': return <CommandCenter alerts={sosAlerts} setActiveTab={setActiveTab} />;
            case 'team': return <TeamManagementMobile />;
            case 'assignment': return <SmartAssignmentMobile alerts={sosAlerts} />;
            case 'monitoring': return <LiveMonitoringMobile alerts={sosAlerts} />;
            case 'escalation': return <PriorityControlMobile alerts={sosAlerts} />;
            case 'broadcast': return <BroadcastSystemMobile />;
            case 'analytics': return <AnalyticsMobile alerts={sosAlerts} />;
            case 'override': return <OverrideAccessMobile />;
            case 'ai': return <AIIntelligenceMobile alerts={sosAlerts} />;
            case 'profile': return <ProfileMobile user={user} />;
            default: return <CommandCenter alerts={sosAlerts} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* TACTICAL ALERT BANNER */}
            {latestSos && (
                <div style={{ background: '#ff4d4d', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 900, position: 'sticky', top: 0, zIndex: 1000 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-pulse" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }}></div>
                        <span>SOS: {latestSos.userName?.toUpperCase()}</span>
                    </div>
                    <button onClick={() => setActiveTab("command")} style={{ background: '#fff', color: '#ff4d4d', border: 'none', borderRadius: '5px', padding: '4px 10px', fontSize: '9px', fontWeight: 900 }}>INTERCEPT</button>
                </div>
            )}

            {/* HEADER */}
            <header style={{ padding: '15px 20px', background: 'rgba(6, 8, 13, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: latestSos ? '40px' : 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
                <FaBars onClick={() => setMenuOpen(true)} style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)' }} />
                <Logo height={22} />
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #4285F4, #00fff2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>{user?.name[0]}</div>
            </header>

            {/* CONTENT */}
            <main style={{ flex: 1, padding: '20px', overflowY: 'auto', paddingBottom: '40px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '9px', color: '#4285F4', fontWeight: 900, letterSpacing: '2px', marginBottom: '4px' }}>MISSION CONTROL • {activeTab.toUpperCase()}</div>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>{tabs.find(t => t.id === activeTab)?.label}</div>
                </div>
                {renderContent()}
            </main>

            {/* SIDE MENU */}
            {menuOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 7, 10, 0.98)', backdropFilter: 'blur(20px)', zIndex: 2000, display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease' }}>
                    <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Logo height={25} />
                        <FaTimes onClick={() => setMenuOpen(false)} style={{ fontSize: '20px', opacity: 0.5 }} />
                    </div>
                    
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #4285F4, #00fff2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900 }}>{user?.name[0]}</div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 900 }}>{user?.name}</div>
                                <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 800 }}>SOS HEAD ACCESS</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '15px', marginLeft: '10px' }}>CORE COMMANDS</div>
                        {tabs.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '18px 15px', borderRadius: '12px', background: activeTab === t.id ? 'rgba(66,133,244,0.1)' : 'transparent', marginBottom: '5px' }}
                            >
                                <span style={{ fontSize: '18px', color: activeTab === t.id ? t.color : 'rgba(255,255,255,0.4)' }}>{t.icon}</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{t.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button onClick={onLogout} style={{ width: '100%', padding: '18px', background: 'rgba(255,77,77,0.05)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <FaSignOutAlt /> TERMINATE SESSION
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .glass-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                .status-pulse { animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}

function CommandCenter({ alerts, setActiveTab }) {
    const active = alerts.filter(a => a.status === "ACTIVE");
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff4d4d' }}>{active.length}</div>
                    <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.4 }}>ACTIVE SOS</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#00e5a0' }}>14</div>
                    <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.4 }}>UNITS LIVE</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {active.map(a => (
                    <div key={a.id} className="glass-panel" style={{ padding: '15px', borderLeft: '4px solid #ff4d4d' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '4px' }}>{a.userName}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>{a.locationName?.substring(0, 40)}...</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => updateDoc(doc(db, "reports", a.id), { status: "ASSIGNED", assignedAt: Date.now() })} style={{ padding: '10px', background: 'rgba(66,133,244,0.1)', border: 'none', borderRadius: '8px', color: '#4285F4', fontSize: '10px', fontWeight: 900 }}>ASSIGN</button>
                            <button onClick={() => updateDoc(doc(db, "reports", a.id), { status: "ESCALATED", priority: "CRITICAL" })} style={{ padding: '10px', background: 'rgba(255,77,77,0.1)', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontSize: '10px', fontWeight: 900 }}>ESCALATE</button>
                        </div>
                    </div>
                ))}
                {active.length === 0 && <div style={{ textAlign: 'center', padding: '40px', opacity: 0.3, fontSize: '12px' }}>NO PENDING SOS SIGNALS</div>}
            </div>
        </div>
    );
}

function TeamManagementMobile() {
    const [members, setMembers] = useState([]);
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "sos_members"), s => setMembers(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px', background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.1)' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#00e5a0', letterSpacing: '1px' }}>PERSONNEL CAPACITY</div>
                <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '5px' }}>{members.length} / 15</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {members.map(m => (
                    <div key={m.id} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>{m.name?.[0]}</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 800 }}>{m.name}</div>
                                <div style={{ fontSize: '9px', color: m.status === 'Online' ? '#00e5a0' : 'rgba(255,255,255,0.3)', fontWeight: 900 }}>{m.status?.toUpperCase()}</div>
                            </div>
                        </div>
                        <button onClick={() => { if(window.confirm("TERMINATE PERSONNEL?")) deleteDoc(doc(db, "sos_members", m.id)); }} style={{ background: 'none', border: 'none', color: '#ff4d4d', opacity: 0.3 }}><FaTrash size={12} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SmartAssignmentMobile({ alerts }) {
    const active = alerts.filter(a => a.status === "ACTIVE");
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 900, marginBottom: '5px' }}>AI ENGINE ACTIVE</div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>Proximity-based dispatch recommendations for all active units.</div>
            </div>
            {active.map(a => (
                <div key={a.id} className="glass-panel" style={{ padding: '15px', marginBottom: '12px', borderLeft: '4px solid #fbbc04' }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, marginBottom: '10px' }}>{a.userName}</div>
                    <button onClick={() => alert("ALPHA UNIT DISPATCHED")} style={{ width: '100%', padding: '12px', background: 'rgba(251,188,4,0.1)', border: '1px solid #fbbc04', borderRadius: '10px', color: '#fbbc04', fontSize: '10px', fontWeight: 900 }}>AI RECOMMEND: ALPHA UNIT</button>
                </div>
            ))}
        </div>
    );
}

function LiveMonitoringMobile({ alerts }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                <FaBroadcastTower size={60} color="#ff4d4d" style={{ filter: 'drop-shadow(0 0 15px #ff4d4d)' }} />
                <div style={{ fontSize: '12px', fontWeight: 900, marginTop: '20px', letterSpacing: '2px' }}>SCANNING SECTORS...</div>
                <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '5px' }}>INDORE_METRO_AREA_UPLINK</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#00e5a0' }}>24</div>
                    <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.4 }}>UNITS ON FIELD</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff8a00' }}>08</div>
                    <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.4 }}>INTERCEPTS</div>
                </div>
            </div>
        </div>
    );
}

function PriorityControlMobile({ alerts }) {
    const critical = alerts.filter(a => a.priority === "CRITICAL" || a.status === "ESCALATED");
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#ff4d4d', letterSpacing: '2px', marginBottom: '15px' }}>HIGH-PRIORITY ESCALATIONS</h4>
            {critical.map(c => (
                <div key={c.id} className="glass-panel" style={{ padding: '15px', marginBottom: '10px', border: '1px solid #ff4d4d' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900 }}>{c.userName}</div>
                    <button style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#ff4d4d', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>IMMEDIATE ACTION</button>
                </div>
            ))}
            {critical.length === 0 && <div style={{ textAlign: 'center', padding: '40px', opacity: 0.2 }}>NO CRITICAL THREATS</div>}
        </div>
    );
}

function BroadcastSystemMobile() {
    const [msg, setMsg] = useState("");
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
                <textarea 
                    value={msg} 
                    onChange={e => setMsg(e.target.value)}
                    placeholder="ENTER PROTOCOL MESSAGE..." 
                    style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '15px', outline: 'none', fontSize: '14px', resize: 'none' }}
                />
                <button onClick={() => { if(msg) alert(`BROADCAST: ${msg}`); setMsg(""); }} style={{ width: '100%', marginTop: '15px', padding: '18px', background: '#60b8ff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '11px' }}>EXECUTE BROADCAST</button>
            </div>
        </div>
    );
}

function AnalyticsMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e5a0' }}>99.2%</div>
                    <div style={{ fontSize: '8px', opacity: 0.4 }}>RESPONSE RATE</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#d442f5' }}>88.4%</div>
                    <div style={{ fontSize: '8px', opacity: 0.4 }}>PREDICTIVE ACC.</div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: '#d442f5', borderRadius: '4px', opacity: 0.5 }}></div>
                ))}
            </div>
        </div>
    );
}

function OverrideAccessMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid #ff2d55', textAlign: 'center' }}>
                <FaLock size={30} color="#ff2d55" style={{ marginBottom: '15px' }} />
                <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '5px' }}>SYSTEM LOCKDOWN</div>
                <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '20px' }}>Chief authorization required for override.</div>
                <button onClick={() => alert("INITIATING LOCKDOWN PROTOCOL")} style={{ width: '100%', padding: '12px', background: '#ff2d55', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 900 }}>ACTIVATE LOCK</button>
            </div>
        </div>
    );
}

function AIIntelligenceMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', background: 'radial-gradient(circle, rgba(0,255,242,0.05) 0%, transparent 70%)' }}>
                <FaBrain size={40} color="#00fff2" className="status-pulse" />
                <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '15px' }}>NEURAL CORE ONLINE</div>
                <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '10px' }}>Scanning city intel for early warnings...</p>
            </div>
        </div>
    );
}

function ProfileMobile({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #0095ff)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#000' }}>{user?.name?.[0]}</div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 800, letterSpacing: '1px', marginTop: '5px' }}>SOS HEAD COMMANDER</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '9px', opacity: 0.4, marginBottom: '4px' }}>EMAIL</div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{user?.email}</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '9px', opacity: 0.4, marginBottom: '4px' }}>CLEARANCE</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#00e5a0' }}>LEVEL 10 (COMMANDER)</div>
                </div>
            </div>
        </div>
    );
}

