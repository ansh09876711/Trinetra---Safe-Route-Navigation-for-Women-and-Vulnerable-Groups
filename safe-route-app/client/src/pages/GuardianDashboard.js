import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./Landing.css"; // Reuse glassmorphism styles

// Custom Marker Icon
const icon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38]
});

export default function GuardianDashboard() {
    const [liveEvent, setLiveEvent] = useState(null);
    const [arrivedEvent, setArrivedEvent] = useState(null); // Destination reached alert
    const [sosHistory, setSosHistory] = useState([]);
    const [monitoredUser, setMonitoredUser] = useState({ name: "TRINETRA User", mobile: "..." });
    const [isMonitoring, setIsMonitoring] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get("userId");

    // Audio for alerts
    const [alertAudio] = useState(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));
    const [arrivalAudio] = useState(new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3"));

    useEffect(() => {
        if (!userId) return;

        const reportsRef = collection(db, "reports");
        const q = query(reportsRef, where("userId", "==", userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            reports.sort((a, b) => {
                const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.timestamp);
                const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.timestamp);
                return timeB - timeA;
            });
            
            setSosHistory(reports);

            if (reports.length > 0) {
                const latest = reports[0];
                setMonitoredUser({ name: latest.userName, mobile: latest.userMobile });

                const reportTime = latest.createdAt?.toDate ? latest.createdAt.toDate() : new Date(latest.timestamp);
                const isLive = (new Date() - reportTime) < 600000; // 10 min window

                if (isLive && latest.type === "ARRIVED") {
                    // ── Destination Reached Alert ──
                    setArrivedEvent(latest);
                    setLiveEvent(null);
                    try { arrivalAudio.play().catch(() => {}); } catch(e) {}
                    // Auto-dismiss after 30 seconds
                    setTimeout(() => setArrivedEvent(null), 30000);
                } else if (isLive && latest.type !== "ARRIVED") {
                    // ── SOS / Danger Alert ──
                    setLiveEvent(latest);
                    setArrivedEvent(null);
                    if (isMonitoring) {
                        try { alertAudio.play().catch(() => {}); } catch(e) {}
                    }
                } else {
                    setLiveEvent(null);
                }
            }
        });

        return () => {
            unsubscribe();
            alertAudio.pause();
            arrivalAudio.pause();
        };
    }, [userId, isMonitoring, alertAudio, arrivalAudio]);

    const handleLogout = () => navigate("/");

    return (
        <div className="landing-root" style={{ minHeight: '100vh', padding: '20px', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
            {/* Animated Background */}
            <div className="hero-mesh">
                <div className={`hero-orb hero-orb-1 ${liveEvent ? 'danger-pulse' : ''}`} />
                <div className="hero-orb hero-orb-3" />
            </div>

            {/* Header Area */}
            <div style={{ 
                maxWidth: '1200px', margin: '0 auto', display: 'flex', 
                justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px',
                zIndex: 10, position: 'relative'
            }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>GUARDIAN COMMAND</h1>
                    <p style={{ color: 'var(--text3)', fontSize: '14px', margin: '5px 0 0 0' }}>Real-time surveillance & protection</p>
                </div>
                <button onClick={handleLogout} className="nr-btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>
                    Secure Logout
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px', zIndex: 10, position: 'relative' }}>
                
                {/* Left Column: Live Status & Map */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* ── DESTINATION ARRIVED ALERT ── */}
                    {arrivedEvent && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,180,120,0.08))',
                            border: '2px solid #00e5a0',
                            borderRadius: '24px',
                            padding: '20px 25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 0 40px rgba(0,229,160,0.2)',
                            animation: 'pulse-arrived 2s infinite'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ fontSize: '48px' }}>🏁</div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#00e5a0', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        ✅ Safe Arrival Confirmed
                                    </div>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                                        {arrivedEvent.userName} has reached their destination!
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                        📍 {arrivedEvent.destinationName || arrivedEvent.placeName} · {new Date(arrivedEvent.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setArrivedEvent(null)}
                                style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, fontWeight: 700 }}
                            >✕</button>
                        </div>
                    )}

                    {/* User Status Card */}
                    <div style={{ 
                        background: 'var(--glass)', padding: '25px', borderRadius: '24px', 
                        border: liveEvent ? '2px solid #ff4444' : '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backdropFilter: 'blur(20px)', boxShadow: liveEvent ? '0 0 30px rgba(255,68,68,0.2)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ 
                                width: '60px', height: '60px', borderRadius: '20px', 
                                background: liveEvent ? '#ff4444' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                            }}>{liveEvent ? '🚨' : '👤'}</div>
                            <div>
                                <h3 style={{ fontSize: '20px', margin: 0 }}>{monitoredUser.name}</h3>
                                <p style={{ color: liveEvent ? '#ff4444' : 'var(--text3)', margin: '4px 0 0 0', fontWeight: liveEvent ? 800 : 400 }}>
                                    {liveEvent ? 'DANGER DETECTED' : 'CURRENTLY SAFE'}
                                </p>
                            </div>
                        </div>

                        {/* Vital Stats Simulation */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Battery</div>
                                <div style={{ fontWeight: 700, color: '#22c55e' }}>84%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Signal</div>
                                <div style={{ fontWeight: 700, color: '#22c55e' }}>LTE+</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        <button className="nr-btn-primary" style={{ background: '#22c55e', border: 'none', height: '60px', borderRadius: '18px', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => window.open(`tel:${monitoredUser.mobile}`)}>
                            📞 Call User
                        </button>
                        <button className="nr-btn-primary" style={{ background: '#ff4444', border: 'none', height: '60px', borderRadius: '18px', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => window.open(`tel:100`)}>
                            🚓 Alert Police
                        </button>
                        <button className="nr-btn-primary" style={{ background: '#25D366', border: 'none', height: '60px', borderRadius: '18px', color: '#fff', fontWeight: 800, cursor: 'pointer' }} onClick={() => window.open(`https://wa.me/${monitoredUser.mobile}`)}>
                            💬 WhatsApp
                        </button>
                    </div>

                    {/* Smart Insights Panel */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ background: 'var(--glass)', padding: '15px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 800 }}>AI RISK ASSESSMENT</div>
                            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '5px', color: liveEvent ? '#ff4444' : '#22c55e' }}>
                                {liveEvent ? "HIGH ALERT" : "MINIMAL RISK"}
                            </div>
                        </div>
                        <div style={{ background: 'var(--glass)', padding: '15px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 800 }}>NEAREST HELP NODE</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '5px' }}>
                                {liveEvent ? (
                                    (() => {
                                        // Dynamic stations for Indore & Bhopal
                                        const stations = [
                                            { name: "Dwarkapuri Police", lat: 22.6800, lng: 75.8300 },
                                            { name: "Annapurna Police", lat: 22.6950, lng: 75.8350 },
                                            { name: "TT Nagar Police", lat: 23.2599, lng: 77.4126 },
                                            { name: "Habibganj Police", lat: 23.2333, lng: 77.4340 }
                                        ];
                                        // Simple distance calculation to find nearest
                                        const nearest = stations.reduce((prev, curr) => {
                                            const dPrev = Math.sqrt((prev.lat - liveEvent.lat)**2 + (prev.lng - liveEvent.lng)**2);
                                            const dCurr = Math.sqrt((curr.lat - liveEvent.lat)**2 + (curr.lng - liveEvent.lng)**2);
                                            return dCurr < dPrev ? curr : prev;
                                        });
                                        return `${nearest.name} (Active)`;
                                    })()
                                ) : "System Standby"}
                            </div>
                        </div>
                    </div>

                    {/* Live Tracking / Map Container */}
                    <div style={{ 
                        background: 'var(--glass)', borderRadius: '30px', overflow: 'hidden', 
                        height: '450px', border: '1px solid var(--border)', position: 'relative',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {!liveEvent ? (
                            <div style={{ 
                                height: '100%', display: 'flex', flexDirection: 'column', 
                                alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px'
                            }}>
                                <div style={{ fontSize: '80px', marginBottom: '20px', opacity: 0.5 }}>🛡️</div>
                                <h2 style={{ margin: 0 }}>No Active Threats</h2>
                                <p style={{ color: 'var(--text3)', maxWidth: '300px', margin: '15px 0' }}>The user is in a safe state. Tracking will activate automatically during an SOS.</p>
                                {!isMonitoring && (
                                    <button onClick={() => setIsMonitoring(true)} className="nr-btn-primary" style={{ marginTop: '10px', padding: '12px 30px', borderRadius: '14px', background: 'var(--accent)', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                                        Start Active Monitoring
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                                <MapContainer center={[liveEvent.lat, liveEvent.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[liveEvent.lat, liveEvent.lng]} icon={icon}>
                                        <Popup>
                                            <b>DANGER: {monitoredUser.name}</b><br/>
                                            Location: {liveEvent.placeName}
                                        </Popup>
                                    </Marker>
                                    <Circle center={[liveEvent.lat, liveEvent.lng]} radius={200} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />
                                </MapContainer>
                                
                                <div style={{ 
                                    position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 1000,
                                    background: 'rgba(0,0,0,0.85)', padding: '20px', borderRadius: '20px',
                                    border: '1px solid #ff4444', backdropFilter: 'blur(10px)'
                                }}>
                                    <div style={{ color: '#ff4444', fontWeight: 800, marginBottom: '5px' }}>🚨 EMERGENCY LOCATION</div>
                                    <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '15px' }}>{liveEvent.placeName}</div>
                                    <button 
                                        onClick={() => window.open(`https://www.google.com/maps?q=${liveEvent.lat},${liveEvent.lng}`)}
                                        style={{ width: '100%', padding: '12px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                                    >Navigate in Google Maps</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: SOS Timeline */}
                <div style={{ 
                    background: 'var(--glass)', padding: '25px', borderRadius: '30px', 
                    border: '1px solid var(--border)', height: 'fit-content', maxHeight: '720px', 
                    overflowY: 'auto', backdropFilter: 'blur(20px)'
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', margin: 0 }}>
                        <span>🕒</span> Incident History
                    </h3>
                    
                    {sosHistory.length === 0 ? (
                        <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '40px 0' }}>No past incidents.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            {sosHistory.map((report, idx) => (
                                <div key={report.id} style={{ 
                                    padding: '15px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
                                    borderLeft: (idx === 0 && liveEvent) ? '4px solid #ff4444' : '4px solid #6366f1',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 800, marginBottom: '6px' }}>
                                        {new Date(report.createdAt?.toDate ? report.createdAt.toDate() : report.timestamp).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                                        {report.placeName ? report.placeName.split(',')[0] : "Unknown Location"}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>SOS Signal Sent</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <style>{`
                .danger-pulse {
                    animation: pulse-danger 2s infinite !important;
                }
                @keyframes pulse-danger {
                    0% { transform: scale(1); background: rgba(255, 0, 0, 0.4); }
                    50% { transform: scale(1.3); background: rgba(255, 0, 0, 0.8); box-shadow: 0 0 50px rgba(255,0,0,0.5); }
                    100% { transform: scale(1); background: rgba(255, 0, 0, 0.4); }
                }
                @keyframes pulse-arrived {
                    0% { box-shadow: 0 0 20px rgba(0,229,160,0.2); }
                    50% { box-shadow: 0 0 50px rgba(0,229,160,0.5), 0 0 80px rgba(0,229,160,0.2); }
                    100% { box-shadow: 0 0 20px rgba(0,229,160,0.2); }
                }
                .nr-btn-primary:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
}
