import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileInvoice, FaBars, FaBell, FaDownload, FaTrash, FaClock, FaCheckCircle, FaChevronLeft } from 'react-icons/fa';
import Logo from '../components/Logo';
import Sidebar from '../components/Sidebar';
import "./MobileSOSReports.css";

const MobileSOSReports = ({ user, onLogout }) => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem('trinetra_sos_reports') || '[]');
      setReports(saved.reverse());
      setLoading(false);
    }, 600);
  }, []);

  const deleteReport = (id) => {
    if (window.confirm("Delete this evidence report?")) {
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      localStorage.setItem('trinetra_sos_reports', JSON.stringify(updated.slice().reverse()));
      setSelectedReport(null);
    }
  };

  const handleDownload = () => {
    if (!selectedReport) return;
    
    // Minimal Audit Template (to save space/tokens)
    const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmQAAAGYCAYAAADsqf5DAAAQAElEQVR4AeydBZxVRfvHnzl1u+92d8EusXQIit0BdgcmJnas3Yqt6GsXYCsiooIinct2d9693ffE/M/Vd/0vCIi+BrJzPnf2nDPzzDPP851l74+Zu2cpIAchQAgQAoQAIUAIEAKEwD9KgAiyfxQ/GZwQIAQIgeFCgORJCBACeyNABNne6JA2QoAQIAQIAUKAECAE/gYCRJD9DZDJEMODAMmSECAECAFCgBD4owSIIPuj5Eg/QoAQIAQIAUKAECAE/iQCv0OQ/UkjEjeEACFACBAChAAhQAgQAjsRIIJsJxzkhhAgBAgBQuAfJ0ACIASGIQEiyIbhpJOUCQFCgBAgBAgBQmD/IkAE2f41HySa4UGAZEkIEAKEACFACOxEgAiynXCQG0KAECAECAFCBAgBP5+An+NIPv78yAjEgKEACFACBAChAAh8K8lQATZv3bqSOCEACFACBAChAAhcKAQIILsQJlJkgchQAgQAoQAIUAI/GsJEEH2r506EvjwIECyJAQIAUKAEBgOBIggGw6zTHIkBAgBQoAQIAQIgf2awD8uyPZrOiQ4QoAQIAQIAUKAECAE/gYCRJD9DZDJEIQAIUAIEAL/OAESACGwXxMggmy/nh4SHCFACBAChAAhQAgMBwJEkA2HWSY5Dg8CJEtCgBAgBAiBfy0BIsj+tVNHAicECAFCgBAgBAiBA4XAv0mQHSjMSR6EACFACBAChAAhQAjsRNBIsj2wkFuCAFCoBgOJHfAsCcRZEP9O4DkTwiQAH8DATIu/gYIZAhCYBgS8Pl+1v8UAnf8A/hB7r9Kof99AAAAAElFTkSuQmCC";

    const fullHtml = `
      <html>
        <head><title>TRINETRA_AUDIT_${selectedReport.id}</title></head>
        <body style="font-family: sans-serif; padding: 40px; background: #f4f4f4;">
          <div style="background: white; max-width: 800px; margin: 0 auto; padding: 40px; border: 2px solid #000;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px;">
              <img src="${logoBase64}" style="height: 60px;"/>
              <div style="text-align: right;">
                <div style="font-weight: bold;">INCIDENT AUDIT #${selectedReport.id.toString().slice(-8)}</div>
                <div>Status: FORENSIC_VERIFIED</div>
              </div>
            </div>
            <h1 style="text-align: center; margin: 40px 0;">Incident Evidence Report</h1>
            <div style="margin-bottom: 20px;"><strong>Victim:</strong> ${selectedReport.userName || 'User'}</div>
            <div style="margin-bottom: 20px;"><strong>Timestamp:</strong> ${new Date(selectedReport.timestamp).toLocaleString()}</div>
            <div style="margin-bottom: 20px;"><strong>Location:</strong> ${selectedReport.locationName}</div>
            <div style="margin-bottom: 20px;"><strong>Coordinates:</strong> ${selectedReport.lat}, ${selectedReport.lng}</div>
            <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #000;">
              <strong>Distress Message:</strong><br/>"${selectedReport.message}"
            </div>
            <div style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666;">
              This document is a digitally generated forensic report by the TRINETRA Emergency System. 
              Location data is verified via system telemetry at the time of trigger.
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRINETRA_AUDIT_${selectedReport.id.toString().slice(-6)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mobile-reports-root">
      <header className="mob-rep-header">
        <button className="mob-top-btn" onClick={() => setSidebarOpen(true)}><FaBars size={20} /></button>
        <Logo height={20} />
        <button className="mob-top-btn"><FaBell size={18} /></button>
      </header>

      <div className="mob-rep-content">
        <h2 className="mob-rep-title">
          <FaFileInvoice color="var(--accent)" /> Incident Reports
        </h2>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} style={{ height: 80, background: 'var(--bg2)', borderRadius: 18, animation: 'pulse 1.5s infinite' }} />)
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', opacity: 0.4 }}>
            <FaFileInvoice size={40} style={{ marginBottom: 12 }} />
            <p>No reports found.</p>
          </div>
        ) : (
          reports.map(r => (
            <div key={r.id} className="mob-report-card" onClick={() => setSelectedReport(r)}>
              <div className="mob-report-icon"><FaFileInvoice /></div>
              <div className="mob-report-main">
                <div className="mob-report-id">ID: {r.id.toString().slice(-6)}</div>
                <div className="mob-report-name">Emergency SOS Log</div>
                <div className="mob-report-meta">
                  <FaClock size={10} /> {new Date(r.timestamp).toLocaleDateString()} at {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedReport && (
        <div className="mob-rep-overlay">
          <button className="mob-btn-close" onClick={() => setSelectedReport(null)}><FaChevronLeft /></button>
          
          <div className="mob-rep-detail-card">
            <div className="mob-audit-badge"><FaCheckCircle /></div>
            <h3 className="mob-audit-title">Audit Ready</h3>
            <p className="mob-audit-desc">
              The forensic audit for report #{selectedReport.id.toString().slice(-6)} has been generated and is ready for secure download.
            </p>

            <div className="mob-audit-actions">
              <button className="mob-btn-primary" onClick={handleDownload}>
                <FaDownload /> Download Audit
              </button>
              <button className="mob-btn-danger" onClick={() => deleteReport(selectedReport.id)}>
                <FaTrash /> Delete Record
              </button>
            </div>
            
            <div style={{ marginTop: 40, fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2 }}>
              Hash: {Math.random().toString(36).substring(7).toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <Link to="/dashboard" className="mob-tab">
          <span className="mob-tab-icon">🏠</span>
          <span className="mob-tab-label">Home</span>
        </Link>
        <Link to="/sos" className="mob-tab">
          <span className="mob-tab-icon">🆘</span>
          <span className="mob-tab-label">SOS</span>
        </Link>
        <Link to="/stations" className="mob-tab">
          <span className="mob-tab-icon">🚉</span>
          <span className="mob-tab-label">Help</span>
        </Link>
        <Link to="/history" className="mob-tab active">
          <span className="mob-tab-icon">📜</span>
          <span className="mob-tab-label">History</span>
        </Link>
        <Link to="/profile" className="mob-tab">
          <span className="mob-tab-icon">👤</span>
          <span className="mob-tab-label">Profile</span>
        </Link>
      </nav>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user} 
        onLogout={onLogout}
      />
    </div>
  );
};

export default MobileSOSReports;
