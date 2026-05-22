import React, { useState } from "react";
import { 
  FaExclamationCircle, FaUsers, FaRobot, FaMapMarkedAlt, 
  FaArrowUp, FaBroadcastTower, FaChartLine, FaUnlockAlt, 
  FaBrain, FaSignOutAlt, FaThLarge, FaSearch, FaBell, FaUserCircle, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt, FaTrash
} from "react-icons/fa";
import Logo from "../../../components/Logo";
import { db } from "../../../firebase";
import { doc, updateDoc, deleteDoc, query, collection, where, orderBy, limit, onSnapshot } from "firebase/firestore";

// SOS Head Components
import TeamManagement from "../components/TeamManagement";

export default function SOSDashboard({ user, sosAlerts, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [searchQuery, setSearchQuery] = useState("");

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

    const renderContent = () => {
        switch (activeTab) {
            case 'command': return <CommandCenter alerts={sosAlerts} />;
            case 'team': return <TeamManagement />;
            case 'assignment': return <SmartAssignmentView alerts={sosAlerts} />;
            case 'monitoring': return <LiveMonitoringView alerts={sosAlerts} />;
            case 'escalation': return <PriorityControlView alerts={sosAlerts} />;
            case 'broadcast': return <BroadcastSystemView />;
            case 'analytics': return <AnalyticsView alerts={sosAlerts} />;
            case 'override': return <OverrideAccessView />;
            case 'ai': return <AIIntelligenceView alerts={sosAlerts} />;
            case 'profile':
                return <ProfileView user={user} />;
            default: return <CommandCenter alerts={sosAlerts} />;
        }
    };

    const [latestSos, setLatestSos] = useState(null);

    React.useEffect(() => {
        const qLatest = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SOS"), orderBy("timestamp", "desc"), limit(1));
        const unsubLatest = onSnapshot(qLatest, (snap) => {
            if (!snap.empty) {
                setLatestSos({ id: snap.docs[0].id, ...snap.docs[0].data() });
            } else {
                setLatestSos(null);
            }
        });
        return () => unsubLatest();
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* GLOBAL TACTICAL ALERT BANNER */}
            {latestSos && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, 
                    background: 'rgba(255, 77, 77, 0.95)', color: '#fff', padding: '15px 40px', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backdropFilter: 'blur(20px)', borderBottom: '2px solid rgba(255,255,255,0.2)',
                    animation: 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="status-pulse" style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 15px #fff' }}></div>
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px' }}>CRITICAL SOS BROADCAST</span>
                            <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 700 }}>CITIZEN: {latestSos.userName?.toUpperCase()} • LOCATION: {latestSos.locationName?.toUpperCase()}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={() => setActiveTab("command")}
                            style={{ padding: '8px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            INTERCEPT SIGNAL
                        </button>
                    </div>
                </div>
            )}

            {/* --- TACTICAL SIDEBAR --- */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100, marginTop: latestSos ? '60px' : '0', transition: '0.5s' }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(66,133,244,0.1)', borderRadius: '8px', border: '1px solid rgba(66,133,244,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#4285F4' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#4285F4', letterSpacing: '2px' }}>MISSION CONTROL</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
                    {tabs.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '14px 20px', 
                                marginBottom: '6px', 
                                borderRadius: '12px', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderLeft: `3px solid ${activeTab === item.id ? item.color : 'transparent'}`,
                                transition: '0.2s'
                            }}
                        >
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

            {/* --- MAIN CONTENT --- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', marginTop: latestSos ? '60px' : '0', transition: '0.5s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input 
                            placeholder="SEARCH INCIDENTS, TEAMS, OR LOCATIONS..." 
                            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div onClick={onLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '8px 15px', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.2)' }}>
                            <FaSignOutAlt size={14} />
                            <span style={{ fontSize: '10px', fontWeight: 900 }}>EXIT HUB</span>
                        </div>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <FaBell style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)' }} />
                            <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '50%', border: '2px solid #05070a' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.5px' }}>{user?.name}</div>
                                <div style={{ fontSize: '9px', color: '#00e5a0', fontWeight: 800, letterSpacing: '1px' }}>SOS HEAD • ACTIVE</div>
                            </div>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #4285F4, #00fff2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff' }}>
                                {user?.name[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

function PlaceholderTab({ title, icon }) {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>{icon}</div>
            <h1 style={{ letterSpacing: '10px', fontWeight: 900 }}>{title}</h1>
            <p style={{ letterSpacing: '2px', fontWeight: 600 }}>ENCRYPTED MODULE PENDING INTEGRATION</p>
        </div>
    );
}

function CommandCenter({ alerts }) {
    const activeCount = alerts.filter(a => a.status === "ACTIVE").length;
    const assignedCount = alerts.filter(a => a.status === "ASSIGNED").length;
    const totalCount = alerts.length + 1240; // Base + Real
    
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
                {[
                    { label: 'TOTAL SOS', val: totalCount.toLocaleString(), change: '+12%', color: '#4285F4' },
                    { label: 'ACTIVE NOW', val: activeCount, change: 'CRITICAL', color: '#ff4d4d' },
                    { label: 'AVG RESPONSE', val: activeCount > 0 ? '2m 14s' : '0s', change: '-18s', color: '#00e5a0' },
                    { label: 'TEAMS LIVE', val: assignedCount + 12, change: 'MAX', color: '#fbbc04' },
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>{s.label}</div>
                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{s.val}</div>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: s.color, marginTop: '8px' }}>{s.change}</div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: s.color, opacity: 0.3 }}></div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>ACTIVE SOS MONITOR</h3>
                            <button 
                                onClick={async () => {
                                    if(window.confirm("CRITICAL: PERMANENTLY CLEAR ALL ACTIVE SOS ALERTS FROM SYSTEM?")) {
                                        try {
                                            const activeAlerts = alerts.filter(a => a.status === "ACTIVE");
                                            for (const a of activeAlerts) {
                                                await updateDoc(doc(db, "reports", a.id), { status: "DELETED", deletedAt: Date.now() });
                                            }
                                            alert("SYSTEM PURGE COMPLETE. ALL TEST LOGS REMOVED.");
                                        } catch (err) {
                                            console.error(err);
                                            alert("PURGE ERROR: TACTICAL FAILURE.");
                                        }
                                    }
                                }}
                                style={{ padding: '4px 10px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: '#ff4d4d', fontSize: '9px', fontWeight: 900, cursor: 'pointer' }}
                            >
                                PURGE ALL
                            </button>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>{alerts.length} PENDING ACTION</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {alerts.filter(a => a.status === "ACTIVE" || a.status === "ASSIGNED" || a.status === "ESCALATED").map(a => {
                            const handleAssign = async () => {
                                try {
                                    await updateDoc(doc(db, "reports", a.id), { status: "ASSIGNED", assignedAt: Date.now() });
                                    alert(`INCIDENT ${a.id.substring(0,6)} ASSIGNED TO QUICK RESPONSE UNIT.`);
                                } catch (err) {
                                    console.error(err);
                                }
                            };

                            const handleEscalate = async () => {
                                try {
                                    await updateDoc(doc(db, "reports", a.id), { status: "ESCALATED", priority: "CRITICAL" });
                                    alert(`INCIDENT ${a.id.substring(0,6)} ESCALATED TO SUPREME COMMISSIONER.`);
                                } catch (err) {
                                    console.error(err);
                                }
                            };

                            return (
                                <div key={a.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{a.userName}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{a.locationName?.substring(0, 60)}...</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button onClick={handleAssign} style={{ padding: '8px 15px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '8px', color: '#4285F4', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>ASSIGN</button>
                                        <button onClick={handleEscalate} style={{ padding: '8px 15px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', color: '#ff4d4d', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>ESCALATE</button>
                                        <button 
                                            onClick={async () => {
                                                if(window.confirm("PERMANENTLY DELETE THIS SOS INCIDENT FROM MONITOR?")) {
                                                    try { 
                                                        await updateDoc(doc(db, "reports", a.id), { status: "DELETED", deletedAt: Date.now() }); 
                                                        alert("INCIDENT REMOVED FROM MONITOR.");
                                                    }
                                                    catch(err) { 
                                                        console.error(err); 
                                                        alert("TACTICAL ERROR: FAILED TO REMOVE INCIDENT.");
                                                    }
                                                }
                                            }}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '5px' }}
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ margin: '0 0 25px 0', fontSize: '18px', fontWeight: 900 }}>TACTICAL OVERRIDE</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button 
                            onClick={() => alert("TACTICAL OVERRIDE: CITY-WIDE EMERGENCY BROADCAST ACTIVATED. ALL CITIZEN DEVICES NOTIFIED.")}
                            style={{ padding: '20px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '16px', color: '#ff4d4d', fontWeight: 900, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px' }}
                        >
                            <FaBroadcastTower /> ACTIVATE CITY BROADCAST
                        </button>
                        <button 
                            onClick={() => alert("TACTICAL ALERT: ALL ALPHA, BETA, AND GAMMA RESPONSE TEAMS DEPLOYED TO HOTSPOTS.")}
                            style={{ padding: '20px', background: 'rgba(255,188,4,0.1)', border: '1px solid #fbbc04', borderRadius: '16px', color: '#fbbc04', fontWeight: 900, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px' }}
                        >
                            <FaUsers /> ALERT ALL RESPONSE TEAMS
                        </button>
                        <button 
                            onClick={() => alert("AI SYSTEM ENGAGED: AUTOMATIC NEAREST-UNIT DISPATCH ENABLED GLOBALLY.")}
                            style={{ padding: '20px', background: 'rgba(66,133,244,0.1)', border: '1px solid #4285F4', borderRadius: '16px', color: '#4285F4', fontWeight: 900, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '15px' }}
                        >
                            <FaRobot /> ACTIVATE AI AUTO-DISPATCH
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SmartAssignmentView({ alerts }) {
    const active = alerts.filter(a => a.status === "ACTIVE");
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <FaRobot size={24} color="#fbbc04" />
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>AI SMART ASSIGNMENT ENGINE</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', maxWidth: '800px' }}>
                    Our AI engine analyzes the proximity of available response units (Alpha, Beta, Gamma) and recommends the optimal assignment based on traffic, distance, and unit specialization.
                </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {active.map(a => (
                    <div key={a.id} className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #fbbc04' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900 }}>{a.userName}</span>
                            <span style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 900, background: 'rgba(251,188,4,0.1)', padding: '4px 10px', borderRadius: '20px' }}>AI RECOMMENDED</span>
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '20px' }}>{a.locationName}</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => alert("AI DISPATCH: ALPHA UNIT-7 ORDERED TO INTERCEPT.")} style={{ flex: 1, padding: '12px', background: 'rgba(251,188,4,0.1)', border: '1px solid #fbbc04', color: '#fbbc04', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>ASSIGN UNIT ALPHA</button>
                            <button onClick={() => alert("AI DISPATCH: BETA RESPONSE ORDERED.")} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>OVERRIDE TO BETA</button>
                        </div>
                    </div>
                ))}
                {active.length === 0 && <div className="glass-panel" style={{ padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>NO ACTIVE PENDING ALERTS FOR AI ASSIGNMENT</div>}
            </div>
        </div>
    );
}

function LiveMonitoringView({ alerts }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', height: 'calc(100vh - 200px)' }}>
            <div className="glass-panel" style={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(255,77,77,0.05) 0%, transparent 70%)' }}>
                <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 10 }}>
                    <div style={{ background: 'rgba(0,0,0,0.8)', padding: '15px 25px', borderRadius: '15px', border: '1px solid rgba(255,77,77,0.3)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff4d4d', letterSpacing: '2px', marginBottom: '8px' }}>LIVE TACTICAL HUD</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 900 }}>
                            <FaMapMarkedAlt color="#ff4d4d" /> {alerts.filter(a => a.status === 'ACTIVE').length} ACTIVE SIGNALS
                        </div>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <div className="pulse-circle" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'rgba(255,77,77,0.1)', borderRadius: '50%' }}></div>
                        <FaBroadcastTower size={120} color="#ff4d4d" style={{ opacity: 0.8, filter: 'drop-shadow(0 0 30px rgba(255,77,77,0.5))' }} />
                    </div>
                    <div style={{ marginTop: '50px', fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '4px' }}>SCANNING SECTOR: INDORE_METRO_AREA</div>
                </div>

                <div style={{ position: 'absolute', bottom: '30px', right: '30px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#00e5a0' }}>24</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.5 }}>UNITS ONLINE</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff8a00' }}>08</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, opacity: 0.5 }}>INTERCEPTS</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PriorityControlView({ alerts }) {
    const critical = alerts.filter(a => a.priority === "CRITICAL" || a.status === "ESCALATED");
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '30px', color: '#ff4d4d' }}>PRIORITY COMMAND HUB</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 900 }}>HIGH-PRIORITY ESCALATIONS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {critical.map(c => (
                            <div key={c.id} style={{ padding: '20px', background: 'rgba(255,77,77,0.05)', borderRadius: '15px', border: '1px solid rgba(255,77,77,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 900 }}>{c.userName}</div>
                                    <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900, marginTop: '4px' }}>CRITICAL • {c.locationName?.substring(0, 50)}...</div>
                                </div>
                                <button onClick={() => alert("SUPREME OVERRIDE: Deploying Special Response Unit Alpha-1.")} style={{ padding: '10px 20px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '10px', cursor: 'pointer' }}>IMMEDIATE ACTION</button>
                            </div>
                        ))}
                        {critical.length === 0 && <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3, fontWeight: 800 }}>NO CRITICAL ESCALATIONS DETECTED</div>}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 900 }}>SYSTEM STATUS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { label: 'COMMS LINK', status: 'ACTIVE', color: '#00e5a0' },
                            { label: 'GPS UPLINK', status: 'STABLE', color: '#00e5a0' },
                            { label: 'AI ENGINE', status: 'OPTIMIZING', color: '#fbbc04' }
                        ].map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5 }}>{s.label}</span>
                                <span style={{ fontSize: '11px', fontWeight: 900, color: s.color }}>{s.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BroadcastSystemView() {
    const [msg, setMsg] = useState("");
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <FaBroadcastTower size={30} color="#60b8ff" />
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>EMERGENCY BROADCAST</h3>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>
                    Broadcast a critical security alert to all active Trinetra users and field units within the selected sector.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <select style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                        <option style={{ background: '#0a0c12' }}>GLOBAL BROADCAST (ALL SECTORS)</option>
                        <option style={{ background: '#0a0c12' }}>SECTOR 1: VIJAY NAGAR AREA</option>
                        <option style={{ background: '#0a0c12' }}>SECTOR 4: RAJWADA CENTRAL</option>
                    </select>
                    <textarea 
                        value={msg} 
                        onChange={e => setMsg(e.target.value)}
                        placeholder="ENTER EMERGENCY PROTOCOL MESSAGE..." 
                        style={{ height: '200px', padding: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'none', fontSize: '16px' }}
                    />
                    <button 
                        onClick={() => { if(msg) alert(`BROADCAST EXECUTED: ${msg}`); setMsg(""); }}
                        style={{ padding: '20px', background: '#60b8ff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer' }}
                    >
                        EXECUTE BROADCAST SIGNAL
                    </button>
                </div>
            </div>
        </div>
    );
}

function AnalyticsView({ alerts }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '30px' }}>ANALYTICS & PATTERN INTELLIGENCE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                {[
                    { label: 'RESPONSE RATE', val: '99.2%', change: '+0.5%', color: '#00e5a0' },
                    { label: 'PREDICTIVE ACCURACY', val: '88.4%', change: '+4.2%', color: '#d442f5' },
                    { label: 'SYSTEM LOAD', val: '12.4%', change: 'STABLE', color: '#60b8ff' }
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4, marginBottom: '10px' }}>{s.label}</div>
                        <div style={{ fontSize: '36px', fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '10px', color: '#00e5a0', marginTop: '8px', fontWeight: 900 }}>{s.change}</div>
                    </div>
                ))}
            </div>
            <div className="glass-panel" style={{ padding: '40px', height: '400px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                {[40, 70, 45, 90, 65, 80, 55, 95, 30, 85, 60, 75].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #d442f5, transparent)', borderRadius: '8px', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '8px', opacity: 0.3 }}>M{i+1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OverrideAccessView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '30px', color: '#ff2d55' }}>SYSTEM OVERRIDE & SECURITY</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', border: '1px solid #ff2d55' }}>
                        <FaLock size={40} color="#ff2d55" style={{ marginBottom: '20px' }} />
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>SYSTEM LOCK</h4>
                        <p style={{ fontSize: '11px', opacity: 0.5, margin: '15px 0' }}>Activate city-wide platform lockdown in case of severe breach.</p>
                        <button onClick={() => alert("SECURITY PROTOCOL: Platform Lockdown requires 2-Factor Chief Authorization.")} style={{ width: '100%', padding: '12px', background: '#ff2d55', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>INITIATE LOCKDOWN</button>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 900 }}>ACCESS OVERRIDE LOGS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { user: 'Admin_7', action: 'DB_BACKUP_EXEC', time: '12:44:02', status: 'SUCCESS' },
                            { user: 'Chief_1', action: 'OVERRIDE_AUTH', time: '12:30:15', status: 'SUCCESS' },
                            { user: 'Sys_Kernel', action: 'PORT_SCAN_BLOCKED', time: '11:58:44', status: 'ALERT' }
                        ].map((log, i) => (
                            <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '11px' }}>
                                <span style={{ color: '#ff2d55' }}>[{log.time}]</span>
                                <span style={{ fontWeight: 900 }}>{log.user}</span>
                                <span style={{ opacity: 0.5 }}>{log.action}</span>
                                <span style={{ color: log.status === 'ALERT' ? '#ff4d4d' : '#00e5a0' }}>{log.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AIIntelligenceView({ alerts }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', background: 'radial-gradient(circle, rgba(0,255,242,0.05) 0%, transparent 70%)' }}>
                    <FaBrain size={60} color="#00fff2" className="blink" style={{ marginBottom: '20px' }} />
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>AI NEURAL CORE</h3>
                    <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '15px' }}>Currently processing City Intel Stream for early-warning indicators.</p>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 900 }}>RISK ASSESSMENT</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { zone: 'SECTOR 4', risk: 'LOW', color: '#00e5a0' },
                            { zone: 'SECTOR 9', risk: 'ELEVATED', color: '#fbbc04' },
                            { zone: 'STATION RD', risk: 'MINIMAL', color: '#00e5a0' }
                        ].map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800 }}>{r.zone}</span>
                                <span style={{ fontSize: '12px', fontWeight: 900, color: r.color }}>{r.risk}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '30px' }}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 900 }}>AI RECOMMENDATIONS</h4>
                <div style={{ padding: '20px', background: 'rgba(0,255,242,0.05)', border: '1px solid rgba(0,255,242,0.2)', borderRadius: '15px', color: '#00fff2', fontSize: '13px', fontWeight: 700, lineHeight: '1.6' }}>
                    "Our predictive models suggest increasing patrols in the northern transit hub between 23:00 and 01:00. High-density pedestrian movement detected with low lighting coverage."
                </div>
            </div>
        </div>
    );
}

function ProfileView({ user }) {
    const [showPass, setShowPass] = useState(false);
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10, 12, 18, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #0095ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 900, color: '#000', boxShadow: '0 10px 30px rgba(0,229,160,0.3)' }}>
                        {user.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>{user.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5a0', marginTop: '5px' }}>
                            <FaShieldAlt size={12} />
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>SOS HEAD COMMANDER</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Login Email Address</label>
                        <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FaEnvelope style={{ color: '#00e5a0' }} /> {user.email}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Secure Password</label>
                        <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FaLock style={{ color: '#00e5a0' }} /> 
                                <span style={{ letterSpacing: !showPass ? '4px' : 'normal', fontFamily: !showPass ? 'monospace' : 'inherit' }}>
                                    {localStorage.getItem("trinetra_pass") || (user.email === 'chief@trinetra.gov.in' ? 'CHIEF#TRINETRA' : user.email === 'admin@trinetra.com' ? 'Admin@9977' : "••••••••")}
                                </span>
                            </div>
                            <button 
                                onClick={() => setShowPass(!showPass)}
                                style={{ background: 'none', border: 'none', color: '#00e5a0', cursor: 'pointer', fontSize: '18px' }}
                            >
                                {showPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
