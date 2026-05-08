import React, { useState } from "react";
import { FaRoute, FaShieldAlt, FaTimes, FaMapMarkerAlt, FaClock, FaUsers } from "react-icons/fa";
import "../styles/SafeRoutes.css";

const SafeRoutes = ({ startLocation, endLocation, onClose }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = [
    {
      id: 1,
      name: "Safest Route",
      safety: 95,
      distance: 12.4,
      time: 24,
      description: "Well-lit, populated main roads",
      wellLit: true,
      busyAreas: true,
      cctv: true,
      policePresence: true,
    },
    {
      id: 2,
      name: "Balanced Route",
      safety: 78,
      distance: 10.2,
      time: 18,
      description: "Mix of main and alternate roads",
      wellLit: true,
      busyAreas: true,
      cctv: false,
      policePresence: false,
    },
    {
      id: 3,
      name: "Fastest Route",
      safety: 65,
      distance: 8.5,
      time: 14,
      description: "Shortest distance, some dark areas",
      wellLit: false,
      busyAreas: false,
      cctv: false,
      policePresence: false,
    },
  ];

  return (
    <div className="safe-routes-modal" onClick={onClose}>
      <div className="safe-routes-content" onClick={(e) => e.stopPropagation()}>
        <div className="routes-header">
          <div className="header-info">
            <FaRoute className="header-icon" />
            <div>
              <h3>Recommended Safe Routes</h3>
              <p>
                <FaMapMarkerAlt /> From destination to destination
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="routes-list">
          {routes.map((route) => (
            <div
              key={route.id}
              className={`route-card ${selectedRoute?.id === route.id ? "selected" : ""}`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="route-header">
                <h4>{route.name}</h4>
                <div className="safety-badge">
                  <FaShieldAlt /> {route.safety}% Safe
                </div>
              </div>

              <p className="route-description">{route.description}</p>

              <div className="route-stats">
                <div className="stat">
                  <FaMapMarkerAlt /> {route.distance} km
                </div>
                <div className="stat">
                  <FaClock /> {route.time} min
                </div>
              </div>

              <div className="route-features">
                {route.wellLit && <span className="feature">💡 Well-lit</span>}
                {route.busyAreas && <span className="feature">👥 Busy Areas</span>}
                {route.cctv && <span className="feature">📹 CCTV Coverage</span>}
                {route.policePresence && <span className="feature">🚔 Police Patrol</span>}
              </div>

              {selectedRoute?.id === route.id && (
                <div className="route-details">
                  <h5>Route Details</h5>
                  <ul>
                    <li>✓ Uses main arterial roads</li>
                    <li>✓ Avoids high-risk zones</li>
                    <li>✓ Multiple escape routes available</li>
                    <li>✓ Emergency services nearby</li>
                  </ul>
                  <button className="btn-navigate">Navigate Now</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafeRoutes;
