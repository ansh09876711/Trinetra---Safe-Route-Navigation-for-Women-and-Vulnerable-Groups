import React from "react";
import { FaTimes, FaUserLock, FaMapMarkerAlt, FaShieldAlt, FaRoute, FaMapMarkedAlt, FaBroadcastTower, FaMicrophoneAlt } from "react-icons/fa";

export default function HowItWorksWomenModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <FaUserLock />,
      title: "Secure User Login",
      desc: "User logs in securely to the system",
      color: "#4285F4"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Smart Destination Input",
      desc: "User enters destination and system analyzes context",
      color: "#34A853"
    },
    {
      icon: <FaShieldAlt />,
      title: "AI Safety Audit",
      desc: "AI scans datasets for safety information",
      color: "#7FB432"
    },
    {
      icon: <FaRoute />,
      title: "Safety Score Comparison",
      desc: "System compares routes based on safety scores",
      color: "#1AA9BC"
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "Interactive Tactical Map",
      desc: "User views interactive map with red zone indicators",
      color: "#E2B800"
    },
    {
      icon: <FaBroadcastTower />,
      title: "Live Navigation & Command Sync",
      desc: "System provides live navigation and syncs with HQ",
      color: "#E36C2F"
    },
    {
      icon: <FaMicrophoneAlt />,
      title: "AI-Driven Guardian Assurance",
      desc: "Voice AI agent sends alerts to guardian dashboard",
      color: "#EA4335"
    }
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(5, 7, 10, 0.98)",
      backdropFilter: "blur(20px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1100px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "32px",
        padding: "40px",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
      }}>
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            border: "none",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.3s"
          }}
          onMouseOver={(e) => e.target.style.background = "rgba(255, 77, 77, 0.2)"}
          onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.05)"}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "10px" }}>Trinetra Safety Lifecycle with Guardian AI</h2>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.4)", fontWeight: 500 }}>
            Automated intelligence working in the background to ensure your safe arrival.
          </p>
        </div>

        {/* FLOWCHART DESKTOP */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          padding: "40px 0",
          flexWrap: "wrap",
          gap: "40px 0"
        }}>
          {/* CURVED DOTTED LINE (DESKTOP ONLY) */}
          <svg className="flow-line" style={{
            position: "absolute",
            top: "90px",
            left: "5%",
            width: "90%",
            height: "100px",
            zIndex: 0,
          }}>
            <path 
              d="M 0 50 Q 150 0 300 50 T 600 50 T 900 50" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.2)" 
              strokeWidth="2" 
              strokeDasharray="8 8"
            />
          </svg>

          {steps.map((step, i) => (
            <div key={i} className="flow-step" style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
              animation: `slideUp 0.5s ease ${i * 0.1}s both`
            }}>
              {/* TOP LABEL (Alternating) */}
              <div className="step-label-top" style={{ marginBottom: "30px", height: "60px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                {i % 2 === 0 && (
                  <>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: step.color, marginBottom: "4px", textTransform: 'uppercase' }}>{step.title}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", maxWidth: "120px", margin: "0 auto" }}>{step.desc}</div>
                  </>
                )}
              </div>

              {/* THE CIRCLE */}
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: step.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                color: "#fff",
                boxShadow: `0 10px 25px ${step.color}40`,
                marginBottom: "30px",
                position: "relative",
                transition: '0.3s'
              }} className="step-circle">
                {step.icon}
                {/* Connector Dot */}
                <div style={{
                  position: "absolute",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "12px",
                  height: "12px",
                  background: step.color,
                  borderRadius: "50%",
                  border: "2px solid #05070a",
                  animation: 'pulse-dot 2s infinite'
                }}></div>
              </div>

              {/* BOTTOM LABEL (Alternating) */}
              <div className="step-label-bottom" style={{ marginTop: "0", height: "60px" }}>
                {i % 2 !== 0 && (
                  <>
                    <div style={{ fontSize: "12px", fontWeight: 900, color: step.color, marginBottom: "4px", textTransform: 'uppercase' }}>{step.title}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", maxWidth: "120px", margin: "0 auto" }}>{step.desc}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "60px", textAlign: "center" }}>
          <button 
            onClick={onClose}
            style={{
              padding: "16px 40px",
              borderRadius: "15px",
              background: "#00e5a0",
              color: "#000",
              fontWeight: 900,
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              letterSpacing: "1px",
              boxShadow: "0 10px 30px rgba(0, 229, 160, 0.3)",
              transition: '0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            UNDERSTOOD
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
        
        .flow-step { width: 14.28%; }
        @media (max-width: 900px) {
          .flow-line { display: none !important; }
          .flow-step { width: 100% !important; margin-bottom: 20px; }
          .step-label-top, .step-label-bottom { height: auto !important; margin: 10px 0 !important; }
          .step-label-top { order: 2; }
          .step-circle { order: 1; margin-bottom: 10px !important; }
          .step-label-bottom { order: 3; }
        }
        .step-circle:hover { transform: scale(1.1); }
      `}</style>
    </div>
  );
}
