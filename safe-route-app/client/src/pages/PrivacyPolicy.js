import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function PrivacyPolicy() {
  return (
    <div className="nr-root" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>TRINETRA</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Privacy Policy</span>
        </div>
        <Link to="/" style={{ textDecoration: "none", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>← Home</Link>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7 }}>Last updated: April 2026 · Effective for all TRINETRA users.</p>
        </div>

        {[
          {
            icon: "📍", title: "Location Data",
            content: "TRINETRA collects your real-time GPS location ONLY when the app is actively in use. Your location is used to provide safe route suggestions, nearby safety station information, and to share your position with trusted contacts during an SOS event. We never store historical location data on our servers. All location data stays on your device unless you explicitly trigger an SOS alert."
          },
          {
            icon: "🔐", title: "Data Security",
            content: "All data transmitted between your device and our servers is encrypted using AES-256 encryption and TLS 1.3. Your emergency contacts, personal details, and SOS history are stored locally on your device using encrypted local storage. We do not share, sell, or monetize any personal data. Our codebase is open-source and can be audited by the community."
          },
          {
            icon: "📱", title: "Device Permissions",
            content: "TRINETRA requests the following permissions: Location (for GPS tracking and safe routing), Microphone (for voice navigation commands), Vibration (for hardware SOS shake detection), SMS (for sending emergency alerts to contacts), and Phone (for emergency calling). Each permission is optional and can be revoked at any time through your device settings."
          },
          {
            icon: "🆘", title: "SOS Data Sharing",
            content: "When you trigger an SOS alert, TRINETRA shares your current GPS coordinates, timestamp, and a pre-configured emergency message with your trusted contacts via SMS. If enabled, your live location link is also shared. This data is sent directly to your contacts and is not stored on any intermediate server. You have full control over who receives your SOS alerts."
          },
          {
            icon: "🍪", title: "Cookies & Analytics",
            content: "TRINETRA does not use any third-party tracking cookies or analytics services. We do not serve advertisements. We collect anonymous usage statistics (e.g., number of safe routes generated, SOS triggers) purely for improving our safety algorithms. No personally identifiable information is included in these statistics."
          },
          {
            icon: "👤", title: "Your Rights",
            content: "You have the right to: Access all data stored by TRINETRA, Export your data at any time, Delete your account and all associated data permanently, Opt out of any data collection, and Request information about how your data is used. To exercise any of these rights, contact us at privacy@trinetra.org.in."
          },
          {
            icon: "👶", title: "Children's Privacy",
            content: "TRINETRA is designed to be safe for users of all ages. We do not knowingly collect personal information from children under 13 without parental consent. If you are a parent and believe your child has provided personal information, please contact us immediately."
          }
        ].map((section, i) => (
          <div key={i} style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18,
            padding: "28px 24px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
              }}>{section.icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{section.title}</h2>
            </div>
            <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.85 }}>{section.content}</p>
          </div>
        ))}

        <div style={{
          background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)", borderRadius: 16,
          padding: "24px", textAlign: "center", marginTop: 32
        }}>
          <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.7 }}>
            Questions about privacy? Reach out to us at <span style={{ color: "var(--accent)", fontWeight: 600 }}>privacy@trinetra.org.in</span>
          </p>
        </div>
      </main>
    </div>
  );
}
