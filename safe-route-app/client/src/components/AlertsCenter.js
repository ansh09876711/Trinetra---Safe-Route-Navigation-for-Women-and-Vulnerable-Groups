import React, { useState, useEffect } from "react";
import { FaBell, FaMapMarkerAlt, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "../styles/AlertsCenter.css";

const AlertsCenter = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "crime",
      severity: "high",
      title: "Robbery Reported",
      location: "Connaught Place, Delhi",
      time: "2 mins ago",
      distance: "0.8 km",
    },
    {
      id: 2,
      type: "accident",
      severity: "medium",
      title: "Traffic Accident",
      location: "NH1 Highway",
      time: "15 mins ago",
      distance: "2.3 km",
    },
    {
      id: 3,
      type: "alert",
      severity: "low",
      title: "Safety Reminder",
      location: "Your Area",
      time: "1 hour ago",
      distance: "0.1 km",
    },
  ]);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "#ff4d4d";
      case "medium":
        return "#fbbc04";
      case "low":
        return "#00e5a0";
      default:
        return "#ffffff";
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case "crime":
        return "🚨";
      case "accident":
        return "⚠️";
      case "alert":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="alerts-center-container">
      <div className="alerts-header">
        <FaBell className="alerts-icon" />
        <h3>Real-Time Safety Alerts</h3>
        <span className="alert-count">{alerts.length}</span>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <div className="checkmark">✓</div>
          <p>All clear! No active safety alerts in your area.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="alert-item"
              style={{ borderLeftColor: getSeverityColor(alert.severity) }}
            >
              <div className="alert-icon" style={{ color: getSeverityColor(alert.severity) }}>
                {getSeverityIcon(alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-location">
                  <FaMapMarkerAlt /> {alert.location}
                </div>
                <div className="alert-meta">
                  <span className="alert-time">{alert.time}</span>
                  <span className="alert-distance">{alert.distance}</span>
                </div>
              </div>
              <button className="dismiss-btn" onClick={() => dismissAlert(alert.id)}>
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="alerts-footer">
        <button className="btn-view-map">View on Map</button>
        <button className="btn-help">Get Help</button>
      </div>
    </div>
  );
};

export default AlertsCenter;
