import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, orderBy, limit, updateDoc, doc } from "firebase/firestore";
import { 
  FaTasks, FaUserCheck, FaExclamationCircle, FaPaperPlane, 
  FaUserShield, FaSignOutAlt, FaPlus, FaCheckCircle, FaSatellite,
  FaCogs, FaHistory, FaUsers, FaThLarge, FaMapMarkerAlt
} from "react-icons/fa";
import Logo from "../components/Logo";
import "./Dashboard.css";

// SOS Head Specialized Components
import SOSDashboardDesktop from "./SOSHead/Desktop/SOSDashboard";
import SOSDashboardMobile from "./SOSHead/Mobile/SOSDashboardMobile";
import SOSMemberDashboard from "./SOSMember/Desktop/MemberDashboard";
import TaxiHeadDashboard from "./SafeTaxi/Head/TaxiHeadDashboard";
import TaxiMemberDashboard from "./SafeTaxi/Member/TaxiMemberDashboard";
import WomenSupportHeadDashboard from "./WomenSupport/Head/WomenSupportHeadDashboard";
import WomenSupportMemberDashboard from "./WomenSupport/Member/WomenSupportMemberDashboard";
import AnalyticsIntelHeadDashboard from "./AnalyticsIntel/Head/AnalyticsIntelHeadDashboard";
import AnalyticsIntelMemberDashboard from "./AnalyticsIntel/Member/AnalyticsIntelMemberDashboard";
import CyberSecurityHeadDashboard from "./CyberSecurity/Head/CyberSecurityHeadDashboard";
import CyberSecurityMemberDashboard from "./CyberSecurity/Member/CyberSecurityMemberDashboard";
import HelpdeskHeadDashboard from "./Helpdesk/Head/HelpdeskHeadDashboard";
import HelpdeskMemberDashboard from "./Helpdesk/Member/HelpdeskMemberDashboard";
import CommissionerHeadDashboard from "./CommissionerOffice/Head/CommissionerHeadDashboard";

const specializedTeamsMapping = {
    "1": "SOS COMMAND CENTER",
    "2": "SAFE TAXI UNIT",
    "3": "WOMEN SAFETY UNIT",
    "4": "ANALYTICS & INTEL",
    "5": "CYBER SECURITY",
    "6": "HELPDESK SUPPORT",
    "7": "COMMISSIONER OFFICE"
};

