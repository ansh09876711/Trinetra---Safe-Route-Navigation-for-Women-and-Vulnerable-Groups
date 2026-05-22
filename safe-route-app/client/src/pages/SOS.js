import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTrash, FaPlus, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaShieldAlt, FaHistory, FaInfoCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import MobileSOS from "./MobileSOS";
import "./Dashboard.css";
import "./SOS.css";

const STORAGE_KEY = "nr_sos_contacts";
const MSG_KEY = "nr_sos_message";

const TYPE_STYLE = {
  Police: { color: "#0095ff", bg: "rgba(0,149,255,0.1)", border: "rgba(0,149,255,0.25)" },
  Hospital: { color: "#ff4d4d", bg: "rgba(255,77,77,0.1)", border: "rgba(255,77,77,0.25)" },
  Fire: { color: "#ff8c00", bg: "rgba(255,140,0,0.1)", border: "rgba(255,140,0,0.25)" },
  Government: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)", border: "rgba(0,229,160,0.25)" },
};

export default function SOS() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [type, setType] = useState("Family Member");
  const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem("trinetra_permissions") || "{}"));
  const [message, setMessage] = useState("Emergency! I need help. This is my live location:");
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [assistantCountdown, setAssistantCountdown] = useState(15);
  const [enablePublicAlerts, setEnablePublicAlerts] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [sirenOscillator, setSirenOscillator] = useState(null);
  const [sirenGain, setSirenGain] = useState(null);
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopPasswordInput, setStopPasswordInput] = useState("");
  const [showStopPass, setShowStopPass] = useState(false);
  const [sirenPassword] = useState(localStorage.getItem("trinetra_siren_password") || "1234");

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userInitials = (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkRes = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkRes);
    return () => window.removeEventListener('resize', checkRes);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setContacts(saved);
    } catch {}
    const savedMsg = localStorage.getItem(MSG_KEY);
    if (savedMsg) setMessage(savedMsg);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        setLocation({ lat, lng, url: `https://maps.google.com/?q=${lat},${lng}` });
        // Fetch nearby stations from crime-zones API (acting as stations for now)
        fetch(`http://localhost:5000/api/crime-zones?lat=${lat}&lng=${lng}`)
          .then(r => r.json()).then(d => setNearbyStations(d.zones.slice(0, 5)))
          .catch(() => {});
      });
    }
  }, []);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return showToast("Name aur Mobile daalo", "danger");
    const contactId = Date.now();
    const updated = [
      { 
        id: contactId, 
        name: name.trim(), 
        phone: phone.trim(), 
        whatsapp: whatsapp.trim() || phone.trim(),
        type: type 
      }, 
      ...contacts
    ];
    setContacts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Auto WhatsApp Invite Link
    const portalUrl = `${window.location.origin}/guardian?userId=${loggedInUser.id}&contactId=${contactId}`;
    const inviteMsg = encodeURIComponent(`Hi ${name}, I've added you as my Emergency Contact on TRINETRA. Please click here to monitor my safety: ${portalUrl}`);
    window.open(`https://wa.me/${(whatsapp || phone).replace(/\D/g, "")}?text=${inviteMsg}`, '_blank');

    setName(""); setPhone(""); setWhatsapp(""); setType("Family Member");
    showToast(`${name} add ho gaya! WhatsApp link sent.`, "success");
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
    showToast("Contact delete ho gaya", "info");
  };

  const speakMessage = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    // Stop any existing speech and clear the queue
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    // Use the most standard, clear English voice available
    const bestVoice = voices.find(v => v.lang === "en-US" && v.name.includes("Natural")) || 
                      voices.find(v => v.name.includes("Google") && v.lang.includes("en")) ||
                      voices.find(v => v.lang.includes("en")) ||
                      voices[0];

    const script = `Emergency alert. This is an automated report from TRINETRA Security. A user is in immediate distress. Their recorded message is: "${text}". I repeat, emergency assistance is required. GPS location has been sent to your phone. Please check your messages immediately.`;

    const u = new SpeechSynthesisUtterance(script);
    if (bestVoice) u.voice = bestVoice;
    u.lang = "en-US";
    u.rate = 0.95; // Almost normal speed for better clarity
    u.pitch = 1.0; 
    u.volume = 1.0;

    // Small delay to ensure the system is ready and any previous audio has fully stopped
    setTimeout(() => {
      window.speechSynthesis.speak(u);
    }, 300);
  };

  const playSiren = () => {
    try {
      setSirenPlaying(true);
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 900;

      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.value = 905;

      const freqLFO = ctx.createOscillator();
      freqLFO.type = "sine";
      freqLFO.frequency.value = 1.5;

      const freqLFOGain = ctx.createGain();
      freqLFOGain.gain.value = 200;

      freqLFO.connect(freqLFOGain);
      freqLFOGain.connect(osc.frequency);
      freqLFOGain.connect(osc2.frequency);

      const ampLFO = ctx.createOscillator();
      ampLFO.type = "sine";
      ampLFO.frequency.value = 1.5;

      const ampLFOGain = ctx.createGain();
      ampLFOGain.gain.value = 0.12;

      ampLFO.connect(ampLFOGain);

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.28;

      ampLFOGain.connect(masterGain.gain);

      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(512);
      for (let i = 0; i < 512; i++) {
        const x = (i * 2) / 512 - 1;
        curve[i] = (Math.PI + 60) * x / (Math.PI + 60 * Math.abs(x));
      }
      distortion.curve = curve;
      distortion.oversample = "4x";

      osc.connect(distortion);
      osc2.connect(distortion);
      distortion.connect(masterGain);
      masterGain.connect(ctx.destination);

      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.1);

      freqLFO.start(ctx.currentTime);
      ampLFO.start(ctx.currentTime);
      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      setSirenOscillator(osc);
      setSirenGain(masterGain);
      ctx._sirenExtra = { osc2, freqLFO, ampLFO };
    } catch (e) {
      console.error("Siren error:", e);
    }
  };

  const stopSiren = () => {
    if (stopPasswordInput === sirenPassword) {
      try {
        if (audioContext) {
          if (sirenGain) {
            sirenGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          }
          setTimeout(() => {
            try { sirenOscillator && sirenOscillator.stop(); } catch (e) {}
            try {
              if (audioContext._sirenExtra) {
                audioContext._sirenExtra.osc2.stop();
                audioContext._sirenExtra.freqLFO.stop();
                audioContext._sirenExtra.ampLFO.stop();
              }
            } catch (e) {}
          }, 350);
        }
      } catch (e) {}
      setSirenPlaying(false);
      setShowStopModal(false);
      setStopPasswordInput("");
      showToast("Siren stopped", "success");
      setSosActive(false);
      setShowCallOverlay(false);
      window.speechSynthesis.cancel();
    } else {
      showToast("Wrong password!", "danger");
      setStopPasswordInput("");
    }
  };

  const triggerSOS = async () => {
    if (sosActive) return;
    if (contacts.length === 0) return showToast("Pehle contacts add karein", "danger");
    
    setSosActive(true);
    setLocLoading(true);
    
    // Trigger siren after 5 seconds
    setTimeout(() => {
      playSiren();
    }, 5000);
    
    try {
      // 0. Unlock Speech (Browser requirement: must start speech during user gesture)
      const unlocker = new SpeechSynthesisUtterance("");
      unlocker.volume = 0;
      window.speechSynthesis.speak(unlocker);

      // 1. Start actual phone call to primary contact immediately
      const primary = contacts[0].phone.replace(/\D/g, "");
      window.location.href = `tel:${primary}`;

      // 2. Try to get high accuracy location (but don't block the report)
      let lat = 0, lng = 0;
      try {
        const pos = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (err) {
        console.warn("High accuracy GPS failed, using fallback.");
        if (location) { lat = location.lat; lng = location.lng; }
      }

      // 3. Generate Official Incident Report (PRIORITY)
      const savedReports = JSON.parse(localStorage.getItem('trinetra_sos_reports') || '[]');
      let locName = "Location Signal Weak (Searching...)";
      if (lat !== 0) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
          const data = await res.json();
          locName = data.display_name || `${lat}, ${lng}`;
        } catch (err) { locName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
      }

      const newReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: "SOS",
        status: "ACTIVE",
        lat: lat,
        lng: lng,
        locationName: locName,
        message: message,
        userName: loggedInUser.name || "TRINETRA User",
        userMobile: loggedInUser.mobile || "N/A"
      };
      
      localStorage.setItem('trinetra_sos_reports', JSON.stringify([...savedReports, newReport]));
      
      // 3.5 SYNC SOS REPORT TO BACKEND (Now using Firebase!)
      try {
        console.log("🔥 Syncing SOS to Firebase...");
        await addDoc(collection(db, "reports"), {
            ...newReport,
            userId: loggedInUser.uid || loggedInUser.id,
            createdAt: serverTimestamp()
        });
        console.log("✅ SOS Saved to Firestore!");
      } catch (e) {
        console.error("❌ Firebase Sync Failed:", e);
      }
      
      showToast("Official Incident Report Generated! 📄", "success");

      // 4. Update UI Location
      const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
      setLocation({ lat, lng, url: mapUrl });

      // 5. Show simulation overlay and start 15s AI Voice Assistant countdown
      setShowCallOverlay(true);
      setAssistantCountdown(15);
      
      let currentVal = 15;
      const timer = setInterval(() => {
        currentVal -= 1;
        setAssistantCountdown(currentVal);
        
        if (currentVal <= 0) {
          clearInterval(timer);
          speakMessage(message);
        }
      }, 1000);

      // 5. Native Call Relay (Free & Reliable for Demo)
      // This uses the device's native dialer to call the judge/mummy
      window.location.href = `tel:${primary}`;
      
      // 6. Professional Voice Assistant with "Call-Ready" Delay
      // We wait 8 seconds for the call to be picked up before speaking
      setTimeout(() => {
        speakMessage(message);
        showToast("AI Assistant is now delivering the report...", "info");
      }, 8000);

      // 7. Automatic WhatsApp Report (No Verification Needed)
      const msg = encodeURIComponent(`🚨 *TRINETRA SOS REPORT*\nUser: ${loggedInUser.name}\nMessage: ${message}\n📍 Location: ${mapUrl}\n\n[Please stay on the call to hear the AI Assistant]`);
      window.open(`https://wa.me/91${primary}?text=${msg}`, '_blank');
      
      showToast("Emergency Broadcast Initiated!", "success");

    } catch (e) {
      showToast("Location error, but alerts triggered!", "danger");
    } finally {
      setLocLoading(false);
      // Keep overlay for 60s or until manual close
      setTimeout(() => { setSosActive(false); }, 10000);
    }
  };

  if (isMobile) {
    return <MobileSOS user={loggedInUser} onLogout={() => { localStorage.removeItem("trinetra_user"); window.location.href="/"; }} />;
  }

  return (
    <div className="nr-root">
      <header className="nr-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="topbar-btn" onClick={() => setSidebarOpen(true)}><FaBars /></button>
          <div className="topbar-brand"><Logo /> <span style={{ color: "#fff", marginLeft: 4 }}>TRINETRA SOS</span></div>
        </div>
        <div className="topbar-right">
          <div className={`status-pill ${enablePublicAlerts ? "live" : "test"}`}>
            {enablePublicAlerts ? "● Live Mode" : "● Test Mode"}
          </div>
          <div className="sb-avatar" style={{ width: 32, height: 32 }}>{userInitials}</div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={() => { localStorage.removeItem("trinetra_user"); window.location.href="/"; }}
      />

      <main className="sos-container">
        {/* Left Side: Contacts */}
        <aside className="sos-side-panel">
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>Emergency Contacts</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" 
                style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "10px", borderRadius: 8, color: "#fff", fontSize: 13 }} />
              
              <div style={{ display: "flex", gap: 8 }}>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile Number" 
                  style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", padding: "10px", borderRadius: 8, color: "#fff", fontSize: 13 }} />
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (Optional)" 
                  style={{ flex: 1, background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)", padding: "10px", borderRadius: 8, color: "#25D366", fontSize: 13 }} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", padding: "10px", borderRadius: 8, color: "#fff", fontSize: 13, outline: 'none' }}
                >
                  <option value="Family Member">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
                <button onClick={addContact} style={{ background: "var(--accent)", color: "#000", border: "none", padding: "0 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>ADD</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "350px", overflowY: "auto", borderTop: '1px solid var(--border)', paddingTop: 15 }}>
              {contacts.map(c => (
                <div key={c.id} className="sos-contact-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12 }}>
                    <div className="sb-avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--accent)', color: 'black' }}>{c.name[0]}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name} <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 400 }}>({c.type})</span></div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>📞 {c.phone}</div>
                        <div style={{ fontSize: 10, color: "#25D366" }}>💬 {c.whatsapp}</div>
                        </div>
                    </div>
                    <button onClick={() => deleteContact(c.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><FaTrash size={12} /></button>
                  </div>
                  
                  <div style={{ width: '100%', marginTop: 10, display: 'flex', gap: 10 }}>
                    <button 
                        onClick={() => {
                            const firebaseUid = auth.currentUser?.uid || JSON.parse(localStorage.getItem("trinetra_user"))?.id || "unknown";
                            
                            if (firebaseUid === "unknown") {
                                showToast("Error: Identity not verified. Please re-login.", "danger");
                                return;
                            }

                            const portalUrl = `${window.location.origin}/guardian?userId=${firebaseUid}&contactId=${c.id}`;
                            const inviteMsg = encodeURIComponent(`🚨 TRINETRA SOS: I am in an emergency. Please track my live location and safety reports here: ${portalUrl}`);
                            window.open(`https://wa.me/${(c.whatsapp || c.phone).replace(/\D/g, "")}?text=${inviteMsg}`, '_blank');
                        }}
                        style={{ flex: 1, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', fontSize: 9, padding: '5px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
                    >
                        SEND INVITE LINK 💬
                    </button>
                    <button 
                        onClick={() => togglePermission(c.id)}
                        style={{ 
                            flex: 1,
                            background: permissions[c.id] !== false ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', 
                            border: permissions[c.id] !== false ? '1px solid #22c55e' : '1px solid var(--border)', 
                            padding: '10px', borderRadius: 12, 
                            color: permissions[c.id] !== false ? '#22c55e' : 'var(--text3)', 
                            fontSize: 10, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <span style={{ 
                            width: 6, height: 6, borderRadius: '50%', 
                            background: permissions[c.id] !== false ? '#22c55e' : '#666',
                            boxShadow: permissions[c.id] !== false ? '0 0 10px #22c55e' : 'none',
                            animation: permissions[c.id] !== false ? 'pulse 1.5s infinite' : 'none'
                        }} />
                        LIVE: {permissions[c.id] !== false ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 11, padding: "20px" }}>No contacts added.</div>}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>SOS Message</h3>
            <textarea value={message} onChange={e => setMessage(e.target.value)} 
              style={{ width: "100%", height: "80px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, color: "#fff", fontSize: 12, resize: "none" }} />
          </div>
        </aside>

        {/* Center: SOS Button */}
        <section className="sos-center-panel">
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(255,45,45,0.1)", borderRadius: 20, border: "1px solid rgba(255,45,45,0.2)", color: "var(--danger)", fontSize: 12, fontWeight: 600 }}>
              <div className="status-dot" style={{ background: "var(--danger)" }} /> SOS System Active
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {sosActive && (
              <>
                <div className="sos-ripple" />
                <div className="sos-ripple" />
                <div className="sos-ripple" />
              </>
            )}
            <button className={`sos-main-btn ${sosActive ? "active" : ""}`} onClick={triggerSOS}>
              <span className="sos-btn-label">SOS</span>
              <span className="sos-btn-sub">{sosActive ? "Sending..." : "Emergency Trigger"}</span>
            </button>
          </div>

          <div style={{ marginTop: 60, display: "flex", gap: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{contacts.length}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase" }}>Targets</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent2)" }}>ON</div>
              <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase" }}>GPS Link</div>
            </div>
          </div>
        </section>

        {/* Right Side: Nearby */}
        <aside className="sos-side-panel">
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Public Help</h3>
              <button onClick={() => setEnablePublicAlerts(!enablePublicAlerts)} 
                style={{ fontSize: 10, background: enablePublicAlerts ? "var(--accent2)" : "var(--bg3)", color: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "3px 8px", cursor: "pointer" }}>
                {enablePublicAlerts ? "ON" : "OFF"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {nearbyStations.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12 }}>
                   <span style={{ fontSize: 18 }}>{s.risk === 'red' ? '🚔' : s.risk === 'yellow' ? '🏥' : '🚒'}</span>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                     <div style={{ fontSize: 9, color: "var(--text3)" }}>Nearby Rescue Unit</div>
                   </div>
                   <div style={{ fontSize: 10, color: s.risk === 'red' ? 'var(--danger)' : 'var(--warn)', fontWeight: 700 }}>{s.dist ? `${s.dist.toFixed(1)}km` : "Nearby"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 15, display: "flex", alignItems: "center", gap: 8 }}>
              <FaInfoCircle color="var(--accent)" /> SOS Protocols
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12, color: "var(--text2)", display: "flex", gap: 8 }}><span style={{ color: "var(--accent)" }}>1.</span> Location pinpointing</div>
              <div style={{ fontSize: 12, color: "var(--text2)", display: "flex", gap: 8 }}><span style={{ color: "var(--accent)" }}>2.</span> AI Voice Assistant trigger</div>
              <div style={{ fontSize: 12, color: "var(--text2)", display: "flex", gap: 8 }}><span style={{ color: "var(--accent)" }}>3.</span> SMS & WhatsApp broadcast</div>
            </div>
          </div>
        </aside>
      </main>

      {/* Call Overlay */}
      {showCallOverlay && (
        <div className="call-overlay-premium" style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#fff" }}>
          <div style={{ width: 150, height: 150, borderRadius: "50%", background: "rgba(255,45,45,0.1)", border: "3px solid #ff4d4d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, marginBottom: 20, animation: "hyperPulse 1s infinite" }}>📞</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>SOS CALL ACTIVE</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 30 }}>Connecting to {contacts[0]?.name || "Primary Contact"}...</p>
          <div style={{ width: 250, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", background: "#ff4d4d", width: `${(assistantCountdown/15)*100}%`, transition: "width 1s linear" }} />
          </div>
          <p style={{ color: assistantCountdown < 5 ? "#ff4d4d" : "var(--accent2)", fontWeight: 600 }}>
            {assistantCountdown > 0 ? `AI Voice Assistant starting in ${assistantCountdown}s` : "Assistant is speaking..."}
          </p>
          <button onClick={() => {
            setShowStopModal(true);
          }} style={{ marginTop: 50, padding: "14px 48px", background: "#ff4d4d", color: "#fff", border: "none", borderRadius: 32, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(255,45,45,0.3)" }}>END EMERGENCY</button>
        </div>
      )}

      {/* Siren Stop Modal */}
      {sirenPlaying && (
        <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(15px)" }}>
          <div className="glass-card" style={{ width: 320, padding: 30, textAlign: "center", border: "1px solid var(--danger)" }}>
            <div style={{ fontSize: 40, marginBottom: 15 }}>🛑</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>STOP SIREN</h3>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>Enter security password to deactivate emergency alerts.</p>
            <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
              <input 
                type={showStopPass ? "text" : "password"} 
                value={stopPasswordInput} 
                onChange={e => setStopPasswordInput(e.target.value)}
                placeholder="Enter Password (1234)"
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", padding: "12px", paddingRight: "45px", borderRadius: 10, color: "#fff", textAlign: "center", fontSize: 16, letterSpacing: showStopPass ? 0 : 4 }}
              />
              <div onClick={() => setShowStopPass(!showStopPass)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--accent)', fontSize: '18px' }}>
                {showStopPass ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowStopModal(false)} style={{ flex: 1, padding: "12px", background: "var(--bg3)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>Cancel</button>
              <button onClick={stopSiren} style={{ flex: 1, padding: "12px", background: "var(--danger)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>STOP</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "rgba(10,12,16,0.9)", border: "1px solid var(--border)", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600, zIndex: 10001, backdropFilter: "blur(10px)" }}>
          {toast.type === "success" ? "✅" : "ℹ️"} {toast.text}
        </div>
      )}
    </div>
  );
}
