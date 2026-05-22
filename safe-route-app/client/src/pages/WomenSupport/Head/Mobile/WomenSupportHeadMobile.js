import React, { useState, useEffect } from "react";
import { 
  FaChartLine, FaUsers, FaExclamationTriangle, FaShieldAlt, 
  FaBell, FaSignOutAlt, FaPlus, FaUserShield, FaBullhorn, FaMapMarkedAlt, FaLock, FaBrain,
  FaArrowUp, FaCheckCircle, FaTrash, FaUserClock
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy, limit } from "firebase/firestore";

export default function WomenSupportHeadMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [teamMembers, setTeamMembers] = useState([]);
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const qMembers = query(collection(db, "users"), where("divisionId", "==", "3"));
        const unsubMembers = onSnapshot(qMembers, (snap) => {
            setTeamMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qIncidents = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(20));
        const unsubIncidents = onSnapshot(qIncidents, (snap) => {
            setIncidents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubMembers(); unsubIncidents(); };
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewMobile team={teamMembers} incidents={incidents} />;
            case 'critical': return <CriticalMobile incidents={incidents} />;
            case 'team': return <TeamMobile team={teamMembers} />;
            case 'intel': return <IntelMobile />;
            case 'broadcast': return <BroadcastMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <OverviewMobile team={teamMembers} incidents={incidents} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', paddingBottom: '90px', fontFamily: "'Space Grotesk', sans-serif" }}>
            <header style={{ padding: '15px 20px', background: 'rgba(10, 12, 18, 0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                <Logo height={20} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#00e5a0', borderRadius: '50%', boxShadow: '0 0 10px #00e5a0' }}></div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                </div>
            </header>

            <main style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ fontSize: '10px', color: '#d442f5', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>DIVISION 03 • COMMAND HUB</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '1px' }}>Operational Readiness: <span style={{ color: '#00e5a0' }}>OPTIMAL</span></div>
                </div>
                {renderContent()}
            </main>

            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(5, 7, 10, 0.95)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', padding: '12px 0', backdropFilter: 'blur(20px)', zIndex: 1000, boxShadow: '0 -10px 30px rgba(0,0,0,0.5)' }}>
                {[
                    { id: 'overview', icon: <FaChartLine />, label: 'HUD' },
                    { id: 'critical', icon: <FaExclamationTriangle />, label: 'Signals' },
                    { id: 'team', icon: <FaUsers />, label: 'Units' },
                    { id: 'intel', icon: <FaBrain />, label: 'Intel' },
                    { id: 'broadcast', icon: <FaBullhorn />, label: 'Alert' },
                    { id: 'profile', icon: <FaLock />, label: 'Session' }
                ].map(tab => (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === tab.id ? '#d442f5' : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: '0.3s' }}>
                        <div style={{ fontSize: '18px', transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)' }}>{tab.icon}</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{tab.label}</div>
                    </div>
                ))}
            </nav>
            <style>{`
                .h-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; backdrop-filter: blur(10px); transition: 0.3s; }
                .h-card:active { transform: scale(0.98); background: rgba(255,255,255,0.04); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .status-pulse { animation: pulse-sos 2s infinite; }
                @keyframes pulse-sos { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}

function OverviewMobile({ team, incidents }) {
    const activeCases = incidents.filter(i => i.status === "ACTIVE").length;
    const onlineUnits = team.length;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                {[
                    { label: 'ACTIVE SIGNALS', val: activeCases < 10 ? `0${activeCases}` : activeCases, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'ON-DUTY UNITS', val: onlineUnits < 10 ? `0${onlineUnits}` : onlineUnits, color: '#00e5a0', icon: <FaUserShield /> },
                    { label: 'RISK FACTOR', val: 'LOW', color: '#ffd700', icon: <FaBrain /> },
                    { label: 'AVG RESPONSE', val: '2.4m', color: '#6366f1', icon: <FaUserClock /> }
                ].map((s, i) => (
                    <div key={i} className="h-card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '40px', opacity: 0.03, color: s.color }}>{s.icon}</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="h-card" style={{ marginBottom: '20px', background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <FaMapMarkedAlt color="#00e5a0" />
                    <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px' }}>LOCAL SAFE ZONE STATUS</div>
                </div>
                <div style={{ height: '100px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>
                    GEOSPATIAL FEED SECURE_CONNECTED
                </div>
            </div>
        </div>
    );
}

function CriticalMobile({ incidents }) {
    const activeCases = incidents.filter(i => i.status === "ACTIVE");

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '1px' }}>CRITICAL SIGNALS</h3>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '4px 10px', borderRadius: '6px' }}>LIVE_FEED</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeCases.map((c, i) => (
                    <div key={i} className="h-card" style={{ borderLeft: `4px solid ${c.type === 'SOS' ? '#ff4d4d' : '#ffd700'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 900 }}>{c.type} REPORT</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>CITIZEN: {c.userName || 'ANONYMOUS'}</div>
                            </div>
                            <div style={{ fontSize: '8px', fontWeight: 900, color: '#ff4d4d' }}>{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.6, fontStyle: 'italic' }}>"{c.description?.substring(0, 60)}..."</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                            <button style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '9px', fontWeight: 900 }}>DETAILS</button>
                            <button style={{ padding: '12px', background: '#ff4d4d', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '9px', fontWeight: 900 }}>DISPATCH</button>
                        </div>
                    </div>
                ))}
                {activeCases.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 800 }}>NO ACTIVE CRITICAL SIGNALS</div>
                )}
            </div>
        </div>
    );
}

