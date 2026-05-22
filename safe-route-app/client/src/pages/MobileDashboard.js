import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  FaBars, FaLocationArrow, FaCube, FaLayerGroup, 
  FaShieldAlt, FaTimes, FaBell, FaRobot, FaSearch,
  FaHome, FaBriefcase, FaPlus, FaDirections
} from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import TrinetraAgent from "../components/TrinetraAgent";
import { useNavigate } from "react-router-dom";
import "./MobileDashboard.css";

// ── Tile Providers ──
const TILES = {
  modern: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attr: "CartoDB", bg: "#06080d" },
  satellite: { url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", attr: "Google Hybrid", bg: "#000" },
  street: { url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", attr: "Google Street", bg: "#f0f2f5" },
  terrain: { url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", attr: "Google Terrain", bg: "#e4e8e0" }
};

export default function MobileDashboard({ user, onLogout, triggerSOS }) {
  const navigate = useNavigate();
  // ── States ──
  const [position, setPosition] = useState(null);
  const [areaName, setAreaName] = useState("Locating...");
  const [score, setScore] = useState(98);
  const [mapStyle, setMapStyle] = useState("modern");
  const [showZones, setShowZones] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [crimeZones, setCrimeZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [map3D, setMap3D] = useState(false);
  
  // ── Refs ──
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const zoneLayersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // ── Initialization ──
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Default to Bhopal
    const initialPos = [23.2599, 77.4126];
    
    mapRef.current = L.map(containerRef.current, {
      center: initialPos,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true
    });

    const t = TILES[mapStyle];
    tileLayerRef.current = L.tileLayer(t.url, { maxZoom: 18 }).addTo(mapRef.current);

    // Watch location
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        localStorage.setItem('trinetra_last_pos', JSON.stringify(newPos));
        
        // Update marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(newPos);
        } else {
          const userIcon = L.divIcon({
            className: 'mob-user-marker',
            html: `<div class="user-dot"></div><div class="user-pulse"></div>`,
            iconSize: [20, 20]
          });
          userMarkerRef.current = L.marker(newPos, { icon: userIcon }).addTo(mapRef.current);
          mapRef.current.flyTo(newPos, 16);
        }

        // Reverse Geocode for area name
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`)
          .then(r => r.json())
          .then(data => {
            const area = data.address.suburb || data.address.neighbourhood || data.address.city || "Nearby";
            setAreaName(area);
          });
      },
      (err) => console.warn("GPS Error", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Initial Resize
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 500);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── Force InvalidateSize on state changes ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 400);
    return () => clearTimeout(timer);
  }, [drawerOpen]);

  // ── Tile Style Switch ──
  useEffect(() => {
    if (!mapRef.current) return;
    const t = TILES[mapStyle];
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(t.url, { maxZoom: 18 }).addTo(mapRef.current);
  }, [mapStyle]);

  // ── Fetch Crime Zones ──
  useEffect(() => {
    if (!position) return;
    const fetchZones = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/crime-zones?lat=${position[0]}&lng=${position[1]}`);
        const data = await res.json();
        setCrimeZones(data.zones || []);
        renderZones(data.zones || []);
      } catch (err) {
        console.warn("Using fallback zones");
        const fallback = [
          { lat: position[0] + 0.005, lng: position[1] + 0.003, risk: 'red', label: 'High Risk Area' },
          { lat: position[0] - 0.004, lng: position[1] - 0.002, risk: 'yellow', label: 'Caution Area' }
        ];
        setCrimeZones(fallback);
        renderZones(fallback);
      }
    };
    fetchZones();
  }, [position]);

  const renderZones = (zones) => {
    if (!mapRef.current) return;
    zoneLayersRef.current.forEach(l => mapRef.current.removeLayer(l));
    zoneLayersRef.current = [];

    if (!showZones) return;

    zones.forEach(z => {
      const color = z.risk === 'red' ? '#ff4d4d' : z.risk === 'yellow' ? '#fbbc04' : '#00e5a0';
      const circle = L.circle([z.lat, z.lng], {
        radius: z.risk === 'red' ? 150 : 100,
        color: color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 1
      }).addTo(mapRef.current);
      zoneLayersRef.current.push(circle);
    });
  };

  useEffect(() => {
    renderZones(crimeZones);
  }, [showZones]);

  // ── Actions ──
  const toggleStyle = () => {
    const keys = Object.keys(TILES);
    const nextIdx = (keys.indexOf(mapStyle) + 1) % keys.length;
    setMapStyle(keys[nextIdx]);
  };

  const handleSOS = () => {
    // 1. Get saved emergency contacts
    const contacts = JSON.parse(localStorage.getItem("trinetra_emergency_contacts") || "[]");
    
    // 2. Prepare Message
    const lat = position ? position[0].toFixed(6) : "Unknown";
    const lng = position ? position[1].toFixed(6) : "Unknown";
    const googleMapsUrl = position ? `https://www.google.com/maps?q=${lat},${lng}` : "Location not available";
    
    const message = encodeURIComponent(
      `🚨 *TRINETRA EMERGENCY ALERT* 🚨\n\n` +
      `I need immediate help! My live location is shared below.\n\n` +
      `📍 Location: ${googleMapsUrl}\n` +
      `🕒 Time: ${new Date().toLocaleTimeString()}\n\n` +
      `_Sent via Trinetra Safety App_`
    );

    // 3. Trigger Siren/Internal SOS
    if (triggerSOS) triggerSOS();

    // 4. Send WhatsApp Messages
    if (contacts.length > 0) {
      contacts.forEach((contact, index) => {
        // We add a small delay between opening links to avoid browser blocks
        setTimeout(() => {
          const whatsappUrl = `https://wa.me/${contact.whatsapp.replace('+', '')}?text=${message}`;
          window.open(whatsappUrl, '_blank');
        }, index * 1000);
      });
    } else {
      alert("🚨 SOS Triggered! No emergency WhatsApp contacts found. Please add them in Profile.");
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  const selectResult = (res) => {
    const latlng = [parseFloat(res.lat), parseFloat(res.lon)];
    if (mapRef.current) {
      mapRef.current.flyTo(latlng, 16);
      L.popup().setLatLng(latlng).setContent(res.display_name).openOn(mapRef.current);
    }
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="mobile-dashboard-root">
      {/* Custom styles for the user dot */}
      <style>{`
        .mob-user-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-dot {
          width: 14px;
          height: 14px;
          background: #4285F4;
          border: 2px solid white;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 0 10px rgba(66,133,244,0.5);
        }
        .user-pulse {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(66, 133, 244, 0.3);
          border-radius: 50%;
          animation: mobPulse 2s infinite;
          z-index: 1;
        }
        @keyframes mobPulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* ── TopBar ── */}
      <header className="mobile-topbar" style={{ height: isSearching ? '70px' : '60px' }}>
        {!isSearching ? (
          <>
            <button className="mob-top-btn" onClick={() => setSidebarOpen(true)}><FaBars size={20} /></button>
            <Logo height={20} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="mob-top-btn" onClick={() => setIsSearching(true)}><FaSearch size={18} /></button>
              <button className="mob-top-btn" onClick={toggleStyle}><FaLayerGroup size={18} /></button>
              <ThemeToggle />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '14px' }} />
              <input 
                autoFocus
                type="text"
                placeholder="Search destination..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: '100%', height: '42px', background: 'var(--bg2)', border: '1px solid var(--accent)', borderRadius: '21px', padding: '0 15px 0 35px', color: '#fff', fontSize: '14px', outline: 'none', boxShadow: '0 0 15px rgba(66, 133, 244, 0.2)' }}
              />
            </div>
            <button onClick={() => { setIsSearching(false); setSearchQuery(""); setSearchResults([]); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: '13px' }}>Cancel</button>
          </div>
        )}
      </header>

      {/* ── Search Results Overlay ── */}
      {isSearching && searchResults.length > 0 && (
        <div style={{ position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, background: 'rgba(6,8,13,0.95)', zIndex: 12000, padding: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {searchResults.map((res, i) => (
              <div key={i} onClick={() => selectResult(res)} style={{ padding: '14px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', borderRadius: i === 0 ? '16px 16px 0 0' : i === searchResults.length - 1 ? '0 0 16px 16px' : '0' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{res.display_name.split(',')[0]}</div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.display_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Safety Banner ── */}
      <div className="mobile-safety-banner" style={{ background: score >= 80 ? 'rgba(0, 229, 160, 0.1)' : 'rgba(255, 77, 77, 0.1)' }}>
        <div className="banner-dot" style={{ background: score >= 80 ? '#00e5a0' : '#ff4d4d', boxShadow: score >= 80 ? '0 0 10px #00e5a0' : '0 0 10px #ff4d4d' }}></div>
        <span className="banner-txt" style={{ color: score >= 80 ? '#00e5a0' : '#ff4d4d' }}>
          {score >= 80 ? 'SAFE ZONE' : 'CAUTION AREA'} · {areaName}
        </span>
      </div>

      {/* ── Map ── */}
      <main className="mobile-map-view">
        <div 
          ref={containerRef} 
          className="mob-map-inner" 
          style={{ 
            transform: map3D ? 'perspective(1000px) rotateX(25deg) translateY(-20px) scale(1.1)' : 'none',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'bottom'
          }}
        />
        
        {/* Floating Controls */}
        <div className="mob-map-ctrls">
          <button className="mob-ctrl-btn locate" onClick={() => position && mapRef.current.flyTo(position, 17)}><FaLocationArrow /></button>
          <button className={`mob-ctrl-btn ${showZones ? 'active' : ''}`} onClick={() => setShowZones(!showZones)}><FaShieldAlt /></button>
          <button className={`mob-ctrl-btn ${map3D ? 'active' : ''}`} onClick={() => setMap3D(!map3D)}><FaCube /></button>
        </div>

        {/* Safety Score Badge */}
        <div className="mob-score-badge">
          <div className="mob-score-ring">
            <svg width="36" height="36" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={score >= 80 ? "#00e5a0" : "#ff4d4d"} strokeWidth="10" 
                strokeDasharray="251.2" strokeDashoffset={251.2 - (score / 100) * 251.2} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <span className="mob-score-val">{score}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text3)' }}>SAFETY</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: score >= 80 ? '#00e5a0' : '#ff4d4d' }}>EXCELLENT</span>
          </div>
        </div>

        {/* FABs - AI + SOS in same line */}
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          zIndex: 15001,
          pointerEvents: 'none',
        }}>
          <TrinetraAgent embedded={true} />
          <button 
            className="mob-fab mob-fab-sos" 
            onClick={handleSOS}
            style={{ 
              width: '56px', 
              height: '56px',
              flexShrink: 0,
              pointerEvents: 'auto',
              position: 'relative',
              fontSize: '22px'
            }}
          >🚨</button>
        </div>
      </main>

      {/* ── Pull-up Drawer ── */}
      <div className={`mob-drawer ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(!drawerOpen)}>
        <div className="mob-drawer-handle" />
        <div className="mob-drawer-header">
          <span className="mob-drawer-title">Explore Nearby</span>
          <FaPlus style={{ color: 'var(--accent)' }} />
        </div>
        <div className="mob-drawer-content">
          <div onClick={() => navigate('/citizen-report')} className="mob-place-card" style={{ background: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.2)' }}>
            <div className="mob-place-icon" style={{ background: '#ff9800' }}>📋</div>
            <div className="mob-place-info">
              <div className="mob-place-name" style={{ color: '#ff9800' }}>Report Incident</div>
              <div className="mob-place-addr">File a specialized report for Cyber, Taxi, etc.</div>
            </div>
            <FaPlus size={20} color="#ff9800" />
          </div>
          <div className="mob-place-card">
            <div className="mob-place-icon"><FaHome /></div>
            <div className="mob-place-info">
              <div className="mob-place-name">Home</div>
              <div className="mob-place-addr">Arera Colony, Bhopal</div>
            </div>
            <FaDirections size={20} color="var(--accent)" />
          </div>
          <div className="mob-place-card">
            <div className="mob-place-icon"><FaBriefcase /></div>
            <div className="mob-place-info">
              <div className="mob-place-name">Office</div>
              <div className="mob-place-addr">MP Nagar Zone 1, Bhopal</div>
            </div>
            <FaDirections size={20} color="var(--accent)" />
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user} 
        onLogout={onLogout}
      />
    </div>
  );
}
