import React, { useState, useEffect } from "react";
import { 
  FaUserPlus, FaUserMinus, FaCheckCircle, FaClock, 
  FaShieldAlt, FaPlus, FaFilter, FaChartBar, FaTimes 
} from "react-icons/fa";
import { db } from "../../../firebase";
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

export default function TeamManagement() {
    const [showModal, setShowModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: "", email: "", password: "", role: "SOS Member", team: "Alpha" });
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);

    const [teams, setTeams] = useState([
        { id: 1, name: "Alpha Response", members: 4, status: "Active", efficiency: "98%" },
        { id: 2, name: "Quick Action Unit", members: 3, status: "On Mission", efficiency: "94%" },
        { id: 3, name: "Night Watch", members: 5, status: "Standby", efficiency: "96%" }
    ]);

    // Fetch live members from Firestore
    useEffect(() => {
        const q = query(collection(db, "sos_members"));
        const unsub = onSnapshot(q, (snapshot) => {
            setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (members.length >= 15) {
            alert("Maximum personnel capacity (15) reached. Please remove members to add new ones.");
            setShowModal(false);
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, "sos_members"), {
                ...newMember,
                status: "Offline",
                performance: 5.0,
                cases: 0,
                divisionId: "1",
                createdAt: serverTimestamp()
            });
            setShowModal(false);
            setNewMember({ name: "", email: "", password: "", role: "SOS Member", team: "Alpha" });
        } catch (err) {
            console.error("Error adding member:", err);
            alert("Failed to add member.");
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (id) => {
        if (!window.confirm("Are you sure you want to remove this personnel?")) return;
        try {
            await deleteDoc(doc(db, "sos_members", id));
        } catch (err) {
            console.error("Error removing member:", err);
        }
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease", display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* --- TEAM STATS --- */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
                <div className="glass-panel" style={{ padding: "25px", borderLeft: "4px solid #00e5a0" }}>
                    <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>TOTAL ACTIVE PERSONNEL</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "10px" }}>{members.length} / 15</div>
                    <div style={{ fontSize: "10px", color: "#00e5a0", marginTop: "5px" }}>{Math.round((members.length / 15) * 100)}% CAPACITY UTILIZED</div>
                </div>
                <div className="glass-panel" style={{ padding: "25px", borderLeft: "4px solid var(--accent)" }}>
                    <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>AVG TEAM EFFICIENCY</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "10px" }}>96.4%</div>
                    <div style={{ fontSize: "10px", color: "var(--accent)", marginTop: "5px" }}>+2.1% FROM LAST WEEK</div>
                </div>
                <div className="glass-panel" style={{ padding: "25px", borderLeft: "4px solid #fbbc04" }}>
                    <div style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>READY FOR DISPATCH</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "10px" }}>8 UNITS</div>
                    <div style={{ fontSize: "10px", color: "#fbbc04", marginTop: "5px" }}>WAITING FOR HQ ORDER</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "30px" }}>
                
                {/* --- MEMBER DIRECTORY --- */}
                <div className="glass-panel" style={{ padding: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 900 }}>SOS PERSONNEL DIRECTORY</h3>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button style={{ padding: "10px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                <FaFilter /> FILTER
                            </button>
                            <button 
                                onClick={() => members.length < 15 ? setShowModal(true) : alert("Unit Capacity Full (15/15)")} 
                                style={{ 
                                    padding: "10px 20px", 
                                    background: members.length >= 15 ? "rgba(255,255,255,0.05)" : "var(--accent)", 
                                    border: "none", 
                                    borderRadius: "10px", 
                                    color: members.length >= 15 ? "rgba(255,255,255,0.2)" : "#000", 
                                    fontSize: "11px", 
                                    fontWeight: 900, 
                                    cursor: members.length >= 15 ? "not-allowed" : "pointer", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px" 
                                }}
                            >
                                <FaUserPlus /> {members.length >= 15 ? "CAPACITY FULL" : "ADD MEMBER"}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <th style={{ padding: "15px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>PERSONNEL</th>
                                    <th style={{ padding: "15px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>ROLE</th>
                                    <th style={{ padding: "15px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>STATUS</th>
                                    <th style={{ padding: "15px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>PERFORMANCE</th>
                                    <th style={{ padding: "15px", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(m => (
                                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", transition: "0.2s" }}>
                                        <td style={{ padding: "20px 15px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "35px", height: "35px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 900 }}>{m.name[0]}</div>
                                                <div style={{ fontSize: "13px", fontWeight: 700 }}>{m.name}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "20px 15px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{m.role}</td>
                                        <td style={{ padding: "20px 15px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: 900, color: m.status === "Online" ? "#00e5a0" : "rgba(255,255,255,0.2)" }}>
                                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.status === "Online" ? "#00e5a0" : "rgba(255,255,255,0.2)" }}></div>
                                                {m.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: "20px 15px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", minWidth: "60px" }}>
                                                    <div style={{ width: `${m.performance * 10}%`, height: "100%", background: "var(--accent)" }}></div>
                                                </div>
                                                <span style={{ fontSize: "11px", fontWeight: 900 }}>{m.performance}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "20px 15px" }}>
                                            <FaUserMinus onClick={() => removeMember(m.id)} style={{ color: "rgba(255,77,77,0.3)", cursor: "pointer", transition: "0.2s" }} onMouseOver={(e) => e.target.style.color="#ff4d4d"} onMouseOut={(e) => e.target.style.color="rgba(255,77,77,0.3)"} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- RESPONSE UNITS --- */}
                <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                    <div className="glass-panel" style={{ padding: "30px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900 }}>RESPONSE UNITS</h3>
                            <button style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.3)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <FaPlus />
                            </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            {teams.map(t => (
                                <div key={t.id} style={{ padding: "18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 800 }}>{t.name}</span>
                                        <span style={{ fontSize: "9px", fontWeight: 900, color: t.status === "On Mission" ? "#ff4d4d" : "#00e5a0", background: t.status === "On Mission" ? "rgba(255,77,77,0.1)" : "rgba(0,229,160,0.1)", padding: "3px 8px", borderRadius: "5px" }}>{t.status.toUpperCase()}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                                            <FaShieldAlt style={{ fontSize: "14px" }} /> {t.members} Members
                                        </div>
                                        <div style={{ fontSize: "10px", fontWeight: 900, color: "var(--accent)" }}>EFFICIENCY: {t.efficiency}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: "30px", background: "rgba(66, 133, 244, 0.02)", border: "1px solid rgba(66, 133, 244, 0.15)" }}>
                        <h4 style={{ margin: "0 0 15px 0", fontSize: "12px", fontWeight: 900, color: "var(--accent)", letterSpacing: "1px" }}>PERFORMANCE ANALYTICS</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: "1.6" }}>
                                Overall team performance is up by 15% this month. Team Alpha has the fastest response time (2m 14s).
                            </div>
                            <button style={{ padding: "12px", background: "rgba(66, 133, 244, 0.1)", border: "1px solid rgba(66, 133, 244, 0.3)", borderRadius: "10px", color: "var(--accent)", fontSize: "11px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <FaChartBar /> VIEW FULL REPORT
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- ADD MEMBER MODAL --- */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(15px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="glass-panel" style={{ width: "450px", padding: "40px", border: "1px solid var(--accent)", animation: "slideUp 0.3s ease" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: "var(--accent)" }}>PROVISION SOS PERSONNEL</h3>
                            <FaTimes onClick={() => setShowModal(false)} style={{ cursor: "pointer", color: "rgba(255,255,255,0.4)" }} />
                        </div>
                        <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div className="input-group">
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "1px" }}>FULL NAME</label>
                                <input type="text" required placeholder="Personnel Name" style={{ width: "100%", padding: "15px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none" }} value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "1px" }}>LOGIN ID (EMAIL)</label>
                                <input type="email" required placeholder="official@trinetra.sos" style={{ width: "100%", padding: "15px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none" }} value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "1px" }}>TACTICAL PASSPHRASE</label>
                                <input type="password" required placeholder="••••••••" style={{ width: "100%", padding: "15px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none" }} value={newMember.password} onChange={(e) => setNewMember({...newMember, password: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "1px" }}>OPERATIONAL ROLE</label>
                                <select style={{ width: "100%", padding: "15px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", cursor: "pointer" }} value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})}>
                                    <option value="SOS Member">SOS Member</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: "8px", letterSpacing: "1px" }}>ASSIGNED TEAM</label>
                                <select style={{ width: "100%", padding: "15px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", outline: "none", cursor: "pointer" }} value={newMember.team} onChange={(e) => setNewMember({...newMember, team: e.target.value})}>
                                    <option value="Alpha">Team Alpha</option>
                                    <option value="Beta">Team Beta</option>
                                    <option value="Gamma">Team Gamma</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading} style={{ padding: "18px", background: "var(--accent)", border: "none", borderRadius: "12px", color: "#000", fontWeight: 900, cursor: "pointer", marginTop: "10px", boxShadow: "0 10px 20px rgba(66, 133, 244, 0.3)" }}>
                                {loading ? "PROVISIONING..." : "CREATE PERSONNEL ID"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
