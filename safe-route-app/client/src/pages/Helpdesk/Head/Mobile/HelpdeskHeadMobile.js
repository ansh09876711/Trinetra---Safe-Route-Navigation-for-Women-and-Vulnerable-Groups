import React, { useState, useEffect } from "react";
import { 
  FaHeadset, FaClipboardList, FaComments, FaUser, FaBell, FaSignOutAlt,
  FaExclamationTriangle, FaRobot, FaMapMarkedAlt, FaBroadcastTower, FaUserShield, FaShieldAlt
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";

export default function HelpdeskHeadMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [incidents, setIncidents] = useState([]);
    const [latestSos, setLatestSos] = useState(null);

    useEffect(() => {
        const qLatest = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SOS"), orderBy("timestamp", "desc"), limit(1));
        const unsubLatest = onSnapshot(qLatest, (snap) => {
            if (!snap.empty) setLatestSos({ id: snap.docs[0].id, ...snap.docs[0].data() });
            else setLatestSos(null);
        });

        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(20));
        const unsub = onSnapshot(q, (snapshot) => {
            setIncidents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubLatest(); unsub(); };
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewMobile incidents={incidents} />;
            case 'tickets': return <TicketsMobile incidents={incidents} />;
            case 'ai': return <AINeuralMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <OverviewMobile incidents={incidents} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', paddingBottom: '90px', fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* TACTICAL SOS BANNER */}
            {latestSos && (
                <div style={{ background: '#ff4d4d', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 900, letterSpacing: '1px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-pulse" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }}></div>
                        <span>SOS: {latestSos.userName?.toUpperCase()}</span>
                    </div>
                    <button style={{ background: '#fff', color: '#ff4d4d', border: 'none', borderRadius: '5px', padding: '5px 10px', fontSize: '9px', fontWeight: 900 }}>INTERCEPT</button>
                </div>
            )}

            <header style={{ padding: '20px', background: 'rgba(15, 15, 20, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                <Logo height={22} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '8px', color: '#fbbc04', fontWeight: 900, letterSpacing: '1px' }}>COMMAND_LIVE</span>
                        <span style={{ fontSize: '10px', fontWeight: 800 }}>{user?.name?.split(' ')[0]}</span>
                    </div>
                    <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'linear-gradient(135deg, #fbbc04, #ea4335)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                </div>
            </header>

            <main style={{ padding: '20px' }}>
                {renderContent()}
            </main>

            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10, 10, 12, 0.98)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(15px)', zIndex: 1000 }}>
                {[
                    { id: 'overview', icon: <FaHeadset />, label: 'Hub' },
                    { id: 'tickets', icon: <FaClipboardList />, label: 'Queue' },
                    { id: 'ai', icon: <FaRobot />, label: 'AI' },
                    { id: 'profile', icon: <FaUser />, label: 'Me' }
                ].map(tab => (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === tab.id ? '#fbbc04' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: '0.3s' }}>
                        <div style={{ fontSize: '20px', transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)' }}>{tab.icon}</div>
                        <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{tab.label}</div>
                    </div>
                ))}
            </nav>
            <style>{`
                .h-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px; transition: 0.3s; }
                .h-card:active { transform: scale(0.98); background: rgba(255,255,255,0.04); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .status-pulse { animation: pulse-sos 1s infinite; }
                @keyframes pulse-sos { 0% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.4; transform: scale(0.8); } }
            `}</style>
        </div>
    );
}

function OverviewMobile({ incidents }) {
    const active = incidents.filter(i => i.status === "ACTIVE").length;
    const pending = incidents.filter(i => i.status === "PENDING").length;

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="h-card" style={{ borderLeft: '4px solid #4285F4' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#4285F4' }}>{incidents.length}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '1px' }}>TOTAL SIGNALS</div>
                </div>
                <div className="h-card" style={{ borderLeft: '4px solid #fbbc04' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#fbbc04' }}>{active + pending}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '1px' }}>PENDING OPS</div>
                </div>
            </div>
            
            <div className="h-card" style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px', letterSpacing: '1px' }}>OPERATIONAL EFFICIENCY</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '10px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Resolve Rate</span>
                    <span style={{ color: '#00e5a0', fontWeight: 900 }}>94.2%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '94.2%', height: '100%', background: 'linear-gradient(to right, #fbbc04, #00e5a0)' }}></div>
                </div>
            </div>

            <div className="h-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(66, 133, 244, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4285f4' }}>
                    <FaBroadcastTower />
                </div>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 900 }}>SYSTEM BROADCAST</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Operational across all sectors.</div>
                </div>
            </div>
        </div>
    );
}

function TicketsMobile({ incidents }) {
    const queue = incidents.filter(i => i.status !== "SOLVED").slice(0, 10);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '1px' }}>ACTIVE SUPPORT QUEUE</h3>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#fbbc04' }}>LIVE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {queue.map((inc, i) => (
                    <div key={i} className="h-card" style={{ borderLeft: `4px solid ${inc.type === 'SOS' ? '#ff4d4d' : '#fbbc04'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900, color: inc.type === 'SOS' ? '#ff4d4d' : '#fbbc04' }}>{inc.type} REPORT</span>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{new Date(inc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '5px' }}>{inc.locationName || "Unknown Sector"}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Citizen: {inc.userName || "Protected Identity"}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                            <button style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>DETAILS</button>
                            <button style={{ padding: '10px', background: '#fbbc04', border: 'none', borderRadius: '10px', color: '#000', fontSize: '10px', fontWeight: 900 }}>ASSIGN</button>
                        </div>
                    </div>
                ))}
                {queue.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 800 }}>QUEUE CLEAR • NO PENDING TICKETS</div>
                )}
            </div>
        </div>
    );
}

function AINeuralMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', letterSpacing: '1px' }}>NEURAL CORE ANALYTICS</h3>
            <div className="h-card" style={{ background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <FaRobot color="#00e5a0" size={20} />
                    <div style={{ fontSize: '12px', fontWeight: 900 }}>AI AGENT STATUS: ONLINE</div>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                    AI is currently monitoring <span style={{ color: '#00e5a0', fontWeight: 900 }}>42</span> active data streams. No anomalies detected in the last 15 minutes.
                </div>
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>SUGGESTED ACTIONS</div>
                    <div style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 800 }}>● Optimize Sector 7 Unit Allocation</div>
                </div>
            </div>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="h-card" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ea4335)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 800, marginTop: '5px', letterSpacing: '2px' }}>DIRECTOR OF SUPPORT</div>
            </div>
            
            <div className="h-card" style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px' }}>SECURITY CLEARANCE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(0,229,160,0.1)', borderRadius: '10px', border: '1px solid rgba(0,229,160,0.2)' }}>
                    <FaUserShield color="#00e5a0" />
                    <span style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 900 }}>LEVEL 4 AUTHORIZATION</span>
                </div>
            </div>

            <button onClick={onLogout} style={{ width: '100%', padding: '18px', background: 'rgba(255,77,77,0.05)', border: '1px solid #ff4d4d', borderRadius: '15px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px', letterSpacing: '1px' }}>EXIT COMMAND HUB</button>
        </div>
    );
}

