import React from "react";
import { FaUserLock, FaMapMarkerAlt, FaShieldAlt, FaRoute, FaMapMarkedAlt, FaBroadcastTower, FaMicrophoneAlt } from "react-icons/fa";

export default function SafetyLifecycleSection() {
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
    <section className="safety-lifecycle-section" style={{
      padding: "100px 20px",
      background: "linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)",
      overflow: "hidden"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="landing-section-tag">Tactical Workflow</div>
          <h2 className="gradient-text" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: "16px" }}>
            Trinetra Safety Lifecycle
          </h2>
          <p style={{ color: "var(--text3)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Our AI-driven ecosystem works tirelessly to ensure every journey is protected by real-time intelligence.
          </p>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          padding: "60px 0",
          flexWrap: "wrap",
          gap: "40px 0"
        }}>
          {/* CURVED DOTTED LINE (DESKTOP ONLY) */}
          <svg className="flow-line-static" style={{
            position: "absolute",
            top: "110px",
            left: "5%",
            width: "90%",
            height: "100px",
            zIndex: 0,
          }}>
            <path 
              d="M 0 50 Q 150 0 300 50 T 600 50 T 900 50" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeWidth="2" 
              strokeDasharray="8 8"
            />
          </svg>

          {steps.map((step, i) => (
            <div key={i} className="flow-step-static" style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}>
              {/* TOP LABEL (Alternating) */}
              <div className="step-label-top-static" style={{ marginBottom: "30px", height: "70px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                {i % 2 === 0 && (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: step.color, marginBottom: "4px", textTransform: 'uppercase', letterSpacing: '1px' }}>{step.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text3)", maxWidth: "140px", margin: "0 auto", lineHeight: 1.4 }}>{step.desc}</div>
                  </>
                )}
              </div>

              {/* THE CIRCLE */}
              <div style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: step.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "#fff",
                boxShadow: `0 15px 35px ${step.color}30`,
                marginBottom: "30px",
                position: "relative",
                transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} className="step-circle-static">
                {step.icon}
                {/* Connector Dot */}
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "14px",
                  height: "14px",
                  background: step.color,
                  borderRadius: "50%",
                  border: "3px solid var(--bg)",
                  animation: 'pulse-dot-static 2s infinite'
                }}></div>
              </div>

              {/* BOTTOM LABEL (Alternating) */}
              <div className="step-label-bottom-static" style={{ marginTop: "0", height: "70px" }}>
                {i % 2 !== 0 && (
                  <>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: step.color, marginBottom: "4px", textTransform: 'uppercase', letterSpacing: '1px' }}>{step.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text3)", maxWidth: "140px", margin: "0 auto", lineHeight: 1.4 }}>{step.desc}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot-static { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 70% { box-shadow: 0 0 0 12px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
        
        .flow-step-static { width: 14.28%; }
        .step-circle-static:hover { transform: scale(1.15) rotate(5deg); box-shadow: 0 20px 45px rgba(0,0,0,0.4); }
        
        @media (max-width: 1024px) {
          .flow-step-static { width: 25%; }
          .flow-line-static { display: none; }
        }
        
        @media (max-width: 768px) {
          .flow-step-static { width: 50%; }
        }
        
        @media (max-width: 480px) {
          .flow-step-static { width: 100%; }
          .step-label-top-static, .step-label-bottom-static { height: auto !important; margin: 15px 0 !important; }
          .step-label-top-static { order: 2; }
          .step-circle-static { order: 1; margin-bottom: 10px !important; }
          .step-label-bottom-static { order: 3; }
        }
      `}</style>
    </section>
  );
}
