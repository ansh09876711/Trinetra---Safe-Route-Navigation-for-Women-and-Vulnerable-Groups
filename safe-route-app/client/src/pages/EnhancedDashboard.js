import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SafetyScore from "../components/SafetyScore";
import AlertsCenter from "../components/AlertsCenter";
import QuickActions from "../components/QuickActions";
import LiveSharing from "../components/LiveSharing";
import "../styles/EnhancedDashboard.css";

const EnhancedDashboard = () => {
  const [userLocation, setUserLocation] = useState("Current Area");
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: "sos", time: "2 hours ago", desc: "SOS triggered from home" },
    { id: 2, type: "route", time: "4 hours ago", desc: "Safe route used to office" },
    { id: 3, type: "incident", time: "1 day ago", desc: "Incident reported in Connaught Place" },
  ]);

  const [stats, setStats] = useState({
    sosUsed: 0,
    safeRoutesUsed: 12,
    incidentsReported: 3,
    contactsAdded: 5,
  });

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Could reverse geocode to get city name
          setUserLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      );
    }
  }, []);

  return (
    <div className="enhanced-dashboard">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome Back! 👋</h1>
          <p>Stay safe with real-time alerts and smart safety features</p>
        </div>
        <div className="hero-decoration">
          <div className="decoration-blob blob1"></div>
          <div className="decoration-blob blob2"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Left Column */}
        <div className="dashboard-main">
          {/* Safety Score */}
          <SafetyScore location={userLocation} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Real-time Alerts */}
          <AlertsCenter />
        </div>

        {/* Right Sidebar */}
        <div className="dashboard-sidebar">
          {/* Live Sharing Widget */}
          <div className="sidebar-section">
            <h3>Quick Access</h3>
            <LiveSharing />
          </div>

          {/* Statistics */}
          <div className="sidebar-section stats-section">
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🚨</div>
                <div className="stat-content">
                  <div className="stat-label">SOS Calls</div>
                  <div className="stat-value">{stats.sosUsed}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🗺️</div>
                <div className="stat-content">
                  <div className="stat-label">Safe Routes</div>
                  <div className="stat-value">{stats.safeRoutesUsed}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="stat-label">Reports</div>
                  <div className="stat-value">{stats.incidentsReported}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">Contacts</div>
                  <div className="stat-value">{stats.contactsAdded}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="sidebar-section">
            <h3>Recent Activities</h3>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === "sos" && "🚨"}
                    {activity.type === "route" && "🗺️"}
                    {activity.type === "incident" && "📋"}
                  </div>
                  <div className="activity-content">
                    <div className="activity-desc">{activity.desc}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="sidebar-section tips-section">
            <h3>Safety Tip 💡</h3>
            <div className="tip-box">
              <p>
                Always share your live location with at least 2 trusted contacts when
                traveling to unfamiliar areas. This can be crucial in emergencies.
              </p>
              <button className="btn-primary">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
