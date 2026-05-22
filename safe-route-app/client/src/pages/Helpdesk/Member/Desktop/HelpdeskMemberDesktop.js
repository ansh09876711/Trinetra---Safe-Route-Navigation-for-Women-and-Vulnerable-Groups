import React, { useState, useEffect } from "react";
import { 
  FaHeadset, FaClipboardList, FaComments, FaHistory, FaSignOutAlt, 
  FaBell, FaUser, FaSearch, FaPaperPlane, FaTimes, FaCheck
} from "react-icons/fa";
import Logo from "../../../../components/Logo";

export default function HelpdeskMemberDesktop({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("mytickets");
    const [tickets, setTickets] = useState([
        { id: 'TK-1001', user: 'Ansh Agarwal', subject: 'Signal Connectivity', status: 'IN_PROGRESS', priority: 'HIGH' },
        { id: 'TK-1005', user: 'Rahul Verma', subject: 'Account Login Issue', status: 'NEW', priority: 'MEDIUM' }
    ]);

    const tabs = [
        { id: 'mytickets', label: 'MY TICKETS', icon: <FaClipboardList />, color: '#fbbc04' },
        { id: 'chat', label: 'LIVE CHAT', icon: <FaComments />, color: '#00e5a0' },
        { id: 'history', label: 'RESOLVED', icon: <FaHistory />, color: '#4285F4' },
        { id: 'profile', label: 'MY PROFILE', icon: <FaUser />, color: '#fbbc04' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'mytickets': return <MyTicketsView tickets={tickets} />;
            case 'chat': return <LiveChatView />;
            case 'history': return <ResolvedView />;
            case 'profile': return <ProfileView user={user} />;
            default: return <MyTicketsView tickets={tickets} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0a0b', color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
            
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'rgba(15, 15, 20, 0.98)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 0', zIndex: 100 }}>
                <div style={{ padding: '0 30px', marginBottom: '40px' }}>
                    <Logo height={35} />
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(251,188,4,0.1)', borderRadius: '8px', border: '1px solid rgba(251,188,4,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <div className="status-dot" style={{ background: '#fbbc04' }}></div>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#fbbc04', letterSpacing: '2px' }}>SUPPORT AGENT</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '0 15px', overflowY: 'auto' }}>
                    {tabs.map(item => (
                        <div key={item.id} onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '14px 20px', marginBottom: '6px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                borderLeft: `3px solid ${activeTab === item.id ? item.color : 'transparent'}`,
                                transition: '0.2s'
                            }}>
                            <span style={{ fontSize: '18px', color: activeTab === item.id ? item.color : 'rgba(255,255,255,0.2)' }}>{item.icon}</span>
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '0 20px', marginTop: '20px' }}>
                    <button onClick={onLogout} style={{ width: '100%', padding: '16px', background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.1)', borderRadius: '12px', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '11px', fontWeight: 900 }}>
                        <FaSignOutAlt /> TERMINATE SESSION
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '20px 40px', background: 'rgba(10, 10, 15, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '2px' }}>AGENT DESK</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900 }}>{user?.name}</div>
                            <div style={{ fontSize: '9px', color: '#fbbc04', fontWeight: 800 }}>SUPPORT AGENT</div>
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>{renderContent()}</main>
            </div>
            <style>{`
                .glass-panel { background: rgba(20, 20, 25, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; }
            `}</style>
        </div>
    );
}

function MyTicketsView({ tickets }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '30px' }}>ASSIGNED TO ME</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tickets.map((t, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(251,188,4,0.1)', color: '#fbbc04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{t.user[0]}</div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 900 }}>{t.user} - {t.id}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{t.subject}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '11px', fontWeight: 900 }}>VIEW DETAILS</button>
                            <button style={{ padding: '10px 20px', background: '#fbbc04', border: 'none', borderRadius: '10px', color: '#000', fontSize: '11px', fontWeight: 900 }}>RESOLVE</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LiveChatView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', height: '600px' }} className="glass-panel">
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#00e5a0', borderRadius: '50%' }}></div>
                    <span style={{ fontWeight: 900, fontSize: '14px' }}>CITIZEN_ANSH_A</span>
                </div>
                <FaTimes color="rgba(255,255,255,0.2)" cursor="pointer" />
            </div>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px 15px 15px 0', maxWidth: '70%', fontSize: '13px' }}>Hello, I'm having trouble with the safe route map not loading the satellite view.</div>
                <div style={{ background: '#fbbc04', color: '#000', padding: '15px', borderRadius: '15px 15px 0 15px', maxWidth: '70%', alignSelf: 'flex-end', fontSize: '13px', fontWeight: 700 }}>Hello Ansh, please ensure your GPS is enabled. I'm checking the satellite layer status now.</div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '15px' }}>
                <input placeholder="TYPE YOUR MESSAGE..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '12px', outline: 'none' }} />
                <button style={{ width: '50px', height: '50px', background: '#fbbc04', border: 'none', borderRadius: '12px', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}><FaPaperPlane /></button>
            </div>
        </div>
    );
}

function ResolvedView() {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.1)' }}>
            <FaHistory size={80} style={{ marginBottom: '20px' }} />
            <h2>NO RECENTLY RESOLVED TICKETS</h2>
        </div>
    );
}

function ProfileView({ user }) {
    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbc04, #ea4335)', margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900 }}>{user?.name?.[0]}</div>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{user?.name}</h2>
                <p style={{ color: '#fbbc04', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>SUPPORT AGENT</p>
            </div>
        </div>
    );
}
