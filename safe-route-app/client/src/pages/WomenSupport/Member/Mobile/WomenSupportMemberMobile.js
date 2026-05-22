import React, { useState, useEffect } from "react";
import { 
  FaClipboardList, FaPhoneAlt, FaUsers, FaHeart, 
  FaHistory, FaUser, FaBell, FaSignOutAlt, FaSearch,
  FaExclamationTriangle, FaCommentDots, FaUserSecret, FaRoute,
  FaShieldAlt, FaLock, FaHandsHelping, FaMapMarkedAlt, FaBroadcastTower
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export default function WomenSupportMemberMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("sos");
    const [incidents, setIncidents] = useState([]);
    const [isOnDuty, setIsOnDuty] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(20));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(reports);
        });
        return () => unsubscribe();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'sos': return <SOSMobile incidents={incidents} />;
            case 'complaints': return <ComplaintsMobile incidents={incidents} />;
            case 'chat': return <ChatMobile />;
            case 'safety': return <SafetyMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <SOSMobile incidents={incidents} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', paddingBottom: '90px', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* TACTICAL HEADER */}
            <header style={{ padding: '20px', background: 'rgba(10, 12, 18, 0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                <Logo height={25} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div onClick={() => setIsOnDuty(!isOnDuty)} style={{ padding: '6px 12px', background: isOnDuty ? 'rgba(0,229,160,0.1)' : 'rgba(255,77,77,0.1)', borderRadius: '20px', border: `1px solid ${isOnDuty ? '#00e5a0' : '#ff4d4d'}`, cursor: 'pointer' }}>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: isOnDuty ? '#00e5a0' : '#ff4d4d' }}>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <FaBell color="rgba(255,255,255,0.4)" />
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#d442f5', borderRadius: '50%', border: '2px solid #0a0c12' }}></div>
                    </div>
                </div>
            </header>

            <main style={{ padding: '20px' }}>
                {renderContent()}
            </main>

            {/* BOTTOM TACTICAL NAVIGATION */}
            <nav style={{ position: 'fixed', bottom: '15px', left: '15px', right: '15px', background: 'rgba(15, 18, 25, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '25px', display: 'flex', justifyContent: 'space-around', padding: '15px 5px', backdropFilter: 'blur(20px)', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                {[
                    { id: 'sos', icon: <FaExclamationTriangle />, label: 'SOS' },
                    { id: 'complaints', icon: <FaUserSecret />, label: 'Intel' },
                    { id: 'chat', icon: <FaCommentDots />, label: 'Chat' },
                    { id: 'safety', icon: <FaShieldAlt />, label: 'Safety' },
                    { id: 'profile', icon: <FaUser />, label: 'Ops' }
                ].map(tab => (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === tab.id ? '#d442f5' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: '0.3s', flex: 1 }}>
                        <div style={{ fontSize: '18px', transform: activeTab === tab.id ? 'scale(1.2)' : 'scale(1)' }}>{tab.icon}</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{tab.label}</div>
                    </div>
                ))}
            </nav>

            <style>{`
                .m-card { background: rgba(14, 17, 25, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 20px; }
                .btn-m { width: 100%; padding: 15px; border-radius: 12px; border: none; font-weight: 900; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: 0.3s; }
                .btn-m-primary { background: #d442f5; color: #fff; }
                .btn-m-secondary { background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function SOSMobile({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>PRIORITY SOS FEED</h3>
                <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900 }}>LIVE TRACKING</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                    { type: 'WOMEN SOS', loc: 'Sector 4', time: '1m', priority: 'CRITICAL', color: '#ff4d4d' },
                    { type: 'CHILD SAFETY', loc: 'Mall Road', time: '4m', priority: 'HIGH', color: '#ffd700' },
                    { type: 'NIGHT EMERGENCY', loc: 'Railway St.', time: '7m', priority: 'HIGH', color: '#6366f1' }
                ].map((s, i) => (
                    <div key={i} className="m-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{s.type}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.loc} • {s.time} ago</div>
                            </div>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: s.color, background: `${s.color}15`, padding: '4px 10px', borderRadius: '8px' }}>{s.priority}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-m btn-m-secondary" style={{ flex: 1, padding: '10px' }}>DETAILS</button>
                            <button className="btn-m btn-m-primary" style={{ flex: 1, padding: '10px' }}>DISPATCH</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ComplaintsMobile({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px', marginBottom: '20px' }}>ANONYMOUS INTEL</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incidents.slice(0, 5).map((e, i) => (
                    <div key={i} className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(212,66,245,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d442f5' }}>
                            <FaUserSecret />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 900 }}>CASE #{String(e.id).substring(0, 6).toUpperCase()}</div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>ENCRYPTED • HARASSMENT</div>
                        </div>
                        <button style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '9px', fontWeight: 900 }}>VIEW</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ChatMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                <header style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900 }}>SECURE CHAT #819</div>
                    <div style={{ fontSize: '9px', color: '#00e5a0', fontWeight: 800 }}>LIVE • END-TO-END ENCRYPTED</div>
                </header>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <div style={{ display: 'inline-block', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 0', fontSize: '12px', maxWidth: '80%' }}>
                            Someone is following me. Please help.
                        </div>
                    </div>
                    <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-block', padding: '12px', background: 'rgba(212,66,245,0.1)', borderRadius: '12px 12px 0 12px', fontSize: '12px', maxWidth: '80%', color: '#d442f5' }}>
                            Stay calm. I'm dispatching Team Alpha to your location.
                        </div>
                    </div>
                </div>
                <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Type guidance..." style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                        <button style={{ padding: '0 15px', background: '#d442f5', border: 'none', borderRadius: '10px', color: '#fff' }}><FaCommentDots /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SafetyMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px', marginBottom: '20px' }}>SAFETY TOOLS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                {[
                    { label: 'HELPLINES', icon: <FaBroadcastTower />, color: '#ff4d4d' },
                    { label: 'SAFE ROUTES', icon: <FaRoute />, color: '#4285F4' },
                    { label: 'NGO HUB', icon: <FaHandsHelping />, color: '#d442f5' },
                    { label: 'COUNSELING', icon: <FaHandsHelping />, color: '#fbbc04' }
                ].map((t, i) => (
                    <div key={i} className="m-card" style={{ textAlign: 'center', borderBottom: `3px solid ${t.color}` }}>
                        <div style={{ fontSize: '20px', color: t.color, marginBottom: '10px' }}>{t.icon}</div>
                        <div style={{ fontSize: '9px', fontWeight: 900 }}>{t.label}</div>
                    </div>
                ))}
            </div>
            <div className="m-card" style={{ textAlign: 'center', padding: '30px' }}>
                <FaMapMarkedAlt size={40} color="rgba(255,255,255,0.1)" />
                <div style={{ fontSize: '12px', fontWeight: 900, marginTop: '10px' }}>TACTICAL MAP ENGINE</div>
                <button className="btn-m btn-m-primary" style={{ marginTop: '15px' }}>OPEN MAP HUB</button>
            </div>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>{user?.name}</h3>
                <div style={{ fontSize: '10px', color: '#d442f5', fontWeight: 900, letterSpacing: '2px', marginTop: '5px' }}>WOMEN SUPPORT MEMBER</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '30px' }}>
                    <div className="m-card" style={{ padding: '15px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900 }}>142</div>
                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>CASES</div>
                    </div>
                    <div className="m-card" style={{ padding: '15px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900 }}>9.8</div>
                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>RATING</div>
                    </div>
                </div>

                <button onClick={onLogout} className="btn-m btn-m-secondary" style={{ marginTop: '30px', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)' }}>
                    <FaSignOutAlt style={{ marginRight: '10px' }} /> LOGOUT SESSION
                </button>
            </div>
        </div>
    );
}
