import React, { useState, useEffect } from "react";
import { 
  FaTaxi, FaUsers, FaChartLine, FaMapMarkedAlt, FaBroadcastTower, 
  FaUserShield, FaExclamationTriangle, FaRoute, FaShieldAlt, FaSignOutAlt, 
  FaSearch, FaBell, FaHistory, FaCogs, FaBan, FaUserCheck, FaMapMarkerAlt,
  FaCheckCircle, FaTrash, FaPlus, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaGlobe, FaBrain, FaPhone
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db, auth } from "../../../../firebase";
import { setDoc, doc, collection, onSnapshot, query, where, deleteDoc, orderBy, updateDoc, limit } from "firebase/firestore";
import { createUserWithEmailAndPassword as firebaseCreateUser } from "firebase/auth";

export default function TaxiHeadDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [searchQuery, setSearchQuery] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionForm, setProvisionForm] = useState({ name: "", email: "", password: "", role: "Taxi Member", team: "Alpha Response" });
    const [showPass, setShowPass] = useState(false);
    const [provisionStatus, setProvisionStatus] = useState({ loading: false, msg: "" });
    const [incidents, setIncidents] = useState([]);

    const [latestSos, setLatestSos] = useState(null);

    useEffect(() => {
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

    useEffect(() => {
        const q = query(collection(db, "reports"), where("type", "==", "SAFE TAXI"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(list);
        });
        return () => unsubscribe();
    }, []);

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

    const handleDeleteMember = async (id, name) => {
        if (!window.confirm(`REVOKE ACCESS FOR ${name}?`)) return;
        try {
            await deleteDoc(doc(db, "users", id));
        } catch (err) {
            alert("ERROR REVOKING ACCESS");
        }
    };

    const tabs = [
        { id: 'command', label: 'RIDE COMMAND CENTER', icon: <FaTaxi />, color: '#fbbc04' },
        { id: 'team', label: 'TEAM MANAGEMENT', icon: <FaUsers />, color: '#4285F4' },
        { id: 'rides', label: 'ALL RIDES', icon: <FaRoute />, color: '#00e5a0' },
        { id: 'drivers', label: 'DRIVER MANAGEMENT', icon: <FaUserCheck />, color: '#ff8a00' },
        { id: 'analytics', label: 'RIDE ANALYTICS', icon: <FaChartLine />, color: '#d442f5' },
        { id: 'map', label: 'LIVE TAXI MAP', icon: <FaMapMarkedAlt />, color: '#ff4d4d' },
        { id: 'geofence', label: 'GEO-FENCE CONTROL', icon: <FaGlobe />, color: '#00e5a0' },
        { id: 'broadcast', label: 'PUBLIC BROADCAST', icon: <FaBroadcastTower />, color: '#60b8ff' },
        { id: 'escalation', label: 'EMERGENCY ESCALATION', icon: <FaExclamationTriangle />, color: '#ff4d4d' },
        { id: 'settings', label: 'DIVISION SETTINGS', icon: <FaCogs />, color: 'rgba(255,255,255,0.4)' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUserShield />, color: '#00e5a0' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'command': return <RideCommandView incidents={incidents} user={user} />;
            case 'team': return <TeamManagementView onAddClick={() => setShowProvisionModal(true)} members={teamMembers} onDelete={handleDeleteMember} />;
            case 'rides': return <AllRidesView />;
            case 'drivers': return <DriverManagementView />;
            case 'analytics': return <AnalyticsView />;
            case 'map': return <LiveMapView />;
            case 'geofence': return <GeoFenceView />;
            case 'broadcast': return <BroadcastView />;
            case 'escalation': return <EscalationView />;
            case 'settings': return <SettingsView />;
            case 'profile': return <ProfileView user={user} />;
            default: return <RideCommandView />;
        }
    };

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
                            onClick={() => setActiveTab("escalation")}
                            style={{ padding: '8px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            INTERCEPT SIGNAL
                        </button>
                    </div>
                </div>
            )}

            {/* TACTICAL SIDEBAR */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100, marginTop: latestSos ? '60px' : '0', transition: '0.5s' }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(251,188,4,0.1)', borderRadius: '8px', border: '1px solid rgba(251,188,4,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#fbbc04' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#fbbc04', letterSpacing: '2px' }}>FLEET COMMAND</span>
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

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', marginTop: latestSos ? '60px' : '0', transition: '0.5s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input placeholder="SEARCH RIDES, DRIVERS, OR TEAMS..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                                <div style={{ fontSize: '9px', color: '#fbbc04', fontWeight: 800, letterSpacing: '1px' }}>SAFE TAXI COMMANDER</div>
                            </div>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbc04, #ff8a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#000', fontWeight: 900 }}>{user?.name[0]}</div>
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            {/* PROVISION MODAL */}
            {showProvisionModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '450px', padding: '40px', background: '#0a0c12', border: '1px solid #00e5a0', position: 'relative' }}>
                        <button onClick={() => setShowProvisionModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        
                        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#00e5a0', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                             PROVISION TAXI PERSONNEL
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {provisionStatus.msg && (
                                <div style={{ padding: '10px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '10px', textAlign: 'center', fontWeight: 900 }}>
                                    {provisionStatus.msg}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>FULL NAME</label>
                                <input placeholder="Personnel Name" style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} value={provisionForm.name} onChange={e => setProvisionForm({...provisionForm, name: e.target.value})} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>LOGIN ID (EMAIL)</label>
                                <input placeholder="official@trinetra.taxi" style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} value={provisionForm.email} onChange={e => setProvisionForm({...provisionForm, email: e.target.value})} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>TACTICAL PASSPHRASE</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? "text" : "password"} placeholder="••••••••" style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} value={provisionForm.password} onChange={e => setProvisionForm({...provisionForm, password: e.target.value})} />
                                    <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#00e5a0' }}>
                                        {showPass ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>OPERATIONAL ROLE</label>
                                <select style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} value={provisionForm.role} onChange={e => setProvisionForm({...provisionForm, role: e.target.value})}>
                                    <option value="Taxi Member" style={{ background: '#0a0c12', color: '#fff' }}>Taxi Member</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>ASSIGNED TEAM</label>
                                <select style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} value={provisionForm.team} onChange={e => setProvisionForm({...provisionForm, team: e.target.value})}>
                                    <option value="Alpha Response" style={{ background: '#0a0c12', color: '#fff' }}>Alpha Response</option>
                                    <option value="Quick Action Unit" style={{ background: '#0a0c12', color: '#fff' }}>Quick Action Unit</option>
                                    <option value="Night Watch" style={{ background: '#0a0c12', color: '#fff' }}>Night Watch</option>
                                </select>
                            </div>

                            <button onClick={handleProvision} disabled={provisionStatus.loading} style={{ marginTop: '10px', width: '100%', padding: '18px', background: '#00e5a0', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 900, fontSize: '12px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,229,160,0.2)' }}>
                                {provisionStatus.loading ? "PROCESSING..." : "CREATE PERSONNEL ID"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RideCommandView({ incidents, user }) {
    const activeAlerts = incidents.filter(i => i.status === "ACTIVE");
    const assignedCount = incidents.filter(i => i.status === "ASSIGNED").length;
    
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'ACTIVE TAXI SOS', val: activeAlerts.length, color: '#fbbc04', icon: <FaTaxi /> },
                    { label: 'CRITICAL ALERTS', val: activeAlerts.filter(a => a.priority === "CRITICAL").length, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'DISPATCHED UNITS', val: assignedCount, color: '#00e5a0', icon: <FaUserCheck /> },
                    { label: 'TOTAL REPORTS', val: incidents.length, color: '#d442f5', icon: <FaRoute /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${w.color}10`, borderRadius: '15px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: 900 }}>{w.val < 10 ? `0${w.val}` : w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '500px', padding: 0, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '2px' }}>LIVE RIDE MONITOR</h3>
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FaMapMarkedAlt style={{ fontSize: '100px', color: 'rgba(255,255,255,0.05)' }} />
                         {incidents.filter(i => i.status !== "DELETED").map((inc, i) => (
                             <div key={inc.id} style={{ position: 'absolute', top: `${20 + (i*15)%70}%`, left: `${20 + (i*20)%70}%`, color: inc.status === 'ACTIVE' ? '#ff4d4d' : '#fbbc04', animation: 'pulse 2s infinite' }}>
                                 <FaTaxi />
                                 <div style={{ position: 'absolute', top: -10, background: inc.status === 'ACTIVE' ? '#ff4d4d' : '#fbbc04', color: '#000', fontSize: '7px', padding: '1px 4px', borderRadius: '4px', fontWeight: 900, whiteSpace: 'nowrap' }}>{inc.userName}</div>
                             </div>
                         ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.1)' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#ff4d4d', letterSpacing: '2px', marginBottom: '15px' }}>CITIZEN RIDE ALERTS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                            {incidents.filter(i => i.status !== "DELETED").map(i => (
                                <div key={i.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', borderLeft: `3px solid ${i.status === 'ACTIVE' ? '#ff4d4d' : '#fbbc04'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 900 }}>{i.userName}</div>
                                        <div style={{ fontSize: '8px', fontWeight: 900, color: i.status === 'ACTIVE' ? '#ff4d4d' : '#00e5a0' }}>{i.status}</div>
                                    </div>
                                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{i.locationName?.substring(0, 40)}...</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={async () => {
                                                try { await updateDoc(doc(db, "reports", i.id), { status: "ASSIGNED", assignedAt: Date.now(), assignedBy: user.name }); }
                                                catch(e) {}
                                            }}
                                            style={{ flex: 1, padding: '5px', background: 'rgba(66,133,244,0.1)', border: '1px solid #4285F4', borderRadius: '6px', color: '#4285F4', fontSize: '8px', fontWeight: 900, cursor: 'pointer' }}
                                        >
                                            ASSIGN
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if(window.confirm("REMOVE REPORT?")) {
                                                    try { await updateDoc(doc(db, "reports", i.id), { status: "DELETED", deletedAt: Date.now() }); }
                                                    catch(e) {}
                                                }
                                            }}
                                            style={{ padding: '5px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {incidents.filter(i => i.status !== "DELETED").length === 0 && (
                                <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', padding: '20px' }}>NO ACTIVE TAXI ALERTS</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamManagementView({ onAddClick, members, onDelete }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #00e5a0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>TOTAL ACTIVE PERSONNEL</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{members.length} / 25</div>
                    <div style={{ fontSize: '10px', color: '#00e5a0', marginTop: '5px' }}>{Math.round((members.length/25)*100)}% CAPACITY UTILIZED</div>
                </div>
                <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #00e5a0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>AVG TEAM EFFICIENCY</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>94.2%</div>
                    <div style={{ fontSize: '10px', color: '#00e5a0', marginTop: '5px' }}>+2.1% FROM LAST WEEK</div>
                </div>
                <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #fbbc04' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>READY FOR DISPATCH</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>6 UNITS</div>
                    <div style={{ fontSize: '10px', color: '#fbbc04', marginTop: '5px' }}>WAITING FOR HQ ORDER</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                {/* Directory */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>TAXI PERSONNEL DIRECTORY</h3>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900 }}>FILTER</button>
                            <button onClick={onAddClick} style={{ padding: '10px 25px', background: '#00e5a0', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 900, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaPlus /> ADD MEMBER
                            </button>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '15px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>PERSONNEL</th>
                                <th style={{ padding: '15px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>ROLE</th>
                                <th style={{ padding: '15px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>STATUS</th>
                                <th style={{ padding: '15px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>PERFORMANCE</th>
                                <th style={{ padding: '15px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '35px', height: '35px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{p.name?.[0] || 'T'}</div>
                                        <span style={{ fontWeight: 800 }}>{p.name}</span>
                                    </td>
                                    <td style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{p.designation}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#00e5a0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', background: '#00e5a0', borderRadius: '50%' }}></div> ONLINE
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `90%`, background: '#00e5a0', borderRadius: '2px' }}></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <button onClick={() => onDelete(p.id, p.name)} style={{ background: 'none', border: 'none', color: 'rgba(255,77,77,0.4)', cursor: 'pointer' }}><FaTrash size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>NO PERSONNEL REGISTERED</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Right Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: 900, margin: 0 }}>RESPONSE UNITS</h4>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '24px', height: '24px', borderRadius: '6px', color: '#fff' }}>+</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { name: 'Alpha Response', members: 4, eff: '88%', status: 'ACTIVE', color: '#00e5a0' },
                                { name: 'Quick Action Unit', members: 3, eff: '94%', status: 'ON MISSION', color: '#ff4d4d' },
                                { name: 'Night Watch', members: 5, eff: '96%', status: 'STANDBY', color: '#fbbc04' },
                            ].map((u, i) => (
                                <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 800 }}>{u.name}</span>
                                        <span style={{ fontSize: '8px', fontWeight: 900, color: u.color, background: `${u.color}10`, padding: '2px 8px', borderRadius: '4px' }}>{u.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                                        <span>🛡️ {u.members} Members</span>
                                        <span style={{ color: u.color }}>EFFICIENCY: {u.eff}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(66, 133, 244, 0.05)', border: '1px solid rgba(66, 133, 244, 0.1)' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#4285F4', marginBottom: '15px' }}>PERFORMANCE ANALYTICS</h4>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '20px' }}>
                            Overall team performance is up by 15% this month. Team Alpha has the fastest response time (2m 14s).
                        </p>
                        <button style={{ width: '100%', padding: '12px', background: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.2)', borderRadius: '10px', color: '#4285F4', fontSize: '10px', fontWeight: 900 }}>VIEW FULL REPORT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AllRidesView() {
    const [selectedReplay, setSelectedReplay] = useState(null);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>TRANSIT LOG & REPLAY</h2>
            <div style={{ display: 'grid', gridTemplateColumns: selectedReplay ? '1fr 400px' : '1fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[1,2,3,4,5].map(i => (
                        <div key={i} onClick={() => setSelectedReplay(i)} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: selectedReplay === i ? '1px solid #fbbc04' : '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(251,188,4,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbc04' }}>
                                    <FaTaxi />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 800 }}>TRIP #{8000 + i} {i === 3 && <span style={{ color: '#ff4d4d', fontSize: '10px', marginLeft: '10px' }}>● SOS INCIDENT</span>}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>FROM: Vijay Nagar • TO: Bhawarkua</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', fontWeight: 900, color: i === 3 ? '#ff4d4d' : '#00e5a0' }}>{i === 3 ? 'CRITICAL' : 'IN PROGRESS'}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>DRIVER ID: D-442{i}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedReplay && (
                    <div className="glass-panel" style={{ padding: '30px', background: 'rgba(6, 8, 13, 0.9)', position: 'sticky', top: 0 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 900 }}>EMERGENCY REPLAY</h3>
                            <button onClick={() => setSelectedReplay(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>CLOSE</button>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { time: '14:02', event: 'Ride Started', status: 'normal' },
                                { time: '14:10', event: 'Route Deviation', status: 'warning' },
                                { time: '14:12', event: 'SOS Triggered', status: 'critical' },
                                { time: '14:13', event: 'Live Audio Link Open', status: 'critical' },
                                { time: '14:15', event: 'Alpha Team Dispatch', status: 'action' }
                            ].map((e, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', width: '40px' }}>{e.time}</div>
                                    <div style={{ width: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 0, left: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: e.status === 'critical' ? '#ff4d4d' : e.status === 'warning' ? '#fbbc04' : '#00e5a0' }}></div>
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 800 }}>{e.event}</div>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DriverManagementView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>DRIVER DATABASE</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                     <button style={{ padding: '10px 20px', background: 'rgba(251,188,4,0.1)', border: '1px solid #fbbc04', borderRadius: '10px', color: '#fbbc04', fontWeight: 900, fontSize: '11px' }}>TRUSTED LIST</button>
                     <button style={{ padding: '10px 20px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '10px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px' }}>BLACKLIST</button>
                </div>
            </div>
            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {[
                        { name: 'Amit Kumar', id: 'D-992', risk: '2%', status: 'TRUSTED' },
                        { name: 'Suresh Raina', id: 'D-102', risk: '45%', status: 'SUSPENDED' },
                        { name: 'Vikram Singh', id: 'D-442', risk: '12%', status: 'ACTIVE' },
                    ].map((d, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ fontSize: '16px', fontWeight: 800 }}>{d.name}</div>
                                <div style={{ fontSize: '10px', color: d.status === 'TRUSTED' ? '#00e5a0' : d.status === 'SUSPENDED' ? '#ff4d4d' : '#fbbc04', fontWeight: 900 }}>{d.status}</div>
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>ID: {d.id}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800 }}>RISK SCORE:</span>
                                <span style={{ color: parseInt(d.risk) > 40 ? '#ff4d4d' : '#00e5a0', fontWeight: 900 }}>{d.risk}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AnalyticsView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>TRANSIT ANALYTICS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '350px', padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px' }}>RIDE SUCCESS RATE (WEEKLY)</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {[60, 85, 45, 90, 70, 95, 80].map((h, i) => (
                            <div key={i} style={{ flex: 1, background: 'var(--accent)', height: `${h}%`, borderRadius: '5px 5px 0 0', opacity: 0.5 + (h/200) }}></div>
                        ))}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px' }}>DANGER ZONES</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {['LIG Square', 'Sapna Sangeeta', 'Bhawarkua'].map((z, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px' }}>{z}</span>
                                <span style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900 }}>HIGH RISK</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeoFenceView() {
    const [zones, setZones] = useState([
        { id: 1, name: 'Railway Station Backgate', type: 'RESTRICTED', risk: 'HIGH', status: 'ACTIVE' },
        { id: 2, name: 'Industrial Area Ph-2', type: 'RESTRICTED', risk: 'MEDIUM', status: 'ACTIVE' },
        { id: 3, name: 'C21 Mall Main Gate', type: 'SAFE_PICKUP', risk: 'LOW', status: 'VERIFIED' },
        { id: 4, name: 'TI Mall East Exit', type: 'SAFE_PICKUP', risk: 'LOW', status: 'VERIFIED' }
    ]);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>GEO-FENCE COMMAND</h2>
                <button style={{ padding: '10px 20px', background: '#00e5a0', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 900, fontSize: '11px', cursor: 'pointer' }}>+ DEFINE NEW SECTOR</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px', color: 'rgba(255,255,255,0.4)' }}>ACTIVE PERIMETERS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {zones.map((z) => (
                            <div key={z.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${z.type === 'RESTRICTED' ? 'rgba(255,77,77,0.1)' : 'rgba(0,229,160,0.1)'}`, borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: z.type === 'RESTRICTED' ? '#ff4d4d' : '#00e5a0', boxShadow: `0 0 10px ${z.type === 'RESTRICTED' ? '#ff4d4d' : '#00e5a0'}` }}></div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{z.name}</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>TYPE: {z.type} • RISK: {z.risk}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 900, color: z.type === 'RESTRICTED' ? '#ff4d4d' : '#00e5a0' }}>{z.status}</span>
                                    <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><FaTrash size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.1)' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#ff4d4d', marginBottom: '15px' }}>PROXIMITY ALERTS</h4>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                            Currently monitoring 4 active taxis within 500m of Restricted Zones. Auto-warnings initiated for Driver D-442.
                        </p>
                    </div>
                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.1)' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#00e5a0', marginBottom: '15px' }}>SAFE CORRIDORS</h4>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                            Optimizing routes through verified safe zones for all female passengers.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BroadcastView() {
    const handleSend = () => {
        alert("BROADCAST SIGNAL TRANSMITTED TO ALL ACTIVE TAXI UNITS.");
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10, 12, 18, 0.4)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaBroadcastTower color="#60b8ff" /> PUBLIC SAFETY BROADCAST
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>ALERT TYPE</label>
                        <select style={{ width: '100%', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', outline: 'none' }}>
                            <option>Unsafe Route Warning</option>
                            <option>Driver Blacklist Alert</option>
                            <option>Public Ride Advisory</option>
                            <option>Women Safety Notification</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>TRANSMISSION CONTENT</label>
                        <textarea placeholder="Enter official broadcast message..." style={{ width: '100%', height: '150px', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', resize: 'none', outline: 'none', fontSize: '14px', lineHeight: '1.6' }} />
                    </div>
                    <button onClick={handleSend} style={{ padding: '20px', background: '#60b8ff', border: 'none', borderRadius: '15px', color: '#000', fontWeight: 900, fontSize: '14px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(96,184,255,0.3)', transition: '0.3s' }}>EXECUTE BROADCAST</button>
                </div>
            </div>
        </div>
    );
}

function LiveMapView() { 
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>LIVE TAXI HEATMAP</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ padding: '8px 15px', background: 'rgba(255,77,77,0.1)', borderRadius: '20px', fontSize: '10px', fontWeight: 800, color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)' }}>4 HIGH RISK ZONES</div>
                    <div style={{ padding: '8px 15px', background: 'rgba(0,229,160,0.1)', borderRadius: '20px', fontSize: '10px', fontWeight: 800, color: '#00e5a0', border: '1px solid rgba(0,229,160,0.2)' }}>62 ACTIVE UNITS</div>
                </div>
            </div>
            <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(251,188,4,0.05) 0%, transparent 70%)' }}>
                <div style={{ textAlign: 'center' }}>
                    <FaMapMarkedAlt size={120} color="#fbbc04" style={{ opacity: 0.3, marginBottom: '20px' }} />
                    <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '4px', color: 'rgba(255,255,255,0.2)' }}>ENCRYPTED TACTICAL FEED ACTIVE</div>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <div className="status-pulse" style={{ width: '8px', height: '8px', background: '#ff4d4d', borderRadius: '50%' }}></div>
                        <div className="status-pulse" style={{ width: '8px', height: '8px', background: '#00e5a0', borderRadius: '50%', animationDelay: '0.2s' }}></div>
                        <div className="status-pulse" style={{ width: '8px', height: '8px', background: '#4285F4', borderRadius: '50%', animationDelay: '0.4s' }}></div>
                    </div>
                </div>
                {/* Visual scanning lines */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #fbbc04, transparent)', animation: 'scan 4s linear infinite', opacity: 0.2 }}></div>
            </div>
            <style>{`
                @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
            `}</style>
        </div>
    ); 
}

function EscalationView() { 
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '20px', color: '#ff4d4d' }}>SMART SOS ESCALATION</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '30px', fontSize: '14px', lineHeight: '1.6' }}>Forward critical transit emergencies to the central SOS team or police command instantly.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <button style={{ padding: '35px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '25px', color: '#ff4d4d', fontWeight: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: '0.3s' }}>
                        <FaExclamationTriangle size={40} /> 
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px' }}>SOS TEAM</div>
                            <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '5px' }}>CENTRAL DISPATCH</div>
                        </div>
                    </button>
                    <button style={{ padding: '35px', background: 'rgba(66,133,244,0.1)', border: '1px solid #4285F4', borderRadius: '25px', color: '#4285F4', fontWeight: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: '0.3s' }}>
                        <FaPhone size={40} /> 
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px' }}>POLICE HQ</div>
                            <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '5px' }}>EMERGENCY LINE</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

function SettingsView() { 
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px' }}>DIVISION SETTINGS</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {[
                        { title: 'AUTO-DISPATCH SOS', desc: 'Automatically assign nearest team to critical taxi SOS signals.', status: true },
                        { title: 'PROXIMITY ALERTS', desc: 'Warn drivers when entering identified high-risk zones.', status: true },
                        { title: 'DRIVER PERFORMANCE TRACKING', desc: 'Enable real-time efficiency and risk scoring for all taxi personnel.', status: false },
                        { title: 'PUBLIC BROADCAST OVERRIDE', desc: 'Allow divisional head to override global alerts in emergency.', status: false }
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ flex: 1, paddingRight: '40px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '5px' }}>{s.title}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>{s.desc}</div>
                            </div>
                            <div style={{ width: '45px', height: '24px', background: s.status ? '#00e5a0' : 'rgba(255,255,255,0.1)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                                <div style={{ position: 'absolute', top: '4px', left: s.status ? '25px' : '4px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: '0.3s' }}></div>
                            </div>
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
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>SAFE TAXI COMMANDER</span>
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

function PlaceholderTab({ title, icon }) {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>{icon}</div>
            <h1 style={{ letterSpacing: '10px', fontWeight: 900 }}>{title}</h1>
            <p style={{ letterSpacing: '2px', fontWeight: 600 }}>MODULE PENDING INTEGRATION</p>
        </div>
    );
}
