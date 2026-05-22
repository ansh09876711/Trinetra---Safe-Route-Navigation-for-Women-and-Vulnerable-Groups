import React, { useState, useEffect } from "react";
import {
    FaUserShield, FaUsers, FaChartLine, FaMapMarkedAlt, FaBroadcastTower,
    FaExclamationTriangle, FaRoute, FaShieldAlt, FaSignOutAlt,
    FaSearch, FaBell, FaHistory, FaCogs, FaBan, FaUserCheck, FaMapMarkerAlt,
    FaCheckCircle, FaTrash, FaPlus, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaGlobe, FaBrain, FaPhone,
    FaClipboardList, FaHandsHelping, FaHeart, FaUserSecret, FaBullhorn, FaMicrochip, FaUserFriends, FaExclamationCircle, FaUser, FaTerminal
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db, auth } from "../../../../firebase";
import { setDoc, doc, collection, onSnapshot, query, where, deleteDoc, updateDoc, orderBy, limit } from "firebase/firestore";
import { createUserWithEmailAndPassword as firebaseCreateUser } from "firebase/auth";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function WomenSupportHeadDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("command");
    const [searchQuery, setSearchQuery] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionForm, setProvisionForm] = useState({ name: "", email: "", password: "", role: "Support Agent", team: "Crisis Response" });
    const [showPass, setShowPass] = useState(false);
    const [provisionStatus, setProvisionStatus] = useState({ loading: false, msg: "" });

    useEffect(() => {
        const q = query(collection(db, "users"), where("divisionId", "==", "3"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeamMembers(members);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteMember = async (id) => {
        if (window.confirm("ARE YOU SURE YOU WANT TO TERMINATE THIS PERSONNEL'S ACCESS?")) {
            try {
                await deleteDoc(doc(db, "users", id));
                setProvisionStatus({ loading: false, msg: "ACCESS TERMINATED" });
                setTimeout(() => setProvisionStatus({ loading: false, msg: "" }), 2000);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleProvision = async (e) => {
        e.preventDefault();
        setProvisionStatus({ loading: true, msg: "PROVISIONING..." });
        try {
            // Note: In a real app, creating auth users from a dashboard requires Firebase Admin SDK.
            // For hackathon demo, we will simulate the auth and focus on the database record.
            const tempId = "MEM-" + Math.floor(Math.random() * 10000);
            await setDoc(doc(db, "users", tempId), {
                id: tempId,
                name: provisionForm.name,
                email: provisionForm.email,
                role: "member",
                accountType: "divisional",
                divisionId: "3",
                designation: provisionForm.role,
                team: provisionForm.team,
                createdAt: new Date().toISOString(),
                provisionedBy: user.name,
                status: 'ONLINE'
            });

            setProvisionStatus({ loading: false, msg: "SUCCESSFUL!" });
            setProvisionForm({ name: "", email: "", password: "", role: "Support Agent", team: "Crisis Response" });
            setTimeout(() => {
                setShowProvisionModal(false);
                setProvisionStatus({ loading: false, msg: "" });
            }, 2000);
        } catch (err) {
            setProvisionStatus({ loading: false, msg: "ERROR: " + err.message });
        }
    };

    const tabs = [
        { id: 'command', label: 'COMMAND CENTER', icon: <FaUserShield />, color: '#d442f5' },
        { id: 'team', label: 'TEAM MANAGEMENT', icon: <FaUsers />, color: '#4285F4' },
        { id: 'critical', label: 'CRITICAL CONTROL', icon: <FaExclamationTriangle />, color: '#ff4d4d' },
        { id: 'intel', label: 'AI THREAT INTEL', icon: <FaBrain />, color: '#00e5a0' },
        { id: 'zones', label: 'SAFE ZONE HUB', icon: <FaMapMarkedAlt />, color: '#ff9800' },
        { id: 'coordination', label: 'EMERGENCY SYNC', icon: <FaBroadcastTower />, color: '#60b8ff' },
        { id: 'analytics', label: 'COMPLAINT ANALYTICS', icon: <FaChartLine />, color: '#00e5a0' },
        { id: 'broadcast', label: 'BROADCAST CENTER', icon: <FaBullhorn />, color: '#ff4d4d' },
        { id: 'protection', label: 'VICTIM PROTECTION', icon: <FaShieldAlt />, color: '#6366f1' },
        { id: 'ai_hub', label: 'ADVANCED AI HUB', icon: <FaMicrochip />, color: '#ffd700' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "reports"), 
            where("type", "in", ["SOS", "STALKING", "CYBER ABUSE"]),
            orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIncidents(reports);
        });
        return () => unsubscribe();
    }, []);

    const latestSos = incidents.find(i => i.type === "SOS" && i.status === "ACTIVE");

    const renderContent = () => {
        const filteredMembers = teamMembers.filter(m => 
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            m.designation.toLowerCase().includes(searchQuery.toLowerCase())
        );

        switch (activeTab) {
            case 'command': return <CommandCenterView incidents={incidents} user={user} />;
            case 'team': return <TeamManagementView onAddClick={() => setShowProvisionModal(true)} members={filteredMembers} onDelete={handleDeleteMember} setActiveTab={setActiveTab} />;
            case 'critical': return <CriticalControlView incidents={incidents} setActiveTab={setActiveTab} />;
            case 'intel': return <AIThreatIntelView incidents={incidents} />;
            case 'zones': return <SafeZoneHubView />;
            case 'coordination': return <EmergencyCoordinationView />;
            case 'analytics': return <AnalyticsView incidents={incidents} />;
            case 'broadcast': return <BroadcastView />;
            case 'protection': return <VictimProtectionView incidents={incidents} />;
            case 'ai_hub': return <AdvancedAIHubView incidents={incidents} />;
            case 'profile': return <ProfileView user={user} />;
            default: return <CommandCenterView incidents={incidents} user={user} />;
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
                            onClick={() => setActiveTab("critical")}
                            style={{ padding: '8px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            INTERCEPT SIGNAL
                        </button>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100, marginTop: latestSos ? '60px' : '0', transition: '0.5s' }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(212,66,245,0.1)', borderRadius: '8px', border: '1px solid rgba(212,66,245,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#d442f5' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px' }}>SUPPORT COMMAND</span>
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
                        <input placeholder="SEARCH CASES, AGENTS, OR ANALYTICS..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#d442f5', fontWeight: 800, letterSpacing: '1px' }}>WOMEN SUPPORT COMMANDER</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            {/* PROVISION MODAL */}
            {showProvisionModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ width: '450px', padding: '50px 40px', background: '#050505', border: '1px solid #d442f5', borderRadius: '40px', position: 'relative', boxShadow: '0 0 50px rgba(212,66,245,0.1)' }}>
                        <button onClick={() => setShowProvisionModal(false)} style={{ position: 'absolute', top: '25px', right: '30px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '24px', cursor: 'pointer', outline: 'none' }}>×</button>
                        
                        <div style={{ marginBottom: '35px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#d442f5', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Provision Personnel</h2>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Authorized Access Only</div>
                        </div>

                        <form onSubmit={handleProvision} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Full Name</label>
                                <input placeholder="Personnel Name" style={{ width: '100%', padding: '15px 20px', background: '#0a0a0b', border: '1px solid rgba(212,66,245,0.1)', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none' }} value={provisionForm.name} onChange={e => setProvisionForm({ ...provisionForm, name: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Login ID (Email)</label>
                                <input placeholder="official@trinetra.gov" style={{ width: '100%', padding: '15px 20px', background: '#0a0a0b', border: '1px solid rgba(212,66,245,0.1)', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none' }} value={provisionForm.email} onChange={e => setProvisionForm({ ...provisionForm, email: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Tactical Passphrase</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        style={{ width: '100%', padding: '15px 50px 15px 20px', background: '#0a0a0b', border: '1px solid rgba(212,66,245,0.1)', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                                        value={provisionForm.password} 
                                        onChange={e => setProvisionForm({ ...provisionForm, password: e.target.value })} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPass(!showPass)} 
                                        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(212,66,245,0.5)', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' }}
                                    >
                                        {showPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Operational Role</label>
                                <select style={{ width: '100%', padding: '15px 20px', background: '#0a0a0b', border: '1px solid rgba(212,66,245,0.1)', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none', appearance: 'none' }} value={provisionForm.role} onChange={e => setProvisionForm({ ...provisionForm, role: e.target.value })}>
                                    <option value="Support Member">Support Member</option>
                                    <option value="Field Member">Field Member</option>
                                    <option value="Tactical Member">Tactical Member</option>
                                    <option value="Intel Member">Intel Member</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>Assigned Team</label>
                                <select style={{ width: '100%', padding: '15px 20px', background: '#0a0a0b', border: '1px solid rgba(212,66,245,0.1)', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none', appearance: 'none' }} value={provisionForm.team} onChange={e => setProvisionForm({ ...provisionForm, team: e.target.value })}>
                                    <option value="Alpha Response">Team Alpha</option>
                                    <option value="Quick Action">Quick Action Unit</option>
                                    <option value="Night Watch">Night Watch</option>
                                    <option value="Street Shield">Street Shield</option>
                                </select>
                            </div>

                            <button type="submit" disabled={provisionStatus.loading} style={{ width: '100%', padding: '20px', background: provisionStatus.msg.includes('ERROR') ? '#ff4d4d' : provisionStatus.msg.includes('SUCCESS') ? '#00e5a0' : '#d442f5', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 900, fontSize: '14px', letterSpacing: '2px', marginTop: '10px', cursor: 'pointer', boxShadow: '0 15px 30px rgba(212,66,245,0.3)', textTransform: 'uppercase', transition: '0.3s' }}>
                                {provisionStatus.msg || "Create Personnel ID"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                .status-dot { width: 8px; height: 8px; borderRadius: 50%; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
function CommandCenterView({ incidents, user }) {
    const activeSOS = incidents.filter(i => i.status === "ACTIVE").length;
    const assignedCount = incidents.filter(i => i.status === "ASSIGNED").length;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'ACTIVE FEMALE SOS', val: activeSOS, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'CRITICAL COMPLAINTS', val: incidents.length, color: '#d442f5', icon: <FaClipboardList /> },
                    { label: 'UNSAFE ZONES', val: activeSOS > 0 ? '04' : '01', color: '#ff9800', icon: <FaMapMarkerAlt /> },
                    { label: 'TEAM AVAILABILITY', val: `${assignedCount}/${assignedCount + 8}`, color: '#00e5a0', icon: <FaUsers /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${w.color}10`, borderRadius: '15px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{w.val < 10 && typeof w.val === 'number' ? `0${w.val}` : w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '500px', padding: '30px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '2px', margin: 0 }}>LIVE WOMEN SAFETY MONITOR</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ padding: '5px 12px', background: 'rgba(0,229,160,0.1)', borderRadius: '20px', fontSize: '9px', fontWeight: 900, color: '#00e5a0', border: '1px solid rgba(0,229,160,0.2)' }}>GEO-ENCRYPTED FEED LIVE</div>
                        </div>
                    </div>
                    
                    <div style={{ position: 'absolute', inset: '80px 30px 30px 30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <MapContainer center={[22.7196, 75.8577]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {incidents.filter(i => i.status === "ACTIVE" || i.status === "ASSIGNED").map(incident => (
                                <React.Fragment key={incident.id}>
                                    <Marker position={[incident.lat || 22.7196, incident.lng || 75.8577]}>
                                        <Popup>
                                            <div style={{ color: '#000', fontSize: '12px' }}>
                                                <strong style={{ color: '#ff4d4d' }}>{incident.type} ALERT</strong><br/>
                                                User: {incident.userName}<br/>
                                                Status: {incident.status}
                                            </div>
                                        </Popup>
                                    </Marker>
                                    <Circle 
                                        center={[incident.lat || 22.7196, incident.lng || 75.8577]}
                                        radius={300}
                                        pathOptions={{ 
                                            color: incident.type === 'SOS' ? '#ff4d4d' : '#d442f5', 
                                            fillColor: incident.type === 'SOS' ? '#ff4d4d' : '#d442f5', 
                                            fillOpacity: 0.2 
                                        }}
                                    />
                                </React.Fragment>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #6366f1' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#6366f1', letterSpacing: '2px', marginBottom: '15px' }}>AI THREAT ALERTS</h4>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '12px' }}>
                            <FaMicrochip style={{ color: '#6366f1' }} />
                            <div>
                                <div style={{ fontSize: '10px', fontWeight: 900 }}>HARASSMENT PATTERN</div>
                                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>Detecting repeated signals in Sector 4.</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 900, letterSpacing: '2px' }}>ACTIVE SOS MONITOR</h4>
                                <button 
                                    onClick={async () => {
                                        if(window.confirm("DIVISIONAL COMMAND: PERMANENTLY CLEAR ALL ACTIVE REPORTS FROM MONITOR?")) {
                                            try {
                                                const activeAlerts = incidents.filter(e => e.status !== "DELETED");
                                                for (const a of activeAlerts) {
                                                    await updateDoc(doc(db, "reports", a.id), { status: "DELETED", deletedAt: new Date().toISOString() });
                                                }
                                                alert("DIVISIONAL PURGE COMPLETE. MONITOR CLEARED.");
                                            } catch (err) {
                                                console.error(err);
                                                alert("COMMAND ERROR: PURGE FAILED.");
                                            }
                                        }
                                    }}
                                    style={{ padding: '4px 8px', background: 'rgba(212,66,245,0.1)', border: '1px solid rgba(212,66,245,0.3)', borderRadius: '6px', color: '#d442f5', fontSize: '8px', fontWeight: 900, cursor: 'pointer' }}
                                >
                                    PURGE ALL
                                </button>
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{incidents.filter(e => e.status !== "DELETED").length} PENDING ACTION</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {incidents.filter(e => e.status !== "DELETED").map((e, i) => {
                                const handleAssign = async () => {
                                    try {
                                        await updateDoc(doc(db, "reports", e.id), { status: "ASSIGNED", assignedAt: new Date().toISOString(), assignedBy: user.name });
                                        alert(`UNIT DISPATCHED FOR ${e.userName.toUpperCase()}`);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                };

                                const handleEscalate = async () => {
                                    try {
                                        await updateDoc(doc(db, "reports", e.id), { status: "ESCALATED", priority: "CRITICAL" });
                                        alert(`CASE ${e.id.substring(0,6)} ESCALATED TO SUPREME COMMISSIONER`);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                };

                                return (
                                    <div key={e.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `3px solid ${e.type === 'SOS' ? '#ff4d4d' : '#d442f5'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ flex: 1, marginRight: '15px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 800 }}>{e.userName}</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{e.locationName?.substring(0, 40)}...</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button onClick={handleAssign} style={{ padding: '6px 12px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '6px', color: '#4285F4', fontSize: '9px', fontWeight: 900, cursor: 'pointer' }}>ASSIGN</button>
                                            <button onClick={handleEscalate} style={{ padding: '6px 12px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: '#ff4d4d', fontSize: '9px', fontWeight: 900, cursor: 'pointer' }}>ESCALATE</button>
                                        </div>
                                    </div>
                                );
                            })}
                            {incidents.filter(e => e.status !== "DELETED").length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.2, fontWeight: 900, fontSize: '11px', letterSpacing: '2px' }}>
                                    NO ACTIVE SIGNALS DETECTED
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamManagementView({ onAddClick, members, onDelete, setActiveTab }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* TOP METRICS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #d442f5' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '2px', marginBottom: '10px' }}>TOTAL PERSONNEL</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{members.length} / 25</div>
                    <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 800, marginTop: '5px' }}>{Math.round((members.length / 25) * 100)}% CAPACITY UTILIZED</div>
                </div>
                <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #00e5a0' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '2px', marginBottom: '10px' }}>AVG TEAM EFFICIENCY</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>98.4%</div>
                    <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 800, marginTop: '5px' }}>+2.1% FROM LAST WEEK</div>
                </div>
                <div className="glass-panel" style={{ padding: '25px', borderLeft: '4px solid #ffd700' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '2px', marginBottom: '10px' }}>READY FOR DISPATCH</div>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>8 UNITS</div>
                    <div style={{ fontSize: '10px', color: '#ffd700', fontWeight: 800, marginTop: '5px' }}>WAITING FOR HQ ORDER</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                {/* PERSONNEL DIRECTORY */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>SUPPORT PERSONNEL DIRECTORY</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaSearch style={{ fontSize: '12px', opacity: 0.5 }} /> FILTER
                            </button>
                            <button onClick={onAddClick} style={{ padding: '10px 20px', background: '#d442f5', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaUsers /> ADD MEMBER
                            </button>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '15px 20px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>PERSONNEL</th>
                                <th style={{ padding: '15px 20px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>ROLE</th>
                                <th style={{ padding: '15px 20px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>STATUS</th>
                                <th style={{ padding: '15px 20px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>PERFORMANCE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#d442f5' }}>{m.name[0]}</div>
                                            <div style={{ fontSize: '14px', fontWeight: 800 }}>{m.name}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{m.designation}</td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '6px', height: '6px', background: '#00e5a0', borderRadius: '50%', boxShadow: '0 0 10px #00e5a0' }}></div>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#00e5a0' }}>ONLINE</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '100px' }}>
                                                <div style={{ width: '96%', height: '100%', background: '#00e5a0', borderRadius: '2px', boxShadow: '0 0 10px #00e5a050' }}></div>
                                            </div>
                                            <button onClick={() => onDelete(m.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px', borderRadius: '5px', transition: '0.2s' }} onMouseOver={(e) => e.target.style.background='rgba(255,77,77,0.1)'} onMouseOut={(e) => e.target.style.background='none'}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* RIGHT SIDEBAR - TACTICAL UNITS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1px' }}>RESPONSE UNITS</h3>
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><FaPlus style={{ fontSize: '10px' }} /></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'Alpha Response', status: 'ACTIVE', members: 4, efficiency: '98%', color: '#00e5a0' },
                                { name: 'Quick Action Unit', status: 'ON MISSION', members: 3, efficiency: '94%', color: '#ff4d4d' },
                                { name: 'Night Watch', status: 'STANDBY', members: 5, efficiency: '96%', color: '#6366f1' }
                            ].map((unit, i) => (
                                <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 900 }}>{unit.name}</div>
                                        <div style={{ fontSize: '8px', fontWeight: 900, color: unit.color, background: `${unit.color}15`, padding: '3px 8px', borderRadius: '10px' }}>{unit.status}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}><FaUserShield /> {unit.members} Members</div>
                                        <div style={{ fontSize: '10px', fontWeight: 900, color: unit.color }}>EFFICIENCY: {unit.efficiency}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(212,66,245,0.02)', border: '1px solid rgba(212,66,245,0.1)' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#d442f5', marginBottom: '15px' }}>PERFORMANCE ANALYTICS</h3>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>Overall team performance is up by 15% this month. Team Alpha has the fastest response time (2m 14s).</p>
                        <button onClick={() => setActiveTab('analytics')} style={{ width: '100%', padding: '14px', background: 'rgba(212,66,245,0.1)', border: '1px solid rgba(212,66,245,0.2)', borderRadius: '12px', color: '#d442f5', fontSize: '11px', fontWeight: 900, marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <FaChartLine /> VIEW FULL REPORT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CriticalControlView({ incidents, setActiveTab }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>CRITICAL INCIDENT CONTROL</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {[
                    { type: 'SEVERE HARASSMENT', priority: 'CRITICAL', icon: <FaBan />, color: '#ff4d4d' },
                    { type: 'MISSING PERSONS', priority: 'IMMEDIATE', icon: <FaSearch />, color: '#ffd700' },
                    { type: 'ABUSE REPORTS', priority: 'HIGH', icon: <FaShieldAlt />, color: '#ff9800' }
                ].map((c, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', borderLeft: `5px solid ${c.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{ fontSize: '18px', color: c.color }}>{c.icon}</div>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: c.color, background: `${c.color}15`, padding: '4px 10px', borderRadius: '15px' }}>{c.priority}</div>
                        </div>
                        <h4 style={{ fontWeight: 900, fontSize: '15px' }}>{c.type}</h4>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>Requires immediate divisional coordination.</p>
                        <button onClick={() => setActiveTab('protection')} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900, marginTop: '20px', cursor: 'pointer' }}>VIEW CASE FILES</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AIThreatIntelView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>AI THREAT INTELLIGENCE</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#00e5a0', marginBottom: '20px' }}>RISK PATTERN DETECTION</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { label: 'Harassment Zones', val: '4 Detected', icon: <FaBan /> },
                            { label: 'Unsafe Travel Areas', val: 'Sector 4, 9', icon: <FaRoute /> },
                            { label: 'High-Risk Timings', val: '22:00 - 02:00', icon: <FaHistory /> }
                        ].map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px' }}>
                                <div style={{ color: '#00e5a0' }}>{p.icon}</div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 900 }}>{p.label}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{p.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <FaBrain size={60} color="#d442f5" style={{ marginBottom: '20px', animation: 'pulse 2s infinite' }} />
                    <h4 style={{ fontWeight: 900, letterSpacing: '2px' }}>PREDICTIVE RISK ENGINE</h4>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '10px' }}>AI is analyzing city-wide patterns to predict potential harassment hotspots.</p>
                </div>
            </div>
        </div>
    );
}

function SafeZoneHubView() {
    const [zones, setZones] = useState([
        { name: 'VIJAY NAGAR SQUARE', safety: 'HIGH', score: '9.8/10', color: '#00e5a0', alerts: 0, patrols: 4 },
        { name: 'SARAFA BAZAAR', safety: 'MEDIUM', score: '6.5/10', color: '#ff9800', alerts: 2, patrols: 4 },
        { name: 'BHANWARKUAN ZONE', safety: 'LOW', score: '3.2/10', color: '#ff4d4d', alerts: 5, patrols: 4 }
    ]);

    const handleAddSafePoint = () => {
        const name = prompt("ENTER NEW SAFE POINT LOCATION NAME:");
        if (name) {
            const newZone = {
                name: name.toUpperCase(),
                safety: 'HIGH',
                score: '10/10',
                color: '#00e5a0',
                alerts: 0,
                patrols: 2
            };
            setZones([newZone, ...zones]);
            alert(`TACTICAL UPDATE: ${name.toUpperCase()} HAS BEEN REGISTERED AS A SECURE SAFE POINT.`);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>SAFE ZONE HUB</h3>
                <button 
                    onClick={handleAddSafePoint}
                    style={{ padding: '10px 20px', background: 'rgba(0,229,160,0.1)', border: '1px solid #00e5a0', borderRadius: '10px', color: '#00e5a0', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}
                >
                    + ADD SAFE POINT
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                {zones.map((z, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', position: 'relative' }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, marginBottom: '15px' }}>{z.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: z.color }}>SAFETY: {z.safety}</div>
                            <div style={{ fontSize: '18px', fontWeight: 900 }}>{z.score}</div>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '15px' }}>
                            <div style={{ width: parseFloat(z.score) * 10 + '%', height: '100%', background: z.color, borderRadius: '2px' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                            <span>Active Patrols: {String(z.patrols).padStart(2, '0')}</span>
                            <span style={{ color: z.alerts > 0 ? '#ff4d4d' : 'inherit' }}>{z.alerts} Recent Incidents</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmergencyCoordinationView() {
    const [units, setUnits] = useState([
        { unit: 'SOS COMMAND TEAM', icon: <FaBroadcastTower />, status: 'LINKED', color: '#00e5a0' },
        { unit: 'CITY POLICE UNITS', icon: <FaShieldAlt />, status: 'STANDBY', color: '#60b8ff' },
        { unit: 'SAFE TAXI FLEET', icon: <FaPhone />, status: 'ACTIVE', color: '#ffd700' },
        { unit: 'COMMISSIONER OFFICE', icon: <FaUserShield />, status: 'REPORTING', color: '#d442f5' }
    ]);

    const handleTrigger = () => {
        if (window.confirm("CRITICAL PROTOCOL: INITIATE GLOBAL COORDINATION OF JOINT TASK FORCE?")) {
            setUnits(units.map(u => ({ ...u, status: 'DEPLOYED', color: '#ff4d4d' })));
            alert("TACTICAL ALERT: ALL DIVISIONAL UNITS HAVE BEEN REDEPLOYED TO CRITICAL SECTORS.");
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>EMERGENCY SYNC COMMAND</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
                {units.map((u, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ fontSize: '24px', color: u.color }}>{u.icon}</div>
                            <div style={{ fontWeight: 900, fontSize: '14px' }}>{u.unit}</div>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: u.color }}>{u.status}</div>
                    </div>
                ))}
            </div>
            <button 
                onClick={handleTrigger}
                style={{ width: '100%', padding: '20px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 900, fontSize: '14px', marginTop: '30px', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,77,77,0.2)' }}
            >
                TRIGGER JOINT TASK FORCE
            </button>
        </div>
    );
}

function AnalyticsView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>COMPLAINT ANALYTICS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>RESPONSE EFFICIENCY</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#00e5a0' }}>98.4%</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>UNSAFE HOTSPOTS</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#ff4d4d' }}>12</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>TOTAL RESOLVED</div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#d442f5' }}>1,240</div>
                </div>
            </div>
        </div>
    );
}

function BroadcastView() {
    const [msg, setMsg] = useState("");
    const [sending, setSending] = useState(false);

    const handleBroadcast = () => {
        if (!msg) return;
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setMsg("");
            alert("BROADCAST SIGNAL SENT TO ALL REGIONAL UNITS");
        }, 1500);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaBullhorn color="#ff4d4d" /> SAFETY BROADCAST
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <select style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                        <option>UNSAFE ZONE WARNING</option>
                        <option>EMERGENCY ADVISORY</option>
                        <option>PUBLIC AWARENESS</option>
                    </select>
                    <textarea 
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Enter broadcast message..." 
                        style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', height: '150px', resize: 'none', outline: 'none' }}
                    ></textarea>
                    <button 
                        onClick={handleBroadcast}
                        disabled={sending}
                        style={{ padding: '18px', background: sending ? '#ff9800' : '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer', transition: '0.3s' }}
                    >
                        {sending ? "TRANSMITTING..." : "EXECUTE BROADCAST"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function VictimProtectionView({ incidents }) {
    const activeCases = incidents.filter(e => e.status !== "DELETED");

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>VICTIM PROTECTION SYSTEM</h3>
                <button 
                    onClick={() => alert("CYBER SECURITY PROTOCOL: All victim metadata has been encrypted with AES-256. Secure tunnel established.")}
                    style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}
                >
                    ENCRYPT ALL SENSITIVE DATA
                </button>
            </div>
            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {activeCases.map((e, i) => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', animation: 'fadeIn 0.3s ease' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <FaLock color="#6366f1" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 900 }}>CASE #{String(e.id).substring(0, 8).toUpperCase()}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Identity: {e.userName} (PROTECTED) • Data: ENCRYPTED</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => alert(`DECRYPTION KEY REQUIRED TO VIEW CASE ${e.id.substring(0,6)}`)} style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>VIEW (SECURE)</button>
                                <button style={{ padding: '8px 15px', background: 'rgba(99,102,241,0.2)', border: 'none', borderRadius: '8px', color: '#6366f1', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>RESTRICT ACCESS</button>
                            </div>
                        </div>
                    ))}
                    {activeCases.length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center', opacity: 0.2, fontWeight: 900, fontSize: '12px', letterSpacing: '2px' }}>
                            NO SENSITIVE CASE FILES DETECTED
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdvancedAIHubView({ incidents }) {
    const [aiLogs, setAiLogs] = useState([
        "SYSTEM: INITIALIZING NEURAL THREAT DETECTION...",
        "STATUS: MONITORING CITY-WIDE AUDIO FEEDS...",
        "SIGNAL: ENCRYPTED WHISPER MODE ACTIVE",
        "ANALYSIS: SCANNING SECTOR 4 FOR HARASSMENT PATTERNS..."
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const events = [
                "INTEL: PATTERN DETECTED IN VIJAY NAGAR",
                "SYSTEM: UPDATING CRITICAL RISK HEATMAP",
                "SIGNAL: SECURE UPLINK STABLE",
                "ANALYSIS: VOICE PANIC SENSITIVITY OPTIMIZED",
                "INTEL: SMART ESCORT ROUTE CALCULATED"
            ];
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            setAiLogs(prev => [randomEvent, ...prev.slice(0, 5)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaMicrochip color="#ffd700" className="pulse-fast" /> ADVANCED AI HUB
                </h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button 
                        onClick={() => {
                            setAiLogs(["SYSTEM REBOOT INITIATED...", "CLEARING NEURAL CACHE...", "RELOADING THREAT MODELS...", "NEURAL ENGINE V4.2 REBOOTED SUCCESSFULLY."]);
                            alert("NEURAL CORE REBOOT COMPLETE. ALL AI SYSTEMS OPTIMIZED.");
                        }}
                        style={{ padding: '8px 15px', background: 'rgba(255,77,77,0.1)', borderRadius: '10px', border: '1px solid rgba(255,77,77,0.3)', fontSize: '9px', color: '#ff4d4d', fontWeight: 900, cursor: 'pointer' }}
                    >
                        REBOOT NEURAL ENGINE
                    </button>
                    <div style={{ padding: '8px 15px', background: 'rgba(0,229,160,0.1)', borderRadius: '10px', border: '1px solid #00e5a0', fontSize: '10px', color: '#00e5a0', fontWeight: 900, letterSpacing: '2px' }}>
                        NEURAL ENGINE: V4.2 ACTIVE
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'VOICE PANIC DETECTION', icon: <FaPhone />, status: 'LISTENING', color: '#ff4d4d', detail: 'Monitoring high-frequency panic vocal patterns.' },
                    { label: 'HARASSMENT PREDICTION', icon: <FaBrain />, status: 'OPTIMIZING', color: '#d442f5', detail: 'Analyzing spatial-temporal risk clusters.' },
                    { label: 'WOMEN SAFETY SCORE', icon: <FaShieldAlt />, status: '9.4/10', color: '#00e5a0', detail: 'Real-time city-wide safety index calculation.' },
                    { label: 'SMART ESCORT REQ', icon: <FaRoute />, status: 'READY', color: '#60b8ff', detail: 'AI-routed safe passage generation.' },
                    { label: 'FAKE COMPLAINT DETECT', icon: <FaUserSecret />, status: 'FILTERING', color: '#ff9800', detail: 'Neural filtering of malicious report patterns.' },
                    { label: 'WHISPER MODE', icon: <FaBell />, status: 'ENCRYPTED', color: '#6366f1', detail: 'Silent signal encryption protocol active.' }
                ].map((item, i) => (
                    <div 
                        key={i} 
                        className="glass-panel" 
                        onClick={() => alert(`NEURAL DIAGNOSTIC: ${item.label}\n${item.detail}\nSTATUS: ${item.status}`)}
                        style={{ padding: '30px', textAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.3s' }}
                    >
                        <div className="scanning-bar"></div>
                        <div style={{ fontSize: '30px', color: item.color, marginBottom: '15px', filter: 'drop-shadow(0 0 10px currentColor)' }}>{item.icon}</div>
                        <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '5px', letterSpacing: '1px' }}>{item.label}</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: item.color }}>{item.status}</div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,215,0,0.1)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#ffd700', letterSpacing: '2px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaTerminal /> TACTICAL AI FEED (REAL-TIME)
                </h4>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '2' }}>
                    {aiLogs.map((log, i) => (
                        <div key={i} style={{ color: i === 0 ? '#ffd700' : 'inherit', opacity: 1 - (i * 0.15), display: 'flex', gap: '15px' }}>
                            <span style={{ opacity: 0.3 }}>[{new Date().toLocaleTimeString()}]</span>
                            <span style={{ fontWeight: i === 0 ? 900 : 500 }}>{log}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .scanning-bar {
                    position: absolute;
                    top: -100%;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to bottom, transparent, rgba(212,66,245,0.05), transparent);
                    animation: scan 3s linear infinite;
                }
                @keyframes scan {
                    0% { top: -100%; }
                    100% { top: 100%; }
                }
                .pulse-fast { animation: pulse 1s infinite alternate; }
            `}</style>
        </div>
    );
}

function ProfileView({ user }) {
    const [showPass, setShowPass] = useState(false);
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 900, color: '#fff' }}>{user?.name?.[0]}</div>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{user?.name}</h2>
                        <div style={{ color: '#d442f5', fontWeight: 800, letterSpacing: '2px', fontSize: '12px' }}>WOMEN SUPPORT COMMANDER</div>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>SYSTEM ACCESS LEVEL</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e5a0' }}>DIVISION CHIEF (LVL 5)</div>
                </div>
            </div>
        </div>
    );
}
