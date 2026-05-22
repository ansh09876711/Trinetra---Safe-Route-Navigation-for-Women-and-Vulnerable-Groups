import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaLock, FaUserShield, FaChartLine, FaQuestionCircle, FaExclamationTriangle, FaEye, FaEyeSlash } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function MobileProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const [showPass, setShowPass] = useState(true);

  const [dark, setDark] = useState(JSON.parse(localStorage.getItem("trinetra_dark") || "true"));
  const [voiceAlerts, setVoiceAlerts] = useState(JSON.parse(localStorage.getItem("trinetra_voice") || "true"));

  // Emergency Contacts States
  const [emergencyContacts, setEmergencyContacts] = useState(JSON.parse(localStorage.getItem("trinetra_emergency_contacts") || "[]"));
  const [newContactName, setNewContactName] = useState("");
  const [newContactWhatsapp, setNewContactWhatsapp] = useState("");
  const [newContactType, setNewContactType] = useState("Family Member");

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

  return (
    <div className="mob-profile-root" style={{ background: "#06080c", minHeight: "100vh", color: "#fff", paddingBottom: "40px" }}>
      <style>{`
        @keyframes pulseGlow { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .safety-badge { animation: pulseGlow 2s infinite ease-in-out; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; backdrop-filter: blur(10px); }
      `}</style>

      {/* HEADER */}
      <header style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,8,12,0.8)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff" }}><FaBars size={22} /></button>
        <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.5px' }}>TRINETRA ID</span>
        <button onClick={handleLogout} style={{ background: "rgba(255,77,77,0.15)", border: "none", color: "#ff4d4d", padding: "8px 16px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>Exit</button>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={loggedInUser} onLogout={handleLogout} />

      <main style={{ padding: "16px", display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* USER HERO CARD */}
        <div className="glass-card" style={{ padding: '30px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '100px', height: '100px', background: 'var(--accent)', filter: 'blur(60px)', opacity: 0.1 }} />
          
          <div style={{ position: 'relative', width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg, #00e5a0, #0095ff)", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 900, color: "#000", boxShadow: "0 10px 30px rgba(0,229,160,0.4)" }}>
            {user.initials}
          </div>
          
          <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: '4px' }}>{user.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent)', fontSize: '12px', fontWeight: 600 }}>
             <FaShieldAlt className="safety-badge" /> LEVEL 4 PROTECTION ACTIVE
          </div>
        </div>

        {/* SECURITY SHIELD STATUS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FaUserShield size={20} color="var(--accent)" />
            <div style={{ fontSize: '11px', color: '#888' }}>SAFETY SCORE</div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>98<span style={{ fontSize: '12px', color: '#666' }}>/100</span></div>
          </div>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <FaChartLine size={20} color="#0095ff" />
            <div style={{ fontSize: '11px', color: '#888' }}>TRUST INDEX</div>
            <div style={{ fontSize: '22px', fontWeight: 800 }}>Elite</div>
          </div>
        </div>

        {/* IDENTITY INFO */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "20px", color: "#888", display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaLock size={12} /> IDENTITY INFORMATION
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: '4px', letterSpacing: '1px' }}>LEGAL NAME</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: '#eee' }}>{user.name}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: '4px', letterSpacing: '1px' }}>SECURE EMAIL</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: '#eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaEnvelope size={12} color="#444" /> {user.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: '4px', letterSpacing: '1px' }}>PROTECTED NUMBER</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: '#eee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPhoneAlt size={12} color="#444" /> {user.mobile}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: '4px', letterSpacing: '1px' }}>SECURE PASSWORD</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaLock size={12} color="#444" /> 
                  <span style={{ letterSpacing: showPass ? 'normal' : '4px', fontFamily: showPass ? 'inherit' : 'monospace' }}>
                    {localStorage.getItem("trinetra_pass") || (loggedInUser.email === 'chief@trinetra.gov.in' ? 'CHIEF#TRINETRA' : loggedInUser.email === 'admin@trinetra.com' ? 'Admin@9977' : "••••••••")}
                  </span>
                </div>
                <button 
                  onClick={() => setShowPass(!showPass)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                >
                  {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EMERGENCY CONTACTS WITH WHATSAPP */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "20px", color: "#25D366", display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>📱</span> EMERGENCY CONTACTS
          </h3>
          
          {/* Add New Contact Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Contact Name"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🇮🇳</span>
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  value={newContactWhatsapp}
                  onChange={(e) => setNewContactWhatsapp(e.target.value.replace(/[^0-9+]/g, ''))}
                  maxLength={13}
                  style={{
                    width: '100%', padding: '12px 14px 12px 38px', background: 'rgba(37,211,102,0.08)',
                    border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px',
                    color: '#25D366', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            
            {/* Relationship Type Selector */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Family Member', 'Friend', 'Colleague', 'Other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setNewContactType(type)}
                  style={{
                    padding: '8px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    border: newContactType === type ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                    background: newContactType === type ? 'rgba(0,229,160,0.15)' : 'rgba(255,255,255,0.03)',
                    color: newContactType === type ? '#00e5a0' : '#888',
                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                >
                  {type === 'Family Member' ? '👨‍👩‍👧' : type === 'Friend' ? '🤝' : type === 'Colleague' ? '💼' : '👤'} {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!newContactName.trim() || !newContactWhatsapp.trim()) return;
                const contact = {
                  id: Date.now(),
                  name: newContactName.trim(),
                  whatsapp: newContactWhatsapp.trim(),
                  type: newContactType,
                };
                const updated = [...emergencyContacts, contact];
                setEmergencyContacts(updated);
                localStorage.setItem('trinetra_emergency_contacts', JSON.stringify(updated));
                setNewContactName('');
                setNewContactWhatsapp('');
                setNewContactType('Family Member');
              }}
              style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: (!newContactName.trim() || !newContactWhatsapp.trim()) ? 0.5 : 1,
              }}
            >
              <span>📱</span> Add Emergency Contact
            </button>
          </div>

          {/* Saved Contacts List */}
          {emergencyContacts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', marginBottom: '4px' }}>
                SAVED CONTACTS ({emergencyContacts.length})
              </div>
              {emergencyContacts.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                  }}>
                    {c.type === 'Family Member' ? '👨‍👩‍👧' : c.type === 'Friend' ? '🤝' : c.type === 'Colleague' ? '💼' : '👤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#eee' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#25D366', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📱 {c.whatsapp}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{c.type}</div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = emergencyContacts.filter(ec => ec.id !== c.id);
                      setEmergencyContacts(updated);
                      localStorage.setItem('trinetra_emergency_contacts', JSON.stringify(updated));
                    }}
                    style={{
                      background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d',
                      width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {emergencyContacts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#444', fontSize: '13px' }}>
              No emergency contacts added yet.
              <br />
              <span style={{ fontSize: '11px', color: '#333' }}>Add contacts to alert via WhatsApp during SOS</span>
            </div>
          )}
        </div>

        {/* SETTINGS SECTION */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "20px", color: "#888" }}>SYSTEM PREFERENCES</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>Night Mode</span>
                <span style={{ fontSize: '11px', color: '#555' }}>Optimized dark interface</span>
              </div>
              <button onClick={() => updateSetting("dark", !dark, setDark)} style={{ width: 48, height: 26, borderRadius: 13, background: dark ? "var(--accent)" : "#222", border: "none", position: "relative", transition: '0.3s' }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#000", position: "absolute", top: 3, left: dark ? 25 : 3, transition: "0.3s" }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>AI Voice Feedback</span>
                <span style={{ fontSize: '11px', color: '#555' }}>Voice safety notifications</span>
              </div>
              <button onClick={() => updateSetting("voice", !voiceAlerts, setVoiceAlerts)} style={{ width: 48, height: 26, borderRadius: 13, background: voiceAlerts ? "var(--accent)" : "#222", border: "none", position: "relative", transition: '0.3s' }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#000", position: "absolute", top: 3, left: voiceAlerts ? 25 : 3, transition: "0.3s" }} />
              </button>
            </div>
          </div>
        </div>

        {/* HELP & SUPPORT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaQuestionCircle color="#888" />
            <span style={{ fontSize: '14px', flex: 1 }}>How it works?</span>
            <span style={{ fontSize: '12px', color: '#444' }}>→</span>
          </div>
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaExclamationTriangle color="#ff4d4d" />
            <span style={{ fontSize: '14px', flex: 1, color: '#ff4d4d' }}>Emergency Guidelines</span>
            <span style={{ fontSize: '12px', color: '#444' }}>→</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#333', fontSize: '10px', letterSpacing: '2px' }}>
          TRINETRA VERSION 2.1.0-STABLE
        </div>

      </main>
    </div>
  );
}
