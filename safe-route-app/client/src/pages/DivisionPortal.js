import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { 
  FaUserShield, FaLock, FaEnvelope, 
  FaChevronLeft, FaArrowRight, FaEye, FaEyeSlash 
} from "react-icons/fa";
import Logo from "../components/Logo";
import "./Dashboard.css";

export default function DivisionPortal() {
    const { divisionId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const divisionNames = {
        '1': 'SOS TEAM', '2': 'Safe Taxi Team', '3': 'Women Safety Support',
        '4': 'Analytics & Monitoring', '5': 'Cyber Security Team', '6': 'Helpdesk / Support',
        '7': 'COMMISSIONER OFFICE'
    };

    useEffect(() => {
        const agent = document.getElementById("trinetra-agent-container");
        if (agent) agent.style.display = "none";
        return () => { if (agent) agent.style.display = "block"; };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            // --- MASTER ADMIN OVERRIDE FOR MONITORING ---
            if (formData.email === "admin@trinetra.com" && formData.password === "Admin@9977") {
                localStorage.setItem("trinetra_user", JSON.stringify({ 
                    id: "admin-master", 
                    email: "admin@trinetra.com", 
                    role: "admin", 
                    name: "Supreme Commissioner",
                    divisionId: divisionId 
                }));
                navigate(`/division-dashboard/${divisionId}`);
                return;
            }

            // --- EXCLUSIVE COMMISSIONER UNIT (UNIT 7) CREDENTIALS ---
            if (divisionId === "7") {
                if (formData.email === "chief@trinetra.gov.in" && formData.password === "CHIEF#TRINETRA") {
                    localStorage.setItem("trinetra_user", JSON.stringify({ 
                        id: "commissioner-supreme", 
                        email: "chief@trinetra.gov.in", 
                        role: "admin", 
                        name: "Supreme Commissioner",
                        divisionId: "7",
                        startTab: "overview" // Ensure War Room opens
                    }));
                    navigate(`/admin-dashboard`);
                    return;
                } else {
                    throw new Error("Invalid Chief Credentials for Commissioner Office.");
                }
            }

            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            
            // Check if account is divisional and matches the portal's division ID
            if (userDoc.exists() && (userDoc.data().accountType === "divisional" || userDoc.data().divisionId)) {
                localStorage.setItem("trinetra_user", JSON.stringify({ id: userCredential.user.uid, ...userDoc.data() }));
                navigate(`/division-dashboard/${divisionId}`);
            } else {
                throw new Error("Unauthorized Access. This portal is for Divisional Personnel only.");
            }
        } catch (err) {
            console.warn("Auth check failed, trying SOS Member database...");
            
            // --- FALLBACK: CHECK SOS MEMBERS COLLECTION (Custom Credentials) ---
            try {
                const memberQuery = query(
                    collection(db, "sos_members"),
                    where("email", "==", formData.email),
                    where("password", "==", formData.password)
                );
                const memberSnap = await getDocs(memberQuery);
                
                if (!memberSnap.empty) {
                    const memberData = memberSnap.docs[0].data();
                    const memberId = memberSnap.docs[0].id;
                    
                    localStorage.setItem("trinetra_user", JSON.stringify({ 
                        id: memberId, 
                        ...memberData,
                        role: "Member", // Enforce Member role for dashboard logic
                        designation: memberData.role // Map their specific role (Responder/Lead/etc)
                    }));
                    
                    navigate(`/division-dashboard/${divisionId}`);
                    return;
                }
            } catch (memberErr) {
                console.error("SOS Member Auth Error:", memberErr);
            }

            console.error("Portal Login Error:", err);
            setError("Access Denied: Invalid credentials or unauthorized unit access.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="nr-root" style={{ background: '#06080d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center', position: 'relative' }}>
                
                <button onClick={() => {
                    const adminBackup = localStorage.getItem("trinetra_admin_backup");
                    if (adminBackup) {
                        localStorage.setItem("trinetra_user", adminBackup);
                        localStorage.removeItem("isAdminSession");
                        localStorage.removeItem("trinetra_admin_backup");
                    }
                    navigate('/admin-dashboard');
                }} style={{ position: 'absolute', left: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                    <FaChevronLeft /> Back to Command
                </button>

                <div style={{ marginBottom: '40px', marginTop: '10px' }}>
                    <Logo height={45} />
                    <h2 style={{ marginTop: '20px', fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '1px' }}>
                        {divisionNames[divisionId] || 'UNIT'} GATEWAY
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600 }}>TACTICAL AUTHENTICATION REQUIRED</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                        <input type="email" placeholder="Official Email / ID" required style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#1a1d23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                        <input type={showPassword ? "text" : "password"} placeholder="Tactical Passphrase" required style={{ width: '100%', padding: '15px 45px 15px 45px', background: '#1a1d23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.2)' }}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>

                    {error && <div style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 700, padding: '12px', background: 'rgba(255,77,77,0.1)', borderRadius: '10px', border: '1px solid rgba(255,77,77,0.2)' }}>{error}</div>}

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', background: 'var(--accent)', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 900, cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 24px rgba(66, 133, 244, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {loading ? 'AUTHENTICATING...' : 'ACCESS UNIT HUD'} <FaArrowRight />
                    </button>
                </form>

                <div style={{ marginTop: '40px', padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    <FaUserShield style={{ marginRight: '8px' }} /> ENCRYPTED COMMAND SESSION
                </div>
            </div>
        </div>
    );
}
