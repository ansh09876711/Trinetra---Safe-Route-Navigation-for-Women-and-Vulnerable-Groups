import React, { useState, useEffect } from "react";
import { 
  FaTaxi, FaUsers, FaChartLine, FaMapMarkedAlt, FaBroadcastTower, 
  FaExclamationTriangle, FaRoute, FaShieldAlt, FaSignOutAlt, 
  FaSearch, FaBell, FaCogs, FaBan, FaUserCheck, FaMapMarkerAlt,
  FaPlus, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaGlobe, FaBrain, FaPhone, FaBars, FaTimes
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db, auth } from "../../../../firebase";
import { setDoc, doc, collection, onSnapshot, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword as firebaseCreateUser } from "firebase/auth";

export default function TaxiHeadMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [teamMembers, setTeamMembers] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionForm, setProvisionForm] = useState({ name: "", email: "", password: "", role: "Taxi Member", team: "Alpha Response" });
    const [showPass, setShowPass] = useState(false);
    const [provisionStatus, setProvisionStatus] = useState({ loading: false, msg: "" });

    useEffect(() => {
        const q = query(collection(db, "users"), where("divisionId", "==", "2"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeamMembers(members);
        });
        return () => unsubscribe();
    }, []);

    const handleProvision = async (e) => {
        e.preventDefault();
        setProvisionStatus({ loading: true, msg: "PROVISIONING..." });
        try {
            const userCredential = await firebaseCreateUser(auth, provisionForm.email, provisionForm.password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, "users", uid), {
                name: provisionForm.name,
                email: provisionForm.email,
                role: "member",
                accountType: "divisional",
                divisionId: "2",
                designation: provisionForm.role,
                team: provisionForm.team,
                createdAt: new Date().toISOString(),
                provisionedBy: user.name
            });

            setProvisionStatus({ loading: false, msg: "SUCCESSFUL!" });
            setProvisionForm({ name: "", email: "", password: "", role: "Taxi Member", team: "Alpha Response" });
            setTimeout(() => {
                setShowProvisionModal(false);
                setProvisionStatus({ loading: false, msg: "" });
            }, 2000);
        } catch (err) {
            setProvisionStatus({ loading: false, msg: "ERROR: " + err.message });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewMobile members={teamMembers} />;
            case 'team': return <TeamMobile members={teamMembers} onAddClick={() => setShowProvisionModal(true)} />;
            case 'rides': return <PlaceholderMobile title="ALL RIDES LOG" icon={<FaRoute />} />;
            case 'drivers': return <PlaceholderMobile title="DRIVER DATABASE" icon={<FaUserCheck />} />;
            case 'analytics': return <PlaceholderMobile title="RIDE ANALYTICS" icon={<FaChartLine />} />;
            case 'map': return <PlaceholderMobile title="LIVE TAXI MAP" icon={<FaMapMarkedAlt />} />;
            case 'geofence': return <PlaceholderMobile title="GEO-FENCE CONTROL" icon={<FaGlobe />} />;
            case 'broadcast': return <PlaceholderMobile title="PUBLIC BROADCAST" icon={<FaBroadcastTower />} />;
            case 'escalation': return <PlaceholderMobile title="EMERGENCY ESCALATION" icon={<FaExclamationTriangle />} />;
            case 'alerts': return <AlertsMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            case 'settings': return <PlaceholderMobile title="DIVISION SETTINGS" icon={<FaCogs />} />;
            default: return <OverviewMobile members={teamMembers} />;
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
                                { id: 'overview', icon: <FaTaxi />, label: 'RIDE COMMAND', color: '#fbbc04' },
                                { id: 'team', icon: <FaUsers />, label: 'TEAM MANAGEMENT', color: '#4285F4' },
                                { id: 'rides', icon: <FaRoute />, label: 'ALL RIDES LOG', color: '#00e5a0' },
                                { id: 'drivers', icon: <FaUserCheck />, label: 'DRIVER DATABASE', color: '#ff8a00' },
                                { id: 'analytics', icon: <FaChartLine />, label: 'RIDE ANALYTICS', color: '#d442f5' },
                                { id: 'map', icon: <FaMapMarkedAlt />, label: 'LIVE TAXI MAP', color: '#ff4d4d' },
                                { id: 'geofence', icon: <FaGlobe />, label: 'GEO-FENCE CONTROL', color: '#00e5a0' },
                                { id: 'broadcast', icon: <FaBroadcastTower />, label: 'PUBLIC BROADCAST', color: '#60b8ff' },
                                { id: 'escalation', icon: <FaExclamationTriangle />, label: 'EMERGENCY ESCALATION', color: '#ff4d4d' },
                                { id: 'alerts', icon: <FaBell />, label: 'THREAT ALERTS', color: '#ff4d4d' },
                                { id: 'profile', icon: <FaShieldAlt />, label: 'MY PROFILE', color: '#00e5a0' },
                                { id: 'settings', icon: <FaCogs />, label: 'SETTINGS', color: 'rgba(255,255,255,0.4)' },
                            ].map(item => (
                                <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }} style={{ width: '100%', padding: '12px 20px', background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', borderLeft: activeTab === item.id ? `4px solid ${item.color}` : '4px solid transparent', borderRadius: '0 12px 12px 0', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left' }}>
                                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '12px' }}>LOGOUT COMMAND</button>
                    </aside>
                </div>
            )}

            <main style={{ padding: '20px' }}>{renderContent()}</main>

            {/* Bottom Nav (Quick Access) */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: 'rgba(10, 12, 18, 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }}>
                {[
                    { id: 'overview', icon: <FaTaxi />, label: 'COMMAND' },
                    { id: 'team', icon: <FaUsers />, label: 'TEAM' },
                    { id: 'map', icon: <FaMapMarkedAlt />, label: 'MAP' },
                    { id: 'escalation', icon: <FaExclamationTriangle />, label: 'SOS' },
                ].map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === item.id ? '#fbbc04' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '1px' }}>{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* MOBILE PROVISION MODAL */}
            {showProvisionModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px', background: '#0a0c12', border: '1px solid #00e5a0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#00e5a0', margin: 0 }}>PROVISION PERSONNEL</h2>
                            <FaTimes onClick={() => setShowProvisionModal(false)} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {provisionStatus.msg && (
                                <div style={{ padding: '10px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '10px', textAlign: 'center', fontWeight: 900 }}>
                                    {provisionStatus.msg}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>FULL NAME</label>
                                <input placeholder="Name" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} value={provisionForm.name} onChange={e => setProvisionForm({...provisionForm, name: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>EMAIL ID</label>
                                <input placeholder="Email" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} value={provisionForm.email} onChange={e => setProvisionForm({...provisionForm, email: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>PASSWORD</label>
                                <input type="password" placeholder="••••••••" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} value={provisionForm.password} onChange={e => setProvisionForm({...provisionForm, password: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>ROLE</label>
                                <select style={{ padding: '12px', background: '#0a0c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }} value={provisionForm.role} onChange={e => setProvisionForm({...provisionForm, role: e.target.value})}>
                                    <option value="Taxi Member" style={{ background: '#0a0c12', color: '#fff' }}>Taxi Member</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>TEAM</label>
                                <select style={{ padding: '12px', background: '#0a0c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }} value={provisionForm.team} onChange={e => setProvisionForm({...provisionForm, team: e.target.value})}>
                                    <option value="Alpha Response" style={{ background: '#0a0c12', color: '#fff' }}>Alpha Response</option>
                                    <option value="Quick Action Unit" style={{ background: '#0a0c12', color: '#fff' }}>Quick Action Unit</option>
                                    <option value="Night Watch" style={{ background: '#0a0c12', color: '#fff' }}>Night Watch</option>
                                </select>
                            </div>
                            <button onClick={handleProvision} style={{ marginTop: '10px', padding: '15px', background: '#00e5a0', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 900, fontSize: '12px' }}>CREATE ID</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
                select option { background: #0a0c12; color: white; }
            `}</style>
        </div>
    );
}

function OverviewMobile({ members }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>COMMAND OVERVIEW</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>842</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>ACTIVE RIDES</div>
                </div>
                <div className="glass-panel" style={{ padding: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff4d4d' }}>03</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>SOS EVENTS</div>
                </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>LIVE RIDE COMMAND</h3>
            <div className="glass-panel" style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
                [ INTERACTIVE MAP HUD ]
            </div>
        </div>
    );
}

function TeamMobile({ members, onAddClick }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900 }}>TEAM DIRECTORY</h2>
                <button onClick={onAddClick} style={{ background: '#00e5a0', color: '#000', padding: '5px 12px', borderRadius: '15px', fontSize: '10px', fontWeight: 900, border: 'none' }}>+ ADD</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {members.map((m, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>{m.name?.[0] || 'T'}</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 800 }}>{m.name}</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{m.designation}</div>
                            </div>
                        </div>
                        <div style={{ width: '8px', height: '8px', background: '#00e5a0', borderRadius: '50%' }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AlertsMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', color: '#ff4d4d' }}>CRITICAL ALERTS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1,2,3].map(i => (
                    <div key={i} className="glass-panel" style={{ padding: '15px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.1)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900 }}>ROUTE DEVIATION #{i}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>CAB T-882 • RAJWADA SECTOR</div>
                        <button style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#ff4d4d', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: 900 }}>INTERVENE</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlaceholderMobile({ title, icon }) {
    return (
        <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>{icon}</div>
            <h2 style={{ fontSize: '14px', letterSpacing: '5px', fontWeight: 900 }}>{title}</h2>
            <p style={{ fontSize: '10px', letterSpacing: '1px', fontWeight: 600 }}>TACTICAL HUB SYNCING...</p>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ff8a00)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 900, color: '#000' }}>{user.name[0]}</div>
                <h2 style={{ fontSize: '20px', fontWeight: 900 }}>{user.name}</h2>
                <p style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 800, letterSpacing: '2px', marginTop: '5px' }}>SAFE TAXI COMMANDER</p>
            </div>
            <button onClick={onLogout} style={{ width: '100%', padding: '18px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '15px', color: '#ff4d4d', fontWeight: 900, fontSize: '12px' }}>TERMINATE SESSION</button>
        </div>
    );
}