export default function DivisionDashboard() {
    const { divisionId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: "", assignedTo: "" });
    const [loading, setLoading] = useState(true);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [chatMsg, setChatMsg] = useState("");
    const [incidentLogs, setIncidentLogs] = useState([]);
    const [activeTab, setActiveTab] = useState("ops"); // ops, team, logs, health
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [latestSosGlobal, setLatestSosGlobal] = useState(null);

    useEffect(() => {
        // Use client-side filtering to bypass Firestore Index requirements
        const qLatest = query(collection(db, "reports"), limit(50));
        const unsubLatest = onSnapshot(qLatest, (snap) => {
            const activeSos = snap.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .filter(a => a.type === "SOS" && a.status === "ACTIVE")
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (activeSos.length > 0) {
                setLatestSosGlobal(activeSos[0]);
            } else {
                setLatestSosGlobal(null);
            }
        });
        return () => unsubLatest();
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 768;

    useEffect(() => {
        const divUser = JSON.parse(localStorage.getItem("trinetra_user"));
        
        // Case-insensitive role check
        const validRoles = [
            'divisional', 'head of department', 'sub-head', 'member', 'head', 'sub-head', 
            'taxi member', 'support agent', 'agent', 'analyst', 'personnel', 'admin'
        ];
        const userRole = divUser?.role?.toLowerCase();
        const userDesignation = divUser?.designation?.toLowerCase();

        const isAuthorized = divUser && (
            validRoles.includes(userRole) || 
            validRoles.includes(userDesignation)
        );

        if (!isAuthorized) {
            const portalUser = JSON.parse(localStorage.getItem("trinetra_div_user"));
            if (portalUser) {
                setUser(portalUser);
            } else {
                navigate("/login");
            }
        } else {
            setUser(divUser);
        }
        
        // Suppress agent
        const agent = document.getElementById("trinetra-agent-container");
        if (agent) agent.style.display = "none";
        return () => { if (agent) agent.style.display = "block"; };
    }, [navigate]);

    // --- Real-time SOS Alerts (For SOS Division) ---
    useEffect(() => {
        if (divisionId !== '1') return;

        const q = query(collection(db, "reports"), limit(100)); // Get more for client filtering

        const unsub = onSnapshot(q, (snapshot) => {
            const alerts = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .filter(a => a.type === "SOS")
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest

            setSosAlerts(alerts);
            if (!selectedAlert && alerts.length > 0) setSelectedAlert(alerts[0]);
            setLoading(false);
        });

        return () => unsub();
    }, [divisionId, selectedAlert]);

    // --- Real-time Tasks from Firestore ---
    useEffect(() => {
        if (!divisionId || divisionId === '1') return;
        
        const q = query(
            collection(db, "divisional_tasks"), 
            where("divisionId", "==", divisionId),
            orderBy("timestamp", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(taskList);
            setLoading(false);
        });

        return () => unsub();
    }, [divisionId]);

    if (!user) return null;

    const effectiveRole = user.designation || user.role;
    const isAuthority = effectiveRole === "Head of Department" || effectiveRole === "SUB-Head" || effectiveRole === "HEAD" || effectiveRole === "SUB-HEAD";

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.assignedTo) return;

        try {
            await addDoc(collection(db, "divisional_tasks"), {
                divisionId: divisionId,
                title: newTask.title,
                assignedTo: newTask.assignedTo,
                status: "Pending",
                issuedBy: user.name,
                timestamp: serverTimestamp()
            });
            setNewTask({ title: "", assignedTo: "" });
        } catch (err) {
            console.error("Task Assignment Error:", err);
        }
    };

    const handleLogout = () => {
        const isAdminSession = localStorage.getItem("isAdminSession");
        const adminBackup = localStorage.getItem("trinetra_admin_backup");

        if (isAdminSession === "true" && adminBackup) {
            // Restore admin session and go back to 7-card gateway
            localStorage.setItem("trinetra_user", adminBackup);
            localStorage.removeItem("isAdminSession");
            localStorage.removeItem("trinetra_admin_backup");
            window.location.href = "/admin-dashboard";
        } else {
            auth.signOut().then(() => {
                localStorage.clear();
                window.location.href = "/login";
            }).catch(() => {
                localStorage.clear();
                window.location.href = "/login";
            });
        }
    };

    let specializedContent = null;

    if (divisionId === '1') {
        const isMember = user.designation?.toUpperCase().includes("MEMBER") || user.role?.toUpperCase().includes("MEMBER");

        specializedContent = isMember ? (
            <SOSMemberDashboard user={user} sosAlerts={sosAlerts} onLogout={handleLogout} />
        ) : (
            isMobile ? (
                <SOSDashboardMobile user={user} sosAlerts={sosAlerts} onLogout={handleLogout} />
            ) : (
                <SOSDashboardDesktop user={user} sosAlerts={sosAlerts} onLogout={handleLogout} />
            )
        );
    } else if (divisionId === '2') {
        const isMember = user.designation?.toUpperCase().includes("MEMBER") || user.role?.toUpperCase().includes("MEMBER");
        specializedContent = isMember ? <TaxiMemberDashboard user={user} onLogout={handleLogout} /> : <TaxiHeadDashboard user={user} onLogout={handleLogout} />;
    } else if (divisionId === '3') {
        const isMember = user.designation?.toUpperCase().includes("MEMBER") || user.role?.toUpperCase().includes("MEMBER") || user.designation?.toUpperCase().includes("AGENT");
        specializedContent = isMember ? <WomenSupportMemberDashboard user={user} onLogout={handleLogout} /> : <WomenSupportHeadDashboard user={user} onLogout={handleLogout} />;
    } else if (divisionId === '4') {
        const isMember = user.designation?.toUpperCase().includes("MEMBER") || user.role?.toUpperCase().includes("MEMBER") || user.designation?.toUpperCase().includes("ANALYST");
        specializedContent = isMember ? <AnalyticsIntelMemberDashboard user={user} onLogout={handleLogout} /> : <AnalyticsIntelHeadDashboard user={user} onLogout={handleLogout} />;
    } else if (divisionId === '5') {
        const isMember = user.designation?.toUpperCase().includes("MEMBER") || user.role?.toUpperCase().includes("MEMBER") || user.designation?.toUpperCase().includes("ANALYST") || user.designation?.toUpperCase().includes("ADMIN");
        specializedContent = isMember ? <CyberSecurityMemberDashboard user={user} onLogout={handleLogout} /> : <CyberSecurityHeadDashboard user={user} onLogout={handleLogout} />;
    } else if (divisionId === '6') {
        const isMember = user.designation?.toUpperCase().includes("MEMBER") || user.role?.toUpperCase().includes("MEMBER") || user.designation?.toUpperCase().includes("AGENT");
        specializedContent = isMember ? <HelpdeskMemberDashboard user={user} onLogout={handleLogout} /> : <HelpdeskHeadDashboard user={user} onLogout={handleLogout} />;
    } else if (divisionId === '7') {
        specializedContent = <CommissionerHeadDashboard user={user} onLogout={handleLogout} />;
    }

    if (specializedContent) {
        return (
            <>
                {/* GLOBAL TACTICAL ALERT BANNER */}
                {latestSosGlobal && divisionId !== '7' && (
                    <div style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 3000, 
                        background: 'rgba(255, 77, 77, 0.98)', color: '#fff', padding: '15px 40px', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backdropFilter: 'blur(20px)', borderBottom: '2px solid rgba(255,255,255,0.2)',
                        animation: 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div className="status-pulse" style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 15px #fff' }}></div>
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px' }}>CRITICAL SOS BROADCAST</span>
                                <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 700 }}>CITIZEN: {latestSosGlobal.userName?.toUpperCase()} • LOCATION: {latestSosGlobal.locationName?.toUpperCase()}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={async () => {
                                    try {
                                        await updateDoc(doc(db, "reports", latestSosGlobal.id), { 
                                            status: "ASSIGNED", 
                                            assignedAt: Date.now(),
                                            assignedToDivision: divisionId,
                                            assignedToUser: user.name
                                        });
                                        alert(`SIGNAL INTERCEPTED. YOUR DIVISION IS NOW RESPONDING TO ${latestSosGlobal.userName.toUpperCase()}.`);
                                    } catch (err) {
                                        console.error(err);
                                        alert("TACTICAL ERROR: INTERCEPT FAILED.");
                                    }
                                }}
                                style={{ padding: '8px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                            >
                                INTERCEPT SIGNAL
                            </button>
                        </div>
                    </div>
                )}
                {specializedContent}
            </>
        );
    }

    return (
        <div className="nr-root" style={{ background: '#020408', minHeight: '100vh', display: 'flex', flexDirection: 'row', color: '#fff', overflow: 'hidden' }}>
            
            {/* GLOBAL TACTICAL ALERT BANNER */}
            {latestSosGlobal && divisionId !== '7' && (
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
                            <div style={{ fontSize: '10px', opacity: 0.8, fontWeight: 700 }}>CITIZEN: {latestSosGlobal.userName?.toUpperCase()} • LOCATION: {latestSosGlobal.locationName?.toUpperCase()}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={() => {
                                if (divisionId !== '1') {
                                    window.location.href = `/division-dashboard/1`;
                                } else {
                                    setActiveTab("ops");
                                }
                            }}
                            style={{ padding: '8px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                        >
                            INTERCEPT SIGNAL
                        </button>
                    </div>
                </div>
            )}

            {/* --- TACTICAL SIDEBAR --- */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', backdropFilter: 'blur(20px)', zIndex: 100, marginTop: latestSosGlobal ? '60px' : '0', transition: '0.5s' }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(255,45,45,0.1)', borderRadius: '8px', border: '1px solid rgba(255,45,45,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#ff4d4d' }}></div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#ff4d4d', letterSpacing: '1px' }}>LIVE OPERATIONS</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px' }}>
                    {[
                        { id: 'ops', label: 'OPERATIONS ROOM', icon: <FaThLarge /> },
                        { id: 'team', label: 'TEAM DEPLOYMENT', icon: <FaUsers /> },
                        { id: 'logs', label: 'INCIDENT HISTORY', icon: <FaHistory /> },
                        { id: 'health', label: 'SYSTEM HEALTH', icon: <FaCogs /> }
                    ].map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '16px 20px', 
                                marginBottom: '8px', 
                                borderRadius: '14px', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px',
                                background: activeTab === item.id ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
                                border: activeTab === item.id ? '1px solid rgba(66, 133, 244, 0.2)' : '1px solid transparent',
                                transition: '0.3s'
                            }}
                        >
                            <span style={{ fontSize: '18px', color: activeTab === item.id ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }}>{item.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px', color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '0 20px' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '16px', background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.1)', borderRadius: '14px', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '11px', fontWeight: 900 }}>
                        <FaSignOutAlt /> TERMINATE SESSION
                    </button>
                </div>
            </aside>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* --- DIVISIONAL HUD HEADER --- */}
                <header style={{ padding: '25px 40px', background: 'rgba(6, 8, 13, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(30px)', zIndex: 10, marginTop: latestSosGlobal ? '60px' : '0', transition: '0.5s' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {specializedTeamsMapping[divisionId] || "SPECIALIZED UNIT"}
                        </h2>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>
                            SECTOR: {divisionId} • {user.designation || user.role} • <span style={{ color: 'var(--accent)' }}>TAC-NET ACTIVE</span>
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800 }}>{user.name} - {user.designation || (divisionId === '1' ? 'SOS HEAD' : user.role)}</div>
                            <div style={{ fontSize: '10px', color: '#00e5a0', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                                <div className="status-dot" style={{ background: '#00e5a0' }} /> SECURE SESSION
                            </div>
                        </div>
                        <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>
                            {user.name[0]}
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    
                    {activeTab === 'ops' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: (divisionId === '1' || !isAuthority) ? '1fr' : '1fr 400px', gap: '30px' }}>
                            
                            {/* --- TACTICAL SOS COMMAND CENTER (Division 1 Only) --- */}
                            {divisionId === '1' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s ease' }}>
                                    
                                    {/* --- WIDGETS --- */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                        {[
                                            { label: 'ACTIVE EMERGENCIES', val: sosAlerts.length, color: '#ff4d4d', icon: <FaExclamationCircle /> },
                                            { label: 'AVG RESPONSE TIME', val: '4.2 min', color: '#00e5a0', icon: <FaSatellite /> },
                                            { label: 'CRITICAL ALERTS', val: sosAlerts.filter(a => a.priority === 'High').length || '0', color: '#fbbc04', icon: <FaExclamationCircle /> },
                                            { label: 'NEARBY TEAMS', val: '12 Units', color: 'var(--accent)', icon: <FaUserCheck /> }
                                        ].map((w, i) => (
                                            <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ fontSize: '24px', color: w.color, background: `${w.color}10`, width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{w.icon}</div>
                                                <div>
                                                    <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>{w.val}</div>
                                                    <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>{w.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr 320px', gap: '30px', height: 'calc(100vh - 300px)' }}>
                                        
                                        {/* --- LIVE SOS FEED --- */}
                                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 900, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>LIVE SOS FEED</h4>
                                                <div className="status-dot" style={{ background: '#ff4d4d' }}></div>
                                            </div>
                                            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                                                {sosAlerts.map(alert => (
                                                    <div 
                                                        key={alert.id} 
                                                        onClick={() => setSelectedAlert(alert)}
                                                        style={{ 
                                                            padding: '20px', 
                                                            borderRadius: '20px', 
                                                            background: selectedAlert?.id === alert.id ? 'rgba(66, 133, 244, 0.08)' : 'rgba(255,255,255,0.02)',
                                                            border: selectedAlert?.id === alert.id ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                                                            cursor: 'pointer',
                                                            marginBottom: '15px',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                            <span style={{ fontSize: '13px', fontWeight: 900 }}>{alert.userName}</span>
                                                            <span style={{ fontSize: '9px', color: '#ff4d4d', fontWeight: 900, background: 'rgba(255,77,77,0.1)', padding: '4px 8px', borderRadius: '6px' }}>● CRITICAL</span>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.4' }}>
                                                            <FaMapMarkerAlt style={{ color: 'var(--accent)' }} /> {alert.locationName?.substring(0, 50)}...
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>ID: {alert.id.toString().slice(-6)}</div>
                                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{new Date(alert.timestamp).toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* --- TACTICAL RESPONSE MAP & CONTROLS --- */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                            {selectedAlert ? (
                                                <>
                                                    <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        {/* Simulated Map Background */}
                                                        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingBottom: '100px' }}>
                                                            <div className="sos-ripple" style={{ width: '140px', height: '140px', border: '2px solid #ff4d4d' }}></div>
                                                            <div style={{ width: '90px', height: '90px', background: 'rgba(255,77,77,0.15)', borderRadius: '50%', border: '2px solid #ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                                                                <FaExclamationCircle style={{ fontSize: '36px', color: '#ff4d4d' }} />
                                                            </div>
                                                            <div style={{ marginTop: '20px', textAlign: 'center', zIndex: 5 }}>
                                                                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '3px' }}>TARGET PINPOINTED</div>
                                                                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, marginTop: '4px' }}>{selectedAlert.userName.toUpperCase()} • DISTRESS SIGNAL</div>
                                                            </div>
                                                        </div>

                                                        {/* Response Overlay */}
                                                        <div style={{ position: 'absolute', bottom: '25px', left: '25px', right: '25px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', zIndex: 10 }}>
                                                            <button onClick={() => alert("Police Dispatched!")} style={{ padding: '14px', background: 'rgba(0,149,255,0.1)', border: '1px solid rgba(0,149,255,0.4)', borderRadius: '12px', color: '#0095ff', fontWeight: 900, fontSize: '10px', cursor: 'pointer', transition: '0.2s', letterSpacing: '1px' }}>POLICE ALERT</button>
                                                            <button onClick={() => alert("Ambulance Dispatched!")} style={{ padding: '14px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.4)', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', transition: '0.2s', letterSpacing: '1px' }}>AMBULANCE</button>
                                                            <button onClick={() => alert("Case Marked Resolved")} style={{ padding: '14px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.4)', borderRadius: '12px', color: '#00e5a0', fontWeight: 900, fontSize: '10px', cursor: 'pointer', transition: '0.2s', letterSpacing: '1px' }}>RESOLVE CASE</button>
                                                        </div>
                                                    </div>
                                                    <div className="glass-panel" style={{ height: '220px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>TACTICAL COMMS</div>
                                                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 25px', fontSize: '12px' }}>
                                                            <div style={{ background: 'rgba(66, 133, 244, 0.05)', padding: '12px 16px', borderRadius: '14px', borderLeft: '3px solid var(--accent)', marginBottom: '12px' }}>
                                                                <span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '10px' }}>[AI AGENT]:</span> Monitoring biometric data and audio stream. No audible threat confirmed.
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '15px 25px', display: 'flex', gap: '15px' }}>
                                                            <input placeholder="Enter dispatch command..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 20px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                                                            <button style={{ background: 'var(--accent)', border: 'none', borderRadius: '12px', padding: '0 25px', color: '#000', fontWeight: 900, fontSize: '12px' }}>SEND</button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: 900, letterSpacing: '4px' }}>
                                                    AWAITING MISSION SELECTION
                                                </div>
                                            )}
                                        </div>

                                        {/* --- INCIDENT TIMELINE & INTEL --- */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                            <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 900, letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>MISSION LOG</div>
                                                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                                    {[
                                                        { time: '14:20', text: 'SOS UPLINK ESTABLISHED', color: '#ff4d4d' },
                                                        { time: '14:21', text: 'SATELLITE POSITION LOCKED', color: 'var(--accent)' },
                                                        { time: '14:22', text: 'AI AUDIO ANALYSIS LIVE', color: '#00e5a0' },
                                                        { time: '14:23', text: 'GUARDIAN CHANNEL OPEN', color: '#fbbc04' }
                                                    ].map((log, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', width: '50px' }}>{log.time}</div>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.color, boxShadow: `0 0 10px ${log.color}` }}></div>
                                                            <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>{log.text}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="glass-panel" style={{ padding: '30px', background: 'rgba(0, 229, 160, 0.02)', border: '1px solid rgba(0, 229, 160, 0.1)' }}>
                                                <h4 style={{ margin: '0 0 15px 0', fontSize: '12px', fontWeight: 900, color: '#00e5a0', letterSpacing: '2px' }}>SATELLITE INTEL</h4>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8', fontWeight: 600 }}>
                                                    TRINETRA Orbital Link 4 is monitoring this sector. Ground response units are on standby.
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* --- STANDARD DIVISION DASHBOARD (Other Divisions) --- */}
                            {divisionId !== '1' && (
                                <div style={{ display: 'grid', gridTemplateColumns: isAuthority ? '1fr 400px' : '1fr', gap: '30px' }}>
                                    
                                    {/* --- TACTICAL TASK BOARD --- */}
                                    <div className="glass-panel" style={{ padding: '35px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <FaTasks style={{ color: 'var(--accent)' }} /> OPERATIONAL DIRECTIVES
                                            </h3>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <span style={{ fontSize: '11px', background: 'rgba(66,133,244,0.1)', color: 'var(--accent)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(66,133,244,0.2)', fontWeight: 800 }}>
                                                    {tasks.length} SYNCED
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {loading ? (
                                                <div style={{ textAlign: 'center', padding: '50px', color: 'rgba(255,255,255,0.3)' }}>
                                                    <FaSatellite className="pulse" style={{ fontSize: '40px', marginBottom: '15px' }} />
                                                    <div>Synchronizing with Command Center...</div>
                                                </div>
                                            ) : tasks.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', color: 'rgba(255,255,255,0.3)' }}>
                                                    No active directives in this sector.
                                                </div>
                                            ) : (
                                                tasks.map(task => (
                                                    <div key={task.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                                                        <div>
                                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>BY: {task.issuedBy}</div>
                                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{task.title}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '6px', fontWeight: 600 }}>TARGET: {task.assignedTo}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '10px', background: task.status === 'Completed' ? 'rgba(0,229,160,0.1)' : 'rgba(255,188,4,0.1)', color: task.status === 'Completed' ? '#00e5a0' : '#fbbc04', padding: '5px 12px', borderRadius: '8px', fontWeight: 900, letterSpacing: '1px' }}>
                                                                {task.status.toUpperCase()}
                                                            </div>
                                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                                                                {task.timestamp?.toDate().toLocaleTimeString() || 'Just now'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* --- AUTHORITY COMMAND CONSOLE --- */}
                                    {isAuthority && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                            <div className="glass-panel" style={{ padding: '30px' }}>
                                                <h3 style={{ margin: '0 0 25px 0', fontSize: '18px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '1px' }}>ISSUE DIRECTIVE</h3>
                                                <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                                    <div className="input-group">
                                                        <input 
                                                            type="text" placeholder="Directive Title / Objective" required 
                                                            style={{ width: '100%', padding: '16px', background: '#1a1d23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', outline: 'none' }} 
                                                            value={newTask.title}
                                                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="input-group">
                                                        <select 
                                                            required
                                                            style={{ width: '100%', padding: '16px', background: '#1a1d23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                                                            value={newTask.assignedTo}
                                                            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                                                        >
                                                            <option value="">Select Target Unit/Member</option>
                                                            <option value="Team Alpha (Field)">Team Alpha (Field)</option>
                                                            <option value="Quick Response Unit 4">Quick Response Unit 4</option>
                                                            <option value="All Personnel">All Personnel</option>
                                                            <option value="Satellite Monitor">Satellite Monitor</option>
                                                        </select>
                                                    </div>
                                                    <button type="submit" style={{ width: '100%', padding: '18px', background: 'var(--accent)', border: 'none', borderRadius: '14px', color: '#000', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 25px -5px rgba(66, 133, 244, 0.4)' }}>
                                                        <FaPaperPlane /> BROADCAST ORDER
                                                    </button>
                                                </form>
                                            </div>

                                            <div className="glass-panel" style={{ padding: '30px', background: 'rgba(0, 229, 160, 0.03)', border: '1px solid rgba(0, 229, 160, 0.15)' }}>
                                                <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: 900, color: '#00e5a0', letterSpacing: '1px' }}>HOD PRIVILEGES</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {[
                                                        "Broadcast Emergency Alerts",
                                                        "Authorize Personnel Deployment",
                                                        "Override Unit Directives",
                                                        "Access Real-time Global Intel"
                                                    ].map((p, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                                            <FaCheckCircle style={{ color: '#00e5a0' }} /> {p}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '100px', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                            <FaSatellite style={{ fontSize: '60px', marginBottom: '20px' }} />
                            <h2 style={{ letterSpacing: '10px' }}>TAB UNDER CONSTRUCTION</h2>
                            <p style={{ letterSpacing: '2px', fontSize: '12px' }}>ENCRYPTED DATA CHANNEL PENDING</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
