import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const STORAGE_KEY = "nr_trusted_contacts";

const QUICK_TEMPLATES = [
  { name: "Police", phone: "100", icon: "🚔" },
  { name: "Women Helpline", phone: "181", icon: "📞" },
  { name: "Child Helpline", phone: "1098", icon: "👶" },
  { name: "Ambulance", phone: "108", icon: "🚑" },
  { name: "Fire", phone: "101", icon: "🚒" },
];

const RELATIONS = ["Family", "Friend", "Colleague", "Neighbor", "Police", "Doctor", "Other"];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("Family");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userName = loggedInUser.name || "User";
  const userInitials = (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  useEffect(() => {
    try {
      setContacts(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {}
  }, []);

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const addContact = () => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) return showToast("Name aur phone dono bharo", "danger");
    const num = p.replace(/\D/g, "");
    if (num.length < 3) return showToast("Valid phone number daalo", "danger");

    if (editingId) {
      const updated = contacts.map((c) =>
        c.id === editingId ? { ...c, name: n, phone: p, relation } : c
      );
      setContacts(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setEditingId(null);
      showToast(`${n} updated!`, "success");
    } else {
      const updated = [{ id: Date.now(), name: n, phone: p, relation }, ...contacts];
      setContacts(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast(`${n} added!`, "success");
    }
    setName("");
    setPhone("");
    setRelation("Family");
  };

  const deleteContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setConfirmDelete(null);
    showToast("Contact deleted", "info");
  };

  const startEdit = (contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelation(contact.relation);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setRelation("Family");
  };

  const callContact = (contact) => {
    window.location.href = `tel:${contact.phone.replace(/\D/g, "")}`;
  };

  const smsContact = (contact) => {
    window.location.href = `sms:${contact.phone.replace(/\D/g, "")}?body=Hi, this is from TRINETRA app.`;
  };

  const getInitials = (n) => n.charAt(0).toUpperCase();

  return (
    <div className="nr-root" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ct-panel { animation: slideUp 0.35s ease; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>👥</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Trusted Contacts</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          {contacts.length} saved
        </div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* ── DESKTOP: 2-col | MOBILE: stacked ── */}
      <div className="ct-grid" style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        flex: 1,
        minHeight: "calc(100vh - 57px)",
      }}>

        {/* ═══ LEFT — Add/Quick Contacts ═══ */}
        <aside className="ct-panel" style={{
          background: "var(--bg2)", borderRight: "1px solid var(--border)",
          padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto",
        }}>
          {/* Add Contact Form */}
          <div>
            <div className="panel-title" style={{ marginBottom: 12 }}>
              {editingId ? "✏️ Edit Contact" : "➕ Add Contact"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "var(--bg3)", border: "1px solid var(--border2)",
                  borderRadius: 10, color: "var(--text)", fontSize: 14,
                  fontFamily: "inherit", outline: "none",
                }}
                placeholder="Name (e.g. Mom)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContact()}
              />
              <input
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "var(--bg3)", border: "1px solid var(--border2)",
                  borderRadius: 10, color: "var(--text)", fontSize: 14,
                  fontFamily: "inherit", outline: "none",
                }}
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addContact()}
              />

              {/* Relation */}
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "var(--bg3)", border: "1px solid var(--border2)",
                  borderRadius: 10, color: "var(--text)", fontSize: 14,
                  fontFamily: "inherit", outline: "none",
                }}
              >
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={addContact}
                  style={{
                    flex: 1, padding: "10px",
                    background: "var(--accent)", color: "#0a0c10",
                    border: "none", borderRadius: 10,
                    fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {editingId ? "💾 Save" : "✅ Add"}
                </button>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    style={{
                      flex: 1, padding: "10px",
                      background: "var(--bg3)", color: "var(--text2)",
                      border: "1px solid var(--border)", borderRadius: 10,
                      fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <div className="panel-title" style={{ marginBottom: 10 }}>⚡ Quick Add</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setName(t.name);
                    setPhone(t.phone);
                    setRelation(t.name === "Police" ? "Police" : "Other");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    background: "var(--bg3)", border: "1px solid var(--border)",
                    borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>{t.phone}</div>
                  </div>
                  <span style={{ fontSize: 14, color: "var(--text3)" }}>+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div style={{
            padding: "14px",
            background: "rgba(0,149,255,0.05)",
            border: "1px solid rgba(0,149,255,0.15)",
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#60b8ff", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              💡 Why Trusted Contacts?
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.6 }}>
              When SOS is triggered, these contacts receive your call and SMS with your live location automatically.
            </div>
          </div>
        </aside>

        {/* ═══ RIGHT — Contact List ═══ */}
        <main className="ct-panel" style={{
          background: "var(--bg)", padding: "20px", overflowY: "auto",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                  Your Trusted Contacts
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                  {contacts.length} contact{contacts.length !== 1 ? "s" : ""} — first contact is primary for SOS calls
                </div>
              </div>
              <Link
                to="/sos"
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.25)",
                  borderRadius: 9, color: "var(--danger)",
                  fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "inherit",
                }}
              >
                🆘 SOS
              </Link>
            </div>

            {contacts.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px 20px",
                background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>👥</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>
                  No contacts yet
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  Add your trusted contacts on the left, or use Quick Add for emergency numbers.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {contacts.map((c, i) => (
                  <div key={c.id} style={{
                    background: "var(--bg2)",
                    border: `1px solid ${i === 0 ? "rgba(0,229,160,0.3)" : "var(--border)"}`,
                    borderRadius: 14, padding: "14px",
                    ...(i === 0 ? { boxShadow: "0 0 0 1px rgba(0,229,160,0.1)" } : {}),
                  }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: i === 0
                          ? "rgba(0,229,160,0.15)"
                          : "rgba(0,149,255,0.12)",
                        color: i === 0 ? "var(--accent)" : "#60b8ff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 18, flexShrink: 0,
                        border: i === 0 ? "1px solid rgba(0,229,160,0.3)" : "1px solid rgba(0,149,255,0.2)",
                      }}>
                        {getInitials(c.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{c.name}</span>
                          {i === 0 && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                              color: "var(--accent)", background: "rgba(0,229,160,0.1)",
                              padding: "2px 6px", borderRadius: 99, letterSpacing: "0.05em",
                            }}>
                              Primary
                            </span>
                          )}
                          <span style={{
                            fontSize: 9, fontWeight: 600,
                            color: "var(--text3)", background: "var(--bg3)",
                            padding: "2px 6px", borderRadius: 99,
                          }}>
                            {c.relation}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 12, color: "var(--text3)",
                          fontFamily: "'JetBrains Mono', monospace",
                          marginBottom: 10,
                        }}>
                          📞 {c.phone}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => callContact(c)}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              padding: "8px",
                              background: "rgba(0,149,255,0.1)", border: "1px solid rgba(0,149,255,0.25)",
                              borderRadius: 9, color: "#60b8ff",
                              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            }}
                          >
                            📞 Call
                          </button>
                          <button
                            onClick={() => smsContact(c)}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              padding: "8px",
                              background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
                              borderRadius: 9, color: "var(--accent)",
                              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            }}
                          >
                            💬 SMS
                          </button>
                          <button
                            onClick={() => startEdit(c)}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              padding: "8px",
                              background: "var(--bg3)", border: "1px solid var(--border)",
                              borderRadius: 9, color: "var(--text2)",
                              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => confirmDelete === c.id ? deleteContact(c.id) : setConfirmDelete(c.id)}
                            style={{
                              padding: "8px 10px",
                              background: confirmDelete === c.id ? "rgba(255,77,77,0.15)" : "var(--bg3)",
                              border: "1px solid rgba(255,77,77,0.25)",
                              borderRadius: 9, color: "var(--danger)",
                              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                            }}
                          >
                            {confirmDelete === c.id ? "Sure?" : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav" style={{ display: "flex" }}>
        {[
          { to: "/", icon: "🏠", label: "Home" },
          { to: "/sos", icon: "🆘", label: "SOS" },
          { to: "/contacts", icon: "👥", label: "Contacts", active: true },
          { to: "/stations", icon: "🚉", label: "Stations" },
          { to: "/profile", icon: "👤", label: "Profile" },
        ].map((tab) => (
          <Link key={tab.to} to={tab.to} className={`mob-tab ${tab.active ? "active" : ""}`} style={{ textDecoration: "none" }}>
            <span className="mob-tab-icon">{tab.icon}</span>
            <span className="mob-tab-label">{tab.label}</span>
          </Link>
        ))}
      </nav>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
          padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          zIndex: 999, animation: "toastIn 0.3s ease",
          backdropFilter: "blur(10px)", border: "1px solid",
          maxWidth: "90vw", whiteSpace: "nowrap", textAlign: "center",
          background: toast.type === "danger" ? "rgba(255,77,77,0.15)" : "rgba(0,229,160,0.15)",
          borderColor: toast.type === "danger" ? "rgba(255,77,77,0.3)" : "rgba(0,229,160,0.3)",
          color: toast.type === "danger" ? "#ff8080" : "var(--accent)",
        }}>
          {toast.text}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .ct-grid { display: flex !important; flex-direction: column !important; min-height: auto !important; padding-bottom: 70px !important; }
          .ct-grid > aside { order: 0; border-right: none !important; border-bottom: 1px solid var(--border); }
          .ct-grid > main { order: 1; min-height: 400px; }
          .mobile-bottom-nav { display: flex !important; }
        }
        @media (min-width: 901px) { .mobile-bottom-nav { display: none !important; } }
        .panel-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}
