import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  FaUserShield, FaSatellite, FaShieldAlt, FaBroadcastTower, FaHistory, 
  FaSignOutAlt, FaSearch, FaBell, FaUser, FaSkull, FaGlobe, FaCity, FaCogs, 
  FaUsers, FaExclamationTriangle, FaChartLine, FaBullhorn, FaMicrochip, 
  FaTrash, FaUserPlus, FaBan, FaKey, FaTerminal, FaDatabase, FaServer, FaBrain,
  FaSearchLocation, FaBolt, FaEnvelope, FaEye, FaEyeSlash, FaCheckCircle,
  FaShieldVirus, FaNetworkWired, FaCamera, FaDiceD20, FaLock
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db, auth } from "../../../../firebase";
import { 
    collection, onSnapshot, query, orderBy, limit, where, deleteDoc, doc, setDoc, updateDoc, writeBatch, addDoc, serverTimestamp 
} from "firebase/firestore";
import { createUserWithEmailAndPassword as firebaseCreateUser } from "firebase/auth";

// Fix Leaflet Default Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function CommissionerHeadDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("teams");
    const [incidents, setIncidents] = useState([]);
    const [globalAlert, setGlobalAlertAlert] = useState("ALL SYSTEMS OPERATIONAL");

    const [globalAlerts, setGlobalAlerts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const qUsers = query(collection(db, "users"));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubUsers();
    }, []);

    useEffect(() => {
        // REPORTS LISTENER (Filtered for Active/Assigned)
        const qReports = query(collection(db, "reports"), where("status", "!=", "DELETED"));
        const unsubReports = onSnapshot(qReports, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // Sort in JS
            data.sort((a, b) => b.timestamp - a.timestamp);
            setIncidents(data.slice(0, 50));
        });

        // GLOBAL ALERTS LISTENER (Simplified for Zero-Index Requirement)
        const qAlerts = query(collection(db, "divisional_alerts"), where("status", "==", "ACTIVE"));
        const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
            const allAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filter for Commissioner (Div 7) and Sort
            const alerts = allAlerts
                .filter(a => a.targetDivision === "7")
                .sort((a, b) => b.timestamp - a.timestamp);
            
            setGlobalAlerts(alerts);
            if (alerts.length > 0) {
                setGlobalAlertAlert("CRITICAL ESCALATION: " + alerts.length + " ACTIVE CASES");
            } else {
                setGlobalAlertAlert("ALL SYSTEMS OPERATIONAL");
            }
        });

        return () => { unsubReports(); unsubAlerts(); };
    }, []);

    const tabs = [
        { id: 'warroom', label: 'WAR ROOM HUD', icon: <FaGlobe />, color: '#ffd700' },
        { id: 'cyber_defense', label: 'CYBER DEFENSE', icon: <FaNetworkWired />, color: '#00e5a0' },
        { id: 'neural_hub', label: 'NEURAL PREDICTION', icon: <FaBrain />, color: '#a855f7' },
        { id: 'surveillance', label: 'GLOBAL SURVEILLANCE', icon: <FaCamera />, color: '#4285F4' },
        { id: 'heatmap', label: 'CRIME HEATMAP', icon: <FaSearchLocation />, color: '#ff4d4d' },
        { id: 'teams', label: 'TEAM MANAGEMENT', icon: <FaUsers />, color: '#4285F4' },
        { id: 'missions', label: 'MISSION CONTROL', icon: <FaBolt />, color: '#ffd700' },
        { id: 'emergency', label: 'COMMAND CENTER', icon: <FaExclamationTriangle />, color: '#ff4d4d' },
        { id: 'analytics', label: 'GLOBAL ANALYTICS', icon: <FaChartLine />, color: '#00e5a0' },
        { id: 'broadcast', label: 'BROADCAST SYSTEM', icon: <FaBullhorn />, color: '#ff9800' },
        { id: 'trinetra_data', label: 'TRINETRA DATA', icon: <FaDatabase />, color: '#00e5a0' },
        { id: 'settings', label: 'PLATFORM CONFIG', icon: <FaCogs />, color: '#94a3b8' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'warroom': return <WarRoomView incidents={incidents} alerts={globalAlerts} />;
            case 'cyber_defense': return <CyberDefenseView />;
            case 'neural_hub': return <NeuralPredictionView />;
            case 'surveillance': return <GlobalSurveillanceView incidents={incidents} />;
            case 'heatmap': return <HeatmapView incidents={incidents} />;
            case 'teams': return <TeamManagementView setActiveTab={setActiveTab} />;
            case 'missions': return <MissionControlView />;
            case 'emergency': return <EmergencyCommandView incidents={incidents} alerts={globalAlerts} />;
            case 'analytics': return <GlobalAnalyticsView incidents={incidents} />;
            case 'broadcast': return <BroadcastSystemView />;
            case 'trinetra_data': return <TrinetraDataApprovalView />;
            default: return <WarRoomView incidents={incidents} alerts={globalAlerts} />;
        }
    };

    const activeSOS = incidents.find(i => i.type === 'SOS' && i.status === 'ACTIVE');

    const handleIntercept = async () => {
        if (!activeSOS) return;
        try {
            const batch = writeBatch(db);
            const divisions = ["1", "2", "3", "4", "5", "6"]; // All team divisions
            divisions.forEach(div => {
                const alertRef = doc(collection(db, "divisional_alerts"));
                batch.set(alertRef, {
                    source: "SUPREME_COMMISSIONER",
                    targetDivision: div,
                    type: "SIGNAL_INTERCEPT",
                    message: `⚠️ SUPREME COMMAND: Intercepting SOS Signal from ${activeSOS.userName}. All units standby for coordination.`,
                    timestamp: Date.now(),
                    priority: "CRITICAL",
                    status: "ACTIVE"
                });
            });
            await batch.commit();
            alert("TACTICAL SIGNAL INTERCEPTED: All divisions notified.");
        } catch (e) {
            console.error("Intercept failed:", e);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#020305', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* SOS BROADCAST BANNER */}
            {activeSOS && (
                <div style={{ 
                    background: 'linear-gradient(90deg, #ff4d4d, #b91c1c)', 
                    padding: '12px 40px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '2px solid rgba(255,255,255,0.2)',
                    animation: 'pulse 2s infinite',
                    zIndex: 2000
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="status-dot" style={{ background: '#fff', boxShadow: '0 0 10px #fff' }}></div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', color: '#fff' }}>CRITICAL SOS BROADCAST</div>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                                CITIZEN: {activeSOS.userName.toUpperCase()} • LOCATION: {activeSOS.locationName?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleIntercept}
                        style={{ 
                            background: '#fff', 
                            color: '#ff4d4d', 
                            border: 'none', 
                            padding: '8px 25px', 
                            borderRadius: '8px', 
                            fontSize: '11px', 
                            fontWeight: 900, 
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: '0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        INTERCEPT SIGNAL
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            
            {/* SIDEBAR */}
            <aside style={{ width: '280px', background: 'rgba(5, 7, 10, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#ffd700', boxShadow: '0 0 10px #ffd700' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffd700', letterSpacing: '2px' }}>SUPREME COMMAND</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
                    {tabs.map(item => (
                        <div key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '14px 20px', marginBottom: '6px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                background: activeTab === item.id ? 'rgba(255,215,0,0.05)' : 'transparent',
                                borderLeft: `3px solid ${activeTab === item.id ? item.color : 'transparent'}`,
                                transition: '0.2s'
                            }}>
                            <span style={{ fontSize: '18px', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.2)' }}>{item.icon}</span>
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
                <header style={{ padding: '20px 40px', background: 'rgba(4, 5, 8, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div style={{ 
                            fontSize: '11px', fontWeight: 900, 
                            color: globalAlerts.length > 0 ? '#ff4d4d' : '#00e5a0', 
                            background: globalAlerts.length > 0 ? 'rgba(255,77,77,0.1)' : 'rgba(0,229,160,0.1)', 
                            padding: '8px 20px', borderRadius: '20px', 
                            border: `1px solid ${globalAlerts.length > 0 ? 'rgba(255,77,77,0.3)' : 'rgba(0,229,160,0.3)'}`,
                            animation: globalAlerts.length > 0 ? 'pulse 2s infinite' : 'none'
                        }}>
                            {globalAlert}
                        </div>
                        {globalAlerts.length > 0 && (
                            <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaExclamationTriangle className="blink" /> ACTION REQUIRED IN {globalAlerts.length} SECTORS
                            </div>
                        )}
                        <h2 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '3px', margin: 0 }}>WAR ROOM</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#ffd700', fontWeight: 800, letterSpacing: '1px' }}>SUPREME COMMISSIONER OF TRINETRA</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#000', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>
        </div>


            <style>{`
                .glass-panel { background: rgba(10, 12, 18, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
                .metric-card { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); }
                @keyframes pulse-gold { 0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
                .blink { animation: blink 1.2s infinite; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            `}</style>
        </div>
    );
}

function WarRoomView({ incidents, alerts }) {
    const [isSyncing, setIsSyncing] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsSyncing(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const sosIcon = L.divIcon({
        className: 'custom-sos-icon',
        html: `<div style="background-color: #ff4d4d; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #ff4d4d;" class="pulse-fast"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    const normalIcon = L.divIcon({
        className: 'custom-normal-icon',
        html: `<div style="background-color: #4285F4; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4]
    });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'GLOBAL SAFETY', val: '92%', color: '#ffd700', icon: <FaShieldAlt /> },
                    { label: 'TACTICAL ALERTS', val: alerts.length, color: alerts.length > 0 ? '#ff4d4d' : '#00e5a0', icon: <FaExclamationTriangle /> },
                    { label: 'ACTIVE INCIDENTS', val: incidents.length, color: '#ff4d4d', icon: <FaExclamationTriangle /> },
                    { label: 'PERSONNEL', val: '1,420', color: '#4285F4', icon: <FaUsers /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${w.color}15`, borderRadius: '15px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                {/* CENTER MAP AREA */}
                <div className="glass-panel" style={{ height: '550px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)' }}>
                    {isSyncing ? (
                        <div style={{ textAlign: 'center', zIndex: 1, animation: 'pulse 2s infinite' }}>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: '#ffd700', letterSpacing: '2px', marginBottom: '20px', background: 'rgba(255,215,0,0.1)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block' }}>SUPREME INTEL LAYER: ACTIVE SECTOR</div>
                            <FaGlobe size={180} color="#ffd700" style={{ opacity: 0.8, filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.3))' }} className="pulse-fast" />
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '40px', letterSpacing: '4px' }}>[ SATELLITE ENCRYPTION ACTIVE • 256-BIT ]</div>
                        </div>
                    ) : (
                        <MapContainer center={[22.7196, 75.8577]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '15px' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            {incidents.map(t => (
                                <Marker key={t.id} position={[t.lat || t.latitude || 22.7196, t.lng || t.longitude || 75.8577]} icon={t.type === 'SOS' ? sosIcon : normalIcon}>
                                    <Popup>
                                        <div style={{ color: '#000', padding: '10px', width: '200px' }}>
                                            <strong style={{ color: t.type === 'SOS' ? '#ff4d4d' : '#4285F4', fontSize: '14px' }}>{t.type} ALERT</strong><br/>
                                            <div style={{ marginTop: '5px', fontSize: '12px' }}>
                                                <strong>Citizen:</strong> {t.userName}<br/>
                                                <strong>Location:</strong> {t.locationName || 'Indore Sector'}<br/>
                                                <strong>Status:</strong> <span style={{ color: '#ff4d4d', fontWeight: 900 }}>{t.status}</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {/* RIGHT SIDEBAR - ALERTS & LOGS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ flex: 1, padding: '25px', border: alerts.length > 0 ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.05)', background: alerts.length > 0 ? 'rgba(255,77,77,0.02)' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', color: alerts.length > 0 ? '#ff4d4d' : '#fff' }}>EMERGENCY ESCALATIONS</h3>
                                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>LIVE TACTICAL FEED</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {alerts.length > 0 && (
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm("🔴 INITIALIZE TACTICAL PURGE? This will clear all global escalations.")) {
                                                try {
                                                    const batch = writeBatch(db);
                                                    alerts.forEach(a => {
                                                        const ref = doc(db, "divisional_alerts", a.id);
                                                        batch.delete(ref);
                                                    });
                                                    await batch.commit();
                                                } catch (e) { console.error("Purge failed:", e); }
                                            }
                                        }}
                                        style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', fontSize: '9px', fontWeight: 900, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        PURGE ALL
                                    </button>
                                )}
                                {alerts.length > 0 && <div className="blink" style={{ width: '8px', height: '8px', background: '#ff4d4d', borderRadius: '50%' }}></div>}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {alerts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.2, fontSize: '10px', fontWeight: 800 }}>NO ACTIVE ESCALATIONS</div>
                            ) : (
                                alerts.map((a, i) => (
                                    <div key={i} style={{ padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '12px', borderLeft: '4px solid #ff4d4d', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 900, color: '#ff4d4d' }}>{a.type}</span>
                                            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>{new Date(a.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#fff', lineHeight: '1.4' }}>{a.message}</p>
                                        <button 
                                            onClick={async () => {
                                                try { await deleteDoc(doc(db, "divisional_alerts", a.id)); } 
                                                catch (e) { console.error("Delete failed:", e); }
                                            }}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '10px' }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ height: '250px', padding: '25px', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaHistory style={{ opacity: 0.5 }} /> TACTICAL LOGS
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { type: 'SOS', msg: 'Emergency trigger in Vijay Nagar', time: '1m ago', color: '#ff4d4d' },
                                { type: 'AI', msg: 'Unusual gathering at Rajwada', time: '4m ago', color: '#a855f7' },
                                { type: 'SYS', msg: 'SOS Team 4 deployed to Sector 7', time: '12m ago', color: '#00e5a0' }
                            ].map((log, i) => (
                                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: `3px solid ${log.color}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 900, color: log.color }}>{log.type}</span>
                                        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>{log.time}</span>
                                    </div>
                                    <div style={{ fontSize: '10px', fontWeight: 700 }}>{log.msg}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CyberDefenseView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                {[
                    { label: 'NETWORK FIREWALL', val: 'HARDENED', color: '#00e5a0', icon: <FaShieldVirus /> },
                    { label: 'THREAT SCANNER', val: 'CLEAN', color: '#ffd700', icon: <FaNetworkWired /> },
                    { label: 'ENCRYPTION UPLINK', val: 'SECURE', color: '#4285F4', icon: <FaLock /> },
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '30px', color: s.color }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{s.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="glass-panel" style={{ padding: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>GLOBAL THREAT MONITOR</h3>
                <div style={{ background: '#000', padding: '20px', borderRadius: '15px', border: '1px solid rgba(0,229,160,0.1)', fontFamily: 'monospace', height: '300px', overflowY: 'auto', color: '#00e5a0' }}>
                    <div>[INFO] {new Date().toISOString()} : SCANNING_GLOBAL_NODES...</div>
                    <div>[INFO] {new Date().toISOString()} : ENCRYPTING_CITY_UPLINK...</div>
                    <div style={{ color: '#ffd700' }}>[WARN] {new Date().toISOString()} : BRUTE_FORCE_PREVENTED_SECTOR_4.</div>
                    <div className="pulse-fast" style={{ color: '#fff' }}>[LIVE] MONITORING FOR UNAUTHORIZED ACCESS...</div>
                </div>
            </div>
        </div>
    );
}

function NeuralPredictionView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>AI NEURAL PREDICTION HUB</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h4 style={{ color: '#a855f7', fontWeight: 900, fontSize: '12px', marginBottom: '20px' }}>CRIME PROBABILITY HEATMAP</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {['VIJAY NAGAR', 'RAJWADA', 'BHANWARKUAN', 'PALASIA'].map(sector => (
                            <div key={sector} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 900 }}>{sector}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                        <div style={{ width: `${Math.random() * 40 + 10}%`, height: '100%', background: '#a855f7', borderRadius: '2px' }}></div>
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#a855f7', fontWeight: 900 }}>LOW RISK</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <FaBrain size={80} color="#a855f7" className="pulse-fast" style={{ marginBottom: '30px' }} />
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>NEURAL CORE ONLINE</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>AI is currently processing 1,420 situational data points per second to predict potential escalations before they occur.</p>
                </div>
            </div>
        </div>
    );
}

function GlobalSurveillanceView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>GLOBAL SURVEILLANCE OVERVIEW</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map(cam => (
                    <div key={cam} className="glass-panel" style={{ height: '200px', position: 'relative', overflow: 'hidden', background: '#000' }}>
                        <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,77,77,0.8)', padding: '4px 10px', borderRadius: '4px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '5px', zIndex: 1 }}>
                            <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }} className="blink"></div>
                            LIVE CAMERA {cam}
                        </div>
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                            <FaCamera size={50} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>SECTOR_{cam}_FEED_CONNECTED</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TeamManagementView() {
    const [users, setUsers] = useState([]);
    const [provisionForm, setProvisionForm] = useState({ name: "", email: "", password: "", role: "HEAD", division: "1" });
    const [status, setStatus] = useState({ loading: false, msg: "" });
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "users"), where("accountType", "==", "divisional"));
        return onSnapshot(q, s => setUsers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    }, []);

    const specializedTeams = [
        { id: "1", name: "SOS TEAM" },
        { id: "2", name: "Safe Taxi Team" },
        { id: "3", name: "Women Safety Support" },
        { id: "4", name: "Analytics & Monitoring" },
        { id: "5", name: "Cyber Security Team" },
        { id: "6", name: "Helpdesk / Support" },
        { id: "7", name: "COMMISSIONER OFFICE" }
    ];

    const handleProvision = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, msg: "AUTHORIZING COMMAND..." });
        try {
            const userCredential = await firebaseCreateUser(auth, provisionForm.email, provisionForm.password);
            const uid = userCredential.user.uid;
            await setDoc(doc(db, "users", uid), {
                name: provisionForm.name,
                email: provisionForm.email,
                role: "admin",
                accountType: "divisional",
                divisionId: provisionForm.division,
                designation: provisionForm.role,
                createdAt: Date.now(),
                provisionedBy: "Supreme Commissioner"
            });
            setStatus({ loading: false, msg: "CREDENTIALS GENERATED SUCCESSFULLY!" });
            setProvisionForm({ name: "", email: "", password: "", role: "HEAD", division: "1" });
            setTimeout(() => setStatus({ loading: false, msg: "" }), 3000);
        } catch (err) {
            setStatus({ loading: false, msg: "ERROR: " + err.message });
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("TERMINATE THIS AGENT'S ACCESS?")) await deleteDoc(doc(db, "users", id));
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* PROVISIONING FORM */}
            <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px', border: '1px solid rgba(0, 229, 160, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <FaUserPlus size={24} color="#00e5a0" />
                    <h3 style={{ fontSize: '20px', fontWeight: 900 }}>PROVISIONING COMMAND CENTER</h3>
                </div>
                <form onSubmit={handleProvision} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <input type="text" placeholder="OFFICER NAME" required value={provisionForm.name} onChange={e => setProvisionForm({...provisionForm, name: e.target.value})} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                    <input type="email" placeholder="OFFICER EMAIL" required value={provisionForm.email} onChange={e => setProvisionForm({...provisionForm, email: e.target.value})} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showPass ? "text" : "password"} 
                            placeholder="SECURE PASSWORD" 
                            required 
                            value={provisionForm.password} 
                            onChange={e => setProvisionForm({...provisionForm, password: e.target.value})} 
                            style={{ width: '100%', padding: '15px 45px 15px 15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', boxSizing: 'border-box' }} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass(!showPass)} 
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(0,229,160,0.5)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center' }}
                        >
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <select value={provisionForm.role} onChange={e => setProvisionForm({...provisionForm, role: e.target.value})} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}>
                        <option value="HEAD" style={{ background: '#000' }}>DIVISION HEAD</option>
                        <option value="SUB-HEAD" style={{ background: '#000' }}>SUB-HEAD</option>
                        <option value="OFFICER" style={{ background: '#000' }}>FIELD OFFICER</option>
                    </select>
                    <select value={provisionForm.division} onChange={e => setProvisionForm({...provisionForm, division: e.target.value})} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}>
                        {specializedTeams.map(t => <option key={t.id} value={t.id} style={{ background: '#000' }}>{t.name}</option>)}
                    </select>
                    <button type="submit" disabled={status.loading} style={{ padding: '15px', background: '#00e5a0', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 900 }}>
                        {status.loading ? 'AUTHORIZING...' : 'CREATE CREDENTIALS'}
                    </button>
                </form>
                {status.msg && <div style={{ marginTop: '20px', color: status.msg.includes('ERROR') ? '#ff4d4d' : '#00e5a0', fontWeight: 800, textAlign: 'center', fontSize: '12px' }}>{status.msg}</div>}
            </div>

            {/* DIRECTORY LISTING */}
            <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>ACTIVE COMMAND DIRECTORY</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '15px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>OFFICER</th>
                            <th style={{ padding: '15px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>DIVISION</th>
                            <th style={{ padding: '15px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>AUTHORITY</th>
                            <th style={{ padding: '15px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '15px', fontWeight: 700 }}>{u.name}</td>
                                <td style={{ padding: '15px', fontSize: '12px', opacity: 0.6 }}>{specializedTeams.find(t => t.id === u.divisionId)?.name || 'NA'}</td>
                                <td style={{ padding: '15px' }}><span style={{ padding: '4px 10px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '6px', fontSize: '10px', fontWeight: 900 }}>{u.designation}</span></td>
                                <td style={{ padding: '15px' }}>
                                    <button onClick={() => handleDelete(u.id)} style={{ padding: '8px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EmergencyCommandView({ incidents, alerts }) {
    const handleOverride = async (id) => {
        try {
            await setDoc(doc(db, "reports", id), { status: "RESOLVED_BY_SUPREME", resolvedAt: Date.now() }, { merge: true });
            alert("TACTICAL OVERRIDE EXECUTED: Incident marked as Resolved.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeploy = async (divId, divName) => {
        try {
            await setDoc(doc(db, "divisional_alerts", `deploy_${Date.now()}`), {
                type: "SUPREME COMMAND DEPLOYMENT",
                message: `URGENT: Supreme Commissioner has ordered immediate unit deployment for ${divName}.`,
                targetDivision: divId,
                status: "ACTIVE",
                timestamp: Date.now(),
                priority: "CRITICAL"
            });
            alert(`UNIT DEPLOYMENT ORDERED: ${divName} has been notified.`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>EMERGENCY COMMAND CENTER</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#ff4d4d', margin: 0 }}>GLOBAL SOS MONITOR</h4>
                        <button 
                            onClick={async () => {
                                if(window.confirm("SUPREME COMMAND: PERMANENTLY RESOLVE ALL ACTIVE SOS ALERTS?")) {
                                    try {
                                        const activeAlerts = incidents.filter(i => i.status === "ACTIVE" || i.status === "ASSIGNED");
                                        for (const a of activeAlerts) {
                                            await updateDoc(doc(db, "reports", a.id), { status: "RESOLVED_BY_SUPREME", resolvedAt: Date.now() });
                                        }
                                        alert("SUPREME OVERRIDE COMPLETE. ALL ACTIVE LOGS RESOLVED.");
                                    } catch (err) {
                                        console.error(err);
                                        alert("COMMAND ERROR: OVERRIDE FAILED.");
                                    }
                                }
                            }}
                            style={{ padding: '4px 10px', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: '#ff4d4d', fontSize: '9px', fontWeight: 900, cursor: 'pointer' }}
                        >
                            PURGE ALL
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                        {incidents.filter(inc => inc.status !== "RESOLVED_BY_SUPREME").slice(0, 10).map(i => (
                            <div key={i.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1, paddingRight: '20px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#ff4d4d', marginBottom: '4px' }}>{i.type || "EMERGENCY"}</div>
                                    <div style={{ fontSize: '12px', color: '#fff', opacity: 0.8, lineHeight: '1.4' }}>{i.locationName}</div>
                                </div>
                                <button 
                                    onClick={() => handleOverride(i.id)}
                                    style={{ padding: '10px 20px', background: '#ff4d4d', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '10px', fontWeight: 900, cursor: 'pointer', transition: '0.3s' }}
                                    onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                                    onMouseLeave={e => e.target.style.transform='scale(1)'}
                                >
                                    OVERRIDE
                                </button>
                            </div>
                        ))}
                        {incidents.length === 0 && <div style={{ textAlign: 'center', padding: '40px', opacity: 0.3, fontSize: '12px' }}>NO ACTIVE INCIDENTS</div>}
                    </div>
                </div>
                
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#00e5a0', marginBottom: '20px' }}>MULTI-TEAM DISPATCH</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { id: "1", name: "SOS TEAM (DIV-1)" },
                            { id: "3", name: "WOMEN SUPPORT (DIV-3)" },
                            { id: "5", name: "CYBER SECURITY (DIV-5)" },
                            { id: "2", name: "SAFE TAXI (DIV-2)" }
                        ].map(d => (
                            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontWeight: 900, fontSize: '14px' }}>{d.name}</span>
                                <button 
                                    onClick={() => handleDeploy(d.id, d.name)}
                                    style={{ padding: '10px 25px', background: '#00e5a0', border: 'none', borderRadius: '10px', color: '#000', fontSize: '10px', fontWeight: 900, cursor: 'pointer', transition: '0.3s' }}
                                    onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                                    onMouseLeave={e => e.target.style.transform='scale(1)'}
                                >
                                    DEPLOY UNIT
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GlobalAnalyticsView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>CITY-WIDE ANALYTICS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ height: '400px', padding: '30px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#00e5a0', marginBottom: '20px' }}>CRIME TREND ANALYSIS</h4>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #00e5a0, transparent)', borderRadius: '4px' }}></div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>RESPONSE TIME</div>
                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffd700' }}>2.4m</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>SYSTEM UPTIME</div>
                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#00e5a0' }}>99.9%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SecurityAdminView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>SECURITY ADMINISTRATION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <FaServer size={40} color="#6366f1" style={{ marginBottom: '15px' }} />
                    <div style={{ fontWeight: 900 }}>FIREWALL OPS</div>
                    <div style={{ fontSize: '10px', color: '#00e5a0', marginTop: '5px' }}>LEVEL 5 SECURED</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <FaDatabase size={40} color="#ffd700" style={{ marginBottom: '15px' }} />
                    <div style={{ fontWeight: 900 }}>DATABASE MGT</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>ENCRYPTED (AES-256)</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                    <FaTerminal size={40} color="#ff4d4d" style={{ marginBottom: '15px' }} />
                    <div style={{ fontWeight: 900 }}>SEC-LOGS</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>0 THREATS DETECTED</div>
                </div>
            </div>
        </div>
    );
}

function AIControlView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>AI CONTROL CENTER</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FaBrain size={80} color="#a855f7" className="blink" />
                    <h4 style={{ fontWeight: 900, marginTop: '20px' }}>SMART RISK DETECTION</h4>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '10px' }}>AI is monitoring city patterns. Currently analyzing Sector 4 for suspicious movement.</p>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '20px' }}>AUTO-ASSIGNMENT ENGINE</h4>
                    {['Team Alpha', 'Team Beta', 'Team Gamma'].map(t => (
                        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px' }}>{t}</span>
                            <span style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 900 }}>AI OPTIMIZED</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BroadcastSystemView() {
    const [msg, setMsg] = useState("");
    const handleSend = () => { if(msg) alert("GLOBAL BROADCAST EXECUTED: " + msg); setMsg(""); };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>GLOBAL BROADCAST SYSTEM</h3>
            <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <select style={{ padding: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', outline: 'none' }}>
                        <option>CITY-WIDE EMERGENCY ALERT</option>
                        <option>PUBLIC SAFETY ADVISORY</option>
                        <option>DISASTER WARNING (RED)</option>
                    </select>
                    <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="ENTER BROADCAST MESSAGE..." style={{ height: '200px', padding: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', outline: 'none', resize: 'none' }} />
                    <button onClick={handleSend} style={{ padding: '20px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 900, letterSpacing: '2px' }}>EXECUTE SUPREME BROADCAST</button>
                </div>
            </div>
        </div>
    );
}

function PlatformSettingsView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>PLATFORM CONFIGURATION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px' }}>FIREBASE CONTROLS</h4>
                    <button style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 800, marginBottom: '10px' }}>SYNC DATABASE</button>
                    <button style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 800 }}>FLUSH CACHE</button>
                </div>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px' }}>API STATUS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>MAPS API</span> <span style={{ color: '#00e5a0' }}>ONLINE</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>VOICE ENGINE</span> <span style={{ color: '#00e5a0' }}>READY</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SMS GATEWAY</span> <span style={{ color: '#ff4d4d' }}>STANDBY</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GlobalIntelView() { return null; } // Deprecated in favor of new views
function DirectivesView() { return null; } // Deprecated in favor of new views
function DivisionalOversightView() { return null; } // Deprecated in favor of new views
function CommandLogsView() { return null; } // Deprecated in favor of new views

function ProfileView({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', fontWeight: 900, color: '#000', margin: '0 auto 30px' }}>{user?.name?.[0]}</div>
                <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px' }}>{user?.name}</h2>
                <div style={{ fontSize: '14px', color: '#ffd700', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase' }}>Supreme Commissioner</div>
                <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,215,0,0.1)' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>CLEARANCE LEVEL</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffd700' }}>LEVEL 10 (OMEGA)</div>
                </div>
            </div>
        </div>
    );
}

function HeatmapView({ incidents }) {
    const mapCenter = [22.7196, 75.8577]; // Indore Center

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>LIVE CITY HEATMAP</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,77,77,0.1)', padding: '5px 15px', borderRadius: '20px' }}>
                        <div className="status-dot" style={{ background: '#ff4d4d' }}></div> HIGH RISK SECTORS
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#00e5a0', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,229,160,0.1)', padding: '5px 15px', borderRadius: '20px' }}>
                        <div className="status-dot" style={{ background: '#00e5a0' }}></div> PATROLLED AREAS
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ height: '600px', position: 'relative', overflow: 'hidden', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    
                    {/* HEATMAP SIMULATION VIA AGGREGATED CIRCLES */}
                    {incidents.map((inc, i) => {
                        const pos = [inc.lat || inc.latitude || 22.7196, inc.lng || inc.longitude || 75.8577];
                        const isSos = inc.type === 'SOS';
                        
                        return (
                            <React.Fragment key={inc.id || i}>
                                {/* Outer Glow */}
                                <Marker position={pos} icon={L.divIcon({
                                    className: 'heatmap-point',
                                    html: `<div style="
                                        width: ${isSos ? '120px' : '60px'}; 
                                        height: ${isSos ? '120px' : '60px'}; 
                                        background: radial-gradient(circle, ${isSos ? 'rgba(255,77,77,0.4)' : 'rgba(66,133,244,0.3)'} 0%, transparent 70%);
                                        border-radius: 50%;
                                        transform: translate(-50%, -50%);
                                    "></div>`,
                                    iconSize: [0, 0]
                                })} />
                                
                                {/* Inner Core */}
                                <Marker position={pos} icon={L.divIcon({
                                    className: 'heatmap-core',
                                    html: `<div style="
                                        width: 8px; 
                                        height: 8px; 
                                        background: ${isSos ? '#ff4d4d' : '#4285F4'}; 
                                        border-radius: 50%; 
                                        box-shadow: 0 0 10px ${isSos ? '#ff4d4d' : '#4285F4'};
                                        transform: translate(-50%, -50%);
                                    "></div>`,
                                    iconSize: [0, 0]
                                })} />
                            </React.Fragment>
                        );
                    })}
                </MapContainer>

                {/* TACTICAL OVERLAY */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, pointerEvents: 'none' }}>
                    <div style={{ background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '15px', color: '#ffd700' }}>TACTICAL DENSITY OVERLAY</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                                <span style={{ opacity: 0.5 }}>ACTIVE SCAN:</span>
                                <span style={{ color: '#00e5a0' }}>LIVE_FEED_SYNCED</span>
                            </div>
                            <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.5 }}>DATA POINTS:</span>
                                <span>{incidents.length} NODES</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', padding: '15px 25px', borderRadius: '15px', color: '#ff4d4d', fontSize: '10px', fontWeight: 900, backdropFilter: 'blur(10px)' }}>
                        ALERT: HIGH CRIME DENSITY DETECTED IN CENTRAL SECTOR
                    </div>
                </div>
            </div>
        </div>
    );
}

function MissionControlView() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMission, setNewMission] = useState({ title: '', divisionId: '1', target: 'Alpha Unit' });

    useEffect(() => {
        const q = query(collection(db, "divisional_tasks"), orderBy("timestamp", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const deployMission = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "divisional_tasks"), {
                ...newMission,
                status: "ACTIVE",
                issuedBy: "SUPREME COMMISSIONER",
                timestamp: serverTimestamp(),
                assignedTo: newMission.target
            });
            alert("STRATEGIC DIRECTIVE BROADCASTED TO DIVISION " + newMission.divisionId);
            setNewMission({ title: '', divisionId: '1', target: 'Alpha Unit' });
        } catch (err) {
            console.error(err);
            alert("DEPLOYMENT FAILURE: TACTICAL ERROR.");
        }
    };

    const divisionNames = {
        "1": "SOS COMMAND",
        "2": "SAFE TAXI",
        "3": "WOMEN SUPPORT",
        "4": "ANALYTICS",
        "5": "CYBER SEC",
        "6": "HELPDESK"
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>GLOBAL MISSION LOG</h3>
                    {loading ? (
                        <div style={{ color: 'var(--accent)', fontWeight: 900 }}>SYNCING GLOBAL DIRECTIVES...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {missions.map((m, i) => (
                                <div key={m.id} className="glass-panel" style={{ padding: '25px', borderLeft: `4px solid ${m.status === 'Completed' ? '#00e5a0' : '#ff4d4d'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4 }}>DIV_{m.divisionId} • {divisionNames[m.divisionId]}</span>
                                        <span style={{ fontSize: '9px', fontWeight: 900, color: m.status === 'Completed' ? '#00e5a0' : '#ff4d4d' }}>{m.status?.toUpperCase()}</span>
                                    </div>
                                    <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '10px' }}>{m.title}</h4>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Target: <span style={{ color: '#fff', fontWeight: 800 }}>{m.assignedTo}</span></div>
                                    <div style={{ marginTop: '15px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                        <div style={{ width: m.status === 'Completed' ? '100%' : '45%', height: '100%', background: m.status === 'Completed' ? '#00e5a0' : '#ff4d4d', borderRadius: '2px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-panel" style={{ padding: '30px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '25px', color: 'var(--accent)' }}>STRATEGIC DEPLOYMENT</h3>
                    <form onSubmit={deployMission} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="input-group">
                            <label style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '8px', display: 'block' }}>MISSION OBJECTIVE</label>
                            <input 
                                value={newMission.title} onChange={e => setNewMission({...newMission, title: e.target.value})}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} 
                                placeholder="E.g. SECTOR_4_SWEEP" required
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '8px', display: 'block' }}>TARGET DIVISION</label>
                            <select 
                                value={newMission.divisionId} onChange={e => setNewMission({...newMission, divisionId: e.target.value})}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                            >
                                {Object.entries(divisionNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ fontSize: '9px', fontWeight: 900, opacity: 0.4, marginBottom: '8px', display: 'block' }}>DEPLOYMENT UNIT</label>
                            <input 
                                value={newMission.target} onChange={e => setNewMission({...newMission, target: e.target.value})}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }} 
                                placeholder="E.g. ALPHA_UNIT" required
                            />
                        </div>
                        <button type="submit" style={{ marginTop: '10px', padding: '15px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 900, cursor: 'pointer' }}>INITIATE DEPLOYMENT</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function CitizenMessagesView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>CITIZEN COMMUNICATION STREAM</h3>
            <div className="glass-panel" style={{ padding: '0' }}>
                {[
                    { user: 'Amit K.', msg: 'Thank you for the quick response in Sector 4!', time: '5m ago', rating: 5 },
                    { user: 'Priya S.', msg: 'The safe route feature is amazing, feel much safer.', time: '12m ago', rating: 5 },
                    { user: 'Vikram R.', msg: 'Reported a broken street light at M.G. Road.', time: '25m ago', rating: 4 }
                ].map((msg, i) => (
                    <div key={i} style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '5px' }}>{msg.user}</div>
                            <div style={{ fontSize: '12px', opacity: 0.6 }}>{msg.msg}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', opacity: 0.4 }}>{msg.time}</div>
                            <div style={{ color: '#ffd700', marginTop: '5px' }}>{'★'.repeat(msg.rating)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrinetraDataApprovalView() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "deletion_requests"), where("status", "==", "PENDING"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleApproval = async (requestId, userId, action) => {
        try {
            if (action === 'APPROVE') {
                await deleteDoc(doc(db, "users", userId));
                await updateDoc(doc(db, "deletion_requests", requestId), { 
                    status: "APPROVED", 
                    resolvedAt: Date.now() 
                });
                alert("USER PERMANENTLY PURGED FROM TRINETRA ECOSYSTEM.");
            } else {
                await updateDoc(doc(db, "deletion_requests", requestId), { 
                    status: "REJECTED", 
                    resolvedAt: Date.now() 
                });
                alert("DELETION REQUEST DISMISSED.");
            }
        } catch (err) {
            console.error(err);
            alert("TACTICAL ERROR: FAILED TO PROCESS REQUEST.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#00e5a0' }}>SYNCHRONIZING WITH ANALYTICS DATA STREAM...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>DATA PURGE APPROVAL QUEUE</h3>
                <div style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '8px 15px', borderRadius: '10px', fontSize: '11px', fontWeight: 900 }}>
                    {requests.length} PENDING AUTHORIZATIONS
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="glass-panel" style={{ padding: '80px', textAlign: 'center' }}>
                    <FaCheckCircle size={40} color="#00e5a0" style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>NO PENDING DELETION REQUESTS. SYSTEM INTEGRITY VERIFIED.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {requests.map(r => (
                        <div key={r.id} className="glass-panel" style={{ padding: '30px', borderLeft: '4px solid #ff4d4d' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900, letterSpacing: '1px' }}>TARGET CITIZEN</div>
                                    <div style={{ fontSize: '18px', fontWeight: 900 }}>{r.userName}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{r.userEmail}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)' }}>REQUEST_UID</div>
                                    <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>{r.id.substring(0, 8)}</div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: '#fbbc04', marginBottom: '10px' }}>REASON FOR TERMINATION</div>
                                <p style={{ fontSize: '13px', color: '#fff', lineHeight: '1.6', margin: 0 }}>"{r.reason}"</p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => handleApproval(r.id, r.userId, 'APPROVE')}
                                    style={{ flex: 1, padding: '15px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', transition: '0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                                >
                                    APPROVE PURGE
                                </button>
                                <button 
                                    onClick={() => handleApproval(r.id, r.userId, 'REJECT')}
                                    style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}
                                >
                                    DISMISS
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}



