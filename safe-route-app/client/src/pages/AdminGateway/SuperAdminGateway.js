import React from "react";
import { FaSkull, FaCity, FaUser, FaSearch, FaShieldAlt, FaCogs, FaSignOutAlt } from "react-icons/fa";
import Logo from "../../components/Logo";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";

export default function SuperAdminGateway({ onLogout }) {
    const [stats, setStats] = React.useState({ sos: 0, taxi: 0, women: 0, cyber: 0, total: 0, help: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Real-time SOS Alerts Count
        const qSos = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SOS"));
        const unsubSos = onSnapshot(qSos, (snap) => {
            setStats(prev => ({ ...prev, sos: snap.size }));
        });

        // Real-time Safe Taxi Reports Count
        const qTaxi = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SAFE TAXI"));
        const unsubTaxi = onSnapshot(qTaxi, (snap) => {
            setStats(prev => ({ ...prev, taxi: snap.size }));
        });

        // Real-time Women Safety Reports (Stalking/Harassment)
        const qWomen = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "in", ["STALKING", "HARASSMENT"]));
        const unsubWomen = onSnapshot(qWomen, (snap) => {
            setStats(prev => ({ ...prev, women: snap.size }));
        });

        // Real-time Analytics Dataset Count
        const unsubTotal = onSnapshot(collection(db, "reports"), (snap) => {
            setStats(prev => ({ ...prev, total: snap.size }));
        });

        // Real-time Helpdesk Tickets (Assuming PENDING status for support)
        const qHelp = query(collection(db, "reports"), where("status", "==", "PENDING"));
        const unsubHelp = onSnapshot(qHelp, (snap) => {
            setStats(prev => ({ ...prev, help: snap.size }));
        });

        // Real-time Cyber Security Alerts
        const qCyber = query(collection(db, "reports"), where("type", "==", "CYBER ABUSE"), where("status", "==", "ACTIVE"));
        const unsubCyber = onSnapshot(qCyber, (snap) => {
            setStats(prev => ({ ...prev, cyber: snap.size }));
        });

        setLoading(false);
        return () => { unsubSos(); unsubTaxi(); unsubWomen(); unsubTotal(); unsubHelp(); unsubCyber(); };
    }, []);

    const getThreatLevel = () => {
        const totalActive = stats.sos + stats.taxi + stats.women + stats.cyber;
        if (totalActive > 10) return "CRITICAL";
        if (totalActive > 5) return "ELEVATED";
        if (totalActive > 0) return "GUARDED";
        return "SECURE";
    };

    const specializedTeams = [
        { id: "1", name: "SOS TEAM", desc: "Emergency Signal Management & Rapid Response", color: "#ff4d4d", icon: <FaSkull />, status: stats.sos > 0 ? `${stats.sos} CRITICAL` : "STABLE" },
        { id: "2", name: "Safe Taxi Team", desc: "Cab Verification & Live Transit Monitoring", color: "#00e5a0", icon: <FaCity />, status: stats.taxi > 0 ? `${stats.taxi} SIGNAL` : "ACTIVE" },
        { id: "3", name: "Women Safety Support", desc: "Dedicated Support for Vulnerable Groups", color: "#a855f7", icon: <FaUser />, status: stats.women > 0 ? `${stats.women} ACTIVE` : "ON-CALL" },
        { id: "4", name: "Analytics & Monitoring", desc: "AI-Driven Risk Assessment & metrics", color: "#6366f1", icon: <FaSearch />, status: `DATASET: ${stats.total}` },
        { id: "5", name: "Cyber Security Team", desc: "Data Encryption & Platform Integrity", color: "#4285F4", icon: <FaShieldAlt />, status: stats.cyber > 0 ? `${stats.cyber} THREATS` : getThreatLevel() },
        { id: "6", name: "Helpdesk / Support", desc: "24/7 Technical Assistance", color: "#ffd700", icon: <FaCogs />, status: stats.help > 0 ? `${stats.help} TICKETS` : "ONLINE" },
        { id: "7", name: "COMMISSIONER OFFICE", desc: "Supreme Command & Oversight", color: "#ffffff", icon: <FaShieldAlt />, status: "COMMAND" }
    ];

    const handleMonitor = (id) => {
        // Backup admin session and flag it for return
        const adminUser = localStorage.getItem("trinetra_user");
        if (adminUser) localStorage.setItem("trinetra_admin_backup", adminUser);
        localStorage.setItem("isAdminSession", "true");

        // Navigate to the divisional login portal for manual credential entry
        window.location.href = `/division-portal/${id}`;
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'radial-gradient(circle at top right, #0a0f1a, #02040a)', 
            color: '#fff', 
            padding: '40px', 
            fontFamily: "'Space Grotesk', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(0, 229, 160, 0.03)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.03)', filter: 'blur(100px)', borderRadius: '50%' }}></div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px', position: 'relative', zIndex: 2 }}>
                <div>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GLOBAL DIVISIONAL COMMAND</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#00e5a0', borderRadius: '50%', boxShadow: '0 0 10px #00e5a0' }}></div>
                            <p style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px', fontWeight: 600 }}>TRINETRA COMMAND GATEWAY v4.0</p>
                        </div>
                    </div>
                </div>
                <button onClick={onLogout} style={{ padding: '12px 24px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '10px', color: '#ff4d4d', fontWeight: 900, cursor: 'pointer', fontSize: '10px', letterSpacing: '1px', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,77,77,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,77,77,0.05)'}>
                    TERMINATE SESSION
                </button>
            </header>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '20px', 
                position: 'relative', 
                zIndex: 2,
                marginBottom: '40px'
            }}>
                {specializedTeams.map((team) => (
                    <div key={team.id} className="gateway-card" style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        backdropFilter: 'blur(10px)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '20px', 
                        padding: '25px', 
                        position: 'relative',
                        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'default'
                    }}>
                        {/* Status Light */}
                        <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="status-pulse" style={{ width: '6px', height: '6px', background: team.color, borderRadius: '50%', boxShadow: `0 0 8px ${team.color}` }}></div>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: team.color, letterSpacing: '1px' }}>{team.status}</span>
                        </div>

                        <div style={{ width: '45px', height: '45px', background: `${team.color}10`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: team.color, marginBottom: '20px', border: `1px solid ${team.color}20` }}>
                            {team.icon}
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '8px', letterSpacing: '0.5px' }}>{team.name}</h3>
                        <p style={{ fontSize: '11px', opacity: 0.3, lineHeight: '1.5', marginBottom: '25px', height: '33px', overflow: 'hidden' }}>{team.desc}</p>
                        
                        <button 
                            onClick={() => handleMonitor(team.id)}
                            style={{ 
                                width: '100%', 
                                padding: '12px', 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: '10px', 
                                color: '#fff', 
                                fontSize: '10px', 
                                fontWeight: 900, 
                                cursor: 'pointer', 
                                transition: '0.2s',
                                letterSpacing: '1px'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = team.color; e.currentTarget.style.color = '#000'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; }}
                        >
                            ACCESS PORTAL
                        </button>
                    </div>
                ))}
            </div>

            {/* --- NEW: LIVE TACTICAL FEED --- */}
            <div style={{ 
                background: 'rgba(0,0,0,0.4)', 
                border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '15px', 
                padding: '20px',
                position: 'relative',
                zIndex: 2,
                fontFamily: "'Courier New', Courier, monospace"
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', background: '#ff4d4d', borderRadius: '50%', animation: 'pulse-sos 1s infinite' }}></div>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>LIVE TACTICAL INTEL</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>ENCRYPTED STREAM_OFFLINE_BYPASS</span>
                </div>
                <div style={{ height: '80px', overflow: 'hidden', fontSize: '11px', color: '#00e5a0', lineHeight: '1.8', opacity: 0.8 }}>
                    <div className="scrolling-intel">
                        <p>[{new Date().toLocaleTimeString()}] TRINETRA_KERNEL_V4.2.1 LOADED... OK</p>
                        <p>[{new Date().toLocaleTimeString()}] SOS_NODE_INDIRA_NAGAR: MONITORING ACTIVE (LAT: 22.7, LNG: 75.8)</p>
                        <p>[{new Date().toLocaleTimeString()}] SAFE_TAXI_VERIFICATION_NODE: UPGRADE COMPLETE (ID: #TX-9021)</p>
                        <p>[{new Date().toLocaleTimeString()}] CRYPTO_GATEWAY_SECURE: 256-BIT ROTATION APPLIED</p>
                        <p>[{new Date().toLocaleTimeString()}] COMMISSIONER_LINK: STANDBY_MODE_ENGAGED</p>
                    </div>
                </div>
            </div>

            <style>{`
                .gateway-card:hover { 
                    transform: translateY(-8px); 
                    background: rgba(255, 255, 255, 0.04); 
                    border-color: rgba(255,255,255,0.15);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .status-pulse { animation: glow-pulse 2s infinite; }
                @keyframes glow-pulse {
                    0% { opacity: 0.4; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0.4; transform: scale(0.8); }
                }
                .scrolling-intel {
                    animation: scroll-up 10s linear infinite;
                }
                @keyframes scroll-up {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-100%); }
                }
                @keyframes pulse-sos {
                    0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
                }
            `}</style>
        </div>
    );
}
