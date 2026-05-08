import React, { useState, useEffect } from "react";
import { FaShareAlt, FaStopCircle, FaClock, FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import "../styles/LiveSharing.css";

const LiveSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [duration, setDuration] = useState(60);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  const contacts = [
    { id: 1, name: "Mom", phone: "+91 98765 43210", icon: "👩" },
    { id: 2, name: "Dad", phone: "+91 98765 43211", icon: "👨" },
    { id: 3, name: "Best Friend", phone: "+91 98765 43212", icon: "👫" },
    { id: 4, name: "Sibling", phone: "+91 98765 43213", icon: "👦" },
  ];

  useEffect(() => {
    let timer;
    if (isSharing && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsSharing(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSharing, timeLeft]);

  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleStartSharing = () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact");
      return;
    }
    setIsSharing(true);
    setTimeLeft(duration * 60);
  };

  const handleStopSharing = () => {
    setIsSharing(false);
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="live-sharing-container">
      <div className="sharing-header">
        <FaShareAlt className="header-icon" />
        <h3>Live Location Sharing</h3>
      </div>

      {isSharing && timeLeft ? (
        <div className="sharing-active">
          <div className="timer-display">
            <FaClock className="timer-icon" />
            <div className="timer-text">{formatTime(timeLeft)}</div>
          </div>
          <div className="sharing-info">
            <div className="shared-with">Sharing with {selectedContacts.length} contact(s)</div>
            <div className="pulse-indicator">
              <div className="pulse"></div>
              Live Sharing Active
            </div>
          </div>
          <button className="btn-stop" onClick={handleStopSharing}>
            <FaStopCircle /> Stop Sharing
          </button>
        </div>
      ) : (
        <>
          <div className="contacts-section">
            <label>Select Contacts to Share With</label>
            <div className="contacts-grid">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`contact-card ${selectedContacts.includes(contact.id) ? "selected" : ""}`}
                  onClick={() => toggleContact(contact.id)}
                >
                  <div className="contact-avatar">{contact.icon}</div>
                  <div className="contact-name">{contact.name}</div>
                  {selectedContacts.includes(contact.id) && <FaCheck className="check-icon" />}
                </div>
              ))}
            </div>
          </div>

          <div className="duration-section">
            <label>
              <FaClock /> Duration: {duration} minutes
            </label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="duration-slider"
            />
            <div className="duration-labels">
              <span>5 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          <button className="btn-start" onClick={handleStartSharing}>
            <FaShareAlt /> Start Live Sharing
          </button>
        </>
      )}
    </div>
  );
};

export default LiveSharing;
