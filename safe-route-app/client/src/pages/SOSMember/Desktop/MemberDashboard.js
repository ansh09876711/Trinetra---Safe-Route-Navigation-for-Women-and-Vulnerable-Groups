import React, { useState } from "react";
import { 
  FaExclamationCircle, FaCheck, FaChartLine, FaMapMarkerAlt, FaBroadcastTower, 
  FaComment, FaHospital, FaClock, FaRoute, FaMicrophoneAlt, FaUser, 
  FaSignOutAlt, FaSearch, FaBell, FaUserCircle, FaSatellite, FaWalking, 
  FaAmbulance, FaUserShield, FaClipboardList, FaFileImage, FaBrain, FaPhone,
  FaMapMarkedAlt, FaShieldAlt, FaEnvelope, FaLock, FaEyeSlash, FaEye, FaTasks
} from "react-icons/fa";
import Logo from "../../../components/Logo";

export default function MemberDashboard({ user, sosAlerts, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [searchQuery, setSearchQuery] = useState("");

    const tabs = [
        { id: 'command', label: 'MISSION HUB', icon: <FaThLarge />, color: '#ff4d4d' },
        { id: 'feed', label: 'LIVE SOS FEED', icon: <FaBroadcastTower />, color: '#ff8a00' },
        { id: 'tracking', label: 'TRACKING & NAV', icon: <FaMapMarkerAlt />, color: '#00e5a0' },
        { id: 'comms', label: 'TACTICAL COMMS', icon: <FaComment />, color: '#4285F4' },
        { id: 'rescue', label: 'RESCUE ASSETS', icon: <FaHospital />, color: '#fbbc04' },
        { id: 'logs', label: 'MISSION LOGS', icon: <FaClock />, color: '#ff2d55' },
        { id: 'voice', label: 'VOICE MONITOR', icon: <FaMicrophoneAlt />, color: '#00fff2' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'command': return <MemberCommandView alerts={sosAlerts} />;
            case 'feed': return <MemberFeedView alerts={sosAlerts} />;
            case 'tracking': return <MemberTrackingView alerts={sosAlerts} />;
            case 'comms': return <MemberCommsView alerts={sosAlerts} />;
            case 'rescue': return <MemberRescueView />;
            case 'logs': return <MemberLogsView />;
            case 'voice': return <MemberVoiceView />;
            case 'profile': return <ProfileView user={user} />;
            default: return <MemberCommandView alerts={sosAlerts} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(255,77,77,0.1)', borderRadius: '8px', border: '1px solid rgba(255,77,77,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#ff4d4d' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#ff4d4d', letterSpacing: '2px' }}>FIELD OPERATIVE</span>
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
                        <input placeholder="SEARCH INCIDENTS, TEAMS, OR LOCATIONS..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                                    <div style={{ fontSize: '9px', color: '#ff4d4d', fontWeight: 800, letterSpacing: '1px' }}>{user?.designation || 'SOS MEMBER'} • ACTIVE</div>
                                </div>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff4d4d, #fbbc04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff' }}>{user?.name[0]}</div>
                            </div>
                        </div>
                </header>
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>
        </div>
    );
}

function MemberCommandView({ alerts }) {
    const [selectedAlert, setSelectedAlert] = useState(alerts[0] || null);
    const [caseStatus, setCaseStatus] = useState("Pending");

    const getEmergencyType = (msg) => {
        if (!msg) return "Women Safety";
        const m = msg.toLowerCase();
        if (m.includes("accident")) return "Accident";
        if (m.includes("medical")) return "Medical Emergency";
        if (m.includes("threat") || m.includes("kidnap")) return "Kidnap Threat";
        return "Women Safety";
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'ASSIGNED CASES', val: '04', color: '#ff4d4d', icon: <FaExclamationCircle /> },
                    { label: 'ACTIVE EMERGENCY', val: alerts.length, color: '#fbbc04', icon: <FaSatellite /> },
                    { label: 'RESOLVED TODAY', val: '08', color: '#00e5a0', icon: <FaCheck /> },
                    { label: 'AVG RESPONSE', val: '3.8m', color: '#4285F4', icon: <FaChartLine /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${w.color}10`, borderRadius: '15px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 900 }}>{w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr 320px', gap: '30px', height: 'calc(100vh - 280px)' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>LIVE SOS FEED</h4>
                        <div className="status-dot" style={{ background: '#ff4d4d' }}></div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                        {alerts.map(alert => (
                            <div key={alert.id} onClick={() => setSelectedAlert(alert)} style={{ padding: '15px', background: selectedAlert?.id === alert.id ? 'rgba(255,77,77,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedAlert?.id === alert.id ? '#ff4d4d' : 'rgba(255,255,255,0.05)'}`, borderRadius: '15px', marginBottom: '10px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 900 }}>{alert.userName}</span>
                                    <span style={{ fontSize: '8px', background: '#ff4d4d', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>{getEmergencyType(alert.message).toUpperCase()}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaMapMarkerAlt style={{ color: '#ff4d4d' }} /> {alert.locationName?.substring(0, 40)}...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="sos-ripple" style={{ width: '120px', height: '120px', border: '1px solid #ff4d4d' }}></div>
                            <div style={{ zIndex: 2, background: 'rgba(255,77,77,0.2)', border: '2px solid #ff4d4d', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaExclamationCircle style={{ fontSize: '30px', color: '#ff4d4d' }} />
                            </div>
                        </div>
                        <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', background: 'rgba(0,0,0,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>VICTIM DISTANCE</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e5a0' }}>2.4 KM • 6 MIN</div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <button onClick={() => setCaseStatus("Accepted")} style={{ padding: '15px', background: caseStatus === "Accepted" ? '#00e5a0' : 'rgba(0,229,160,0.1)', border: '1px solid #00e5a0', borderRadius: '12px', color: caseStatus === "Accepted" ? '#000' : '#00e5a0', fontWeight: 900, fontSize: '10px', cursor: 'pointer' }}>ACCEPT CASE</button>
                            <button style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer' }}>REJECT CASE</button>
                            <button style={{ padding: '15px', background: 'rgba(66,133,244,0.1)', border: '1px solid #4285F4', borderRadius: '12px', color: '#4285F4', fontWeight: 900, fontSize: '10px', cursor: 'pointer' }}>TRANSFER</button>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ height: '200px', padding: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', marginBottom: '15px', color: 'rgba(255,255,255,0.4)' }}>INCIDENT ACTION PANEL</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                            {[
                                { label: 'MARK SAFE', icon: <FaCheck />, color: '#00e5a0' },
                                { label: 'AMBULANCE', icon: <FaAmbulance />, color: '#ff4d4d' },
                                { label: 'POLICE BACKUP', icon: <FaUserShield />, color: '#4285F4' },
                                { label: 'ADD NOTES', icon: <FaClipboardList />, color: '#fbbc04' },
                                { label: 'EVIDENCE', icon: <FaFileImage />, color: '#ff8a00' },
                                { label: 'REACHED', icon: <FaWalking />, color: '#00fff2' },
                                { label: 'RESOLVED', icon: <FaCheck />, color: '#00e5a0' },
                                { label: 'REQUEST AI', icon: <FaBrain />, color: '#d442f5' },
                            ].map((btn, i) => (
                                <button key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: btn.color, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '16px' }}>{btn.icon}</span>
                                    <span style={{ fontSize: '7px', fontWeight: 900 }}>{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ flex: 1, padding: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', marginBottom: '20px', color: 'rgba(255,255,255,0.4)' }}>TACTICAL COMMS</div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '15px', marginBottom: '15px', height: '150px', overflowY: 'auto' }}>
                            <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900, marginBottom: '5px' }}>[VICTIM]: HELP! Someone is following me near Rajwada.</div>
                            <div style={{ fontSize: '10px', color: '#4285F4', fontWeight: 900, marginBottom: '5px' }}>[AGENT]: Stay calm. Team Alpha is 6 minutes away.</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{ flex: 1, padding: '10px', background: '#4285F4', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>CHAT</button>
                            <button style={{ flex: 1, padding: '10px', background: '#00e5a0', border: 'none', borderRadius: '8px', color: '#000', fontSize: '10px', fontWeight: 900 }}>VOICE</button>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', marginBottom: '20px', color: 'rgba(255,255,255,0.4)' }}>MISSION LOG</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[{ time: '18:10', text: 'SOS RECEIVED', active: true }, { time: '18:12', text: 'TEAM ALPHA ASSIGNED', active: true }, { time: '18:14', text: 'EN ROUTE', active: true }, { time: '--:--', text: 'REACHED', active: false }].map((t, i) => (
                                <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', width: '40px' }}>{t.time}</div>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.active ? '#ff4d4d' : 'rgba(255,255,255,0.1)' }}></div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: t.active ? '#fff' : 'rgba(255,255,255,0.2)' }}>{t.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MemberFeedView({ alerts }) { return <PlaceholderTab title="LIVE SOS FEED" icon={<FaBroadcastTower />} />; }
function MemberTrackingView({ alerts }) { return <PlaceholderTab title="LIVE TACTICAL TRACKING" icon={<FaMapMarkedAlt />} />; }
function MemberCommsView({ alerts }) { return <PlaceholderTab title="TACTICAL COMMUNICATIONS" icon={<FaComment />} />; }
function MemberRescueView() { return <PlaceholderTab title="RESCUE ASSETS" icon={<FaHospital />} />; }
function MemberLogsView() { return <PlaceholderTab title="MISSION LOGS" icon={<FaClock />} />; }
function MemberVoiceView() { return <PlaceholderTab title="VOICE MONITOR" icon={<FaMicrophoneAlt />} />; }

function PlaceholderTab({ title, icon }) {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>{icon}</div>
            <h1 style={{ letterSpacing: '10px', fontWeight: 900 }}>{title}</h1>
            <p style={{ letterSpacing: '2px', fontWeight: 600 }}>ENCRYPTED MODULE PENDING INTEGRATION</p>
        </div>
    );
}

function ProfileView({ user }) {
    const [showPass, setShowPass] = useState(true);
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10, 12, 18, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #0095ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 900, color: '#000', boxShadow: '0 10px 30px rgba(0,229,160,0.3)' }}>{user.name?.split(" ").map(n => n[0]).join("").toUpperCase()}</div>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0 }}>{user.name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5a0', marginTop: '5px' }}>
                            <FaShieldAlt size={12} />
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>{user.designation || 'SOS MEMBER'} COMMANDER</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Login Email Address</label>
                        <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}><FaEnvelope style={{ color: '#00e5a0' }} /> {user.email}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Secure Password</label>
                        <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FaLock style={{ color: '#00e5a0' }} /> 
                                <span style={{ letterSpacing: !showPass ? '4px' : 'normal', fontFamily: !showPass ? 'monospace' : 'inherit' }}>{localStorage.getItem("trinetra_pass") || (user.email === 'chief@trinetra.gov.in' ? 'CHIEF#TRINETRA' : user.email === 'admin@trinetra.com' ? 'Admin@9977' : "••••••••")}</span>
                            </div>
                            <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', color: '#00e5a0', cursor: 'pointer', fontSize: '18px' }}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FaThLarge() { return <FaTasks />; }
