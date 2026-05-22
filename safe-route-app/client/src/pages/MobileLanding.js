import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaShieldAlt, FaMapMarkerAlt, FaPhone, FaArrowRight, FaWalking } from "react-icons/fa";
import Logo from "../components/Logo";
import HowItWorksWomenModal from "../components/HowItWorksWomenModal";
import "./MobileLanding.css";

const FEATURES = [
  { icon: "📍", title: "Smart GPS Tracking", desc: "Live location sharing with your trusted circle." },
  { icon: "🧠", title: "AI Route Analysis", desc: "Our AI avoids dimly lit or high-crime areas." },
  { icon: "🚨", title: "Shake-to-SOS", desc: "Hardware-level SOS trigger in under 1 second." },
];

const MobileLanding = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWomenFlow, setShowWomenFlow] = useState(false);

  return (
    <div className="mobile-landing-root">
      {/* Navigation */}
      <nav className="mob-land-nav">
        <Logo height={24} />
        <button className="mob-menu-trigger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Hero */}
      <header className="mob-hero">
        <div className="mob-hero-tag">
          <FaShieldAlt size={10} /> Trusted by 10k+ Women
        </div>
        <h1 className="mob-hero-title">
          Your Safety,<br />
          <span style={{ color: 'var(--accent)' }}>Our Priority.</span>
        </h1>
        <p className="mob-hero-desc">
          The AI-powered security companion designed to keep you safe on the streets of India.
        </p>
        <div className="mob-hero-cta" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/register" className="mob-btn-main" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Get Started Free <FaArrowRight size={14} style={{ marginLeft: 8 }} />
          </Link>
          <button 
            onClick={() => setShowWomenFlow(true)}
            className="mob-btn-secondary" 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: 'white', 
              padding: '16px', 
              borderRadius: '16px', 
              fontSize: '14px', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <FaWalking /> How it works for Women
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="mob-stats-grid">
        <div className="mob-stat-card">
          <div className="mob-stat-val">24/7</div>
          <div className="mob-stat-lab">Monitoring</div>
        </div>
        <div className="mob-stat-card">
          <div className="mob-stat-val">12k+</div>
          <div className="mob-stat-lab">Safe Routes</div>
        </div>
      </div>

      {/* Features */}
      <section className="mob-section">
        <div className="mob-sec-header">
          <div className="mob-sec-tag">Core Features</div>
          <h2 className="mob-sec-title">Built for Real Protection</h2>
        </div>

        {FEATURES.map((f, i) => (
          <div key={i} className="mob-feat-card">
            <div className="mob-feat-content">
              <div className="mob-feat-icon">{f.icon}</div>
              <h3 className="mob-feat-title">{f.title}</h3>
              <p className="mob-feat-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Why Section */}
      <section className="mob-section" style={{ background: 'var(--bg2)' }}>
        <div className="mob-sec-header">
          <div className="mob-sec-tag">The Reality</div>
          <h2 className="mob-sec-title">Women's Safety Crisis</h2>
        </div>
        <div style={{ background: 'rgba(255,77,77,0.1)', padding: 20, borderRadius: 20, border: '1px solid rgba(255,77,77,0.2)' }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#ff4d4d', fontWeight: 600 }}>
            Every 12 minutes, a crime is reported against a woman in India. TRINETRA uses AI to change this narrative.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mob-footer">
        <Logo height={20} />
        <p className="mob-footer-desc">
          Empowering women with technology, data, and community-driven safety tools.
        </p>
        <div className="mob-footer-links">
          <div className="mob-footer-col">
            <h4>App</h4>
            <Link to="/sos">SOS Alert</Link>
            <Link to="/dashboard">Tracking</Link>
            <Link to="/taxi">Safe Taxi</Link>
          </div>
          <div className="mob-footer-col">
            <h4>Company</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/safety-guidelines">Safety</Link>
            <Link to="/help">Help</Link>
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 11, color: 'var(--text3)' }}>
          © 2026 TRINETRA. Made with ❤️ for India.
        </div>
      </footer>

      {/* Sticky CTA */}
      {!menuOpen && (
        <div className="mob-sticky-cta">
          <Link to="/register" className="mob-btn-main" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            Join Trinetra Now
          </Link>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 1100, padding: 80 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 24, fontWeight: 700, color: 'white', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" style={{ fontSize: 24, fontWeight: 700, color: 'white', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Register</Link>
            <Link to="/how-it-works" style={{ fontSize: 24, fontWeight: 700, color: 'white', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>How it Works</Link>
            <button 
              onClick={() => setMenuOpen(false)}
              style={{ background: 'var(--bg3)', border: 'none', color: 'white', padding: 16, borderRadius: 16, marginTop: 40 }}
            >Close Menu</button>
          </div>
        </div>
      )}

      <HowItWorksWomenModal 
        isOpen={showWomenFlow} 
        onClose={() => setShowWomenFlow(false)} 
      />
    </div>
  );
};

export default MobileLanding;
