import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import Logo from './Logo';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  const userInitials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) 
    : "TR";

  const links = [
    { to: "/", icon: "🏡", label: "Home" },
    { to: "/dashboard", icon: "🗺️", label: "Dashboard" },
    { to: "/sos", icon: "🆘", label: "SOS Emergency" },
    { to: "/history", icon: "📜", label: "History" },
    { to: "/analytics", icon: "📊", label: "Analytics" },
    { to: "/stations", icon: "🚉", label: "Safe Stations" },
    { to: "/taxi", icon: "🚕", label: "Safe Taxi" },
    { to: "/reports", icon: "📄", label: "SOS Reports" },
    { to: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <div className={`nr-sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose} />
      <aside className={`nr-sidebar ${isOpen ? "open" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="sb-header">
          <Logo height={24} />
          <button className="sb-close" onClick={onClose}><FaTimes size={16} /></button>
        </div>
        
        <div className="sb-user">
          <div className="sb-avatar">{userInitials}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.name || "User"}</div>
            <div className="sb-user-status">
              <span className="status-dot"></span> Active
            </div>
          </div>
        </div>

        <nav className="sb-nav">
          {links.map(item => (
            <Link key={item.to} to={item.to} className="sb-link" onClick={onClose}>
              <span className="sb-icon">{item.icon}</span>
              <span className="sb-label">{item.label}</span>
            </Link>
          ))}
          <button onClick={onLogout} className="sb-link logout-btn">
            <span className="sb-icon">🚪</span>
            <span className="sb-label" style={{ color: '#ff4d4d' }}>Logout</span>
          </button>
        </nav>
        
        <div className="sb-footer">
          <div className="sb-ver">v2.2 · TRINETRA</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
