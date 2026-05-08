import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaChartLine, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import "../styles/SafetyScore.css";

const SafetyScore = ({ location = "Current Area" }) => {
  const [score, setScore] = useState(0);
  const [risk, setRisk] = useState("Low");
  const [metrics, setMetrics] = useState({
    incidents: 2,
    coverage: 95,
    responders: 12,
    avgResponse: 4.5,
  });

  useEffect(() => {
    // Simulate safety score calculation
    const calculatedScore = Math.floor(Math.random() * 40 + 60); // 60-100
    setScore(calculatedScore);
    setRisk(calculatedScore > 80 ? "Low" : calculatedScore > 60 ? "Medium" : "High");
  }, [location]);

  const getRiskColor = () => {
    if (risk === "Low") return "#00e5a0";
    if (risk === "Medium") return "#fbbc04";
    return "#ff4d4d";
  };

  const getScoreGradient = () => {
    if (score > 80) return "linear-gradient(135deg, #00e5a0, #0095ff)";
    if (score > 60) return "linear-gradient(135deg, #fbbc04, #f9d94a)";
    return "linear-gradient(135deg, #ff4d4d, #ff7070)";
  };

  return (
    <div className="safety-score-container">
      <div className="score-header">
        <FaShieldAlt className="score-icon" />
        <h3>Safety Score - {location}</h3>
      </div>

      <div className="score-circle" style={{ background: getScoreGradient() }}>
        <div className="score-value">{score}</div>
        <div className="score-label">{risk} Risk</div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <FaMapMarkerAlt className="metric-icon" />
          <div className="metric-info">
            <div className="metric-label">Recent Incidents</div>
            <div className="metric-value">{metrics.incidents}</div>
          </div>
        </div>
        <div className="metric-card">
          <FaChartLine className="metric-icon" />
          <div className="metric-info">
            <div className="metric-label">Coverage</div>
            <div className="metric-value">{metrics.coverage}%</div>
          </div>
        </div>
        <div className="metric-card">
          <FaUsers className="metric-icon" />
          <div className="metric-info">
            <div className="metric-label">Active Responders</div>
            <div className="metric-value">{metrics.responders}</div>
          </div>
        </div>
        <div className="metric-card">
          <FaShieldAlt className="metric-icon" />
          <div className="metric-info">
            <div className="metric-label">Avg Response</div>
            <div className="metric-value">{metrics.avgResponse}min</div>
          </div>
        </div>
      </div>

      <div className="score-tips">
        <h4>🛡️ Safety Tips</h4>
        <ul>
          <li>Share your live location with trusted contacts</li>
          <li>Keep your phone charged and accessible</li>
          <li>Stay aware of your surroundings</li>
          <li>Use well-lit, populated routes</li>
        </ul>
      </div>
    </div>
  );
};

export default SafetyScore;
