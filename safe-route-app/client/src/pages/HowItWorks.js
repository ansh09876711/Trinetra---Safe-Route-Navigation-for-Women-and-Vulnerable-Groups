import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUserPlus, FaUsers, FaMapMarkedAlt, FaRoute, 
  FaShieldAlt, FaExclamationTriangle, FaTaxi, FaChartLine,
  FaChevronLeft, FaArrowRight, FaLock
} from "react-icons/fa";
import Logo from "../components/Logo";

const STEPS = [
  {
    id: 1, icon: <FaUserPlus />, color: "#00e5a0", department: "REGISTRATION",
    title: "Secure Onboarding",
    desc: "Establish your encrypted profile within the TRINETRA ecosystem using 256-bit identity verification.",
    sub: ["Biometric Linkage", "Identity Masking", "OTP Verification"],
    link: "/register"
  },
  {
    id: 2, icon: <FaUsers />, color: "#4285F4", department: "GUARDIANS",
    title: "Circle of Trust",
    desc: "Designate up to 5 tactical contacts who receive instant telemetry during emergency events.",
    sub: ["Real-time Sync", "Direct SMS Fallback", "Encrypted Links"],
    link: "/sos"
  },
  {
    id: 3, icon: <FaMapMarkedAlt />, color: "#fbbc04", department: "TELEMETRY",
    title: "Live GPS Matrix",
    desc: "Activate your situational awareness. Your coordinates are mapped against the city's risk grid.",
    sub: ["Live Tracking", "Safe Zone Mapping", "Risk Heatmaps"],
    link: "/dashboard"
  },
  {
    id: 4, icon: <FaRoute />, color: "#0095ff", department: "NAVIGATION",
    title: "Tactical Routing",
    desc: "Our AI calculates paths through high-visibility areas, avoiding dimly lit or high-crime sectors.",
    sub: ["AI Pathfinding", "Voice HUD", "Offline Routing"],
    link: "/dashboard"
  },
  {
    id: 5, icon: <FaShieldAlt />, color: "#a855f7", department: "STATIONS",
    title: "Safety Node Locator",
    desc: "Instant access to the nearest authorized safety nodes including Police and medical facilities.",
    sub: ["Sorted by Distance", "Direct Command Link", "One-Tap SOS"],
    link: "/stations"
  },
  {
    id: 6, icon: <FaExclamationTriangle />, color: "#ff4d4d", department: "SOS_RESPONSE",
    title: "Critical SOS Signal",
    desc: "Trigger a high-priority emergency broadcast via hardware gesture or silent voice activation.",
    sub: ["Shake-to-SOS", "Silent Safe Word", "120dB Siren"],
    link: "/sos"
  },
  {
    id: 7, icon: <FaTaxi />, color: "#ff8c00", department: "TRANSIT",
    title: "Safe Taxi Protocol",
    desc: "Engage with verified transit partners. Every ride is monitored by the TRINETRA Command Center.",
    sub: ["Verified Driver ID", "Ride Monitoring", "Trip Sharing"],
    link: "/taxi"
  },
  {
    id: 8, icon: <FaChartLine />, color: "#06b6d4", department: "ANALYTICS",
    title: "Intelligence Center",
    desc: "Review detailed safety metrics and historical data to optimize your travel patterns.",
    sub: ["Safety Score Trends", "Historical Logs", "Threat Analytics"],
    link: "/analytics"
  },
  {
    id: 9, icon: <FaLock />, color: "#f43f5e", department: "CYBER_MESH",
    title: "Neural Threat Detection",
    desc: "Advanced AI monitors for unusual deviations in travel behavior and environmental stress.",
    sub: ["Behavioral Analysis", "Stress Patterning", "Auto-De-escalation"],
    link: "/analytics"
  },
  {
    id: 10, icon: <FaShieldAlt />, color: "#fbbf24", department: "INFRASTRUCTURE",
    title: "Encrypted Data Mesh",
    desc: "All telemetry is synced across a decentralized network ensuring 99.9% uptime for SOS signals.",
    sub: ["Decentralized Sync", "Zero-Knowledge Proofs", "Priority Bandwidth"],
    link: "/dashboard"
  },
  {
    id: 11, icon: <FaMapMarkedAlt />, color: "#8b5cf6", department: "SATELLITE",
    title: "Satellite Overwatch",
    desc: "High-resolution satellite positioning provides precise tracking even in low-signal metropolitan areas.",
    sub: ["GNSS Integration", "Sub-Meter Accuracy", "Atmospheric Correction"],
    link: "/dashboard"
  },
  {
    id: 12, icon: <FaUsers />, color: "#ec4899", department: "COMMUNITY",
    title: "Guardian Network",
    desc: "Crowdsourced safety intel from 50,000+ verified TRINETRA users creates a live human safety net.",
    sub: ["Live Reports", "Area Verifications", "Local Help Hubs"],
    link: "/community"
  },
  {
    id: 13, icon: <FaShieldAlt />, color: "#10b981", department: "FALLBACK",
    title: "Offline SOS Protocol",
    desc: "Zero-data emergency activation via high-priority cellular SMS gateway with GPS payload.",
    sub: ["No Data Required", "SMS Fallback", "Satellite Messaging"],
    link: "/sos"
  },
  {
    id: 14, icon: <FaLock />, color: "#3b82f6", department: "ARCHIVE",
    title: "Secure Legal Vault",
    desc: "Emergency evidence (audio/location) is stored in a court-admissible, encrypted legal vault.",
    sub: ["Chain of Custody", "Immutable Logs", "Evidence Export"],
    link: "/analytics"
  }
];

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 900);
  
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    
    const timer = setInterval(() => {
      setVisibleSteps(prev => {
        if (prev.length < STEPS.length) return [...prev, STEPS[prev.length]];
        return prev;
      });
    }, 200);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top right, #0a0f1a, #02040a)",
      color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif",
      paddingBottom: '100px'
    }}>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        .timeline-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(0,229,160,0.2), transparent); }
        @media (max-width: 900px) { .timeline-line { left: 30px; } }
      `}</style>

      {/* FIXED TOPBAR */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "15px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(2,4,10,0.8)", backdropFilter: "blur(20px)",
      }}>
        <Logo height={30} />
        <div style={{ display: "flex", gap: '15px' }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>
              <FaChevronLeft style={{ marginRight: '8px' }} /> BACK
            </button>
          </Link>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <button style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#00e5a0", color: "#000", cursor: "pointer", fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>
              GET STARTED <FaArrowRight style={{ marginLeft: '8px' }} />
            </button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ textAlign: "center", padding: "80px 20px", position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 20px', borderRadius: '50px', background: 'rgba(0, 229, 160, 0.05)', border: '1px solid rgba(0, 229, 160, 0.2)', marginBottom: '30px' }}>
            <div style={{ width: '6px', height: '6px', background: '#00e5a0', borderRadius: '50%', boxShadow: '0 0 10px #00e5a0' }}></div>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#00e5a0', letterSpacing: '3px' }}>MISSION BRIEFING</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, marginBottom: '20px' }}>
            The Architecture of <span style={{ color: '#00e5a0' }}>Safety</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Trinetra is an integrated security ecosystem. Here is a tactical breakdown of how we protect you at every step of your journey.
        </p>
      </section>

      {/* HOLOGRAPHIC BLUEPRINT GRID */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 100px', position: 'relative' }}>
        
        {/* SVG DATA FLOWS (Visible on Desktop) */}
        {!isMobileView && (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.3 }}>
            <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00e5a0" stopOpacity="0" />
                    <stop offset="50%" stopColor="#00e5a0" stopOpacity="1" />
                    <stop offset="100%" stopColor="#00e5a0" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Paths connecting nodes (Simplified grid representation) */}
            <path d="M 300 200 L 900 200 L 900 500 L 300 500 L 300 800 L 900 800" fill="none" stroke="rgba(0, 229, 160, 0.1)" strokeWidth="2" />
            <circle cx="300" cy="200" r="3" fill="#00e5a0">
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}

        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobileView ? '1fr' : 'repeat(3, 1fr)', 
            gap: '30px',
            position: 'relative',
            zIndex: 2
        }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ 
                opacity: visibleSteps.includes(step) ? 1 : 0,
                transform: visibleSteps.includes(step) ? 'scale(1)' : 'scale(0.9)',
                transition: 'all 0.5s ease',
            }}>
              <div style={{ 
                  background: 'rgba(14, 17, 25, 0.6)', 
                  border: `1px solid ${step.color}20`,
                  borderRadius: '24px',
                  padding: '30px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  backdropFilter: 'blur(20px)',
                  transition: '0.3s'
              }} className="blueprint-node">
                
                {/* Node Label */}
                <div style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '9px', fontWeight: 900, color: step.color, letterSpacing: '2px' }}>
                    0{step.id} // SECURE_NODE
                </div>

                {/* Hexagon Icon Wrap */}
                <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: `${step.color}15`, 
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '20px', 
                    color: step.color, 
                    marginBottom: '20px'
                }}>
                    {step.icon}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, flex: 1, marginBottom: '20px' }}>{step.desc}</p>
                
                {/* Tactical Features */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {step.sub.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '4px', height: '4px', background: step.color, borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{s}</span>
                        </div>
                    ))}
                </div>

                <Link to={step.link} style={{ textDecoration: 'none', marginTop: '20px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: step.color, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        INITIALIZE PORTAL <FaArrowRight fontSize={8} />
                    </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* --- TACTICAL ESCALATION PROTOCOL --- */}
        <div style={{ marginTop: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 900 }}>Tactical Escalation Protocol</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Response hierarchy based on incident severity</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(4, 1fr)', gap: '15px' }}>
                {[
                    { level: "LVL_01", status: "MONITORING", color: "#00e5a0", desc: "Standard GPS drift monitoring & safe route guidance active." },
                    { level: "LVL_02", status: "ALERT", color: "#fbbf24", desc: "Anomalous movement detected. Guardian contacts notified of status." },
                    { level: "LVL_03", status: "EMERGENCY", color: "#f43f5e", desc: "SOS triggered. Police dispatch & active location broadcast enabled." },
                    { level: "LVL_04", status: "RECOVERY", color: "#4285F4", desc: "Post-event support. Legal vault locking & medical routing active." }
                ].map((p, i) => (
                    <div key={i} style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '25px', 
                        borderRadius: '20px', 
                        border: `1px solid ${p.color}30`,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: p.color, marginBottom: '10px' }}>{p.level}</div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', marginBottom: '15px', letterSpacing: '1px' }}>{p.status}</div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- SYSTEM INTEGRITY REPORT --- */}
        <div style={{ marginTop: '80px', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>SYSTEM_INTEGRITY_REPORT</h3>
                <div style={{ padding: '4px 12px', background: 'rgba(0, 229, 160, 0.1)', color: '#00e5a0', borderRadius: '4px', fontSize: '10px', fontWeight: 900 }}>v4.2.0_STABLE</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
                {[
                    { label: "Signal Latency", value: "0.42ms", sub: "Ultra-low response", color: "#00e5a0" },
                    { label: "Active Safety Nodes", value: "1,248", sub: "Across city mesh", color: "#4285F4" },
                    { label: "Encryption Strength", value: "AES-256", sub: "Quantum resistant", color: "#f43f5e" },
                    { label: "Network Uptime", value: "99.99%", sub: "High availability", color: "#fbbf24" }
                ].map((stat, i) => (
                    <div key={i} style={{ borderLeft: `2px solid ${stat.color}`, paddingLeft: '15px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '5px' }}>{stat.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '2px' }}>{stat.value}</div>
                        <div style={{ fontSize: '10px', color: stat.color, fontWeight: 700 }}>{stat.sub}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CENTRAL SECURITY CORE --- */}
        <div style={{ 
            marginTop: '80px', 
            background: 'radial-gradient(circle at center, rgba(0, 229, 160, 0.05) 0%, transparent 70%)',
            border: '1px solid rgba(0, 229, 160, 0.1)',
            borderRadius: '40px',
            padding: '60px 40px',
            textAlign: 'center'
        }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 30px' }}>
                <div style={{ position: 'absolute', inset: 0, border: '2px dashed #00e5a0', borderRadius: '50%', animation: 'spin 10s linear infinite', opacity: 0.3 }}></div>
                <div style={{ position: 'absolute', inset: '10px', background: 'rgba(0, 229, 160, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#00e5a0' }}>
                    <FaLock />
                </div>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '15px' }}>GLOBAL SECURITY CORE</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                All nodes are linked to the Trinetra Global Security Core, ensuring sub-second response times across the entire network.
            </p>
            <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '16px 40px', borderRadius: '15px', background: '#00e5a0', color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', letterSpacing: '1px', boxShadow: '0 10px 30px rgba(0, 229, 160, 0.3)' }}>
                    GET STARTED
                </button>
            </Link>
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .blueprint-node:hover {
            background: rgba(14, 17, 25, 0.8);
            border-color: rgba(255,255,255,0.2);
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
