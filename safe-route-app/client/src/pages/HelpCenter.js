import { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const FAQ_DATA = [
  {
    category: "Getting Started",
    icon: "🚀",
    questions: [
      { q: "How do I set up TRINETRA for the first time?", a: "Open the app, create your profile with your name and phone number, then add at least one trusted emergency contact. Enable GPS permissions when prompted. That's it — you're protected!" },
      { q: "Is TRINETRA free to use?", a: "Yes, TRINETRA is completely free. All core safety features including SOS alerts, GPS tracking, voice navigation, and safe station finder are available at no cost. We believe safety is a right, not a privilege." },
      { q: "What devices are supported?", a: "TRINETRA works on any modern smartphone with a web browser — Android, iOS, and desktop. No app download needed — it's a Progressive Web App (PWA) that works directly from your browser." },
    ]
  },
  {
    category: "SOS & Emergency",
    icon: "🆘",
    questions: [
      { q: "How does the SOS shake feature work?", a: "Shake your phone rapidly 3 times within 2 seconds. TRINETRA detects the motion via your device's accelerometer and instantly sends your live GPS location to all your emergency contacts via SMS. No need to unlock the phone." },
      { q: "What happens when I trigger SOS?", a: "Three things happen simultaneously: (1) An SMS with your live location link is sent to all trusted contacts, (2) A loud siren sound plays from your phone to attract attention, and (3) Your location is continuously shared until you manually stop it." },
      { q: "Can I test SOS without alerting my contacts?", a: "Yes! Go to SOS Emergency page and use the 'Test Mode' toggle. This lets you test the shake detection and siren without actually sending SMS alerts to your contacts." },
    ]
  },
  {
    category: "Navigation & Routes",
    icon: "🗺️",
    questions: [
      { q: "How does the safe route algorithm work?", a: "Our algorithm considers multiple factors: street lighting data, reported incidents, police station proximity, crowd density (based on anonymized cell data), and time of day. Routes are scored and the safest option is highlighted on the map." },
      { q: "Does voice navigation work offline?", a: "Basic turn-by-turn voice prompts work offline if you've pre-loaded the route. However, real-time rerouting and traffic data require an internet connection. We recommend downloading routes before heading out." },
      { q: "Can I mark unsafe areas?", a: "Yes! Long-press any location on the Dashboard map to mark it as unsafe. You can add a description (e.g., 'poor lighting', 'isolated area'). These reports help improve safe routes for all TRINETRA users." },
    ]
  },
  {
    category: "Safe Taxi",
    icon: "🚕",
    questions: [
      { q: "How does Safe Taxi booking work?", a: "TRINETRA doesn't directly book taxis — instead, it shows verified pickup zones near you and redirects you to trusted apps like Uber, Ola, or Rapido. Before booking, it helps you share ride details with your contacts automatically." },
      { q: "What is Active Ride Tracking?", a: "When enabled, TRINETRA tracks your taxi ride in real-time and shares your live location with trusted contacts throughout the journey. If the route deviates significantly, you'll receive an alert." },
    ]
  },
  {
    category: "Privacy & Security",
    icon: "🔒",
    questions: [
      { q: "Is my location data shared with third parties?", a: "Never. Your location data stays on your device and is only shared with your trusted contacts during an SOS event. We do not sell, share, or monetize your data in any way." },
      { q: "Can I delete all my data?", a: "Yes. Go to Profile → Settings → Clear All Data. This will permanently delete all your contacts, SOS history, route history, and preferences from your device. Since we don't store data on servers, deletion is instant and complete." },
    ]
  }
];

export default function HelpCenter() {
  const [openQ, setOpenQ] = useState(null);

  const toggleQ = (key) => setOpenQ(prev => prev === key ? null : key);

  return (
    <div className="nr-root" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>TRINETRA</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>❓</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Help Center</span>
        </div>
        <Link to="/" style={{ textDecoration: "none", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>← Home</Link>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Support</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>Help Center</h1>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7 }}>Find answers to frequently asked questions about TRINETRA's features, privacy, and safety tools.</p>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { icon: "📞", label: "Emergency: 112", color: "#ff4d4d" },
            { icon: "📧", label: "help@trinetra.org.in", color: "#0095ff" },
            { icon: "💬", label: "Community Forum", color: "#00e5a0", to: "/community" },
          ].map((item, i) => (
            item.to ? (
              <Link key={i} to={item.to} style={{
                padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 14, textAlign: "center", textDecoration: "none", transition: "all .3s"
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.label}</div>
              </Link>
            ) : (
              <div key={i} style={{
                padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 14, textAlign: "center",
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.label}</div>
              </div>
            )
          ))}
        </div>

        {/* FAQ Sections */}
        {FAQ_DATA.map((section, si) => (
          <div key={si} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
              }}>{section.icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{section.category}</h2>
            </div>

            {section.questions.map((faq, qi) => {
              const key = `${si}-${qi}`;
              const isOpen = openQ === key;
              return (
                <div key={qi} style={{
                  background: "var(--bg2)", border: `1px solid ${isOpen ? "rgba(0,229,160,0.25)" : "var(--border)"}`,
                  borderRadius: 14, marginBottom: 8, overflow: "hidden", transition: "all .3s"
                }}>
                  <button onClick={() => toggleQ(key)} style={{
                    width: "100%", padding: "16px 20px", background: "none", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", fontFamily: "inherit"
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isOpen ? "var(--accent)" : "var(--text)", textAlign: "left" }}>{faq.q}</span>
                    <span style={{ fontSize: 18, color: "var(--text3)", transform: isOpen ? "rotate(45deg)" : "rotate(0)", transition: "transform .3s", flexShrink: 0 }}>+</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 20px 18px", fontSize: 13, color: "var(--text3)", lineHeight: 1.8, borderTop: "1px solid var(--border)" }}>
                      <div style={{ paddingTop: 14 }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div style={{
          background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)", borderRadius: 16,
          padding: "24px", textAlign: "center", marginTop: 24
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Still need help?</p>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>
            Email us at <span style={{ color: "var(--accent)", fontWeight: 600 }}>support@trinetra.org.in</span> and we'll respond within 24 hours.
          </p>
        </div>
      </main>
    </div>
  );
}
