import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import "./Landing.css";

const FEATURES = [
  { img: "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/pexels-dustin-konrad-77350064-15548360_mruyaq?auto=compress&cs=tinysrgb&w=800", icon: "📍", title: "Real-Time GPS Tracking", desc: "Know your exact location with live GPS. Stay aware of your surroundings at all times." },
  { img: "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/pexels-cottonbro-6964149_ngtnyy?auto=compress&cs=tinysrgb&w=800", icon: "👁️", title: "Voice Navigation", desc: "Turn-by-turn audio guidance like Google Maps. Never miss a direction." },
  { img: "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/pexels-vahapdmr-17249214_mvwpxi?auto=compress&cs=tinysrgb&w=800", icon: "👥", title: "Trusted Contacts", desc: "Add family and friends who get notified automatically during emergencies." },
];

const STATS = [
  { num: "12.4K+", label: "Safe Routes Generated" },
  { num: "500+", label: "Active SOS Responders" },
  { num: "24/7", label: "Real-time Monitoring" },
  { num: "15+", label: "Cities Covered" },
];

const HERO_IMAGES = [
  "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/Screenshot_2026-04-28_181804_tug41h?auto=compress&cs=tinysrgb&w=1200",
  "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/Screenshot_2026-04-28_181756_kefil2?auto=compress&cs=tinysrgb&w=1200",
  "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/pexels-mikhail-nilov-7682229_1_lxdrvo?auto=compress&cs=tinysrgb&w=1200",
];

