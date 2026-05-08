import React, { useState } from "react";
import { FaPhone, FaFileAlt, FaRoute, FaShare, FaShieldAlt, FaMapMarkerAlt } from "react-icons/fa";
import IncidentReport from "./IncidentReport";
import SafeRoutes from "./SafeRoutes";
import LiveSharing from "./LiveSharing";
import "../styles/QuickActions.css";

const QuickActions = () => {
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [showSafeRoutes, setShowSafeRoutes] = useState(false);
  const [showLiveSharing, setShowLiveSharing] = useState(false);

  const actions = [
    {
      id: 1,
      icon: "🚨",
      label: "Emergency Call",
      description: "Call emergency services immediately",
      color: "#ff4d4d",
      action: () => window.location.href = "tel:100",
    },
    {
      id: 2,
      icon: "📋",
      label: "Report Incident",
      description: "Report crime or accident",
      color: "#fbbc04",
      action: () => setShowIncidentReport(true),
    },
    {
      id: 3,
      icon: "🗺️",
      label: "Safe Routes",
      description: "Get safest travel route",
      color: "#00e5a0",
      action: () => setShowSafeRoutes(true),
    },
    {
      id: 4,
      icon: "📍",
      label: "Share Location",
      description: "Live share with contacts",
      color: "#a855f7",
      action: () => setShowLiveSharing(true),
    },
    {
      id: 5,
      icon: "🛡️",
      label: "Safety Tips",
      description: "Get personalized safety advice",
      color: "#0095ff",
      action: () => alert("📋 Stay Alert - Avoid dark areas at night\n👥 Travel in groups\n📱 Keep phone charged"),
    },
    {
      id: 6,
      icon: "🏥",
      label: "Nearby Services",
      description: "Find hospitals & stations",
      color: "#4285f4",
      action: () => window.location.href = "/stations",
    },
  ];

  return (
    <>
      <div className="quick-actions-container">
        <div className="actions-header">
          <h3>Quick Actions</h3>
          <p>Emergency & Safety Tools</p>
        </div>

        <div className="actions-grid">
          {actions.map((action) => (
            <button
              key={action.id}
              className="action-card"
              onClick={action.action}
              style={{ "--action-color": action.color }}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-label">{action.label}</div>
              <div className="action-desc">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {showIncidentReport && <IncidentReport onClose={() => setShowIncidentReport(false)} />}
      {showSafeRoutes && <SafeRoutes onClose={() => setShowSafeRoutes(false)} />}
      {showLiveSharing && <LiveSharing />}
    </>
  );
};

export default QuickActions;
