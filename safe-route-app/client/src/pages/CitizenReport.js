import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaExclamationTriangle, FaShieldAlt, FaMapMarkerAlt, FaPaperPlane, 
  FaLock, FaCheckCircle, FaUserSecret, FaPhoneAlt, FaComments, FaChevronLeft
} from "react-icons/fa";
import Logo from "../components/Logo";
import { db } from "../firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

export default function CitizenReport() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        type: "SOS",
        description: "",
        location: "",
        name: "Anonymous"
    });
    const [status, setStatus] = useState({ loading: false, success: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false });

        try {
            const reportId = "CIT-" + Math.floor(Math.random() * 100000);
            const reportRef = doc(collection(db, "reports"));
            
            await setDoc(reportRef, {
                id: reportRef.id,
                reportId: reportId,
                type: form.type,
                description: form.description,
                locationName: form.location,
                timestamp: Date.now(),
                status: "ACTIVE",
                userName: form.name,
                lat: 22.7196 + (Math.random() - 0.5) * 0.1,
                lng: 75.8577 + (Math.random() - 0.5) * 0.1
            });

            // ── Targeted Divisional Alerts ──
            const targetDivMap = {
                "SOS": "1",          // SOS Team
                "SAFE TAXI": "2",    // Safe Taxi
                "STALKING": "3",     // Women Support
                "CYBER ABUSE": "5",  // Cyber Security
            };

            const targetDiv = targetDivMap[form.type] || "7";
            
            const alertRef = doc(collection(db, "divisional_alerts"));
            await setDoc(alertRef, {
                source: "CITIZEN_PORTAL",
                targetDivision: targetDiv,
                type: `${form.type.replace(" ", "_")}_REPORT`,
                message: `NEW ${form.type} REPORT: Filed at ${form.location}. Description: ${form.description.substring(0, 100)}...`,
                timestamp: Date.now(),
                priority: form.type === "SOS" ? "CRITICAL" : "HIGH",
                status: "ACTIVE"
            });

            // ── Global Commissioner Oversight ──
            if (targetDiv !== "7") {
                const escalationRef = doc(collection(db, "divisional_alerts"));
                await setDoc(escalationRef, {
                    source: "CITIZEN_PORTAL",
                    targetDivision: "7", // Commissioner
                    type: "PUBLIC_INCIDENT_ESCALATION",
                    message: `System Alert: A new ${form.type} report has been filed and routed to Division ${targetDiv}.`,
                    timestamp: Date.now(),
                    priority: form.type === "SOS" ? "CRITICAL" : "HIGH",
                    status: "ACTIVE"
                });
            }

            setStatus({ loading: false, success: true });
            setForm({ type: "SOS", description: "", location: "", name: "Anonymous" });
            setTimeout(() => setStatus({ loading: false, success: false }), 5000);
        } catch (err) {
            console.error("Report Error:", err);
            setStatus({ loading: false, success: false });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", display: 'flex', flexDirection: 'column' }}>
            
            {/* PUBLIC HEADER */}
            <header style={{ padding: '20px 40px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'}>
                        <FaChevronLeft /> Back to Home
                    </button>
                    <Logo height={30} />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5a0', fontSize: '12px', fontWeight: 900 }}>
                        <div style={{ width: '8px', height: '8px', background: '#00e5a0', borderRadius: '50%', boxShadow: '0 0 10px #00e5a0' }}></div>
                        PUBLIC SAFETY NODE_ACTIVE
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ width: '100%', maxWidth: '600px', animation: 'fadeIn 0.8s ease' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(255,77,77,0.1)', borderRadius: '20px', color: '#ff4d4d', marginBottom: '20px' }}>
                            <FaExclamationTriangle size={40} />
                        </div>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '1px' }}>EMERGENCY RESPONSE PORTAL</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>Your signal is encrypted and routed directly to the Command Center.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>EMERGENCY TYPE</label>
                                <select 
                                    value={form.type}
                                    onChange={(e) => setForm({...form, type: e.target.value})}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', color: '#fff', marginTop: '10px', outline: 'none' }}
                                >
                                    <option value="SOS">CRITICAL SOS (PHYSICAL THREAT)</option>
                                    <option value="CYBER ABUSE">CYBER ABUSE / HARASSMENT</option>
                                    <option value="STALKING">STALKING / SUSPICIOUS ACTIVITY</option>
                                    <option value="SAFE TAXI">UNSAFE TAXI / DRIVER BEHAVIOR</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>YOUR LOCATION</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        placeholder="e.g. Vijay Nagar, Sector 4"
                                        value={form.location}
                                        onChange={(e) => setForm({...form, location: e.target.value})}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px 15px 15px 45px', borderRadius: '12px', color: '#fff', marginTop: '10px', outline: 'none' }}
                                        required
                                    />
                                    <FaMapMarkerAlt style={{ position: 'absolute', left: '15px', top: '25px', color: 'rgba(255,255,255,0.3)' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SITUATION DESCRIPTION</label>
                            <textarea 
                                placeholder="Provide brief details of the emergency..."
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', color: '#fff', marginTop: '10px', outline: 'none', resize: 'none' }}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={status.loading}
                            style={{ 
                                width: '100%', 
                                padding: '20px', 
                                background: status.success ? '#00e5a0' : '#ff4d4d', 
                                border: 'none', 
                                borderRadius: '15px', 
                                color: status.success ? '#000' : '#fff', 
                                fontWeight: 900, 
                                fontSize: '14px', 
                                letterSpacing: '2px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '15px',
                                transition: '0.3s',
                                boxShadow: status.success ? '0 10px 30px rgba(0,229,160,0.3)' : '0 10px 30px rgba(255,77,77,0.3)'
                            }}
                        >
                            {status.loading ? "UPLOADING ENCRYPTED SIGNAL..." : status.success ? <><FaCheckCircle /> SIGNAL RECEIVED - HELP IS ON THE WAY</> : <><FaPaperPlane /> BROADCAST EMERGENCY SIGNAL</>}
                        </button>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>
                                <FaLock /> END-TO-END ENCRYPTED
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>
                                <FaUserSecret /> IDENTITY SHIELD ACTIVE
                            </div>
                        </div>
                    </form>

                    <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        {[
                            { icon: <FaPhoneAlt />, label: "QUICK DIAL", val: "112" },
                            { icon: <FaShieldAlt />, label: "POLICE", val: "100" },
                            { icon: <FaComments />, label: "WOMEN HELPLINE", val: "1091" }
                        ].map((item, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '10px' }}>{item.icon}</div>
                                <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{item.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '5px' }}>{item.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`
                .glass-panel { background: rgba(14, 17, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 30px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
