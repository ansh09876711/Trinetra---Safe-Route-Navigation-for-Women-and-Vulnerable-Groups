import React, { useState, useEffect } from "react";
import { 
  FaUserShield, FaHandsHelping, FaPhoneAlt, FaCommentMedical, 
  FaBalanceScale, FaHistory, FaSignOutAlt, FaSearch, 
  FaBell, FaUser, FaLock, FaEnvelope, FaEyeSlash, FaEye,
  FaClipboardList, FaUsers, FaHeart, FaShieldAlt, FaExclamationTriangle,
  FaMapMarkedAlt, FaCommentDots, FaUserNinja, FaFileUpload, FaFlag,
  FaArrowUp, FaStethoscope, FaBroadcastTower, FaUserSecret, FaRoute
} from "react-icons/fa";
import Logo from "../../../../components/Logo";
import { db } from "../../../../firebase";
import { collection, onSnapshot, query, orderBy, limit, where, setDoc, doc, Timestamp } from "firebase/firestore";

export default function WomenSupportMemberDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("complaints");
    const [searchQuery, setSearchQuery] = useState("");
    const [incidents, setIncidents] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(3);

    const tabs = [
        { id: 'complaints', label: 'ANONYMOUS COMPLAINTS', icon: <FaUserSecret />, color: '#d442f5' },
        { id: 'sos', label: 'PRIORITY SOS', icon: <FaExclamationTriangle />, color: '#ff4d4d' },
        { id: 'chat', label: 'SUPPORT CHAT', icon: <FaCommentDots />, color: '#00e5a0' },
        { id: 'harassment', label: 'INCIDENT REPORTER', icon: <FaShieldAlt />, color: '#6366f1' },
        { id: 'mental', label: 'MENTAL SUPPORT', icon: <FaHandsHelping />, color: '#fbbc04' },
        { id: 'routes', label: 'SAFE ROUTES', icon: <FaRoute />, color: '#4285F4' },
        { id: 'helpline', label: 'HELPLINE HUB', icon: <FaBroadcastTower />, color: '#ff9800' },
        { id: 'history', label: 'CASE ARCHIVE', icon: <FaHistory />, color: 'rgba(255,255,255,0.4)' },
        { id: 'profile', label: 'AGENT PROFILE', icon: <FaUser />, color: '#00e5a0' },
    ];

    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ type: 'HARASSMENT', msg: '', location: '' });

    const handleFileComplaint = async () => {
        try {
            const reportRef = doc(collection(db, "reports"));
            await setDoc(reportRef, {
                id: reportRef.id,
                type: complaintForm.type,
                description: complaintForm.msg,
                locationName: complaintForm.location || "Undisclosed",
                timestamp: Date.now(),
                status: "PENDING",
                userName: "ANONYMOUS_CITIZEN"
            });

            // TRIGGER CROSS-DIVISION ALERT IF CYBER ABUSE
            if (complaintForm.type === 'CYBER ABUSE') {
                const alertRef = doc(collection(db, "divisional_alerts"));
                await setDoc(alertRef, {
                    source: "WOMEN_SAFETY_UNIT",
                    targetDivision: "5", // Cyber Security
                    type: "CYBER_THREAT_DETECTION",
                    message: `ALERT: Cyber Abuse complaint filed. Payload: ${complaintForm.msg.substring(0, 50)}...`,
                    timestamp: Date.now(),
                    priority: "CRITICAL",
                    status: "ACTIVE"
                });
            }

            // ALWAYS NOTIFY COMMISSIONER
            const commAlertRef = doc(collection(db, "divisional_alerts"));
            await setDoc(commAlertRef, {
                source: "WOMEN_SAFETY_UNIT",
                targetDivision: "7", // Commissioner
                type: "INCIDENT_ESCALATION",
                message: `New ${complaintForm.type} reported. Automatic escalation triggered.`,
                timestamp: Date.now(),
                priority: complaintForm.type === 'CYBER ABUSE' ? "CRITICAL" : "NORMAL",
                status: "ACTIVE"
            });

            setShowComplaintModal(false);
            setComplaintForm({ type: 'HARASSMENT', msg: '', location: '' });
        } catch (err) {
            console.error("Complaint Filing Error:", err);
        }
    };

    useEffect(() => {
        const q = query(collection(db, "reports"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort and Limit in JS
            reports.sort((a, b) => b.timestamp - a.timestamp);
            setIncidents(reports.slice(0, 50));
        });
        return () => unsubscribe();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'complaints': return <AnonymousComplaintsView incidents={incidents} />;
            case 'sos': return <PrioritySOSView incidents={incidents} />;
            case 'chat': return <EmergencyChatView />;
            case 'harassment': return <HarassmentReportingView />;
            case 'mental': return <MentalSupportView />;
            case 'routes': return <SafeRouteView />;
            case 'helpline': return <HelplineIntegrationView />;
            case 'history': return <CaseArchiveView incidents={incidents} />;
            case 'profile': return <ProfileView user={user} />;
            default: return <AnonymousComplaintsView incidents={incidents} onFileNew={() => setShowComplaintModal(true)} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* SIDEBAR */}
            <aside style={{ width: '280px', background: 'rgba(10, 12, 18, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(212,66,245,0.1)', borderRadius: '8px', border: '1px solid rgba(212,66,245,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#d442f5', boxShadow: '0 0 10px #d442f5' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#d442f5', letterSpacing: '2px' }}>SUPPORT OPS MEMBER</span>
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
                <header style={{ padding: '20px 40px', background: 'rgba(6, 8, 13, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '400px' }}>
                        <FaSearch style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <input placeholder="SEARCH CASES, CITIZENS, OR PROTOCOLS..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '11px', outline: 'none', width: '100%', fontWeight: 700, letterSpacing: '1px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#d442f5', fontWeight: 800, letterSpacing: '1px' }}>CERTIFIED RESPONSE MEMBER</div>
                        </div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: 900 }}>{user?.name?.[0]}</div>
                    </div>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>

            {/* COMPLAINT MODAL */}
            {showComplaintModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '40px', background: 'rgba(10,12,18,0.95)', border: '1px solid rgba(212,66,245,0.2)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '25px', color: '#d442f5', letterSpacing: '1px' }}>FILE ANONYMOUS COMPLAINT</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>COMPLAINT CATEGORY</label>
                                <select 
                                    value={complaintForm.type}
                                    onChange={(e) => setComplaintForm({...complaintForm, type: e.target.value})}
                                    style={{ width: '100%', background: 'rgba(30,35,45,1)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', color: '#fff', marginTop: '8px', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="HARASSMENT" style={{ background: '#1a1d24', color: '#fff' }}>HARASSMENT</option>
                                    <option value="STALKING" style={{ background: '#1a1d24', color: '#fff' }}>STALKING</option>
                                    <option value="DOMESTIC VIOLENCE" style={{ background: '#1a1d24', color: '#fff' }}>DOMESTIC VIOLENCE</option>
                                    <option value="CYBER ABUSE" style={{ background: '#1a1d24', color: '#fff' }}>CYBER ABUSE</option>
                                    <option value="UNSAFE TAXI" style={{ background: '#1a1d24', color: '#fff' }}>UNSAFE TAXI</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>INCIDENT DETAILS</label>
                                <textarea 
                                    placeholder="Enter encrypted payload details..."
                                    value={complaintForm.msg}
                                    onChange={(e) => setComplaintForm({...complaintForm, msg: e.target.value})}
                                    style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', color: '#fff', marginTop: '8px', outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                <button onClick={() => setShowComplaintModal(false)} className="btn-tactical btn-secondary">ABORT</button>
                                <button onClick={handleFileComplaint} className="btn-tactical btn-primary">SUBMIT CASE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; }
                .status-dot { width: 8px; height: 8px; borderRadius: 50%; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); borderRadius: 10px; }
                .btn-tactical { padding: 12px 20px; border-radius: 12px; font-weight: 900; font-size: 11px; cursor: pointer; transition: 0.3s; border: none; letter-spacing: 1px; }
                .btn-primary { background: #d442f5; color: #fff; box-shadow: 0 4px 15px rgba(212,66,245,0.2); }
                .btn-secondary { background: rgba(255,255,255,0.03); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}

function AnonymousComplaintsView({ incidents, onFileNew }) {
    const complaintTypes = [
        { label: 'HARASSMENT', color: '#ff4d4d' },
        { label: 'STALKING', color: '#d442f5' },
        { label: 'DOMESTIC VIOLENCE', color: '#ff9800' },
        { label: 'UNSAFE TAXI', color: '#fbbc04' },
        { label: 'CYBER ABUSE', color: '#6366f1' },
        { label: 'PUBLIC THREAT', color: '#00e5a0' }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '30px' }}>
                {complaintTypes.map((type, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '20px', textAlign: 'center', borderBottom: `3px solid ${type.color}` }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: type.color, letterSpacing: '1px' }}>{type.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '8px' }}>{Math.floor(Math.random() * 10)}</div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>LIVE ANONYMOUS COMPLAINT STREAM</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-tactical btn-secondary">FILTER BY TYPE</button>
                        <button onClick={onFileNew} className="btn-tactical btn-primary">FILE NEW COMPLAINT</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {incidents.slice(0, 8).map((e, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px 200px', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ background: 'rgba(212,66,245,0.1)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                                <FaUserSecret color="#d442f5" size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>COMPLAINT #{String(e.id).substring(0, 6).toUpperCase()}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>IDENTITY PROTECTED • ENCRYPTED PAYLOAD</div>
                            </div>
                            <div>
                                <span style={{ padding: '5px 12px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', borderRadius: '8px', fontSize: '9px', fontWeight: 900 }}>{complaintTypes[i % 6].label}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn-tactical btn-secondary" style={{ padding: '8px 15px' }}>CATEGORIZE</button>
                                <button className="btn-tactical btn-primary" style={{ padding: '8px 15px' }}>ASSIGN PRIORITY</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PrioritySOSView({ incidents }) {
    const sosFeed = [
        { type: 'WOMEN SOS', location: 'Vijay Nagar', time: '2m ago', priority: 'CRITICAL', icon: <FaUserShield />, color: '#ff4d4d' },
        { type: 'CHILD SAFETY', location: 'Sarafa Market', time: '5m ago', priority: 'HIGH', icon: <FaHandsHelping />, color: '#ffd700' },
        { type: 'VULNERABLE GROUP', location: 'Bhanwarkuan', time: '8m ago', priority: 'IMMEDIATE', icon: <FaUsers />, color: '#ff9800' },
        { type: 'NIGHT EMERGENCY', location: 'Rajwada', time: '12m ago', priority: 'HIGH', icon: <FaRoute />, color: '#6366f1' }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaBroadcastTower color="#ff4d4d" /> PRIORITY SOS MONITORING
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {sosFeed.map((s, i) => (
                            <div key={i} style={{ padding: '25px', background: 'rgba(255,77,77,0.03)', border: '1px solid rgba(255,77,77,0.1)', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', background: `${s.color}20`, borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '20px' }}>{s.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 900 }}>{s.type}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.location} • {s.time}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: s.color, background: `${s.color}15`, padding: '5px 12px', borderRadius: '8px', marginBottom: '10px' }}>{s.priority}</div>
                                    <button className="btn-tactical btn-primary">DISPATCH UNITS</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px', background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.2)' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#ff4d4d', marginBottom: '15px' }}>GLOBAL ALERT STATUS</h4>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>CODE RED</div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>High frequency of SOS signals detected in Sector 7. Deploying additional patrol units.</p>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '25px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, marginBottom: '20px' }}>REAL-TIME MAP FEED</h4>
                        <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaMapMarkedAlt size={60} color="rgba(255,255,255,0.05)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmergencyChatView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', height: '100%' }}>
            <div className="glass-panel" style={{ height: '700px', display: 'grid', gridTemplateColumns: '300px 1fr', overflow: 'hidden' }}>
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '20px' }}>SECURE SESSIONS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { name: 'ANONYMOUS #442', status: 'WAITING', time: '1m' },
                            { name: 'ANONYMOUS #819', status: 'ACTIVE', time: '5m' },
                            { name: 'ANONYMOUS #112', status: 'ACTIVE', time: '12m' }
                        ].map((c, i) => (
                            <div key={i} style={{ padding: '15px', background: i === 1 ? 'rgba(0,229,160,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `3px solid ${i === 1 ? '#00e5a0' : 'transparent'}` }}>
                                <div style={{ fontSize: '12px', fontWeight: 900 }}>{c.name}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{c.status} • {c.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <header style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#00e5a0', borderRadius: '50%' }}></div>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>LIVE SUPPORT SESSION #819</div>
                        </div>
                        <button className="btn-tactical btn-secondary">TRANSLATE (AUTO)</button>
                    </header>
                    <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <div style={{ display: 'inline-block', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px 15px 15px 0', fontSize: '13px', maxWidth: '70%' }}>
                                Help, I feel like someone is following me since I left the mall.
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-block', padding: '15px', background: 'rgba(0,229,160,0.1)', borderRadius: '15px 15px 0 15px', fontSize: '13px', maxWidth: '70%', color: '#00e5a0' }}>
                                Stay calm. I am tracking your location. Are you in a well-lit area?
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <input placeholder="TYPE SAFETY GUIDANCE OR EMOTIONAL SUPPORT..." style={{ flex: 1, padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                            <button className="btn-tactical btn-primary" style={{ padding: '0 30px' }}>SEND</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HarassmentReportingView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '30px' }}>INCIDENT REPORTING SYSTEM</h3>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>INCIDENT TYPE</label>
                                <select style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}>
                                    <option>Harassment</option>
                                    <option>Stalking</option>
                                    <option>Cyber Abuse</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>URGENCY LEVEL</label>
                                <select style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}>
                                    <option>Normal</option>
                                    <option>High</option>
                                    <option>Severe (Immediate Action)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>INCIDENT DESCRIPTION</label>
                            <textarea placeholder="Provide detailed description of the incident..." style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', height: '150px', outline: 'none' }} />
                        </div>
                        <div style={{ padding: '30px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' }}>
                            <FaFileUpload size={30} color="rgba(255,255,255,0.2)" />
                            <div style={{ fontSize: '12px', marginTop: '10px', color: 'rgba(255,255,255,0.4)' }}>UPLOAD EVIDENCE (PHOTOS, VIDEOS, AUDIO)</div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn-tactical btn-secondary" style={{ flex: 1 }}>FLAG REPEATED OFFENDER</button>
                            <button className="btn-tactical btn-primary" style={{ flex: 1 }}>FILE OFFICIAL REPORT</button>
                        </div>
                    </form>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: '#6366f1', marginBottom: '20px' }}>ESCALATION PROTOCOL</h4>
                        <div style={{ background: 'rgba(99,102,241,0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(99,102,241,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1' }}>
                                <FaArrowUp /> <span style={{ fontWeight: 900, fontSize: '11px' }}>SEVERE CASE ESCALATION</span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>Severe cases are automatically routed to the Commissioner's Special Task Force.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MentalSupportView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px', borderLeft: '4px solid #fbbc04' }}>
                    <FaHandsHelping color="#fbbc04" size={30} />
                    <h3 style={{ fontSize: '20px', fontWeight: 900, marginTop: '15px' }}>12 PENDING</h3>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>EMOTIONAL SUPPORT REQ</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px', borderLeft: '4px solid #00e5a0' }}>
                    <FaCommentMedical color="#00e5a0" size={30} />
                    <h3 style={{ fontSize: '20px', fontWeight: 900, marginTop: '15px' }}>98% SUCCESS</h3>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>CALM GUIDANCE RATE</div>
                </div>
                <div className="glass-panel" style={{ padding: '30px', borderLeft: '4px solid #ff4d4d' }}>
                    <FaStethoscope color="#ff4d4d" size={30} />
                    <h3 style={{ fontSize: '20px', fontWeight: 900, marginTop: '15px' }}>4 CRISIS</h3>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>IMMEDIATE COUNSELING</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '25px' }}>ACTIVE SUPPORT QUEUE</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[
                        { name: 'ANONYMOUS #12', type: 'Emotional Assistance', status: 'In Session' },
                        { name: 'ANONYMOUS #44', type: 'Crisis Support', status: 'Urgent' },
                        { name: 'ANONYMOUS #89', type: 'Safety Guidance', status: 'Waiting' }
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(251,188,4,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbc04' }}><FaUserNinja /></div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 900 }}>{s.name}</div>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{s.type}</div>
                                </div>
                            </div>
                            <button className="btn-tactical btn-primary">START COUNSELING</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SafeRouteView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px', position: 'relative', height: '600px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '20px' }}>TACTICAL NAVIGATION ENGINE</h3>
                    <div style={{ position: 'absolute', inset: '80px 30px 30px 30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaMapMarkedAlt size={80} color="rgba(255,255,255,0.05)" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '25px' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 900, color: '#4285F4', letterSpacing: '2px', marginBottom: '20px' }}>SAFE ENTITIES NEARBY</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'Sector 4 Police Station', dist: '0.4km', type: 'Police' },
                                { name: 'Pink Booth - Vijay Nagar', dist: '1.2km', type: 'Safety' },
                                { name: 'Asha NGO Support Center', dist: '2.5km', type: 'NGO' }
                            ].map((e, i) => (
                                <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 900 }}>{e.name}</div>
                                    <div style={{ fontSize: '10px', color: '#4285F4' }}>{e.dist}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn-tactical btn-primary" style={{ padding: '20px' }}>CALCULATE SAFEST ROUTE</button>
                </div>
            </div>
        </div>
    );
}

function HelplineIntegrationView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'WOMEN HELPLINE', num: '1091', color: '#ff4d4d' },
                    { label: 'POLICE EMERGENCY', num: '100', color: '#4285F4' },
                    { label: 'NGO COORDINATION', num: '181', color: '#d442f5' },
                    { label: 'DOMESTIC ABUSE', num: '1090', color: '#ff9800' }
                ].map((h, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', textAlign: 'center', borderBottom: `4px solid ${h.color}` }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{h.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '10px', color: h.color }}>{h.num}</div>
                        <button className="btn-tactical btn-secondary" style={{ width: '100%', marginTop: '15px', padding: '8px' }}>DIAL NOW</button>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '25px' }}>EXTERNAL COORDINATION LOGS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { target: 'POLICE HQ', action: 'Forwarded Kidnapping Threat', status: 'CONFIRMED' },
                        { target: 'SAKHI NGO', action: 'Requested Shelter for Case #99', status: 'PENDING' },
                        { target: 'PINK BOOTH 4', action: 'Requested Field Escort', status: 'ACTIVE' }
                    ].map((l, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '15px 20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800 }}>{l.target}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{l.action}</div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: l.status === 'CONFIRMED' ? '#00e5a0' : l.status === 'ACTIVE' ? '#4285F4' : '#ff9800' }}>{l.status}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CaseArchiveView({ incidents }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>DIVISION CASE ARCHIVE</h3>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                            <th style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>CASE ID</th>
                            <th style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>TIMESTAMP</th>
                            <th style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>CATEGORY</th>
                            <th style={{ padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>OUTCOME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map((e, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px', fontWeight: 900 }}>#{String(e.id).substring(0, 8).toUpperCase()}</td>
                                <td style={{ padding: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{new Date(e.timestamp?.seconds * 1000).toLocaleString()}</td>
                                <td style={{ padding: '20px', fontSize: '11px' }}>{e.type || 'EMERGENCY'}</td>
                                <td style={{ padding: '20px' }}><span style={{ color: '#00e5a0', fontSize: '10px', fontWeight: 900 }}>RESOLVED</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ProfileView({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #d442f5, #9c27b0)', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#fff', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <h2 style={{ fontSize: '32px', fontWeight: 900 }}>{user?.name}</h2>
                <div style={{ color: '#d442f5', fontWeight: 800, letterSpacing: '2px', fontSize: '12px', marginTop: '10px' }}>WOMEN SUPPORT MEMBER • ID #{user?.uid?.substring(0, 6).toUpperCase()}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '50px' }}>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>142</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '5px' }}>CASES HANDLED</div>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>9.8</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '5px' }}>RATING</div>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>12h</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '5px' }}>SESSION TIME</div>
                    </div>
                </div>

                <div style={{ marginTop: '50px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>SECURITY PERMISSIONS</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {['VIEW_SAFETY_CASES', 'HANDLE_COMPLAINTS', 'EMERGENCY_CHAT', 'ESCALATE_INCIDENTS', 'SUGGEST_SAFE_ROUTES'].map(p => (
                            <div key={p} style={{ padding: '8px 15px', background: 'rgba(0,229,160,0.1)', color: '#00e5a0', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>{p}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
