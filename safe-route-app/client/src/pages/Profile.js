import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaUser, FaEnvelope, FaPhoneAlt, FaShieldAlt, FaSignOutAlt, FaCog, FaHistory, FaMapMarkedAlt, FaUsers, FaBell, FaCheckCircle, FaLock, FaGlobe, FaEye, FaEyeSlash } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import MobileProfile from "./MobileProfile";
import "./Dashboard.css";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Settings
  const [dark, setDark] = useState(JSON.parse(localStorage.getItem("trinetra_dark") || "true"));
  const [voiceAlerts, setVoiceAlerts] = useState(JSON.parse(localStorage.getItem("trinetra_voice") || "true"));
  const [shakeSOS, setShakeSOS] = useState(JSON.parse(localStorage.getItem("trinetra_shake") || "true"));
  const [backgroundAI, setBackgroundAI] = useState(JSON.parse(localStorage.getItem("trinetra_background") || "false"));

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const [showPass, setShowPass] = useState(true);

  const user = {
    name: loggedInUser.name || "User",
    mobile: loggedInUser.mobile || "+91-00000-00000",
    email: loggedInUser.email || "user@example.com",
    initials: (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase(),
  };

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  const updateSetting = (key, val, setter) => {
    setter(val);
    localStorage.setItem(`trinetra_${key}`, JSON.stringify(val));
    window.dispatchEvent(new Event('trinetra_settings_changed'));
  };

  if (isMobile) return <MobileProfile />;

  return (
    <div className="nr-root" style={{ background: "var(--bg)", minHeight: "100vh", display: 'flex', flexDirection: 'column' }}>
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(10, 12, 16, 0.8)' }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ flex: 1, marginLeft: '20px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>Security & Profile Settings</div>
        <button onClick={handleLogout} style={{ border: 'none', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaSignOutAlt /> Logout Account
        </button>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={loggedInUser} onLogout={handleLogout} />

      <main style={{ flex: 1, padding: "40px", maxWidth: "1400px", margin: "0 auto", width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
          
          {/* LEFT COLUMN: IDENTITY */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: 'var(--bg2)', borderRadius: '28px', border: '1px solid var(--border)' }}>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5a0, #0095ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900, color: '#0a0c10',
                margin: '0 auto 24px', boxShadow: '0 15px 35px rgba(0,229,160,0.2)'
              }}>
                {user.initials}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{user.name}</h2>
              <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '24px' }}>{user.email}</p>
              
              <div style={{ background: 'rgba(0,229,160,0.1)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaShieldAlt /> Fully Protected Account
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', background: 'var(--bg2)', borderRadius: '28px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '10px' }}><FaBell /> SOS Alerts</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '10px' }}><FaMapMarkedAlt /> Safe Zones</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>12</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '10px' }}><FaUsers /> Emergency Contacts</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>5</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: SETTINGS & DETAILS */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Account Information */}
            <div className="glass-card" style={{ padding: '32px', background: 'var(--bg2)', borderRadius: '28px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaUser color="var(--accent)" /> Account Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Registered Email</label>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{user.email}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{user.mobile}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Secure Password</label>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FaLock color="var(--accent)" /> 
                      <span style={{ letterSpacing: showPass ? 'normal' : '4px', fontFamily: showPass ? 'inherit' : 'monospace' }}>
                        {localStorage.getItem("trinetra_pass") || (loggedInUser.email === 'chief@trinetra.gov.in' ? 'CHIEF#TRINETRA' : loggedInUser.email === 'admin@trinetra.com' ? 'Admin@9977' : "••••••••")}
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '18px' }}
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div className="glass-card" style={{ padding: '32px', background: 'var(--bg2)', borderRadius: '28px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaCog color="var(--accent)" /> Application Settings
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { id: "dark", label: "Dark Mode Interface", icon: <FaGlobe />, value: dark, setter: setDark },
                  { id: "voice", label: "AI Voice Assistant", icon: <FaBell />, value: voiceAlerts, setter: setVoiceAlerts },
                  { id: "shake", label: "Motion Detection (SOS)", icon: <FaShieldAlt />, value: shakeSOS, setter: setShakeSOS },
                  { id: "background", label: "Background Protection", icon: <FaLock />, value: backgroundAI, setter: setBackgroundAI },
                ].map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: 'var(--accent)' }}>{s.icon}</div>
                      <span style={{ fontSize: '15px', fontWeight: 500 }}>{s.label}</span>
                    </div>
                    <button onClick={() => updateSetting(s.id, !s.value, s.setter)} style={{ width: 50, height: 26, borderRadius: 13, background: s.value ? "var(--accent)" : "#333", border: "none", position: "relative", cursor: 'pointer' }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#000", position: "absolute", top: 3, left: s.value ? 27 : 3, transition: "0.2s" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}
