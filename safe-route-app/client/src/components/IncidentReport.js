import React, { useState } from "react";
import { FaFileAlt, FaMapMarkerAlt, FaCamera, FaTimes, FaCheckCircle } from "react-icons/fa";
import "../styles/IncidentReport.css";

const IncidentReport = ({ onClose }) => {
  const [formData, setFormData] = useState({
    type: "theft",
    description: "",
    location: "",
    severity: "medium",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send to backend
    console.log("Reporting incident:", { ...formData, image });
    setIsSubmitted(true);
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="incident-modal">
        <div className="incident-content success">
          <FaCheckCircle className="success-icon" />
          <h3>Report Submitted</h3>
          <p>Thank you for reporting. Authorities have been notified.</p>
          <p className="report-id">Ref ID: #INC{Math.floor(Math.random() * 100000)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="incident-modal" onClick={onClose}>
      <div className="incident-content" onClick={(e) => e.stopPropagation()}>
        <div className="incident-header">
          <h3>
            <FaFileAlt /> Report Incident
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="incident-form">
          <div className="form-group">
            <label>Incident Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="theft">Theft / Robbery</option>
              <option value="harassment">Harassment / Abuse</option>
              <option value="accident">Accident / Emergency</option>
              <option value="suspicious">Suspicious Activity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Severity *</label>
            <div className="severity-buttons">
              {["low", "medium", "high"].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`severity-btn ${formData.severity === level ? "active" : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, severity: level }))}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <div className="location-input">
              <FaMapMarkerAlt className="location-icon" />
              <input
                type="text"
                name="location"
                placeholder="Enter incident location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Describe what happened..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Attach Photo (Optional)</label>
            <label className="image-upload">
              <FaCamera /> Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            {image && <div className="image-preview" style={{ backgroundImage: `url(${image})` }} />}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentReport;
