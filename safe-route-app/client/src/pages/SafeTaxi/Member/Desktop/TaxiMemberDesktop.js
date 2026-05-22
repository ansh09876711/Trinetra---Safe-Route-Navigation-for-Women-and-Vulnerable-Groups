import React, { useState, useEffect } from "react";
import { 
  FaTaxi, FaIdCard, FaMapMarkerAlt, FaComment, 
  FaExclamationCircle, FaShieldAlt, FaSignOutAlt, 
  FaSearch, FaBell, FaUser, FaLock, FaEnvelope, 
  FaEyeSlash, FaEye, FaTasks, FaCheck, FaQrcode,
  FaFileAlt, FaHistory, FaStar, FaMoon, FaMapMarkedAlt,
  FaCheckCircle, FaTimesCircle, FaBan, FaCar
} from "react-icons/fa";
import Logo from "../../../../components/Logo";

export default function TaxiMemberDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("duty");
    const [searchQuery, setSearchQuery] = useState("");

    const tabs = [
        { id: 'duty', label: 'FIELD HUB', icon: <FaTasks />, color: '#fbbc04' },
        { id: 'verify', label: 'DRIVER VERIFICATION', icon: <FaIdCard />, color: '#00e5a0' },
        { id: 'approvals', label: 'TAXI REGISTRATIONS', icon: <FaCar />, color: '#4285F4' },
        { id: 'live', label: 'LIVE RIDE COMMAND', icon: <FaMapMarkerAlt />, color: '#ff4d4d' },
        { id: 'history', label: 'ROUTE HISTORY', icon: <FaHistory />, color: '#00e5a0' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'duty': return <DutyView />;
            case 'verify': return <DriverVerificationView />;
            case 'approvals': return <TaxiApprovalView />;
            case 'live': return <LiveRideMonitoringView />;
            case 'history': return <RouteHistoryView />;
            case 'profile': return <ProfileView user={user} />;
            default: return <DutyView />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(251,188,4,0.1)', borderRadius: '8px', border: '1px solid rgba(251,188,4,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#fbbc04' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#fbbc04', letterSpacing: '2px' }}>TAXI FIELD OPS</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
                    {tabs.map(item => (
                        <div key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '14px 20px', marginBottom: '6px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderLeft: `3px solid ${activeTab === item.id ? item.color : 'transparent'}`,
                                transition: '0.2s'
                            }}>
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

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input placeholder="SEARCH DRIVER ID OR CAB NO..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div onClick={onLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d4d', background: 'rgba(255,77,77,0.1)', padding: '8px 15px', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.2)' }}>
                            <FaSignOutAlt size={14} />
                            <span style={{ fontSize: '10px', fontWeight: 900 }}>EXIT HUB</span>
                        </div>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <FaBell style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)' }} />
                            <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', background: '#fbbc04', borderRadius: '50%', border: '2px solid #05070a' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.5px' }}>{user?.name}</div>
                                <div style={{ fontSize: '9px', color: '#fbbc04', fontWeight: 800, letterSpacing: '1px' }}>{user?.designation || 'TAXI MEMBER'} • FIELD OPS</div>
                            </div>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbc04, #ff8a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#000', fontWeight: 900 }}>{user?.name[0]}</div>
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>
            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

function DutyView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'ACTIVE RIDES', val: '142', color: '#fbbc04', icon: <FaTaxi /> },
                    { label: 'SOS EVENTS', val: '02', color: '#ff4d4d', icon: <FaExclamationCircle /> },
                    { label: 'PENDING VERIF', val: '28', color: '#00e5a0', icon: <FaIdCard /> },
                    { label: 'UNSAFE DRIVERS', val: '05', color: '#ff8a00', icon: <FaBan /> }
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '24px', color: w.color, background: `${w.color}10`, width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                    [ REAL-TIME RIDE TRACKING MAP ]
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ff4d4d', marginBottom: '20px' }}>CRITICAL ALERTS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: 'rgba(255,77,77,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,77,77,0.1)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900 }}>UNSAFE STOP DETECTED</div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>Cab T-442 • 12 mins at Sector 7 Alley</div>
                            <button style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#ff4d4d', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>INTERVENE</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DriverVerificationView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>DRIVER VERIFICATION PANEL</h2>
            <div className="glass-panel" style={{ padding: '35px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '200px', height: '200px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaUser size={100} color="rgba(255,255,255,0.1)" />
                        </div>
                        <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900 }}>MATCH PHOTO</button>
                    </div>
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            {[
                                { label: 'DRIVER LICENSE', icon: <FaFileAlt />, status: 'Verified' },
                                { label: 'AADHAAR/ID CARD', icon: <FaIdCard />, status: 'Pending' },
                                { label: 'VECHICLE RC', icon: <FaFileAlt />, status: 'Verified' },
                                { label: 'INSURANCE CERT', icon: <FaShieldAlt />, status: 'Pending' }
                            ].map((doc, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ color: '#fbbc04' }}>{doc.icon}</div>
                                        <div style={{ fontSize: '11px', fontWeight: 900 }}>{doc.label}</div>
                                    </div>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: doc.status === 'Verified' ? '#00e5a0' : '#fbbc04' }}>{doc.status.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button style={{ flex: 1, padding: '18px', background: '#00e5a0', border: 'none', borderRadius: '15px', color: '#000', fontWeight: 900 }}>APPROVE DRIVER</button>
                            <button style={{ flex: 1, padding: '18px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '15px', color: '#ff4d4d', fontWeight: 900 }}>SUSPEND / REJECT</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaxiApprovalView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>TAXI REGISTRATION APPROVAL</h2>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['VEHICLE NO', 'MODEL/COLOR', 'DOCUMENTS', 'FITNESS', 'ACTIONS'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1,2,3].map(i => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontWeight: 900 }}>MP-09-AB-{882 + i}</td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800 }}>Swift Dzire</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Color: White</div>
                                </td>
                                <td style={{ padding: '20px' }}><FaCheckCircle color="#00e5a0" /> <span style={{ fontSize: '11px' }}>RC Verified</span></td>
                                <td style={{ padding: '20px' }}><span style={{ padding: '5px 12px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>VALID</span></td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{ padding: '8px 15px', background: '#00e5a0', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 900, fontSize: '10px' }}>APPROVE</button>
                                        <button style={{ padding: '8px 15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px' }}>REJECT</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LiveRideMonitoringView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>LIVE RIDE COMMAND</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ padding: '10px 20px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaExclamationCircle /> 02 SOS TRIPPED
                    </div>
                    <div style={{ padding: '10px 20px', background: 'rgba(0,229,160,0.1)', border: '1px solid #00e5a0', borderRadius: '12px', color: '#00e5a0', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaMoon /> NIGHT MODE ACTIVE
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[1,2,3].map(i => (
                        <div key={i} className="glass-panel" style={{ padding: '20px', borderLeft: i === 1 ? '4px solid #ff4d4d' : '4px solid #fbbc04' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 900 }}>Ride #{8823 + i}</div>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: i === 1 ? '#ff4d4d' : '#fbbc04' }}>{i === 1 ? 'SOS TRIGGERED' : 'ON ROUTE'}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>Indore Airport ➔ Rajwada Junction</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#fbbc04' }}></div>
                                    <div style={{ fontSize: '10px', fontWeight: 800 }}>Ramesh Kumar<br/><span style={{ color: 'rgba(255,255,255,0.3)' }}>Swift Dzire</span></div>
                                </div>
                                <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '9px', fontWeight: 900 }}>VIEW TRACK</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '10px' }}>
                            <div style={{ color: '#ff4d4d', fontWeight: 900 }}>RESTRICTED ZONE</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)' }}>Sector 9 (High Crime Area)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RouteHistoryView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>ROUTE HISTORY & COMPLAINTS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>RECENT COMPLAINTS</h3>
                    {[1,2].map(i => (
                        <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900 }}>Anjali S. ➔ Ramesh K.</div>
                                <div style={{ display: 'flex', color: '#fbbc04', gap: '2px' }}><FaStar/><FaStar/><FaStar/></div>
                            </div>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>"The driver took an unusual route through dark alleys. Felt very unsafe."</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button style={{ padding: '6px 12px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '6px', color: '#ff4d4d', fontSize: '9px', fontWeight: 900 }}>FLAG DRIVER</button>
                                <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '9px', fontWeight: 900 }}>RESOLVE</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>UNUSUAL BEHAVIOR LOG</h3>
                    {[1,2,3].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', width: '60px' }}>{10 + i}:22 PM</div>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff8a00' }}></div>
                            <div style={{ fontSize: '11px', fontWeight: 800 }}>Abnormal Delay: Cab MP09-AB-2291</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProfileView({ user }) {
    const [showPass, setShowPass] = useState(false);
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ff8a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 900, color: '#000' }}>{user.name[0]}</div>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>{user.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbc04', marginTop: '5px' }}>
                            <FaShieldAlt size={12} />
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>SAFE TAXI FIELD AGENT</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Email ID</label>
                        <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}><FaEnvelope style={{ color: '#fbbc04' }} /> {user.email}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Secure Password</label>
                        <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FaLock style={{ color: '#fbbc04' }} /> 
                                <span style={{ letterSpacing: !showPass ? '4px' : 'normal', fontFamily: !showPass ? 'monospace' : 'inherit' }}>{localStorage.getItem("trinetra_pass") || "••••••••"}</span>
                            </div>
                            <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', color: '#fbbc04', cursor: 'pointer', fontSize: '18px' }}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
