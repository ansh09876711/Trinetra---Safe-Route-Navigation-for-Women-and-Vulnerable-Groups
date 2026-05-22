import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import CommissionerHeadDesktop from "./CommissionerOffice/Head/Desktop/CommissionerHeadDesktop";
import CommissionerHeadMobile from "./CommissionerOffice/Head/Mobile/CommissionerHeadMobile";
import CyberSecurityHeadDesktop from "./CyberSecurity/Head/Desktop/CyberSecurityHeadDesktop";
import CyberSecurityHeadMobile from "./CyberSecurity/Head/Mobile/CyberSecurityHeadMobile";
import CyberSecurityMemberDesktop from "./CyberSecurity/Member/Desktop/CyberSecurityMemberDesktop";
import CyberSecurityMemberMobile from "./CyberSecurity/Member/Mobile/CyberSecurityMemberMobile";
import SuperAdminGateway from "./AdminGateway/SuperAdminGateway";
import SuperAdminGatewayMobile from "./AdminGateway/SuperAdminGatewayMobile";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("trinetra_user") || "{}"));
    const [latestSosGlobal, setLatestSosGlobal] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // GLOBAL SOS REAL-TIME LISTENER
    useEffect(() => {
        // Use client-side filtering to bypass Firestore Index requirements
        const q = query(collection(db, "reports"), limit(50));

        const unsub = onSnapshot(q, (snapshot) => {
            const activeSos = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .filter(a => a.type === "SOS" && a.status === "ACTIVE")
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (activeSos.length > 0) {
                setLatestSosGlobal(activeSos[0]);
            } else {
                setLatestSosGlobal(null);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user.role) {
            navigate("/login");
            return;
        }
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        const agent = document.getElementById("trinetra-agent-container");
        if (agent) agent.style.display = "none";
        return () => {
            window.removeEventListener("resize", handleResize);
            if (agent) agent.style.display = "block";
        };
    }, [navigate, user]);

    const handleLogout = () => {
        const isAdminSession = localStorage.getItem("isAdminSession");
        const adminBackup = localStorage.getItem("trinetra_admin_backup");

        if (isAdminSession === "true" && adminBackup) {
            // Restore admin session
            localStorage.setItem("trinetra_user", adminBackup);
            localStorage.removeItem("isAdminSession");
            localStorage.removeItem("trinetra_admin_backup");
            window.location.href = "/admin-dashboard"; // Go back to gateway
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

    // --- DASHBOARD ROUTER ---
    let specializedContent = null;

    if (user.email === "admin@trinetra.com") {
        specializedContent = isMobile ? <SuperAdminGatewayMobile onLogout={handleLogout} /> : <SuperAdminGateway onLogout={handleLogout} />;
    } else if (user.email === "chief@trinetra.gov.in") {
        specializedContent = isMobile ? <CommissionerHeadMobile user={user} onLogout={handleLogout} /> : <CommissionerHeadDesktop user={user} onLogout={handleLogout} />;
    } else if (user.divisionId === "5") {
        if (user.designation === "HEAD") {
            specializedContent = isMobile ? <CyberSecurityHeadMobile user={user} onLogout={handleLogout} /> : <CyberSecurityHeadDesktop user={user} onLogout={handleLogout} />;
        } else {
            specializedContent = isMobile ? <CyberSecurityMemberMobile user={user} onLogout={handleLogout} /> : <CyberSecurityMemberDesktop user={user} onLogout={handleLogout} />;
        }
    } else {
        specializedContent = (
            <div style={{ background: '#02040a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontWeight: 900, color: '#6366f1' }}>{user.divisionId ? `DIVISION ${user.divisionId}` : 'TRINETRA'} COMMAND</h2>
                    <p style={{ opacity: 0.5, marginTop: '10px' }}>Loading Authorized Interface for {user.name}...</p>
                    <button onClick={handleLogout} style={{ marginTop: '30px', padding: '12px 30px', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '10px', cursor: 'pointer' }}>LOGOUT</button>
                </div>
            </div>
        );
    }

    const showBanner = latestSosGlobal && user.email !== "admin@trinetra.com";

    return (
        <>
            {showBanner && (
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
                    <button 
                        onClick={() => window.location.href = `/division-dashboard/1`}
                        style={{ padding: '8px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#ff4d4d', fontWeight: 900, fontSize: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                        INTERCEPT SIGNAL
                    </button>
                </div>
            )}
            {specializedContent}
        </>
    );
}
