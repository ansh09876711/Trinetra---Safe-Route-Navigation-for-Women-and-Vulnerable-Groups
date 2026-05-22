import React, { useState, useEffect } from "react";
import { 
  FaClipboardList, FaComments, FaUser, FaBell, FaSignOutAlt
} from "react-icons/fa";
import Logo from "../../../../components/Logo";

export default function HelpdeskMemberMobile({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("tickets");

    const renderContent = () => {
        switch (activeTab) {
            case 'tickets': return <TicketsMobile />;
            case 'chat': return <ChatMobile />;
            case 'profile': return <ProfileMobile user={user} onLogout={onLogout} />;
            default: return <TicketsMobile />;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', paddingBottom: '80px', fontFamily: "'Space Grotesk', sans-serif" }}>
            <header style={{ padding: '20px', background: 'rgba(15, 15, 20, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Logo height={25} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaBell color="#fbbc04" />
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #fbbc04, #ea4335)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                </div>
            </header>

            <main style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 900, letterSpacing: '2px', marginBottom: '5px' }}>SUPPORT AGENT • FIELD</div>
                    <div style={{ fontSize: '20px', fontWeight: 900 }}>Hello, {user?.name?.split(' ')[0]}</div>
                </div>
                {renderContent()}
            </main>

            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15, 15, 20, 0.98)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', padding: '15px 0', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
                {[
                    { id: 'tickets', icon: <FaClipboardList />, label: 'Queue' },
                    { id: 'chat', icon: <FaComments />, label: 'Chat' },
                    { id: 'profile', icon: <FaUser />, label: 'Me' }
                ].map(tab => (
                    <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: activeTab === tab.id ? '#fbbc04' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                        <div style={{ fontSize: '20px' }}>{tab.icon}</div>
                        <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{tab.label}</div>
                    </div>
                ))}
            </nav>
            <style>{`
                .m-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 15px; }
            `}</style>
        </div>
    );
}

function TicketsMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, marginBottom: '15px' }}>MY ASSIGNED TICKETS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2].map(i => (
                    <div key={i} className="m-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 900, color: '#fbbc04' }}>TK-100{i}</span>
                            <span style={{ fontSize: '10px', background: '#fbbc0420', color: '#fbbc04', padding: '2px 8px', borderRadius: '4px' }}>PENDING</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>Signal Quality Feedback</div>
                        <button style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 900, marginTop: '12px' }}>RESOLVE</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ChatMobile() {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ textAlign: 'center', padding: '40px' }}>
                <FaComments size={40} color="rgba(255,255,255,0.1)" />
                <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>NO ACTIVE CHAT SESSIONS</div>
            </div>
        </div>
    );
}

function ProfileMobile({ user, onLogout }) {
    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="m-card" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ea4335)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>{user?.name}</div>
                <div style={{ fontSize: '10px', color: '#fbbc04', fontWeight: 800, marginTop: '5px' }}>SUPPORT AGENT</div>
            </div>
            <button onClick={onLogout} style={{ width: '100%', padding: '15px', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', borderRadius: '12px', color: '#ff4d4d', fontWeight: 900, fontSize: '11px' }}>LOGOUT</button>
        </div>
    );
}
