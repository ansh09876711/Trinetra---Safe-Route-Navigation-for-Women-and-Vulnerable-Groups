import React, { useState } from "react";
import { 
  FaTaxi, FaQrcode, FaExclamationTriangle, FaShieldAlt, 
  FaSignOutAlt, FaBell, FaTasks, FaHistory, FaBars, FaTimes, 
  FaUser, FaCogs, FaIdCard, FaCar, FaMapMarkerAlt, FaFileAlt, FaMoon
} from "react-icons/fa";
import Logo from "../../../../components/Logo";

export default function TaxiMemberMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("duty");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'duty': return <DutyMobile user={user} />;
            case 'verify': return <DriverVerifyMobile />;
            case 'approvals': return <RegistrationApprovalMobile />;
            case 'live': return <LiveRideMobile />;
            case 'history': return <RouteHistoryMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <DutyMobile user={user} />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', paddingBottom: '80px', fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* Header */}
            <header style={{ padding: '20px', background: 'rgba(6, 8, 13, 0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaBars style={{ fontSize: '20px', color: '#fbbc04', cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)} />
                    <Logo height={22} />
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <FaBell style={{ color: 'rgba(255,255,255,0.4)' }} />
                    <div style={{ width: '25px', height: '25px', borderRadius: '6px', background: '#fbbc04', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>{user.name[0]}</div>
                </div>
            </header>

            {/* Side Menu Overlay */}
            {isMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000 }} onClick={() => setIsMenuOpen(false)}>
                    <aside style={{ width: '80%', height: '100%', background: '#0a0c12', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px', boxShadow: '20px 0 50px rgba(0,0,0,0.5)', animation: 'slideInLeft 0.3s ease' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Logo height={25} />
                            <FaTimes style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }} onClick={() => setIsMenuOpen(false)} />
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' }}>
                            {[
                                { id: 'duty', icon: <FaTasks />, label: 'FIELD HUB', color: '#fbbc04' },
                                { id: 'verify', icon: <FaIdCard />, label: 'DRIVER VERIFY', color: '#00e5a0' },
                                { id: 'approvals', icon: <FaCar />, label: 'TAXI APPROVALS', color: '#4285F4' },
                                { id: 'live', icon: <FaMapMarkerAlt />, label: 'LIVE MONITORING', color: '#ff4d4d' },
                                { id: 'history', icon: <FaHistory />, label: 'ROUTE HISTORY', color: '#00e5a0' },
                                { id: 'profile', icon: <FaUser />, label: 'MY PROFILE', color: '#00e5a0' },
                            ].map(item => (
                                <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }} style={{ width: '100%', padding: '15px 20px', background: activeTab === item.id ? 'rgba(251,188,4,0.1)' : 'transparent', border: 'none', borderLeft: activeTab === item.id ? `4px solid ${item.color}` : '4px solid transparent', borderRadius: '0 12px 12px 0', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left' }}>
                                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '12px' }}>LOGOUT OPS</button>
                    </aside>
                </div>
            )}

            <main style={{ padding: '20px' }}>{renderContent()}</main>

            {/* Bottom Nav */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: 'rgba(10, 12, 18, 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }}>
                {[
                    { id: 'duty', icon: <FaTasks />, label: 'HUB' },
                    { id: 'verify', icon: <FaQrcode />, label: 'VERIFY' },
                    { id: 'live', icon: <FaMapMarkerAlt />, label: 'LIVE' },
                    { id: 'profile', icon: <FaShieldAlt />, label: 'OPS' },
                ].map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === item.id ? '#fbbc04' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '1px' }}>{item.label}</span>
                    </div>
                ))}
            </nav>

            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
            `}</style>
        </div>
    );
}

function DutyMobile({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="glass-panel" style={{ padding: '15px', borderLeft: '3px solid #fbbc04' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>142</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>ACTIVE RIDES</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px', borderLeft: '3px solid #ff4d4d' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff4d4d' }}>02</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>SOS EVENTS</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>QUICK ACTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button style={{ padding: '15px', background: 'rgba(251,188,4,0.1)', border: '1px solid #fbbc04', borderRadius: '12px', color: '#fbbc04', fontSize: '10px', fontWeight: 900 }}>QR SCAN</button>
                    <button style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontSize: '10px', fontWeight: 900 }}>SOS ALERT</button>
                </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>ROUTE VIOLATIONS</h3>
            <div className="glass-panel" style={{ padding: '15px', borderLeft: '3px solid #ff8a00' }}>
                <div style={{ fontSize: '12px', fontWeight: 900 }}>ROUTE DEVIATION: CAB T-442</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>Entering Sector 9 Restricted Zone</div>
            </div>
        </div>
    );
}

function DriverVerifyMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>DRIVER VERIFICATION</h2>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUser size={60} color="rgba(255,255,255,0.1)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {['LICENSE', 'ID CARD', 'VEHICLE RC'].map(doc => (
                        <div key={doc} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '11px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>{doc}</span>
                            <span style={{ color: '#00e5a0', fontWeight: 900 }}>VERIFIED</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ flex: 1, padding: '15px', background: '#00e5a0', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 900, fontSize: '12px' }}>APPROVE</button>
                    <button style={{ flex: 1, padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '12px' }}>REJECT</button>
                </div>
            </div>
        </div>
    );
}

function RegistrationApprovalMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>TAXI APPROVALS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1,2,3].map(i => (
                    <div key={i} className="glass-panel" style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>MP-09-AB-{882 + i}</div>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#00e5a0', background: 'rgba(0,229,160,0.1)', padding: '4px 8px', borderRadius: '6px' }}>FITNESS OK</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>Swift Dzire • White • Documents Verified</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{ flex: 1, padding: '10px', background: '#00e5a0', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 900, fontSize: '10px' }}>APPROVE</button>
                            <button style={{ flex: 1, padding: '10px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px' }}>REJECT</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LiveRideMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900 }}>LIVE RIDE HUB</h2>
                <div style={{ width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '50%', boxShadow: '0 0 10px #ff4d4d' }}></div>
            </div>
            
            <div className="glass-panel" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '10px', marginBottom: '20px' }}>
                [ LIVE HUD MAP ]
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1,2].map(i => (
                    <div key={i} className="glass-panel" style={{ padding: '15px', borderLeft: i === 1 ? '4px solid #ff4d4d' : '4px solid #fbbc04' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '5px' }}>Ride #{8823 + i} • {i === 1 ? 'SOS TRIGGERED' : 'ON ROUTE'}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Ramesh Kumar • Swift Dzire</div>
                        <button style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>OPEN LIVE TRACK</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RouteHistoryMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>ROUTE HISTORY</h2>
            <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#ff8a00', marginBottom: '15px' }}>UNUSUAL BEHAVIOR LOG</h4>
                {[1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{10 + i}:22 PM</div>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff8a00' }}></div>
                        <div style={{ fontSize: '10px', fontWeight: 800 }}>Abnormal Stop: Cab MP09-AB-2291</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ff8a00)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 900, color: '#000' }}>{user.name[0]}</div>
                <h2 style={{ fontSize: '20px', fontWeight: 900 }}>{user.name}</h2>
                <p style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 800, letterSpacing: '2px', marginTop: '5px' }}>SAFE TAXI FIELD AGENT</p>
            </div>
            <button onClick={onLogout} style={{ width: '100%', padding: '18px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '15px', color: '#ff4d4d', fontWeight: 900, fontSize: '12px' }}>TERMINATE SESSION</button>
        </div>
    );
}
