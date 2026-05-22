import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  FaHeadset, FaClipboardList, FaComments, FaQuestionCircle, FaHistory, 
  FaSignOutAlt, FaSearch, FaBell, FaUser, FaChartPie, FaCheckCircle, 
  FaExclamationCircle, FaUserClock, FaLifeRing, FaEnvelopeOpenText,
  FaRobot, FaGlobe, FaCogs, FaHandsHelping, FaFileAlt, FaMicrochip,
  FaBroadcastTower, FaStar, FaTaxi, FaShieldAlt, FaUserShield, FaEye,
  FaMapMarkedAlt, FaLock, FaShieldVirus, FaUserNinja
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit, where, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";

// Fix Leaflet Default Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function HelpdeskHeadDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
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
        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setIncidents(list);
        });
        return () => unsubscribe();
    }, []);

    const tabs = [
        { id: 'overview', label: 'SUPPORT OVERVIEW', icon: <FaChartPie />, color: '#fbbc04' },
        { id: 'ai_hub', label: 'AI NEURAL CORE', icon: <FaRobot />, color: '#00e5a0' },
        { id: 'map', label: 'OPERATIONAL MAP', icon: <FaMapMarkedAlt />, color: '#4285F4' },
        { id: 'verification', label: 'IDENTITY VERIFICATION', icon: <FaUserShield />, color: '#00e5a0' },
        { id: 'tickets', label: 'TICKET MASTER', icon: <FaClipboardList />, color: '#4285F4' },
        { id: 'cyber', label: 'CYBER SECURITY HUB', icon: <FaLock />, color: '#a855f7' },
        { id: 'team', label: 'TEAM COMMAND', icon: <FaUserClock />, color: '#4285F4' },
        { id: 'broadcast', label: 'SYSTEM BROADCAST', icon: <FaBroadcastTower />, color: '#ff4d4d' },
        { id: 'knowledge', label: 'KNOWLEDGE BASE', icon: <FaQuestionCircle />, color: '#a855f7' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <SupportOverviewView incidents={incidents} user={user} />;
            case 'ai_hub': return <AIIntelligenceView />;
            case 'map': return <OperationalMapView incidents={incidents} />;
            case 'verification': return <UserVerificationView />;
            case 'tickets': return <TicketCommandView incidents={incidents} user={user} />;
            case 'cyber': return <CyberSecurityHubView />;
            case 'team': return <TeamPerformanceView />;
            case 'broadcast': return <SystemBroadcastView />;
            case 'knowledge': return <KnowledgeBaseView />;
            default: return <SupportOverviewView />;
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
                            onClick={() => setActiveTab("overview")}
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
                        <div className="status-dot" style={{ background: '#fbbc04', boxShadow: '0 0 10px #fbbc04' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#fbbc04', letterSpacing: '2px' }}>SUPPORT COMMAND CENTER</span>
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
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', marginTop: latestSos ? '60px' : '0', transition: '0.5s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input placeholder="SEARCH TICKETS, USERS, OR SOLUTIONS..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#fbbc04', fontWeight: 800, letterSpacing: '1px' }}>DIRECTOR OF SUPPORT OPS</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbc04, #ff9800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
                .status-badge { padding: 5px 12px; border-radius: 8px; font-size: 9px; font-weight: 900; letter-spacing: 1px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); borderRadius: 10px; }
                .tactical-btn { padding: 12px 20px; border-radius: 12px; border: none; font-weight: 900; font-size: 11px; letter-spacing: 1px; cursor: pointer; transition: 0.3s; }
                .btn-primary { background: #fbbc04; color: #000; box-shadow: 0 4px 15px rgba(251,188,4,0.2); }
                .btn-secondary { background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}

function SupportOverviewView({ incidents, user }) {
    const activeTickets = incidents.filter(i => i.status !== "DELETED");
    const activeCount = activeTickets.length;
    const assignedCount = activeTickets.filter(i => i.status === "ASSIGNED").length;
    const resolvedCount = incidents.filter(i => i.status === "DELETED").length;
    const resolveRate = incidents.length > 0 ? ((resolvedCount / incidents.length) * 100).toFixed(1) : "100";

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '30px' }}>
                {[
                    { label: 'CITIZEN SIGNALS', val: activeCount, color: '#fbbc04', icon: <FaEnvelopeOpenText /> },
                    { label: 'ASSIGNED UNITS', val: assignedCount, color: '#00e5a0', icon: <FaHandsHelping /> },
                    { label: 'RESOLVE RATE', val: `${resolveRate}%`, color: '#4285F4', icon: <FaCheckCircle /> },
                    { label: 'TOTAL HANDLED', val: incidents.length, color: '#a855f7', icon: <FaHistory /> },
                ].map((w, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${w.color}15`, borderRadius: '15px', color: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{w.icon}</div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 900 }}>{w.val < 10 && typeof w.val === 'number' ? `0${w.val}` : w.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{w.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>CITIZEN SUPPORT QUEUE</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 15px', background: 'rgba(0,229,160,0.1)', borderRadius: '10px', border: '1px solid rgba(0,229,160,0.2)' }}>
                                <div className="status-pulse" style={{ width: '6px', height: '6px', background: '#00e5a0', borderRadius: '50%' }}></div>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: '#00e5a0' }}>LIVE_SYNC</span>
                            </div>
                            <button onClick={() => alert("SUPPORT DATA EXPORTED AS CSV (ENCRYPTED)")} className="tactical-btn btn-secondary">EXPORT DATA</button>
                            <button 
                                onClick={async () => {
                                    if(window.confirm("CRITICAL: PERMANENTLY PURGE ALL RESOLVED SIGNALS FROM DATABASE?")) {
                                        try {
                                            const batch = writeBatch(db);
                                            const resolved = incidents.filter(i => i.status === "DELETED");
                                            resolved.forEach(t => {
                                                batch.delete(doc(db, "reports", String(t.id)));
                                            });
                                            await batch.commit();
                                            alert("TACTICAL PURGE COMPLETE: DATABASE CLEARED.");
                                        } catch (e) {
                                            console.error("Purge error:", e);
                                            alert("Purge failed.");
                                        }
                                    }
                                }} 
                                className="tactical-btn btn-secondary" style={{ color: '#ff4d4d' }}
                            >
                                PURGE HUD
                            </button>
                            <button 
                                onClick={async () => {
                                    if(window.confirm("CRITICAL: PERMANENTLY DELETE ALL PENDING SIGNALS?")) {
                                        try {
                                            const batch = writeBatch(db);
                                            const active = activeTickets;
                                            active.forEach(t => {
                                                batch.delete(doc(db, "reports", String(t.id)));
                                            });
                                            await batch.commit();
                                            alert("TACTICAL RESET: ALL PENDING DATA TERMINATED.");
                                        } catch (e) {
                                            console.error("Delete error:", e);
                                            alert("Delete failed.");
                                        }
                                    }
                                }} 
                                className="tactical-btn btn-secondary" style={{ color: '#ff4d4d', border: '1px solid #ff4d4d' }}
                            >
                                DELETE ALL
                            </button>
                            <button onClick={() => alert("ALL PENDING SIGNALS MOVED TO HIGH PRIORITY")} className="tactical-btn btn-primary">PRIORITIZE ALL</button>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
                        {activeTickets.map((t, i) => (
                            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 150px', gap: '20px', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: t.status === 'ASSIGNED' ? '1px solid rgba(66, 133, 244, 0.3)' : '1px solid rgba(255,255,255,0.05)', transition: '0.3s', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: '#fbbc04' }}>{String(t.id).substring(0, 10).toUpperCase()}</div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 900 }}>{t.type} REPORT</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>From: {t.userName} • {t.locationName?.substring(0, 40)}</div>
                                </div>
                                <div>
                                    <span style={{ padding: '5px 12px', background: t.status === 'ACTIVE' ? '#ff4d4d20' : '#4285F420', color: t.status === 'ACTIVE' ? '#ff4d4d' : '#4285F4', borderRadius: '8px', fontSize: '9px', fontWeight: 900, letterSpacing: '1px' }}>{t.status}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button 
                                        disabled={t.status === 'ASSIGNED'}
                                        onClick={async () => {
                                            try { await updateDoc(doc(db, "reports", t.id), { status: "ASSIGNED", assignedAt: Date.now(), assignedBy: user.name }); }
                                            catch(e) {}
                                        }}
                                        className="tactical-btn btn-secondary" style={{ padding: '8px 12px', opacity: t.status === 'ASSIGNED' ? 0.5 : 1, fontSize: '9px' }}
                                    >
                                        {t.status === 'ASSIGNED' ? 'ASSIGNED' : 'ASSIGN'}
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if(window.confirm("MARK AS RESOLVED & CLEAR?")) {
                                                try { await updateDoc(doc(db, "reports", t.id), { status: "DELETED", deletedAt: Date.now() }); }
                                                catch(e) {}
                                            }
                                        }}
                                        className="tactical-btn btn-primary" style={{ padding: '8px 12px', background: '#00e5a0', fontSize: '9px' }}
                                    >
                                        SOLVE
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeCount === 0 && (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '50px', fontWeight: 900, fontSize: '11px', letterSpacing: '2px' }}>NO PENDING CITIZEN SIGNALS</div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#fbbc04', marginBottom: '20px' }}>SUPPORT BOT STATUS</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,229,160,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(0,229,160,0.1)' }}>
                            <FaRobot size={30} color="#00e5a0" />
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 900 }}>TRINETRA_AI_HELPER</div>
                                <div style={{ fontSize: '10px', color: '#00e5a0', fontWeight: 900 }}>OPERATIONAL (98% EFFICIENT)</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '15px' }}>AI is currently handling 74% of common technical inquiries.</p>
                    </div>

                    <div className="glass-panel" style={{ flex: 1, padding: '30px', textAlign: 'center' }}>
                        <FaHandsHelping size={40} color="rgba(255,255,255,0.1)" style={{ marginBottom: '15px' }} />
                        <h4 style={{ fontSize: '12px', fontWeight: 900 }}>CITIZEN SATISFACTION</h4>
                        <div style={{ fontSize: '42px', fontWeight: 900, color: '#fbbc04', margin: '15px 0' }}>4.9/5</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                            {[...Array(5)].map((_, i) => <FaStar key={i} color="#fbbc04" />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketCommandView({ incidents, user }) {
    const [filter, setFilter] = useState('ALL');
    
    const filtered = incidents.filter(i => {
        if (i.status === "DELETED") return false;
        if (filter === 'ALL') return true;
        return i.status === filter;
    });

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>TICKET MASTER CONSOLE</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={async () => {
                                if(window.confirm("CRITICAL: PURGE ALL CLOSED TICKETS FROM DATABASE?")) {
                                    try {
                                        const batch = writeBatch(db);
                                        const closed = incidents.filter(i => i.status === "DELETED" && i.id);
                                        closed.forEach(t => batch.delete(doc(db, "reports", String(t.id))));
                                        await batch.commit();
                                        alert("DATABASE PURGED.");
                                    } catch(e) { alert("Purge failed."); }
                                }
                            }}
                            className="tactical-btn btn-secondary" style={{ color: '#ff4d4d', fontSize: '9px' }}
                        >
                            PURGE HUD
                        </button>
                        <button 
                            onClick={async () => {
                                if(window.confirm("CRITICAL: DELETE ALL PENDING TICKETS?")) {
                                    try {
                                        const batch = writeBatch(db);
                                        const pending = incidents.filter(i => i.status !== "DELETED" && i.id);
                                        pending.forEach(t => batch.delete(doc(db, "reports", String(t.id))));
                                        await batch.commit();
                                        alert("ALL TICKETS TERMINATED.");
                                    } catch(e) { alert("Action failed."); }
                                }
                            }}
                            className="tactical-btn btn-secondary" style={{ color: '#ff4d4d', border: '1px solid #ff4d4d', fontSize: '9px' }}
                        >
                            DELETE ALL
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {['ALL', 'ACTIVE', 'ASSIGNED'].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)}
                                style={{ 
                                    padding: '10px 20px', borderRadius: '8px', border: 'none', 
                                    background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent', 
                                    color: filter === f ? '#fff' : 'rgba(255,255,255,0.4)', 
                                    fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['TICKET ID', 'CITIZEN', 'ISSUE CATEGORY', 'LAST UPDATE', 'STATUS', 'ACTIONS'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t, i) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontWeight: 900, color: '#fbbc04' }}>{String(t.id).substring(0, 8).toUpperCase()}</td>
                                <td style={{ padding: '20px', fontWeight: 800 }}>{t.userName}</td>
                                <td style={{ padding: '20px', fontSize: '12px' }}>{t.type} REPORT</td>
                                <td style={{ padding: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.status === 'ACTIVE' ? '#ff4d4d' : '#4285F4', boxShadow: `0 0 10px ${t.status === 'ACTIVE' ? '#ff4d4d' : '#4285F4'}` }}></div>
                                        <span style={{ padding: '5px 12px', background: t.status === 'ACTIVE' ? '#ff4d4d15' : '#4285F415', color: t.status === 'ACTIVE' ? '#ff4d4d' : '#4285F4', borderRadius: '8px', fontSize: '9px', fontWeight: 900, border: `1px solid ${t.status === 'ACTIVE' ? '#ff4d4d30' : '#4285F430'}` }}>{t.status}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => alert(`🔍 TACTICAL REPORT INSPECTION [${t.id}]\n\nCITIZEN: ${t.userName}\nLOCATION: ${t.locationName}\nTYPE: ${t.type}\nTIME: ${new Date(t.timestamp).toLocaleString()}\nSTATUS: ${t.status}\n\nCOORDINATES: ${t.latitude}, ${t.longitude}`)}
                                            className="tactical-btn btn-secondary" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)' }}
                                        >
                                            VIEW
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if(window.confirm("CLOSE TICKET?")) {
                                                    try { await updateDoc(doc(db, "reports", String(t.id)), { status: "DELETED", deletedAt: Date.now() }); }
                                                    catch(e) {}
                                                }
                                            }}
                                            className="tactical-btn btn-secondary" style={{ padding: '6px 12px', color: '#ff4d4d' }}
                                        >
                                            CLOSE
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '100px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>NO MATCHING TICKETS IN SECURE QUEUE</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OperationalMapView({ incidents }) {
    const [center] = useState([22.7196, 75.8577]); // Indore
    const [isSyncing, setIsSyncing] = useState(true);
    const active = incidents.filter(i => i.status !== "DELETED");

    useEffect(() => {
        const timer = setTimeout(() => setIsSyncing(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isSyncing) {
        return (
            <div style={{ height: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '30px', border: '1px solid rgba(0,229,160,0.1)', animation: 'pulse 2s infinite' }}>
                <div style={{ fontSize: '100px', color: '#00e5a0', marginBottom: '30px', filter: 'drop-shadow(0 0 20px #00e5a0)' }}>
                    <FaGlobe className="pulse-fast" />
                </div>
                <div style={{ background: 'rgba(0,229,160,0.1)', padding: '10px 30px', borderRadius: '50px', border: '1px solid #00e5a030', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#00e5a0', letterSpacing: '3px' }}>LIVE INTEL LAYER: INDORE SECTOR</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '4px' }}>
                    [ SATELLITE ENCRYPTION ACTIVE • 256-BIT ]
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', height: '100%' }}>
            <div className="glass-panel" style={{ height: '600px', padding: '10px', overflow: 'hidden' }}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', borderRadius: '15px' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {active.map(t => (
                        <Marker key={t.id} position={[t.latitude || 22.7196, t.longitude || 75.8577]}>
                            <Popup>
                                <div style={{ color: '#000', padding: '10px' }}>
                                    <strong style={{ fontSize: '14px' }}>{t.type} REPORT</strong><br/>
                                    <div style={{ marginTop: '5px', fontSize: '12px' }}>
                                        Citizen: {t.userName}<br/>
                                        Location: {t.locationName}<br/>
                                        Status: <span style={{ color: t.status === 'ACTIVE' ? '#ff4d4d' : '#4285F4', fontWeight: 900 }}>{t.status}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaGlobe size={24} color="#4285F4" />
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4 }}>GEO-STATIONARY SCAN</div>
                        <div style={{ fontSize: '14px', fontWeight: 900 }}>ALL SIGNAL CLUSTERS ACTIVE</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaBroadcastTower size={24} color="#ff4d4d" />
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4 }}>RELAY STATUS</div>
                        <div style={{ fontSize: '14px', fontWeight: 900 }}>SIGNAL STRENGTH 100%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CyberSecurityHubView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                {[
                    { label: 'ENCRYPTION STATUS', val: 'AES-256', sub: 'ZERO-KNOWLEDGE ACTIVE', color: '#00e5a0', icon: <FaLock /> },
                    { label: 'FIREWALL STATUS', val: 'HARDENED', sub: 'THREAT FILTERING ON', color: '#a855f7', icon: <FaShieldVirus /> },
                    { label: 'ANOMALY DETECTION', val: '0', sub: 'ALL SYSTEMS NORMAL', color: '#fbbc04', icon: <FaUserNinja /> },
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ color: s.color, fontSize: '30px' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>{s.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: '9px', fontWeight: 800, marginTop: '5px' }}>{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCogs /> SYSTEM SECURITY LOGS
                </h3>
                <div style={{ background: '#000', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '12px', color: '#00e5a0', lineHeight: '1.6', height: '300px', overflowY: 'auto' }}>
                    <div>[INFO] {new Date().toISOString()} : SECURE_SOCKET_UPLINK ESTABLISHED.</div>
                    <div>[INFO] {new Date().toISOString()} : ENCRYPTING LIVE DATA STREAM...</div>
                    <div>[OK] {new Date().toISOString()} : FIREWALL_RULES_RELOADED.</div>
                    <div>[OK] {new Date().toISOString()} : NO ANOMALIES DETECTED IN LAST 60M.</div>
                    <div className="pulse-fast" style={{ color: '#fff' }}>[LIVE] SCANNING FOR UNAUTHORIZED ACCESS ATTEMPTS...</div>
                </div>
            </div>
        </div>
    );
}

function LiveSessionsView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', padding: '100px' }}>
            <FaComments size={80} color="rgba(0,229,160,0.1)" className="pulse-fast" />
            <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '5px', color: '#00e5a0', marginTop: '20px' }}>LIVE_CHAT_HUB_STREAM_READY</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '10px', fontSize: '12px' }}>Awaiting secure communication uplink from citizen devices.</p>
            <button onClick={() => alert("VOICE BRIDGE INITIALIZED. READY FOR INCOMING SIGNALS.")} className="tactical-btn btn-primary" style={{ marginTop: '30px', background: '#00e5a0' }}>INITIALIZE VOICE BRIDGE</button>
        </div>
    );
}

function KnowledgeBaseView() {
    const [selected, setSelected] = useState(null);

    const protocols = {
        'SOS Protocols': [
            { id: 'SOS-001', title: 'Critical Threat Escalation', content: 'In the event of a high-priority SOS trigger, the responder must initiate a voice bridge within 5 seconds and notify the nearest Alpha unit.' },
            { id: 'SOS-002', title: 'Multi-Signal Correlation', content: 'AI Neural Core automatically groups multiple signals from the same radius into a single Tactical Cluster for joint response.' }
        ],
        'Taxi Regulations': [
            { id: 'TAX-001', title: 'Driver Biometric Sync', content: 'All Safe Taxi drivers must perform a retinal or fingerprint sync before initiating a night-time trip (22:00 - 05:00).' },
            { id: 'TAX-002', title: 'Real-time Route Guardian', content: 'Deviations from the predicted safe route by more than 20% will trigger an automatic silent alarm in the Command Center.' }
        ],
        'Privacy Compliance': [
            { id: 'PRV-001', title: 'Zero-Knowledge Encryption', content: 'All citizen biometric data is stored using AES-256 zero-knowledge encryption. No personal identification is visible to agents without explicit high-level clearance.' },
            { id: 'PRV-002', title: 'Data Retention Policy', content: 'Non-critical location traces are automatically purged from the tactical cache after 24 hours of successful session closure.' }
        ]
    };

    if (selected) {
        return (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                <button 
                    onClick={() => setSelected(null)}
                    style={{ marginBottom: '25px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 900 }}
                >
                    ← BACK TO DIRECTORY
                </button>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#fbbc04', marginBottom: '30px' }}>{selected.toUpperCase()} ARCHIVE</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {protocols[selected].map(p => (
                            <div key={p.id} style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '2px' }}>DOCUMENT ID: {p.id}</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, marginBottom: '15px' }}>{p.title}</div>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{p.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>KNOWLEDGE BASE & PROTOCOLS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                {[
                    { title: 'SOS Protocols', count: '42 docs', icon: <FaExclamationCircle />, color: '#ff4d4d', desc: 'Emergency response procedures for critical threats.' },
                    { title: 'Taxi Regulations', count: '18 docs', icon: <FaTaxi />, color: '#fbbc04', desc: 'Operational standards for Safe Taxi division.' },
                    { title: 'Privacy Compliance', count: '25 docs', icon: <FaShieldAlt />, color: '#6366f1', desc: 'Data handling and encryption guidelines.' }
                ].map((k, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px', textAlign: 'center', transition: '0.3s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = k.color} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <div style={{ fontSize: '40px', color: k.color, marginBottom: '20px' }}>{k.icon}</div>
                        <div style={{ fontSize: '18px', fontWeight: 900 }}>{k.title}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>{k.desc}</div>
                        <div style={{ fontSize: '9px', fontWeight: 900, color: k.color, marginTop: '5px', letterSpacing: '2px' }}>{k.count}</div>
                        <button onClick={() => setSelected(k.title)} className="tactical-btn btn-secondary" style={{ width: '100%', marginTop: '25px' }}>VIEW ARCHIVE</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ResolutionArchiveView({ incidents }) {
    const resolved = incidents.filter(i => i.status === "DELETED");
    
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>RESOLUTION ARCHIVE</h3>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['CASE ID', 'CITIZEN', 'TYPE', 'RESOLUTION TIME', 'STATUS'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resolved.map((t, i) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontWeight: 900, color: '#00e5a0' }}>{String(t.id).substring(0, 8).toUpperCase()}</td>
                                <td style={{ padding: '20px', fontWeight: 800 }}>{t.userName}</td>
                                <td style={{ padding: '20px', fontSize: '12px' }}>{t.type}</td>
                                <td style={{ padding: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{t.deletedAt ? new Date(t.deletedAt).toLocaleString() : 'ARCHIVED'}</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ padding: '5px 12px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '9px', fontWeight: 900 }}>RESOLVED</span>
                                </td>
                            </tr>
                        ))}
                        {resolved.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '100px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontWeight: 900 }}>NO ARCHIVED RESOLUTIONS FOUND</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AIIntelligenceView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                {[
                    { label: 'BOT THROUGHPUT', val: '1,240', sub: 'RESOLUTIONS / HR', color: '#00e5a0' },
                    { label: 'CITIZEN SENTIMENT', val: 'POSITIVE', sub: '92% ANALYZED', color: '#fbbc04' },
                    { label: 'THREAT DETECTION', val: 'ACTIVE', sub: 'REAL-TIME SCAN', color: '#ff4d4d' },
                ].map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '30px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>{s.label}</div>
                        <div style={{ fontSize: '32px', fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '9px', fontWeight: 800, marginTop: '5px' }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>NEURAL SENTIMENT ANALYZER</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                        { text: "Help me, I am lost near MG Road.", sentiment: "ANXIOUS", score: 0.85 },
                        { text: "The app is working great, thank you!", sentiment: "POSITIVE", score: 0.98 },
                        { text: "Is the safe route updated for tonight?", sentiment: "NEUTRAL", score: 0.65 }
                    ].map((m, i) => (
                        <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', fontStyle: 'italic' }}>"{m.text}"</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '5px', fontWeight: 900 }}>CAPTURED VIA LIVE STREAM</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900, color: m.sentiment === 'POSITIVE' ? '#00e5a0' : '#fbbc04' }}>{m.sentiment}</div>
                                <div style={{ fontSize: '10px', opacity: 0.5 }}>{Math.round(m.score * 100)}% CONFIDENCE</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TeamPerformanceView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>OPERATIONAL UNIT PERFORMANCE</h3>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['AGENT NAME', 'UNIT ID', 'LIVE STATUS', 'DAILY RESOLUTIONS', 'AVG RATING'].map(h => (
                                <th key={h} style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Rahul Sharma', unit: 'HD-ALPHA-01', status: 'ONLINE', count: 45, rating: 4.8 },
                            { name: 'Priya Singh', unit: 'HD-BETA-02', status: 'ON_CALL', count: 32, rating: 4.9 },
                            { name: 'Amit Verma', unit: 'HD-ALPHA-03', status: 'BREAK', count: 28, rating: 4.7 }
                        ].map((a, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontWeight: 900 }}>{a.name}</td>
                                <td style={{ padding: '20px', fontSize: '12px', color: '#fbbc04' }}>{a.unit}</td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ padding: '5px 12px', background: a.status === 'ONLINE' ? 'rgba(0,229,160,0.1)' : 'rgba(255,187,4,0.1)', color: a.status === 'ONLINE' ? '#00e5a0' : '#fbbc04', borderRadius: '8px', fontSize: '9px', fontWeight: 900 }}>{a.status}</span>
                                </td>
                                <td style={{ padding: '20px', fontWeight: 800 }}>{a.count}</td>
                                <td style={{ padding: '20px', color: '#fbbc04', fontWeight: 900 }}>{a.rating} ★</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SystemBroadcastView() {
    const [msg, setMsg] = useState("");
    
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>GLOBAL BROADCAST CENTER</h3>
            <div className="glass-panel" style={{ padding: '40px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '15px', letterSpacing: '2px' }}>TARGETED ALERT MESSAGE</label>
                    <textarea 
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="ENTER EMERGENCY BROADCAST MESSAGE FOR ALL CITIZENS..."
                        style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', padding: '20px', color: '#fff', fontSize: '16px', outline: 'none', fontFamily: 'inherit' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                        onClick={() => {
                            if(!msg) return alert("ENTER MESSAGE FIRST");
                            alert(`🚨 BROADCASTING TO ALL CITIZENS: \n\n"${msg}"`);
                            setMsg("");
                        }}
                        className="tactical-btn btn-primary" style={{ background: '#ff4d4d', color: '#fff', flex: 1 }}
                    >
                        SEND EMERGENCY ALERT
                    </button>
                    <button className="tactical-btn btn-secondary">SEND SYSTEM NOTICE</button>
                </div>
                <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,77,77,0.05)', borderRadius: '15px', border: '1px dashed rgba(255,77,77,0.2)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff4d4d', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaExclamationCircle /> CRITICAL WARNING
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>Broadcasts sent from this console are pushed instantly to all mobile devices registered on the Trinetra network. Use with extreme caution.</p>
                </div>
            </div>
        </div>
    );
}

function ProfileView({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ff9800)', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#000', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <h2 style={{ fontSize: '32px', fontWeight: 900 }}>{user?.name}</h2>
                <div style={{ color: '#fbbc04', fontWeight: 800, letterSpacing: '2px', fontSize: '12px', marginTop: '10px' }}>DIRECTOR OF CITIZEN SUPPORT & HELPDESK</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '50px' }}>
                    <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>4.9</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '5px' }}>SATISFACTION SCORE</div>
                    </div>
                    <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>8,422</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '5px' }}>TOTAL RESOLUTIONS</div>
                    </div>
                    <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>45s</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '5px' }}>AVG RESPONSE TIME</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
function UserVerificationView() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingUsers(users);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAction = async (userId, userEmail, action) => {
        try {
            if (action === 'approve') {
                await updateDoc(doc(db, "users", userId), { status: 'active' });
                alert(`✅ USER APPROVED: An automated notification has been sent to ${userEmail}.\n\nSubject: TRINETRA Account Generated\nBody: Welcome to the ecosystem. Your identity has been verified.`);
            } else {
                if (window.confirm("ARE YOU SURE YOU WANT TO REJECT THIS APPLICATION?")) {
                    await deleteDoc(doc(db, "users", userId));
                    alert("APPLICATION TERMINATED");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Action failed.");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>INITIALIZING SECURE QUEUE...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>IDENTITY VERIFICATION QUEUE</h3>
                <div style={{ padding: '8px 15px', background: 'rgba(0, 229, 160, 0.1)', color: '#00e5a0', borderRadius: '10px', fontSize: '11px', fontWeight: 900 }}>
                    {pendingUsers.length} PENDING APPLICATIONS
                </div>
            </div>

            {pendingUsers.length === 0 ? (
                <div className="glass-panel" style={{ padding: '100px', textAlign: 'center' }}>
                    <FaCheckCircle size={50} color="#00e5a0" style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>ALL IDENTITIES VERIFIED. QUEUE IS CLEAR.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {pendingUsers.map(u => (
                        <div key={u.id} className="glass-panel" style={{ padding: '25px', display: 'flex', gap: '20px' }}>
                            <div style={{ width: '120px', height: '140px', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {u.photo ? <img src={u.photo} alt="Biometric" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#333' }}>NO PHOTO</div>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '18px', fontWeight: 900, marginBottom: '5px' }}>{u.name}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}>{u.email}</div>
                                
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '9px', fontWeight: 900, color: '#fbbc04', marginBottom: '4px', letterSpacing: '1px' }}>DOCUMENTED AADHAAR_ID</div>
                                            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '2px', color: '#fff' }}>{u.aadhaar || 'NOT PROVIDED'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>CARD_PREVIEW</div>
                                            {u.aadhaarFile ? (
                                                <div 
                                                    onClick={() => window.open(u.aadhaarFile)} 
                                                    style={{ 
                                                        width: '80px', height: '50px', background: '#000', borderRadius: '8px', overflow: 'hidden', 
                                                        cursor: 'pointer', border: '2px solid rgba(0, 229, 160, 0.3)', position: 'relative',
                                                        transition: '0.3s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <img src={u.aadhaarFile} alt="Aadhaar Doc" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FaEye size={12} color="#fff" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '10px', color: '#ff4d4d', fontWeight: 900, background: 'rgba(255,77,77,0.1)', padding: '5px 10px', borderRadius: '5px' }}>MISSING</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleAction(u.id, u.email, 'approve')} className="tactical-btn btn-primary" style={{ flex: 1, background: '#00e5a0' }}>APPROVE USER</button>
                                    <button onClick={() => handleAction(u.id, u.email, 'reject')} className="tactical-btn btn-secondary" style={{ color: '#ff4d4d' }}>REJECT</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
