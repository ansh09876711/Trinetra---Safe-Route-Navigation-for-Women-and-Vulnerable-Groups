import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function SafetyGuidelines() {
  return (
    <div className="nr-root" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>TRINETRA</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Safety Guidelines</span>
        </div>
        <Link to="/" style={{ textDecoration: "none", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>← Home</Link>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Safety First</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>Women's Safety Guidelines</h1>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7 }}>Curated by safety experts and law enforcement for everyday situations in India.</p>
        </div>

        {[
          {
            icon: "🚶‍♀️", title: "Walking Alone",
            tips: [
              "Always stick to well-lit, busy streets — even if it takes longer.",
              "Keep your phone charged above 50% before heading out.",
              "Share your live location with a trusted contact while walking.",
              "Avoid wearing headphones in both ears — stay aware of surroundings.",
              "Walk confidently and purposefully. Predators target distracted individuals.",
              "If you feel followed, enter the nearest shop, restaurant, or public building."
            ]
          },
          {
            icon: "🚕", title: "Using Taxi / Auto",
            tips: [
              "Always book rides through verified apps (Uber, Ola, Rapido).",
              "Share ride details with family BEFORE boarding.",
              "Note down the vehicle number and driver name.",
              "Sit in the back seat. Keep windows slightly open.",
              "Track your route live on TRINETRA — we alert you if the driver deviates.",
              "If uncomfortable, ask the driver to stop at a public place or call 100."
            ]
          },
          {
            icon: "🚇", title: "Public Transport",
            tips: [
              "Board women-only compartments in metro and train wherever available.",
              "Keep your bag in front of you, not behind.",
              "Avoid empty buses or trains, especially at night.",
              "Know the location of the emergency alarm in buses and metro.",
              "If harassed, speak up loudly — public attention is your best defense.",
              "Report incidents to the Railway Police (182) or local helpline."
            ]
          },
          {
            icon: "🏢", title: "Workplace Safety",
            tips: [
              "Document any inappropriate behavior with dates, times, and screenshots.",
              "Know your organization's Internal Complaints Committee (ICC).",
              "Under the POSH Act (2013), every workplace must have a complaints committee.",
              "You can file a complaint within 3 months of the incident.",
              "Request CCTV installation in common areas if not already present.",
              "Save the Women Helpline number 181 in your phone."
            ]
          },
          {
            icon: "📱", title: "Digital Safety",
            tips: [
              "Never share your live location on public social media.",
              "Use strong, unique passwords for all accounts.",
              "Enable two-factor authentication on WhatsApp, Instagram, and email.",
              "Report cyber harassment at cybercrime.gov.in or call 1930.",
              "Be cautious of strangers online — never share personal details.",
              "Regularly review your social media privacy settings."
            ]
          },
          {
            icon: "📞", title: "Emergency Numbers (India)",
            tips: [
              "Police: 100 | Women Helpline: 181 | Child Helpline: 1098",
              "National Emergency: 112 (works even without SIM)",
              "Cyber Crime: 1930 | Ambulance: 108 | Fire: 101",
              "Railway Police: 182 | Anti-Stalking: 1091",
              "NCW (National Commission for Women): 7827-170-170",
              "All these numbers work 24/7 across India."
            ]
          }
        ].map((section, i) => (
          <div key={i} style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18,
            padding: "28px 24px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
              }}>{section.icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{section.title}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {section.tips.map((tip, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 14px", background: "var(--bg3)", borderRadius: 10,
                }}>
                  <span style={{ color: "var(--accent)", fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