const GS_OPTIONS = [
  { to: "/dashboard", icon: "🗺️", bg: "linear-gradient(135deg,#00e5a0,#0095ff)", title: "Live Dashboard", desc: "Real-time map, GPS tracking & route navigation", primary: true },
  { to: "/sos", icon: "🆘", bg: "linear-gradient(135deg,#ff4d4d,#ff7070)", title: "SOS Emergency", desc: "Instant alert to contacts" },
  { to: "/stations", icon: "🚔", bg: "linear-gradient(135deg,#4285F4,#6ea8fe)", title: "Nearby Stations", desc: "Police, hospital & fire stations" },
  { to: "/taxi", icon: "🚕", bg: "linear-gradient(135deg,#fbbc04,#f9d94a)", title: "Safe Taxi", desc: "Verified & tracked rides" },
  { to: "/contacts", icon: "👥", bg: "linear-gradient(135deg,#a855f7,#c084fc)", title: "Trusted Contacts", desc: "Manage emergency contacts" },
  { to: "/analytics", icon: "📊", bg: "linear-gradient(135deg,#06b6d4,#67e8f9)", title: "Safety Analytics", desc: "View safety trends & data" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    if (currentHeroImage >= HERO_IMAGES.length) setCurrentHeroImage(0);
    const interval = setInterval(() => {
      setCurrentHeroImage(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [HERO_IMAGES.length, currentHeroImage]);

  useEffect(() => {
    if (currentSlide >= FEATURES.length) setCurrentSlide(0);
  }, [FEATURES.length, currentSlide]);

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 6}s`,
      size: `${2 + Math.random() * 3}px`,
    })), []);

  useEffect(() => {
    setLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setShowGetStarted(false); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const observerRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-up, .fade-in, .scale-in, .slide-left, .slide-right').forEach(el => {
      observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <Logo height={32} />

        {/* Center Nav Links (Desktop) */}
        <div className="desktop-nav-links">
          <button className="nav-link-item" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
            <span className="nav-dot" /> Features
          </button>
          <Link to="/how-it-works" style={{ textDecoration: "none" }}>
            <button className="nav-link-item">⚡ How It Works</button>
          </Link>
          <button className="nav-link-item" onClick={() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })}>
            ⭐ Reviews
          </button>
        </div>

        {/* Right Side */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="landing-nav-btn-secondary" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Login</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button className="landing-nav-btn">Register →</button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '24px', cursor: 'pointer' }}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Theme Preference</span>
              <ThemeToggle />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="nav-link-item" style={{ textAlign: 'left' }} onClick={() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>📍 Features</button>
              <Link to="/how-it-works" style={{ textDecoration: "none" }}>
                <button className="nav-link-item" style={{ textAlign: 'left' }} onClick={() => setMobileMenuOpen(false)}>⚡ How It Works</button>
              </Link>
              <button className="nav-link-item" style={{ textAlign: 'left' }} onClick={() => { document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}>⭐ Reviews</button>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="landing-nav-btn-secondary" style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Login</button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="landing-nav-btn" style={{ width: '100%', padding: '12px' }}>Register →</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-bg-image" style={{ backgroundImage: `url('${HERO_IMAGES[currentHeroImage] || HERO_IMAGES[0]}')`, opacity: 0.4 }} />
        <div className="hero-bg-gradient" />
        <div className="hero-mesh">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-particles">
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size }} />
          ))}
        </div>

        <div className="hero-inner">
          <div className={`hero-content ${loaded ? "visible" : ""}`}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Safety Reimagined for Women in India
            </div>
            <h1 className="hero-title">
              Your Safety,<br />
              <span className="gradient-text">Our Priority.</span>
            </h1>
            <p className="hero-desc">
              TRINETRA is an AI-powered women's safety companion. Get real-time GPS tracking,
              voice navigation, emergency SOS alerts, and safe taxi booking — all in one app.
            </p>
            <div className="hero-actions">
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="hero-cta-primary">🚀 Get Started — It's Free</button>
              </Link>
              <button className="hero-cta-secondary" onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>
                Learn More ↓
              </button>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-avatars">
                {["A", "P", "R", "S", "M"].map((l, i) => (
                  <div key={i} className="hero-trust-avatar" style={{ background: ["#4285F4", "#34a853", "#fbbc04", "#ea4335", "#00e5a0"][i] }}>{l}</div>
                ))}
              </div>
              <span>Trusted by <strong>10,000+</strong> women across India</span>
            </div>
          </div>

          <div className={`hero-image-wrap ${loaded ? "visible" : ""}`}>
            <div className="hero-image-container">
              {HERO_IMAGES.map((img, i) => (
                <img key={i} src={img} alt="Confident woman" className={`hero-image ${i === currentHeroImage ? 'active' : ''}`} />
              ))}
            </div>
            <div className="hero-image-badge">
              <span style={{ fontSize: 24 }}>👁️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Safety Score</div>
                <div style={{ fontSize: 12, color: "#34a853", fontWeight: 600 }}>87/100 — Safe Zone</div>
              </div>
            </div>
            <div className="hero-image-dots">
              {HERO_IMAGES.map((_, i) => (
                <div key={i} className={`hero-image-dot ${i === currentHeroImage ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="scroll-indicator" onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>
          <span className="scroll-indicator-text">Scroll to explore</span>
          <div className="scroll-indicator-arrow">↓</div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats">
        {STATS.map((s, i) => (
          <div key={i} className="landing-stat">
            <div className="landing-stat-num">{s.num}</div>
            <div className="landing-stat-label">{s.label}</div>
            <div className="landing-stat-glow" />
          </div>
        ))}
      </section>

      {/* ── Why TRINETRA ── */}
      <section className="landing-pitch fade-up">
        <div className="landing-section-header">
          <div className="landing-section-tag">The Problem We Solve</div>
          <h2 className="gradient-text">Why We Built TRINETRA</h2>
          <p>Addressing critical women's safety challenges using cutting-edge technology.</p>
        </div>
        <div className="landing-pitch-grid">
          {[
            { icon: "🧠", title: "AI-Powered Intelligence", desc: "Our routing algorithm avoids dimly lit or high-crime areas by analyzing historical incident data and street lighting maps." },
            { icon: "⚡", title: "Sub-second SOS Trigger", desc: "No need to unlock the phone. A hardware-level shake gesture triggers the SOS protocol in under 800 milliseconds." },
            { icon: "🔌", title: "Offline Capabilities", desc: "Core safety features like SMS fallback and pre-downloaded safe zones work even when internet connectivity drops." },
            { icon: "🤝", title: "Community Driven", desc: "Users can crowdsource safety ratings for routes and zones, creating a dynamic, self-updating safety network." }
          ].map((item, i) => (
            <div key={i} className="landing-pitch-card">
              <div className="pitch-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-features fade-up">
        <div className="landing-section-header">
          <div className="landing-section-tag">Features</div>
          <h2>Everything You Need to Stay Safe</h2>
          <p>Powerful safety features designed specifically for women in India</p>
        </div>
        <div className="landing-feature-carousel">
          <div className="landing-feature-card landing-feature-main">
            {FEATURES[currentSlide] && (
              <>
                <img src={FEATURES[currentSlide].img} alt={FEATURES[currentSlide].title} />
                <div className="landing-feature-overlay">
                  <div className="landing-feature-icon">{FEATURES[currentSlide].icon}</div>
                  <h3>{FEATURES[currentSlide].title}</h3>
                  <p>{FEATURES[currentSlide].desc}</p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="landing-feature-dots">
          {FEATURES.map((_, i) => (
            <button key={i} className={`landing-feature-dot ${i === currentSlide ? "active" : ""}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
        <div className="landing-feature-grid" style={{ marginTop: 32 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`landing-feature-grid-card ${i === currentSlide ? "active" : ""}`} onClick={() => setCurrentSlide(i)}>
              <img src={f.img} alt={f.title} />
              <div className="landing-feature-grid-card-content">
                <span className="feat-icon">{f.icon}</span>
                <div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Emergency Toolkit ── */}
      <section className="landing-toolkit fade-up">
        <div className="landing-section-header">
          <div className="landing-section-tag">Instant Actions</div>
          <h2>Your Emergency Toolkit</h2>
          <p>Quick access tools designed to de-escalate situations and get help instantly.</p>
        </div>
        <div className="landing-toolkit-grid">
          {[
            { icon: "🚨", title: "Loud Siren", desc: "Instantly play a 120dB police siren to draw attention and deter threats.", img: "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/pexels-112-uttar-pradesh-2709195-4267620_gc04zq?auto=compress&cs=tinysrgb&w=600" },
            { icon: "📞", title: "Fake Call", desc: "Schedule a realistic incoming phone call to excuse yourself from uncomfortable situations.", img: "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/pexels-cottonbro-6862844_xkxt9g?auto=compress&cs=tinysrgb&w=600" },
            { icon: "📳", title: "Hardware SOS", desc: "Trigger an SOS alert simply by shaking your device rapidly.", img: "https://res.cloudinary.com/dvdhjg6io/image/upload/f_auto,q_auto/Screenshot_2026-04-28_185231_sqd1cc?auto=compress&cs=tinysrgb&w=600" }
          ].map((tool, i) => (
            <div key={i} className="landing-toolkit-card">
              <img src={tool.img} alt={tool.title} className="toolkit-img" />
              <div className="toolkit-content">
                <div className="toolkit-icon">{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Safety Crisis + Solution ── */}
      <section id="how-it-works" className="landing-how fade-up">
        <div className="landing-section-header">
          <div className="landing-section-tag">The Reality</div>
          <h2 style={{ color: "var(--text)" }}>Women's Safety Crisis in India</h2>
          <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 8, maxWidth: 560, margin: "8px auto 0" }}>
            Every statistic below represents a real woman. TRINETRA exists to change these numbers.
          </p>
        </div>

        {/* Crisis Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, maxWidth: 860, margin: "0 auto 48px" }}>
          {[
            { num: "4,45,256+", label: "Crimes against women — NCRB Annual Report", color: "#ff4d4d", icon: "📊" },
            { num: "1 in 3", label: "Women face harassment in public transport", color: "#ff8c00", icon: "🚌" },
            { num: "7 min", label: "Average police response time in cities", color: "#fbbc04", icon: "⏱️" },
            { num: "86%", label: "Crimes go unreported due to fear", color: "#a855f7", icon: "🔕" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "var(--bg2)", border: `1px solid ${stat.color}30`,
              borderRadius: 16, padding: "20px 16px", textAlign: "center",
              boxShadow: `0 0 20px ${stat.color}10`,
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, marginBottom: 6, lineHeight: 1 }}>{stat.num}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* VS Divider */}
        <div style={{ textAlign: "center", margin: "0 auto 40px", position: "relative" }}>
          <div style={{ height: 1, background: "var(--border)", maxWidth: 700, margin: "0 auto" }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #00e5a0, #0095ff)",
            color: "#06080d", fontWeight: 800, fontSize: 13,
            padding: "6px 20px", borderRadius: 99, whiteSpace: "nowrap",
          }}>
            TRINETRA'S RESPONSE ↓
          </div>
        </div>

        {/* Solution Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, maxWidth: 860, margin: "0 auto 40px" }}>
          {[
            { num: "<3 sec", label: "SOS alert sent to all contacts", color: "#00e5a0", icon: "⚡" },
            { num: "5 km", label: "Nearest safe stations always visible", color: "#0095ff", icon: "🚉" },
            { num: "24/7", label: "Live GPS tracking & voice navigation", color: "#4285F4", icon: "📍" },
            { num: "0 data", label: "Needed offline — SMS fallback works", color: "#00e5a0", icon: "📴" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: `${stat.color}08`,
              border: `1px solid ${stat.color}30`,
              borderRadius: 16, padding: "20px 16px", textAlign: "center",
              boxShadow: `0 0 20px ${stat.color}08`,
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, marginBottom: 6, lineHeight: 1 }}>{stat.num}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/how-it-works" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "14px 32px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #00e5a0, #0095ff)",
              color: "#06080d", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>⚡ See How TRINETRA Protects You →</button>
          </Link>
        </div>
      </section>

      {/* ── Safety Score ── */}
      <section className="landing-safety-score" style={{ padding: "100px 48px", background: "linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)" }}>
        <div className="landing-section-header" style={{ maxWidth: 800, margin: "0 auto 60px", textAlign: "center" }}>
          <div className="landing-section-tag">Instant Analysis</div>
          <h2 className="gradient-text">Safety Readiness Calculator</h2>
          <p>How prepared are you for emergencies? Check your safety score in 30 seconds.</p>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "var(--glass)", border: "1px solid var(--border)", borderRadius: 30, padding: "40px", backdropFilter: "blur(40px)" }}>
          {[
            { label: "Emergency Contacts added?", weight: 25 },
            { label: "SOS Shake feature enabled?", weight: 25 },
            { label: "Location permissions active?", weight: 20 },
            { label: "Safe route notifications on?", weight: 15 },
            { label: "Phone charged above 50%?", weight: 15 },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 15, color: "var(--text2)" }}>{item.label}</span>
              <div style={{ width: 50, height: 26, background: "rgba(255,255,255,0.05)", borderRadius: 50, padding: 3, cursor: "pointer", display: "flex", justifyContent: "flex-end", border: "1px solid var(--border)" }}>
                <div style={{ width: 20, height: 20, background: "var(--accent)", borderRadius: 50, boxShadow: "0 0 10px var(--accent)" }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 30, paddingTop: 30, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Your Safety Score</div>
            <div style={{ fontSize: 64, fontWeight: 800, color: "var(--accent)", textShadow: "0 0 30px rgba(0,229,160,0.3)" }}>100%</div>
            <p style={{ fontSize: 14, color: "var(--text3)", marginTop: 10 }}>Excellent! You are fully protected by TRINETRA.</p>
          </div>
        </div>
      </section>

      {/* ── Scenarios ── */}
      <section className="landing-scenarios fade-up">
        <div className="landing-section-header">
          <div className="landing-section-tag">Use Cases</div>
          <h2>Built for Your Daily Life</h2>
        </div>
        <div className="landing-scenario-list">
          {[
            { tag: "Late Night Commute", title: "Returning Home After Hours", desc: "Whether working late or hanging out with friends, use TRINETRA to share your live ride tracking with family and find the safest, well-lit routes.", img: "https://i.ibb.co/3939mHyh/Screenshot-2026-04-28-221418.png" },
            { tag: "New City Travel", title: "Exploring Unfamiliar Places", desc: "Traveling to a new city? Our interactive map highlights nearby police stations and safe zones, giving you confidence wherever you go.", img: "https://i.ibb.co/p6rRL5Wg/Screenshot-2026-04-28-221911.png" },
            { tag: "Daily Routine", title: "College or Office Routes", desc: "Set up geofence alerts so your parents automatically receive an SMS when you reach college or the office safely, eliminating 'Did you reach?' calls.", img: "https://i.ibb.co/Q7GNGhCH/Screenshot-2026-04-28-222137.png" }
          ].map((scene, i) => (
            <div key={i} className={`landing-scenario-card ${scene.reverse ? 'reverse' : ''}`}>
              <div className="scenario-img-wrap">
                <img src={scene.img} alt={scene.title} />
              </div>
              <div className="scenario-content">
                <div className="scenario-tag">{scene.tag}</div>
                <h3>{scene.title}</h3>
                <p>{scene.desc}</p>
                <button className="scenario-btn" onClick={() => setShowGetStarted(true)}>See it in action →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="landing-testimonials fade-up">
        <div className="landing-section-header">
          <div className="landing-section-tag">Testimonials</div>
          <h2 className="gradient-text">Trusted by Real Women</h2>
        </div>
        <div className="landing-testimonials-grid">
          {[
            { name: "Priya Sharma", city: "Bhopal, MP", text: "TRINETRA saved me during a late-night ride home. The SOS alert went off with just a shake of my phone!", stars: 5, avatar: "P" },
            { name: "Anita Verma", city: "Indore, MP", text: "The voice navigation while walking alone at night is amazing. I feel confident walking anywhere now.", stars: 5, avatar: "A" },
            { name: "Kavita Rao", city: "Jaipur, Rajasthan", text: "I love how it shows nearby police stations sorted by distance. The Safe Taxi feature gives me peace of mind.", stars: 5, avatar: "K" },
          ].map((t, i) => (
            <div key={i} className="landing-testimonial-card">
              <div className="landing-testimonial-stars">{"★★★★★".split("").map((s, j) => <span key={j} style={{ color: "#fbbc04" }}>{s}</span>)}</div>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.75, marginBottom: 16 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="landing-testimonial-avatar">{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta fade-up">
        <div className="landing-cta-bg" />
        <div className="landing-cta-content">
          <h2 style={{ marginTop: 24 }}>Ready to Feel Safe Everywhere?</h2>
          <p>Join thousands of women across India who trust TRINETRA for their daily safety.</p>
          <button className="hero-cta-primary" onClick={() => setShowGetStarted(true)}>🚀 Get Started — It's Free</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="footer-brand">
            <Logo height={28} />
            <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>Empowering women across India with AI-driven safety tools, real-time tracking, and instant emergency response.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {["📱", "🌐", "📧"].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
              ))}
            </div>
          </div>
          <div className="footer-links-col">
            <h4 style={{ color: "var(--text)", marginBottom: 16 }}>Features</h4>
            <Link to="/dashboard">GPS Tracking</Link>
            <Link to="/sos">SOS Alerts</Link>
            <Link to="/stations">Safe Stations</Link>
            <Link to="/contacts">Trusted Contacts</Link>
            <Link to="/taxi">Safe Taxi</Link>
          </div>
          <div className="footer-links-col">
            <h4 style={{ color: "var(--text)", marginBottom: 16 }}>Resources</h4>
            <Link to="/safety-guidelines">Safety Guidelines</Link>
            <Link to="/community">Community Forum</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <div className="footer-links-col">
            <h4 style={{ color: "var(--text)", marginBottom: 16 }}>Connect</h4>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter / X</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
          <div className="footer-links-col">
            <h4 style={{ color: "var(--text)", marginBottom: 16 }}>Safety Updates</h4>
            <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, marginBottom: 12 }}>Join our newsletter for the latest safety alerts.</p>
            <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: 4 }}>
              <input type="email" placeholder="Email" style={{ background: "none", border: "none", padding: "8px 12px", color: "var(--text)", fontSize: 13, flex: 1, outline: "none" }} />
              <button style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 12px", color: "var(--bg)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>JOIN</button>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <div style={{ fontSize: 13, color: "var(--text3)" }}>© 2026 TRINETRA. All rights reserved.</div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text3)" }}>
            <Link to="/privacy" style={{ color: "var(--text3)", textDecoration: "none" }}>Privacy</Link>
            <Link to="/safety-guidelines" style={{ color: "var(--text3)", textDecoration: "none" }}>Safety</Link>
            <Link to="/help" style={{ color: "var(--text3)", textDecoration: "none" }}>Help</Link>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop}>↑</button>

      {/* ── GET STARTED MODAL ── */}
      {showGetStarted && (
        <div className="gs-overlay" onClick={() => setShowGetStarted(false)}>
          <div className="gs-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gs-close" onClick={() => setShowGetStarted(false)}>×</button>
            <div className="gs-header">
              <h2 className="gradient-text">Where to next?</h2>
              <p>Select a feature to begin your safe journey with TRINETRA</p>
            </div>
            <div className="gs-grid">
              <Link to="/dashboard" className="gs-item gs-item-featured">
                <div className="gs-icon" style={{ background: "linear-gradient(135deg, #00e5a0, #0095ff)", color: "#06080d" }}>🗺️</div>
                <div className="gs-info">
                  <h3>Live Safety Dashboard</h3>
                  <p>Real-time map, GPS tracking & smart route navigation</p>
                </div>
                <div className="gs-item-arrow">→</div>
              </Link>
              <Link to="/sos" className="gs-item">
                <div className="gs-icon" style={{ background: "rgba(255, 77, 77, 0.15)", color: "#ff4d4d", border: "1px solid rgba(255, 77, 77, 0.2)" }}>🆘</div>
                <div className="gs-info">
                  <h3>SOS Emergency</h3>
                  <p>Instant alerts to your trusted contacts</p>
                </div>
                <div className="gs-item-arrow">→</div>
              </Link>
              <Link to="/stations" className="gs-item">
                <div className="gs-icon" style={{ background: "rgba(0, 149, 255, 0.15)", color: "#0095ff", border: "1px solid rgba(0, 149, 255, 0.2)" }}>🚔</div>
                <div className="gs-info">
                  <h3>Nearby Stations</h3>
                  <p>Find police & hospitals instantly</p>
                </div>
                <div className="gs-item-arrow">→</div>
              </Link>
              <Link to="/taxi" className="gs-item">
                <div className="gs-icon" style={{ background: "rgba(251, 191, 36, 0.15)", color: "#fbbc04", border: "1px solid rgba(251, 191, 36, 0.2)" }}>🚕</div>
                <div className="gs-info">
                  <h3>Safe Taxi Booking</h3>
                  <p>Verified rides with active tracking</p>
                </div>
                <div className="gs-item-arrow">→</div>
              </Link>
              <Link to="/analytics" className="gs-item">
                <div className="gs-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "1px solid rgba(168, 85, 247, 0.2)" }}>📊</div>
                <div className="gs-info">
                  <h3>Safety Analytics</h3>
                  <p>Personalized safety trends & insights</p>
                </div>
                <div className="gs-item-arrow">→</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}