function TeamMobile({ team }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', letterSpacing: '1px' }}>UNIT STATUS MONITOR</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {team.map((m, i) => (
                    <div key={i} className="h-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'rgba(66, 133, 244, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4285f4', fontSize: '14px' }}>
                                <FaUserShield />
                            </div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 900 }}>{m.name}</div>
                                <div style={{ fontSize: '8px', color: '#00e5a0', fontWeight: 900, letterSpacing: '1px' }}>● ONLINE • {m.team?.toUpperCase()}</div>
                            </div>
                        </div>
                        <button style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '8px', fontWeight: 900 }}>CALL</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function IntelMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', letterSpacing: '1px' }}>AI THREAT ANALYSIS</h3>
            <div className="h-card" style={{ borderLeft: '4px solid #00e5a0', background: 'rgba(0,229,160,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <FaBrain color="#00e5a0" size={20} />
                    <div style={{ fontSize: '12px', fontWeight: 900 }}>NEURAL PREDICTION ACTIVE</div>
                </div>
                <div style={{ fontSize: '11px', lineHeight: '1.6', color: 'rgba(255,255,255,0.6)' }}>
                    Current analysis shows an increased risk probability of <span style={{ color: '#ff4d4d', fontWeight: 900 }}>18%</span> in public transit nodes near Indore Junction. 
                </div>
                <button style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '10px', color: '#00e5a0', fontSize: '9px', fontWeight: 900 }}>RE-SYNC NEURAL CORE</button>
            </div>
        </div>
    );
}

function BroadcastMobile() {
    const [msg, setMsg] = useState("");
    const [status, setStatus] = useState(null);

    const handleBroadcast = () => {
        if (!msg) return;
        setStatus("TRANSMITTING...");
        setTimeout(() => {
            setStatus("SIGNAL BROADCASTED");
            setMsg("");
            setTimeout(() => setStatus(null), 3000);
        }, 1500);
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', letterSpacing: '1px' }}>EMERGENCY BROADCAST</h3>
            <div className="h-card" style={{ borderLeft: '4px solid #ff4d4d' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, marginBottom: '10px' }}>ENCRYPTED TACTICAL MESSAGE</div>
                <textarea 
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Enter command or warning to broadcast..." 
                    style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px', outline: 'none', padding: '12px', resize: 'none' }}
                ></textarea>
                <button 
                    onClick={handleBroadcast}
                    style={{ width: '100%', padding: '15px', background: status ? '#ffd700' : '#ff4d4d', color: status ? '#000' : '#fff', border: 'none', borderRadius: '12px', fontWeight: 900, marginTop: '15px', fontSize: '11px', letterSpacing: '2px' }}
                >
                    {status || "EXECUTE BROADCAST"}
                </button>
            </div>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="h-card" style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px', padding: '4px 10px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '8px', fontWeight: 900 }}>SECURE</div>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, boxShadow: '0 0 20px rgba(212,66,245,0.3)' }}>{user?.name?.[0]}</div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#d442f5', fontWeight: 800, marginTop: '5px', letterSpacing: '2px' }}>SUPPORT COMMANDER • D-03</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div className="h-card" style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>142</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>CASES</div>
                </div>
                <div className="h-card" style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>9.8</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>RATING</div>
                </div>
            </div>

            <button onClick={onLogout} style={{ width: '100%', padding: '18px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '15px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px', letterSpacing: '1px' }}>TERMINATE COMMAND SESSION</button>
        </div>
    );
}

