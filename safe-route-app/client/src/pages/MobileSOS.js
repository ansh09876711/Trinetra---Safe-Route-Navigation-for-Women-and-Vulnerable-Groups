import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaBars, FaShieldAlt, FaPlus, FaHome, FaBriefcase, 
  FaHistory, FaUser, FaInfoCircle, FaPhone, FaWhatsapp, FaTrash 
} from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import "./MobileSOS.css";

const STORAGE_KEY = "nr_sos_contacts";
const MSG_KEY = "nr_sos_message";

const MobileSOS = ({ user, onLogout }) => {
  const [contacts, setContacts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [message, setMessage] = useState("Emergency! I need help. This is my live location:");
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopPass, setStopPass] = useState("");
  const [audioCtx, setAudioCtx] = useState(null);
  const [sirenNodes, setSirenNodes] = useState(null);

  // New Contact States
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactWhatsapp, setNewContactWhatsapp] = useState("");
  const [newContactType, setNewContactType] = useState("Family Member");
  const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem("trinetra_permissions") || "{}"));
  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setContacts(saved);
    const savedMsg = localStorage.getItem(MSG_KEY);
    if (savedMsg) setMessage(savedMsg);
  }, []);

  const playSiren = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(ctx);
      setSirenPlaying(true);

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 900;

      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.value = 905;

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 1.5;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 200;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.connect(osc2.frequency);

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.3;

      osc.connect(masterGain);
      osc2.connect(masterGain);
      masterGain.connect(ctx.destination);

      lfo.start();
      osc.start();
      osc2.start();

      setSirenNodes({ osc, osc2, lfo, masterGain });
    } catch (e) { console.error(e); }
  };

  const stopSiren = () => {
    if (stopPass === "1234") {
      if (sirenNodes) {
        sirenNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          sirenNodes.osc.stop();
          sirenNodes.osc2.stop();
          sirenNodes.lfo.stop();
          audioCtx.close();
        }, 600);
      }
      setSirenPlaying(false);
      setShowStopModal(false);
      setSosActive(false);
      setShowCallOverlay(false);
      window.speechSynthesis.cancel();
      setStopPass("");
    } else {
      alert("Wrong Password!");
    }
  };

  const speak = (txt) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`Emergency alert. ${txt}`);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const handleSOS = () => {
    if (sosActive) return;
    if (contacts.length === 0) {
      alert("Please add emergency contacts first!");
      return;
    }

    setSosActive(true);
    setShowCallOverlay(true);
    setCountdown(15);

    // Siren delay
    setTimeout(() => playSiren(), 5000);

    // Call simulation
    const primary = contacts[0].phone.replace(/\D/g, "");
    window.location.href = `tel:${primary}`;

    // WhatsApp alerting
    contacts.forEach(c => {
        const waNum = (c.whatsapp || c.phone).replace(/\D/g, "");
        if (waNum) {
            const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        }
    });

    // --- SYNC SOS REPORT TO FIREBASE ---
    const submitReport = async () => {
        try {
            let lat = 0, lng = 0;
            let locName = "Mobile SOS Triggered";

            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
                    lat = pos.coords.latitude; lng = pos.coords.longitude;
                    
                    // Reverse geocode
                    const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
                    const data = await rev.json();
                    locName = data.display_name || "Mobile SOS Triggered";
                } catch (err) {
                    console.warn("GPS/Geocode failed:", err);
                }
            }

            const reportData = {
                userId: loggedInUser.uid || loggedInUser.id || "unknown",
                userName: loggedInUser.name || "TRINETRA Mobile User",
                userMobile: loggedInUser.mobile || "N/A",
                type: "SOS",
                status: "ACTIVE",
                timestamp: new Date().toISOString(),
                createdAt: serverTimestamp(),
                lat, lng,
                locationName: locName,
                message: message
            };

            await addDoc(collection(db, "reports"), reportData);
            console.log("✅ Mobile SOS Synced to Firebase");
        } catch (e) {
            console.error("❌ Mobile SOS Sync Failed:", e);
        }
    };
    submitReport();

    // Countdown for AI speech
    let c = 15;
    const timer = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timer);
        speak(message);
      }
    }, 1000);
  };

  const saveContact = () => {
    if (!newContactName || !newContactPhone) {
        alert("Please enter Name and Mobile Number");
        return;
    }
    const contactId = Date.now();
    const newContact = {
      id: contactId,
      name: newContactName,
      phone: newContactPhone,
      whatsapp: newContactWhatsapp || newContactPhone, // Fallback to mobile if whatsapp empty
      type: newContactType
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Auto WhatsApp Invite Link
    const portalUrl = `${window.location.origin}/guardian?userId=${loggedInUser.id}&contactId=${contactId}`;
    const inviteMsg = encodeURIComponent(`Hi ${newContactName}, I've added you as my Emergency Contact on TRINETRA. Please click here to monitor my safety: ${portalUrl}`);
    window.open(`https://wa.me/${(newContactWhatsapp || newContactPhone).replace(/\D/g, "")}?text=${inviteMsg}`, '_blank');

    setNewContactName("");
    setNewContactPhone("");
    setNewContactWhatsapp("");
    setNewContactType("Family Member");
  };

  const togglePermission = async (contactId) => {
    const newVal = !permissions[contactId];
    const updated = { ...permissions, [contactId]: newVal };
    setPermissions(updated);
    localStorage.setItem("trinetra_permissions", JSON.stringify(updated));
    
    // Sync with backend
    try {
        await fetch('http://localhost:5005/api/sos/permission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId, allowed: newVal })
        });
    } catch (e) {}
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="mobile-sos-root">
      <header className="mob-sos-header">
        <button className="mob-top-btn" onClick={() => setSidebarOpen(true)}><FaBars size={20} /></button>
        <Logo height={20} />
        <div style={{ width: 44 }} /> {/* Spacer */}
      </header>

      <div className="mob-sos-content">
        {/* SOS Trigger Area */}
        <section className="mob-sos-trigger-section">
          <div className="mob-sos-btn-wrap">
            {sosActive && <div className="mob-sos-ripple" />}
            {sosActive && <div className="mob-sos-ripple" style={{ animationDelay: '0.8s' }} />}
            <button className="mob-sos-main-btn" onClick={handleSOS}>
              <span className="sos-label">SOS</span>
              <span className="sos-sub">{sosActive ? "ACTIVE" : "TAP TO TRIGGER"}</span>
            </button>
          </div>
          
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div className="status-pill live" style={{ padding: '6px 16px', fontSize: 12 }}>
              ● Security Protocol Armed
            </div>
          </div>
        </section>

        {/* Contacts Section */}
        <div className="mob-card" style={{ padding: '20px' }}>
          <div className="mob-card-title" style={{ marginBottom: 15, fontSize: 18, color: 'var(--accent)', fontWeight: 800 }}>
            Emergency Contacts
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px 15px', borderRadius: 12, color: 'white', fontSize: 14 }}
            />
            
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px 15px', borderRadius: 12, color: 'white', fontSize: 14 }}
              />
              <input 
                type="tel" 
                placeholder="WhatsApp Number" 
                value={newContactWhatsapp}
                onChange={(e) => setNewContactWhatsapp(e.target.value)}
                style={{ flex: 1, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', padding: '12px 15px', borderRadius: 12, color: '#25D366', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select 
                value={newContactType}
                onChange={(e) => setNewContactType(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '12px 15px', borderRadius: 12, color: 'white', fontSize: 14, outline: 'none' }}
              >
                <option value="Family Member" style={{ background: '#1a1d24' }}>Family Member</option>
                <option value="Friend" style={{ background: '#1a1d24' }}>Friend</option>
                <option value="Colleague" style={{ background: '#1a1d24' }}>Colleague</option>
                <option value="Other" style={{ background: '#1a1d24' }}>Other</option>
              </select>
              
              <button 
                onClick={saveContact}
                style={{ width: 50, height: 45, background: 'var(--accent)', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <FaPlus size={20} color="black" />
              </button>
            </div>
          </div>

          <div className="mob-contact-list" style={{ marginTop: 25, borderTop: '1px solid var(--border)', paddingTop: 15 }}>
            {contacts.map(c => (
              <div key={c.id} className="mob-contact-item" style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 14, marginBottom: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="mob-contact-avatar" style={{ background: 'var(--accent)', color: 'black', fontWeight: 800 }}>
                    {c.name[0]}
                </div>
                <div className="mob-contact-info" style={{ flex: 1 }}>
                  <div className="mob-contact-name" style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{c.type}</div>
                  <div style={{ display: 'flex', gap: 15, marginTop: 5 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>📞 {c.phone}</span>
                    <span style={{ fontSize: 12, color: '#25D366', display: 'flex', alignItems: 'center', gap: 4 }}>💬 {c.whatsapp}</span>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button 
                        onClick={() => {
                            const portalUrl = `${window.location.origin}/guardian?userId=${loggedInUser.id}&contactId=${c.id}`;
                            const inviteMsg = encodeURIComponent(`Hi ${c.name}, monitoring portal link: ${portalUrl}`);
                            window.open(`https://wa.me/${(c.whatsapp || c.phone).replace(/\D/g, "")}?text=${inviteMsg}`, '_blank');
                        }}
                        style={{ flex: 1.5, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', fontSize: 10, padding: '6px', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}
                    >
                        SEND INVITE LINK 💬
                    </button>
                    <button 
                        onClick={() => togglePermission(c.id)}
                        style={{ 
                            flex: 1,
                            background: permissions[c.id] !== false ? 'var(--accent)' : 'var(--bg3)', 
                            border: 'none', padding: '6px', borderRadius: 10, color: permissions[c.id] !== false ? '#000' : '#fff', 
                            fontSize: 10, fontWeight: 800, cursor: 'pointer' 
                        }}
                    >
                        LIVE: {permissions[c.id] !== false ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => deleteContact(c.id)}
                  style={{ background: 'rgba(255,77,77,0.1)', border: 'none', padding: 10, borderRadius: 10, color: '#ff4d4d', cursor: 'pointer' }}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
            {contacts.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '20px 0' }}>
                No contacts added. Fill the form above to add.
              </div>
            )}
          </div>
        </div>

        {/* Protocol Steps */}
        <div className="mob-card">
          <div className="mob-card-title">Security Workflow</div>
          <div className="mob-protocol-grid">
            <div className="protocol-item">
              <span className="protocol-icon">📍</span>
              <span className="protocol-text">Live Tracking</span>
            </div>
            <div className="protocol-item">
              <span className="protocol-icon">🤖</span>
              <span className="protocol-text">AI Voice Call</span>
            </div>
            <div className="protocol-item">
              <span className="protocol-icon">📢</span>
              <span className="protocol-text">Public Alerts</span>
            </div>
            <div className="protocol-item">
              <span className="protocol-icon">📄</span>
              <span className="protocol-text">Legal Report</span>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Active Overlay */}
      {showCallOverlay && (
        <div className="mob-sos-overlay">
          <div className="mob-call-circle">📞</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ff4d4d' }}>EMERGENCY ACTIVE</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
            Calling {contacts[0]?.name || "Emergency Services"}...
          </p>
          
          <div className="mob-countdown-bar">
            <div className="mob-countdown-fill" style={{ width: `${(countdown/15)*100}%` }} />
          </div>
          
          <p style={{ fontWeight: 600, color: countdown < 5 ? '#ff4d4d' : 'var(--accent)' }}>
            {countdown > 0 ? `AI Assistant starting in ${countdown}s` : "AI Assistant is Speaking"}
          </p>

          <button className="mob-stop-btn" onClick={() => setShowStopModal(true)}>
            STOP EMERGENCY
          </button>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="mob-sos-overlay" style={{ zIndex: 4000 }}>
          <div className="mob-card" style={{ width: '90%', maxWidth: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#fff' }}>Add Emergency Contact</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div className="mob-input-group">
                <label style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Name</label>
                <input 
                  type="text" 
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Mom"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: 12, borderRadius: 10, color: 'white' }}
                />
              </div>

              <div className="mob-input-group">
                <label style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Phone Number</label>
                <input 
                  type="tel" 
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: 12, borderRadius: 10, color: 'white' }}
                />
              </div>

              <div className="mob-input-group">
                <label style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Relationship</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Family Member', 'Friend', 'Colleague', 'Other'].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewContactType(type)}
                      style={{ 
                        padding: '8px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        border: newContactType === type ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: newContactType === type ? 'rgba(0,229,160,0.1)' : 'var(--bg2)',
                        color: newContactType === type ? 'var(--accent)' : 'var(--text3)',
                        transition: '0.2s'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  onClick={() => setShowAddContactModal(false)}
                  style={{ flex: 1, padding: 14, background: 'var(--bg3)', color: 'white', border: 'none', borderRadius: 12 }}
                >Cancel</button>
                <button 
                  onClick={saveContact}
                  style={{ flex: 1, padding: 14, background: 'var(--accent)', color: 'black', border: 'none', borderRadius: 12, fontWeight: 800 }}
                >SAVE CONTACT</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showStopModal && (
        <div className="mob-sos-overlay" style={{ zIndex: 3000 }}>
          <div className="mob-card" style={{ width: '100%', maxWidth: 300, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Stop Emergency</h3>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20 }}>
              Enter password (1234) to deactivate siren and alerts.
            </p>
            <input 
              type="password" 
              value={stopPass}
              onChange={(e) => setStopPass(e.target.value)}
              placeholder="••••"
              style={{ 
                width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', 
                padding: 12, borderRadius: 12, color: 'white', textAlign: 'center', 
                fontSize: 20, letterSpacing: 8, marginBottom: 20 
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => setShowStopModal(false)}
                style={{ flex: 1, padding: 12, background: 'var(--bg3)', color: 'white', border: 'none', borderRadius: 10 }}
              >Cancel</button>
              <button 
                onClick={stopSiren}
                style={{ flex: 1, padding: 12, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700 }}
              >STOP</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <Link to="/dashboard" className="mob-tab">
          <span className="mob-tab-icon">🏠</span>
          <span className="mob-tab-label">Home</span>
        </Link>
        <Link to="/stations" className="mob-tab">
          <span className="mob-tab-icon">🚉</span>
          <span className="mob-tab-label">Help</span>
        </Link>
        <div className="mob-sos-tab">
          🆘
        </div>
        <Link to="/history" className="mob-tab">
          <span className="mob-tab-icon">📜</span>
          <span className="mob-tab-label">History</span>
        </Link>
        <Link to="/profile" className="mob-tab">
          <span className="mob-tab-icon">👤</span>
          <span className="mob-tab-label">Profile</span>
        </Link>
      </nav>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user} 
        onLogout={onLogout}
      />
    </div>
  );
};

export default MobileSOS;
