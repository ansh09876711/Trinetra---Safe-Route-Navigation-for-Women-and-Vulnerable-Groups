import React from "react";
import { FaSkull, FaCity, FaUser, FaSearch, FaShieldAlt, FaCogs, FaSignOutAlt, FaBullhorn } from "react-icons/fa";
import Logo from "../../components/Logo";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";

export default function SuperAdminGatewayMobile({ onLogout }) {
    const [stats, setStats] = React.useState({ sos: 0, taxi: 0, women: 0, cyber: 0, total: 0, help: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const qSos = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SOS"));
        const unsubSos = onSnapshot(qSos, (snap) => setStats(prev => ({ ...prev, sos: snap.size })));

        const qTaxi = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "==", "SAFE TAXI"));
        const unsubTaxi = onSnapshot(qTaxi, (snap) => setStats(prev => ({ ...prev, taxi: snap.size })));

        const qWomen = query(collection(db, "reports"), where("status", "==", "ACTIVE"), where("type", "in", ["STALKING", "HARASSMENT"]));
        const unsubWomen = onSnapshot(qWomen, (snap) => setStats(prev => ({ ...prev, women: snap.size })));

        const unsubTotal = onSnapshot(collection(db, "reports"), (snap) => setStats(prev => ({ ...prev, total: snap.size })));

        const qHelp = query(collection(db, "reports"), where("status", "==", "PENDING"));
        const unsubHelp = onSnapshot(qHelp, (snap) => setStats(prev => ({ ...prev, help: snap.size })));

        const qCyber = query(collection(db, "reports"), where("type", "==", "CYBER ABUSE"), where("status", "==", "ACTIVE"));
        const unsubCyber = onSnapshot(qCyber, (snap) => setStats(prev => ({ ...prev, cyber: snap.size })));

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
        { id: "1", name: "SOS TEAM", desc: "Emergency Response", color: "#ff4d4d", icon: <FaSkull />, status: stats.sos > 0 ? `${stats.sos} ALERT` : "STABLE" },
        { id: "2", name: "Safe Taxi", desc: "Transit Monitor", color: "#00e5a0", icon: <FaCity />, status: stats.taxi > 0 ? `${stats.taxi} LIVE` : "ACTIVE" },
        { id: "3", name: "Women Support", desc: "Vulnerable Groups", color: "#a855f7", icon: <FaUser />, status: stats.women > 0 ? `${stats.women} CASE` : "ON-CALL" },
        { id: "5", name: "Cyber Security", desc: "Platform Integrity", color: "#4285F4", icon: <FaShieldAlt />, status: stats.cyber > 0 ? `${stats.cyber} TRAP` : "SECURE" },
        { id: "6", name: "Helpdesk", desc: "Technical Support", color: "#ffd700", icon: <FaCogs />, status: stats.help > 0 ? `${stats.help} TICKET` : "ONLINE" },
        { id: "7", name: "COMMISSIONER", desc: "Supreme Command", color: "#ffffff", icon: <FaShieldAlt />, status: "COMMAND" }
    ];

    const handleMonitor = (id) => {
        const adminUser = localStorage.getItem("trinetra_user");
        if (adminUser) localStorage.setItem("trinetra_admin_backup", adminUser);
        localStorage.setItem("isAdminSession", "true");
        window.location.href = `/division-portal/${id}`;
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#05070a', 
            color: '#fff', 
            padding: '25px', 
            fontFamily: "'Space Grotesk', sans-serif",
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(66, 133, 244, 0.05)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(212, 66, 245, 0.05)', filter: 'blur(80px)', borderRadius: '50%' }}></div>

            {/* HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
                <Logo height={30} />
                <button 
                    onClick={onLogout} 
                    style={{ 
                        padding: '10px 15px', 
                        background: 'rgba(255,77,77,0.1)', 
                        border: '1px solid rgba(255,77,77,0.2)', 
                        borderRadius: '10px', 
                        color: '#ff4d4d', 
                        fontWeight: 900, 
                        fontSize: '9px', 
                        letterSpacing: '1px' 
                    }}
                >
                    EXIT
                </button>
            </header>

            <div style={{ marginBottom: '30px', position: 'relative', zIndex: 10 }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '1px', marginBottom: '5px' }}>DIVISIONAL COMMAND</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#00e5a0', borderRadius: '50%', boxShadow: '0 0 10px #00e5a0' }}></div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>TRINETRA_MOBILE_KERNEL v4.2</span>
                </div>
            </div>

            {/* GRID LAYOUT FOR MOBILE - 2 Columns */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px', 
                position: 'relative', 
                zIndex: 10,
                marginBottom: '40px'
            }}>
                {specializedTeams.map((team) => (
                    <div key={team.id} style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        backdropFilter: 'blur(20px)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '20px', 
                        padding: '20px', 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <div style={{ width: '40px', height: '40px', background: `${team.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: team.color, marginBottom: '12px', border: `1px solid ${team.color}20` }}>
                            {team.icon}
                        </div>
                        
                        <div style={{ fontSize: '8px', fontWeight: 900, color: team.color, letterSpacing: '1px', marginBottom: '5px', background: `${team.color}10`, padding: '4px 8px', borderRadius: '6px' }}>
                            {team.status}
                        </div>

                        <h3 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '5px' }}>{team.name.toUpperCase()}</h3>
                        <p style={{ fontSize: '9px', opacity: 0.3, marginBottom: '15px', height: '28px', overflow: 'hidden' }}>{team.desc}</p>
                        
                        <button 
                            onClick={() => handleMonitor(team.id)}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                background: team.color, 
                                border: 'none', 
                                borderRadius: '8px', 
                                color: team.color === '#ffffff' ? '#000' : '#fff', 
                                fontSize: '9px', 
                                fontWeight: 900, 
                                letterSpacing: '1px'
                            }}
                        >
                            ACCESS
                        </button>
                    </div>
                ))}
            </div>

            {/* MOBILE TACTICAL FEED */}
            <div style={{ 
                background: 'rgba(0,0,0,0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '15px', 
                padding: '15px',
                fontFamily: "'Courier New', Courier, monospace"
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#ff4d4d', borderRadius: '50%', animation: 'pulse-sos 1s infinite' }}></div>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>MOBILE_TACTICAL_INTEL</span>
                </div>
                <div style={{ fontSize: '10px', color: '#00e5a0', opacity: 0.8, overflow: 'hidden', height: '40px' }}>
                    <div className="scrolling-intel">
                        <p>[{new Date().toLocaleTimeString()}] SYNC_COMPLETE</p>
                        <p>[{new Date().toLocaleTimeString()}] NODE_7_ACTIVE</p>
                        <p>[{new Date().toLocaleTimeString()}] CRYPTO_LINK_UP</p>
                    </div>
                </div>
            </div>

            <style>{`
                .status-pulse { animation: glow-pulse 2s infinite; }
                @keyframes glow-pulse {
                    0% { opacity: 0.4; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0.4; transform: scale(0.8); }
                }
                .scrolling-intel { animation: scroll-up 5s linear infinite; }
                @keyframes scroll-up { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                @keyframes pulse-sos {
                    0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
                }
            `}</style>
        </div>
    );
}
