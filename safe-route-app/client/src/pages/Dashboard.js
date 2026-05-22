import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { FaBars, FaTimes, FaBell, FaShieldAlt, FaLocationArrow, FaLayerGroup, FaCube } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";
import MobileDashboard from "./MobileDashboard";
import TrinetraAgent from "../components/TrinetraAgent";

// ── Tile Layers ─────────────────────────────────────────────
// Esri World Street = most detailed for India roads & colonies
const TILES = {
  streets: {
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attr: '&copy; Google Maps',
    label: "Streets",
    bg: "#f0f0f0",
  },
  satellite: {
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attr: '&copy; Google Maps',
    label: "Satellite",
    bg: "#101010",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; OSM &copy; CARTO',
    label: "Dark",
    bg: "#0a0c10",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; OSM &copy; CARTO',
    label: "Light",
    bg: "#f5f5f5",
  },
};
const TILE_KEYS = ["streets", "satellite", "dark", "light"];

// ── Routing (works for all India) ──────────────────────────
const ROUTING_URL = (start, end) =>
  `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

// ── Leaflet Icons ───────────────────────────────────────────
// ── Leaflet Icons ───────────────────────────────────────────
const userIcon = (heading) => L.divIcon({
    className: "user-marker",
    html: `
      <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
        <!-- Sonar Pulse -->
        <div style="position:absolute; width:44px; height:44px; background:rgba(66,133,244,0.2); border-radius:50%; animation:pulse-gps 2s infinite;"></div>
        
        <!-- Tactical Arrow -->
        <div style="position:relative; width:38px; height:38px; background:#4285F4; border:3px solid #fff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 25px rgba(0,0,0,0.5); transform: rotate(${heading || 0}deg); transition: transform 0.3s ease;">
           <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff">
             <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
           </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

const mkIcon = (html, w, h) => L.divIcon({ html, iconSize: [w, h], iconAnchor: [w / 2, h / 2], className: "", interactive: false });

const alertIcon = () => mkIcon(
  `<div style="width:14px;height:14px;background:#ea4335;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(234,67,53,0.4)"></div>`, 14, 14
);
const destIcon = () => mkIcon(
  `<div style="width:28px;height:28px;background:#34a853;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 8px rgba(52,168,83,0.5)">📍</div>`, 28, 28
);
const hazardIcon = (risk) => mkIcon(
  `<div style="width:32px;height:32px;background:${risk === 'red' ? 'rgba(234,67,53,0.9)' : 'rgba(245,166,35,0.9)'};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 15px rgba(234,67,53,0.6);animation:pulse-sos 1s infinite">⚠️</div>`, 32, 32
);

const TURNS = {
  "turn-left":"↰","turn-right":"↱","turn-sharp-left":"↙","turn-sharp-right":"↘",
  "turn-slight-left":"↖","turn-slight-right":"↗",
  "continue":"⬆","new-name":"➡",
  "depart":"🚗","arrive":"🏁","merge":"⤵","fork":"⑂",
  "roundabout":"🔄","rotary":"🔄","ramp":"🛤️",
};
const turnEmoji = (type, mod) => {
  const k = mod ? `turn-${mod}` : type;
  return TURNS[k] || TURNS[type] || "⬆";
};

const turnMarkerIcon = (emoji, isNext) => mkIcon(
  `<div style="width:32px;height:32px;background:${isNext ? 'rgba(52,168,83,0.92)' : 'rgba(66,133,244,0.88)'};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 10px rgba(0,0,0,0.45)">${emoji}</div>`, 32, 32
);
const arrowSvg = (bearing) => `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2 L15 15 L9 12 L3 15 Z" fill="rgba(66,133,244,0.8)" stroke="#fff" stroke-width="1" stroke-linejoin="round" transform="rotate(${bearing},9,9)"/></svg>`;
const arrowIcon = (bearing) => mkIcon(arrowSvg(bearing), 18, 18);

// ── Score Ring ─────────────────────────────────────────────
function ScoreRing({ score, dark }) {
  const r = 44, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#34a853" : score >= 50 ? "#fbbc04" : "#ea4335";
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110">
        <circle cx="55" cy="55" r={r} fill="none"
          stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s" }} />
        <text x="55" y="50" textAnchor="middle"
          fill={dark ? "#fff" : "#111"} fontSize="22" fontWeight="700"
          fontFamily="'Space Grotesk',sans-serif">{score}</text>
        <text x="55" y="66" textAnchor="middle"
          fill={dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
          fontSize="10" fontFamily="sans-serif">SAFETY</text>
      </svg>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === "danger" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── Place Manager Modal ──────────────────────────────────
function PlaceManagerModal({ isOpen, onClose, onSave, savedPlaces }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isOpen) { setQuery(""); setResults([]); setSelected(null); }
  }, [isOpen]);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      // Use current position to bias results
      const lat = 22.7196; // Default to Indore
      const lng = 75.8577;
      const viewbox = `${lng-1},${lat+1},${lng+1},${lat-1}`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in&viewbox=${viewbox}&bounded=0`);
      const data = await res.json();
      setResults(data);
    } catch (err) {}
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="nr-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
      <div className="glass-card fade-up" style={{ width: '90%', maxWidth: '450px', padding: '24px', background: 'var(--bg1)', border: '1px solid var(--accent)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--accent)', margin: 0 }}>📍 Setup Your Places</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
        </div>

        {/* Current Saved Info */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {['Home', 'Office'].map(label => {
            const p = Array.isArray(savedPlaces) ? savedPlaces.find(x => x.label === label) : null;
            return (
              <div key={label} style={{ flex: 1, padding: '10px', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: p ? 'var(--accent)' : 'var(--text3)' }}>
                  {p ? "✅ Set" : "❌ Not Set"}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input 
            value={query} onChange={e => handleSearch(e.target.value)}
            placeholder="Search for an address..."
            style={{ width: '100%', padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
          />
          {loading && <div style={{ position: 'absolute', right: 15, top: 15, fontSize: 10, color: 'var(--accent)' }}>Searching...</div>}
        </div>

        {results.length > 0 && !selected && (
          <div style={{ background: 'var(--bg2)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)' }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => setSelected(r)}
                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: i < results.length-1 ? '1px solid var(--border)' : 'none', fontSize: '12px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {r.display_name}
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fade-up" style={{ background: 'rgba(66, 133, 244, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(66, 133, 244, 0.3)', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>SELECTED LOCATION</div>
            <div style={{ fontSize: '12px', marginBottom: '12px', color: 'var(--text)' }}>{selected.display_name}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { onSave({ label: 'Home', address: selected.display_name, lat: selected.lat, lon: selected.lon }); setSelected(null); setQuery(""); }}
                style={{ flex: 1, padding: '10px', background: 'var(--accent)', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                Assign to Home 🏠
              </button>
              <button onClick={() => { onSave({ label: 'Office', address: selected.display_name, lat: selected.lat, lon: selected.lon }); setSelected(null); setQuery(""); }}
                style={{ flex: 1, padding: '10px', background: '#00e5a0', color: 'black', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                Assign to Office 🏢
              </button>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '8px', background: 'none', border: 'none', color: 'var(--text3)', fontSize: '10px', cursor: 'pointer' }}>Cancel Selection</button>
          </div>
        )}
        
        <div style={{ textAlign: 'center', fontSize: '11px', opacity: 0.5 }}>
          Search for your address and assign it to Home or Office.
        </div>
      </div>
    </div>
  );
}

// ── Mini Chart ─────────────────────────────────────────────
function SafetyChart({ data }) {
  const max = Math.max(...data), min = Math.min(...data);
  const norm = data.map(v => ((v - min) / (max - min || 1)) * 38);
  const pts = norm.map((v, i) => `${i * (100 / (data.length - 1))},${45 - v}`).join(" ");
  return (
    <svg viewBox="0 0 100 50" style={{ width: "100%", height: 50 }}>
      <polyline points={pts} fill="none" stroke="#34a853" strokeWidth="2" strokeLinejoin="round" />
      {norm.map((v, i) => (
        <circle key={i} cx={i * (100 / (data.length - 1))} cy={45 - v} r="2.5" fill="#34a853" />
      ))}
    </svg>
  );
}

// ── Location Prompt Modal ────────────────────────────────
function LocationPromptModal({ isOpen, onEnable, onSkip, onManual, gpsError, isLoading }) {
  if (!isOpen) return null;
  const isDenied = gpsError?.toLowerCase().includes("denied") || gpsError?.toLowerCase().includes("permission");
  const isUnavailable = gpsError?.toLowerCase().includes("unavailable") || gpsError?.toLowerCase().includes("timeout");

  return (
    <div className="nr-overlay" style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card fade-up" style={{ width: '90%', maxWidth: '400px', padding: '32px', textAlign: 'center', background: 'var(--bg1)', border: `2px solid ${isDenied || isUnavailable ? '#ea4335' : 'var(--accent)'}`, borderRadius: '28px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px', animation: (isDenied || isUnavailable || isLoading) ? 'none' : 'pulse-gps 2s infinite' }}>
          {isDenied ? '❌' : isUnavailable ? '📡' : isLoading ? '🛰️' : '📍'}
        </div>
        <h2 style={{ color: 'var(--text)', marginBottom: '12px', fontSize: '22px', fontWeight: 800 }}>
          {isDenied ? 'Location Blocked' : isUnavailable ? 'System GPS Off' : isLoading ? 'Connecting...' : 'Enable Location'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          {isLoading 
            ? "Establishing secure connection to satellite GPS. If it's taking too long, you can pick your location manually."
            : isDenied 
              ? "Location access is blocked in your browser. Please click the 'Lock' 🔒 icon in the address bar and set Location to 'Allow'."
              : isUnavailable
                ? "It seems your system's GPS is turned off. Please enable 'Location' in your settings or pick manually."
                : "TRINETRA needs your real-time location to provide safety alerts, safe routing, and emergency SOS services."}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isDenied && !isUnavailable && (
            <button onClick={onEnable} disabled={isLoading} style={{ 
              width: '100%', padding: '16px', background: isLoading ? '#666' : 'var(--accent)', 
              color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', 
              fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', 
              boxShadow: isLoading ? 'none' : '0 8px 20px rgba(66,133,244,0.4)' 
            }}>
              {isLoading ? 'Wait a moment...' : 'Allow Location Access'}
            </button>
          )}
          
          {(isLoading || isUnavailable || isDenied) && (
            <button onClick={onManual} style={{ width: '100%', padding: '14px', background: 'rgba(52,168,83,0.15)', border: '1px solid #34a853', color: '#34a853', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              📍 Pick Manually from Map
            </button>
          )}

          {!isLoading && (
            <button onClick={onSkip} style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--text3)', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              I'll do it later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Place Details Panel (Google Maps Style) ──────────────────
function PlaceDetailsPanel({ place, isOpen, onClose, onGetRoute, onSave }) {
  if (!place || !isOpen) return null;
  
  const cleanName = (str) => {
    if (!str) return "";
    // Manual corrections for common geocoding typos
    return str.replace(/Umriya/g, "Umariya");
  };

  const shortName = cleanName(place.name || place.display_name?.split(",")[0]);
  const address = cleanName(place.display_name);
  const lat = place.lat;
  const lng = place.lon || place.lng;

  // Use a public satellite map preview for the "exact image"
  const satImage = `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&size=300,300&z=16&l=sat`;

  return (
    <div className={`place-details-sheet ${isOpen ? "open" : ""}`}>
      <div className="sheet-handle" onClick={onClose} />
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <img src={satImage} 
          style={{ width: 100, height: 100, borderRadius: 16, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} alt={shortName} 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=200&q=80'; }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, margin: '0 0 4px 0', color: 'var(--text)' }}>{shortName}</h2>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>Indore, Madhya Pradesh</div>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, lineHeight: 1.4 }}>{address}</p>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'var(--text)' }}>×</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px' }}>
        {[
          { label: 'Directions', icon: '🗺️', color: '#4285F4', onClick: () => onGetRoute(place.lat, place.lon || place.lng, shortName) },
          { label: 'Set Start', icon: '📍', color: '#ea4335', onClick: () => { 
              onClose(); 
              window.dispatchEvent(new CustomEvent('nr:setStart', { detail: { lat: place.lat, lng: place.lon || place.lng } })); 
            } 
          },
          { label: 'Call', icon: '📞', color: '#34a853', onClick: () => window.open('tel:+917311234567') },
          { label: 'Save', icon: '🔖', color: '#fbbc04', onClick: () => onSave({ label: 'Saved', address, lat: place.lat, lon: place.lon }) },
        ].map(a => (
          <div key={a.label} onClick={a.onClick} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1px solid var(--border)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 6, background: 'var(--bg2)' }}>{a.icon}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>{a.label}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>Reviews & Ratings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>4.8</div>
          <div>
            <div style={{ color: '#fbbc04', fontSize: 14 }}>⭐⭐⭐⭐⭐</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>1,248 reviews</div>
          </div>
        </div>
        {[
          { user: "Ansh Agarwal", review: "Amazing place! Very easy to navigate using TRINETRA.", rating: "⭐⭐⭐⭐⭐" },
          { user: "Deepak S.", review: "The safety score here is very high. Recommended.", rating: "⭐⭐⭐⭐" }
        ].map((r, i) => (
          <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{r.user}</div>
            <div style={{ fontSize: 10, color: '#fbbc04', marginBottom: 4 }}>{r.rating}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{r.review}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const maplibreRef = useRef(null);
  const map3dContainerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pulseMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const arrowMRef = useRef([]);
  const turnMRef = useRef([]);
  const routeZoneMarkersRef = useRef([]);
  const tileLayerRef = useRef(null);
  const searchTimerRef = useRef(null);
  const toastIdRef = useRef(0);
  const watchIdRef = useRef(null);
  const zoneLayersRef = useRef([]);
  const marker3DRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const lastFetchedPosRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dark = theme === 'dark';

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userName = loggedInUser.name || "Aarav Singh";
  const userInitials = (loggedInUser.name || "A").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    console.log("Logout initiated");
    auth.signOut().then(() => {
      localStorage.clear(); 
      window.location.href = "/login";
    }).catch(() => {
      localStorage.clear();
      window.location.href = "/login";
    });
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkRes = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkRes);
    return () => window.removeEventListener('resize', checkRes);
  }, []);


  const [position, setPosition] = useState(null); // [lat, lng]
  const [mapStyle, setMapStyle] = useState("streets");
  const [mapReady, setMapReady] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [score, setScore] = useState(87);
  const [time, setTime] = useState(new Date());
  const [routeLoading, setRouteLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [scoreHistory] = useState([72, 80, 65, 87, 90, 78, 87]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [inDangerZone, setInDangerZone] = useState(false);
  const [wakeLock, setWakeLock] = useState(null);
  const [backgroundActive, setBackgroundActive] = useState(JSON.parse(localStorage.getItem("trinetra_background") || "false"));

  // ── Background Mode Listener ──
  useEffect(() => {
    const checkSettings = () => {
      const isEnabled = JSON.parse(localStorage.getItem("trinetra_background") || "false");
      setBackgroundActive(isEnabled);
    };
    window.addEventListener('trinetra_settings_changed', checkSettings);
    return () => window.removeEventListener('trinetra_settings_changed', checkSettings);
  }, []);

  // ── Wake Lock Implementation ──
  useEffect(() => {
    if (!backgroundActive) {
      if (wakeLock) { wakeLock.release().then(() => setWakeLock(null)); }
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const wl = await navigator.wakeLock.request('screen');
          setWakeLock(wl);
          console.log("🔓 TRINETRA: Background Wake Lock Active");
        }
      } catch (err) {
        console.warn("Wake Lock failed:", err);
      }
    };

    requestWakeLock();
    
    // Re-request on visibility change (browsers release lock when tab hidden)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && backgroundActive) requestWakeLock();
      else if (document.visibilityState === 'hidden' && backgroundActive) {
        // Show "Guarding in background" notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🛡️ TRINETRA Active", { 
            body: "Your safety agent is guarding you in the background.",
            icon: "/logo192.png",
            tag: "bg-guard"
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLock) wakeLock.release();
    };
  }, [backgroundActive]);
  // ── Fully Dynamic Demo Zones (Always around User) ────────
  const getDemoZones = (lat, lng) => [
    // Red Zones - High Risk (Within ~300m)
    { lat: lat + 0.0015, lng: lng + 0.0020, risk: 'red',    label: 'High Risk Alert', crimeType: 'Recent Incident Spot', source: 'TRINETRA AI', count: 12 },
    { lat: lat - 0.0020, lng: lng - 0.0015, risk: 'red',    label: 'Danger Zone',     crimeType: 'Poor Connectivity',    source: 'AI SCAN',    count: 8 },
    
    // Yellow Zones - Caution (Within ~400m)
    { lat: lat + 0.0025, lng: lng - 0.0020, risk: 'yellow', label: 'Caution Area',    crimeType: 'Crowded/Unsafe',        source: 'CITIZEN',    count: 5 },
    { lat: lat - 0.0010, lng: lng + 0.0030, risk: 'yellow', label: 'Sensitive Zone',  crimeType: 'Low Lighting',         source: 'TRINETRA',   count: 3 },
    
    // Green Zones - Safe (Within ~200m)
    { lat: lat + 0.0008, lng: lng - 0.0010, risk: 'green',  label: 'Safe Haven',      crimeType: 'Police Patrol Active', source: 'POLICE',     count: 0 },
    { lat: lat - 0.0012, lng: lng + 0.0005, risk: 'green',  label: 'Secure Plaza',    crimeType: 'CCTV Monitored',       source: 'POLICE',     count: 0 },
  ];

  const [crimeZones, setCrimeZones] = useState([]);
  const [dbCrimeZones, setDbCrimeZones] = useState([]);
  const [sosDynamicZones, setSosDynamicZones] = useState([]);
  const [serverIp] = useState(localStorage.getItem("trinetra_server_ip") || "localhost");
  const [showZones, setShowZones] = useState(true);
  const [routeDangerWarning, setRouteDangerWarning] = useState(null);
  const [showFullNav, setShowFullNav] = useState(false);
  const [navInstructions, setNavInstructions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [zoneCreatorOpen, setZoneCreatorOpen] = useState(false);
  const [zoneType, setZoneType] = useState("danger");
  const [zoneRadius, setZoneRadius] = useState(200);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [tripProgress, setTripProgress] = useState(null); // { totalDist, coveredDist, remainingDist, destLat, destLng, startPos }
  const [areaName, setAreaName] = useState("Detecting location...");
  const [fullAddress, setFullAddress] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch Permanent Crime Zones
    const unsubZones = onSnapshot(collection(db, "crimeZones"), (snapshot) => {
      const zones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbCrimeZones(zones);
    });

    // 2. Fetch Safe Stations
    const unsubStations = onSnapshot(collection(db, "stations"), (snapshot) => {
      const stations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNearbyStations(stations);
    });

    // 3. Fetch User Saved Places (Only if ID exists)
    let unsubPlaces = () => {};
    if (loggedInUser?.id) {
      unsubPlaces = onSnapshot(collection(db, "users", loggedInUser.id, "savedPlaces"), (snapshot) => {
        const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedPlaces(places);
      });
    }

    // 4. Dynamic SOS-Based Threat Mapping
    const unsubSOS = onSnapshot(collection(db, "sosAlerts"), (snapshot) => {
      const alerts = snapshot.docs.map(doc => doc.data());
      const clusters = {};
      alerts.forEach(a => {
        if (!a.lat || !a.lng) return;
        const key = `${a.lat.toFixed(3)}|${a.lng.toFixed(3)}`;
        if (!clusters[key]) clusters[key] = { lat: a.lat, lng: a.lng, count: 0 };
        clusters[key].count += 1;
      });

      const dynamicZones = Object.values(clusters).map(c => {
        if (c.count >= 20) return { ...c, risk: 'red', label: 'SOS Hotspot (High)', crimeType: 'Multiple SOS Alerts', source: 'TRINETRA AI' };
        if (c.count >= 10) return { ...c, risk: 'yellow', label: 'SOS Frequent Area', crimeType: 'Recent Activity', source: 'TRINETRA AI' };
        return null;
      }).filter(Boolean);

      setSosDynamicZones(dynamicZones);
    });

    return () => { unsubZones(); unsubStations(); unsubPlaces(); unsubSOS(); };
  }, [loggedInUser?.id]);

  // Combine all zones (DB + Demo + Dynamic SOS)
  useEffect(() => {
    const lat = position?.[0] || 22.7196;
    const lng = position?.[1] || 75.8577;
    const demoZones = getDemoZones(lat, lng);
    setCrimeZones([...demoZones, ...dbCrimeZones, ...sosDynamicZones]);
  }, [dbCrimeZones, sosDynamicZones, position]);
  const [gpsError, setGpsError] = useState(null);
  const [voiceNavActive, setVoiceNavActive] = useState(false);
  const [currentNavStep, setCurrentNavStep] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [sirenPassword, setSirenPassword] = useState(localStorage.getItem("trinetra_siren_password") || "1234");
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopPasswordInput, setStopPasswordInput] = useState("");
  const [sirenOscillator, setSirenOscillator] = useState(null);
  const [sirenGain, setSirenGain] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [showPassSetup, setShowPassSetup] = useState(false);
  const [resetFlow, setResetFlow] = useState({ active: false, step: 0, otp: "", inputOtp: "", newPass: "" });
  const [spokenSteps, setSpokenSteps] = useState(new Set());
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [aiPetName, setAiPetName] = useState(localStorage.getItem("trinetra_pet_name") || "");
  const aiPetNameRef = useRef(localStorage.getItem("trinetra_pet_name") || "");
  const [nearbyStations, setNearbyStations] = useState([]);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [showLocPrompt, setShowLocPrompt] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tileCacheCount, setTileCacheCount] = useState(0);
  const [offlineBannerVisible, setOfflineBannerVisible] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [map3D, setMap3D] = useState(false);
  const dgSocketRef = useRef(null);
  const sosActiveRef = useRef(false);
  const sirenIntervalRef = useRef(null);

  // ── Siren Password Initial Setup ──
  useEffect(() => {
    const saved = localStorage.getItem("trinetra_siren_password");
    if (!saved && loggedInUser.id) {
      setTimeout(() => setShowPassSetup(true), 3000);
    }
  }, []);
  
  // ── Global AI Command Bridge (for Floating Agent) ──
  useEffect(() => {
    const handleGlobalSOS = () => { triggerSOS(); };
    const handleGlobalCommand = (e) => {
      const { action, value } = e.detail;
      console.log("🤖 Trinetra AI Command Received:", action, value);
      
      switch(action) {
        case 'toggle3D': setMap3D(value); break;
        case 'cycleStyle': cycleMapStyle(); break;
        case 'recenter': if (position && mapRef.current) mapRef.current.flyTo(position, 18); break;
        case 'toggleTheme': toggleTheme(); break;
        default: console.warn("Unknown AI command:", action);
      }
    };

    window.addEventListener('trinetra:sos', handleGlobalSOS);
    window.addEventListener('trinetra:command', handleGlobalCommand);
    return () => {
      window.removeEventListener('trinetra:sos', handleGlobalSOS);
      window.removeEventListener('trinetra:command', handleGlobalCommand);
    };
  }, [position]);

  // ── Service Worker Registration (Offline Map) ───────────
  useEffect(() => {
    // Register SW for tile caching
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(reg => {
          console.log("[TRINETRA] SW registered:", reg.scope);
          // Ask SW for cached tile count
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage("GET_CACHE_SIZE");
          }
        })
        .catch(err => console.warn("SW registration failed:", err));

      navigator.serviceWorker.addEventListener("message", (e) => {
        if (e.data?.type === "CACHE_SIZE") setTileCacheCount(e.data.count);
        if (e.data?.type === "TILE_CACHE_CLEARED") setTileCacheCount(0);
      });
    }

    // Online/Offline detection
    const goOnline  = () => { setIsOnline(true);  setOfflineBannerVisible(false); };
    const goOffline = () => { setIsOnline(false); setOfflineBannerVisible(true);  };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ── Manual Start Location (nr:setStart) ────────────────
  useEffect(() => {
    const handleSetStart = (e) => {
      const { lat, lng } = e.detail;
      setPosition([lat, lng]);
      localStorage.setItem("trinetra_last_pos", JSON.stringify([lat, lng]));
      setLocLoading(false);
      setGpsError(null);
      addToast("📍 Starting location set manually!", "success");
      
      if (mapRef.current) {
        if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon(), zIndexOffset: 1000 }).addTo(mapRef.current);
        mapRef.current.flyTo([lat, lng], 16, { duration: 1 });
      }
    };
    window.addEventListener('nr:setStart', handleSetStart);
    return () => window.removeEventListener('nr:setStart', handleSetStart);
  }, []);

  // ── Real-time Location Watcher (Google Maps Style) ──────
  const startTracking = () => {
    if (!navigator.geolocation) {
      addToast("Geolocation not supported.", "danger");
      return;
    }
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

    setLocLoading(true);
    
    // Try to load last known position from localStorage for instant start
    const cached = localStorage.getItem("trinetra_last_pos");
    if (cached) {
      const [cLat, cLng] = JSON.parse(cached);
      setPosition([cLat, cLng]);
      setShowLocPrompt(false);
    }

    // Step 1: Force the browser prompt
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        localStorage.setItem('trinetra_last_pos', JSON.stringify(newPos));
        setShowLocPrompt(false);
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 16);
          if (!userMarkerRef.current) {
            userMarkerRef.current = L.marker(newPos, { icon: userIcon(), zIndexOffset: 1000 }).addTo(mapRef.current);
          } else {
            userMarkerRef.current.setLatLng(newPos);
          }
        }
        
        // Step 2: Start real-time watch
        watchIdRef.current = navigator.geolocation.watchPosition(
          (wPos) => {
            const { latitude: wLat, longitude: wLng, heading } = wPos.coords;
            setPosition([wLat, wLng]);
            localStorage.setItem("trinetra_last_pos", JSON.stringify([wLat, wLng]));
            setLocLoading(false);
            setGpsError(null);
            setShowLocPrompt(false); 
            if (mapRef.current && isFinite(wLat) && isFinite(wLng)) {
              if (!userMarkerRef.current) {
                userMarkerRef.current = L.marker([wLat, wLng], { 
                  icon: userIcon(heading), 
                  zIndexOffset: 1000 
                }).addTo(mapRef.current);
              } else {
                userMarkerRef.current.setLatLng([wLat, wLng]);
                if (heading !== undefined) userMarkerRef.current.setIcon(userIcon(heading));
              }
            }
          },
          (err) => {
            console.error("Watch error:", err);
            // Don't show prompt on watch error if we already have a position
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
        );
      },
      (err) => {
        setLocLoading(false);
        setGpsError(err.message);
        // Only show prompt if we don't even have a cached position
        if (!localStorage.getItem("trinetra_last_pos")) {
          setShowLocPrompt(true);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    startTracking();
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);


  // ── Toast helper ────────────────────────────────────────
  const addToast = (msg, type = "info", duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  };

  // ── Reverse Geocode ─────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    if (!navigator.onLine) {
      setAreaName(`${lat.toFixed(4)}, ${lng.toFixed(4)} (Satellite GPS)`);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const data = await res.json();
      if (data.address) {
        const a = data.address;
        setFullAddress(data.display_name);
        
        const parts = [
          a.road || "",
          a.suburb || a.residential || a.neighbourhood || "",
          a.city || a.town || ""
        ].filter(Boolean);
        
        // Prioritize Road + Suburb/Colony for a clear local name
        let name = parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : (parts[0] || data.display_name?.split(",")[0] || "Your Location");
        
        // Manual Correction
        name = name.replace(/Umriya/g, "Umariya");
        
        setAreaName(name);
        return name;
      }
    } catch {
      setAreaName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
    return "Your Location";
  };

  useEffect(() => {
    const handleResize = () => { if (mapRef.current) mapRef.current.invalidateSize(); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mapRef.current) setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 500);
  }, [sidebarOpen, map3D]);

  // ── 3D MapLibre GL Map ──────────────────────────────────
  useEffect(() => {
    const initMap3D = () => {
      console.log("🚀 Initializing 3D Map...");
      const mlgl = window.maplibregl;
      if (!mlgl || !map3dContainerRef.current) return;

      if (maplibreRef.current) {
        try { maplibreRef.current.remove(); } catch(e) {}
        maplibreRef.current = null;
        marker3DRef.current = null; // CRITICAL: Reset marker ref when map is destroyed
      }

      try {
        const ml = new mlgl.Map({
          container: map3dContainerRef.current,
          style: mapStyle === 'satellite' ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          center: [position[1], position[0]],
          zoom: 16, pitch: 55, bearing: -20, antialias: true
        });

        ml.on('load', () => {
          try {
            ml.addSource('buildings-src', { type: 'vector', tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'], maxzoom: 14 });
            ml.addLayer({
              id: 'buildings-3d', type: 'fill-extrusion', source: 'buildings-src', 'source-layer': 'building', minzoom: 14,
              paint: {
                'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'render_height'], 0, '#ffffff', 50, '#e0e0e0', 100, '#c0c0c0'],
                'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 20],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                'fill-extrusion-opacity': 0.8, 'fill-extrusion-vertical-gradient': true,
              }
            });
          } catch(e) {}
          if (crimeZones.length > 0) syncZonesTo3D(ml);
          ml.resize();
          
          // Force a marker sync once the new map is loaded
          setTimeout(() => {
            if (maplibreRef.current && position) sync3DUserMarker(position);
          }, 500);
        });
        maplibreRef.current = ml;
      } catch (err) { console.error("💥 MapLibre Error:", err); }
    };

    if (map3D) {
      if (window.maplibregl) initMap3D();
      else {
        if (!document.getElementById('maplibre-js')) {
          const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'; document.head.appendChild(link);
          const script = document.createElement('script'); script.id = 'maplibre-js'; script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'; script.onload = initMap3D; document.head.appendChild(script);
        } else {
          const poll = setInterval(() => { if (window.maplibregl) { clearInterval(poll); initMap3D(); } }, 500);
          setTimeout(() => clearInterval(poll), 10000);
        }
      }
    } else {
      if (maplibreRef.current) { 
        maplibreRef.current.remove(); 
        maplibreRef.current = null; 
        marker3DRef.current = null; // CRITICAL: Reset marker ref
      }
      setTimeout(() => { if (mapRef.current) mapRef.current.invalidateSize(); }, 300);
    }
    return () => {};
  }, [map3D]);

  // ── Init Map ────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [23.2599, 77.4126],
      zoom: 14,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      updateWhenIdle: true,
    });

    const t = TILES[mapStyle];
    tileLayerRef.current = L.tileLayer(t.url, { attribution: t.attr, maxZoom: 18, noClip: true }).addTo(mapRef.current);
    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

        // Click on map → update position
        mapRef.current.on("click", async (e) => {
            const { lat, lng } = e.latlng;
          // Normal map click → show Place Details Panel
          try {
            // Place a temporary pin (like Google Maps "Dropped Pin")
            try { if (destMarkerRef.current) mapRef.current.removeLayer(destMarkerRef.current); } catch {}
            destMarkerRef.current = L.marker([lat, lng], { icon: destIcon() }).addTo(mapRef.current);

              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
              const data = await res.json();
              setSelectedPlace({ ...data, lat, lon: lng });
              setDetailsOpen(true);
              if (mapRef.current) mapRef.current.flyTo([lat, lng], 16, { duration: 1.5 });
            } catch (err) {
              console.error("Geocoding error", err);
            }
          });

    setMapReady(true);
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // ── Pickup external route request ────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const target = sessionStorage.getItem("nr_route_to");
    if (target) {
      try {
        const { lat, lng, name } = JSON.parse(target);
        sessionStorage.removeItem("nr_route_to");
        setTimeout(() => { getRoute(lat, lng, name); }, 1500);
      } catch (err) { console.error("Route pickup error:", err); }
    }
  }, [mapReady]);

  const renderCrimeZones = (zones) => {
    if (!mapRef.current) return;
    zoneLayersRef.current.forEach(l => { try { mapRef.current.removeLayer(l); } catch {} });
    zoneLayersRef.current = [];

    zones.forEach(zone => {
      if (!zone || !isFinite(zone.lat) || !isFinite(zone.lng)) return;
      const colors = { red: { fill: '#ff4d4d', stroke: '#cc0000' }, yellow: { fill: '#fbbc04', stroke: '#e6a000' }, green: { fill: '#00e5a0', stroke: '#00b87a' } };
      const c = colors[zone.risk] || colors.yellow;
      const radius = zone.risk === 'red' ? 100 : zone.risk === 'yellow' ? 80 : 60;
      const circle = L.circle([zone.lat, zone.lng], { radius, color: c.stroke, fillColor: c.fill, fillOpacity: 0.1, weight: 3, className: `zone-pulse-${zone.risk}` }).addTo(mapRef.current);
      const riskEmoji = zone.risk === 'red' ? '🔴' : zone.risk === 'yellow' ? '🟡' : '🟢';
      circle.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${riskEmoji} ${zone.label}</div><div style="font-size:11px;color:#666;margin-bottom:4px">${zone.crimeType || ''}</div><div style="font-size:10px;padding:3px 8px;border-radius:99px;display:inline-block;background:${c.fill}22;color:${c.stroke};border:1px solid ${c.stroke}44">${zone.source} · ${zone.count} incidents</div></div>`, { className: 'nr-popup' });
      zoneLayersRef.current.push(circle);
    });
  };

  const fetchCrimeZones = async () => {
    const lat = position?.[0] || 22.7196;
    const lng = position?.[1] || 75.8577;
    
    const demoData = getDemoZones(lat, lng);
    setCrimeZones(demoData);
    if (showZones) renderCrimeZones(demoData);
    
    try {
      const res = await fetch(`http://localhost:5005/api/crime-zones?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.zones && data.zones.length > 0) {
          setCrimeZones([...demoData, ...data.zones]);
        }
      }
    } catch (e) {}
  };

  // Fly to user on first valid position
  const [hasFlownToUser, setHasFlownToUser] = useState(false);
  useEffect(() => {
    if (position && mapRef.current && !hasFlownToUser) {
      mapRef.current.flyTo(position, 15, { duration: 2 });
      setHasFlownToUser(true);
    }
  }, [position, mapReady]);

  useEffect(() => {
    if (!mapReady || !position) return;
    
    // Only fetch if moved > 100m or first time
    let shouldFetch = !lastFetchedPosRef.current;
    if (lastFetchedPosRef.current) {
        const dist = calcDistKm(position[0], position[1], lastFetchedPosRef.current[0], lastFetchedPosRef.current[1]);
        if (dist > 0.1) shouldFetch = true; // 100m
    }

    if (shouldFetch) {
        fetchCrimeZones();
        lastFetchedPosRef.current = position;
    }

    const interval = setInterval(() => {
        fetchCrimeZones();
        lastFetchedPosRef.current = position;
    }, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [mapReady, position?.[0], position?.[1]]); 


  // Toggle zone visibility and redraw on data change
  useEffect(() => {
    if (showZones && crimeZones.length > 0) {
      renderCrimeZones(crimeZones);
    } else if (!showZones) {
      zoneLayersRef.current.forEach(l => { try { mapRef.current?.removeLayer(l); } catch {} });
      zoneLayersRef.current = [];
    }
    
    // Sync to 3D Map if active
    if (map3D && maplibreRef.current?.loaded()) {
      syncZonesTo3D(maplibreRef.current);
    }
  }, [showZones, crimeZones, mapReady, map3D]);

  const syncZonesTo3D = (ml) => {
    if (!ml || !ml.loaded()) return;
    
    // Cleanup old zones
    crimeZones.forEach((_, i) => {
      if (ml.getLayer(`zone-3d-${i}`)) ml.removeLayer(`zone-3d-${i}`);
      if (ml.getSource(`zone-src-${i}`)) ml.removeSource(`zone-src-${i}`);
    });

    if (!showZones) return;

    crimeZones.forEach((zone, i) => {
      const color = zone.risk === 'red' ? '#ea4335' : zone.risk === 'yellow' ? '#fbbc04' : '#00e5a0';
      
      const points = 32;
      const radius = 0.001; 
      const coords = [];
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        coords.push([
          zone.lng + radius * Math.cos(angle),
          zone.lat + radius * Math.sin(angle)
        ]);
      }
      coords.push(coords[0]);

      ml.addSource(`zone-src-${i}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] }
        }
      });

      ml.addLayer({
        id: `zone-3d-${i}`,
        type: 'fill-extrusion',
        source: `zone-src-${i}`,
        paint: {
          'fill-extrusion-color': color,
          'fill-extrusion-height': 50,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.4
        }
      });
    });
  };

  const fetchNearbyStations = async (lat, lng) => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 60000 && nearbyStations.length > 5) return;
    lastFetchTimeRef.current = now;

    try {
      const query = `[out:json][timeout:25];(node["amenity"="police"](around:10000, ${lat}, ${lng});node["amenity"="hospital"](around:10000, ${lat}, ${lng});node["amenity"="fire_station"](around:10000, ${lat}, ${lng}););out body;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      const mapped = data.elements.map(el => ({
          label: el.tags.name || (el.tags.amenity === "police" ? "Police Station" : el.tags.amenity === "hospital" ? "Hospital" : "Fire Station"),
          type: el.tags.amenity === "police" ? "Police" : el.tags.amenity === "hospital" ? "Hospital" : "Fire",
          icon: el.tags.amenity === "police" ? "🚔" : el.tags.amenity === "hospital" ? "🏥" : "🚒",
          lat: el.lat, lng: el.lon, dist: calcDistKm(lat, lng, el.lat, el.lon),
          phone: el.tags["contact:phone"] || el.tags.phone || (el.tags.amenity === "police" ? "100" : "108"),
          open: el.tags.opening_hours || "24/7"
      }));
      const final = [...mapped, 
        { label: "Women Helpline", type: "Gov", icon: "📞", lat, lng, dist: 0, phone: "181" },
        { label: "Child Helpline", type: "Gov", icon: "👶", lat, lng, dist: 0, phone: "1098" }
      ];
      setNearbyStations(final.sort((a, b) => a.dist - b.dist).slice(0, 10));
    } catch {
      setNearbyStations([
        { label: "Emergency Police", type: "Police", icon: "🚔", lat, lng, dist: 0.1, phone: "100" },
        { label: "Emergency Medical", type: "Hospital", icon: "🏥", lat, lng, dist: 0.1, phone: "108" }
      ]);
    }
  };

  const calcDistKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sync3DUserMarker = (pos) => {
    if (!maplibreRef.current || !maplibreRef.current.loaded() || !pos) return;
    const [lat, lng] = pos;
    const mLng = parseFloat(lng), mLat = parseFloat(lat);
    if (isNaN(mLng) || isNaN(mLat)) return;

    // Ensure marker belongs to the current map instance
    if (marker3DRef.current && marker3DRef.current._map !== maplibreRef.current) {
       try { marker3DRef.current.remove(); } catch(e) {}
       marker3DRef.current = null;
    }

    if (!marker3DRef.current) {
      const el = document.createElement('div');
      el.className = 'marker-3d-user';
      el.style.width = '52px';
      el.style.height = '52px';
      el.innerHTML = `
        <div style="position:relative; width:52px; height:52px; display:flex; align-items:center; justify-content:center;">
          <!-- Sonar Pulse -->
          <div style="position:absolute; width:48px; height:48px; background:rgba(66,133,244,0.3); border-radius:50%; animation:pulse-gps 2s infinite;"></div>
          
          <!-- Tactical Arrow -->
          <div class="arrow-3d-body" style="position:relative; width:42px; height:42px; background:#4285F4; border:3px solid #fff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 35px rgba(0,0,0,0.6); transition: transform 0.3s ease;">
             <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
               <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
             </svg>
          </div>
        </div>
      `;
      marker3DRef.current = new window.maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([mLng, mLat])
        .addTo(maplibreRef.current);
      
      // Force a resize to fix projection
      maplibreRef.current.resize();
    } else {
      marker3DRef.current.setLngLat([mLng, mLat]);
    }
  };

  useEffect(() => {
    if (position && isFinite(position[0]) && isFinite(position[1])) {
      const [lat, lng] = position;
      reverseGeocode(lat, lng);
      fetchNearbyStations(lat, lng);
      
      // 2D Marker Sync
      if (mapRef.current && mapReady) {
        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker(position, { icon: userIcon(), zIndexOffset: 1000 }).addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLatLng(position);
        }
      }

      if (map3D) sync3DUserMarker(position);
    }
  }, [position?.[0], position?.[1], map3D, mapReady, maplibreRef.current]);

  // ── Clock ───────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Fetch alerts ─────────────────────────────────────────
  const fetchAlerts = (lat, lng) => {
    fetch(`http://localhost:5005/api/alerts?lat=${lat}&lng=${lng}`)
      .then(r => r.json()).then(d => setAlerts(d))
      .catch(() => setAlerts([
        { type: "Suspicious Activity", lat: 23.262, lng: 77.415, time: "10 min ago" },
        { type: "Chain Snatching", lat: 23.257, lng: 77.408, time: "32 min ago" },
      ]));
  };

  const lastAlertPosRef = useRef(null);
  useEffect(() => {
    if (position) {
      let shouldFetch = !lastAlertPosRef.current;
      if (lastAlertPosRef.current) {
        const dist = calcDistKm(position[0], position[1], lastAlertPosRef.current[0], lastAlertPosRef.current[1]);
        if (dist > 0.1) shouldFetch = true;
      }
      if (shouldFetch) {
        fetchAlerts(position[0], position[1]);
        lastAlertPosRef.current = position;
      }
    }
  }, [position?.[0], position?.[1]]);

  // ── Community SOS Listener (1km Radius Alert) ───────────
  useEffect(() => {
    if (!position || !loggedInUser.id) return;

    const reportsRef = collection(db, "reports");
    // Listen for new SOS reports
    const q = query(
      reportsRef, 
      where("type", "==", "SOS"), 
      where("status", "==", "ACTIVE")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const report = change.doc.data();
          
          // 1. Don't alert the user about their own SOS
          if (report.userId === loggedInUser.id) return;

          // 2. Check if the SOS is within 1km
          const dist = calcDistKm(position[0], position[1], report.lat, report.lng);
          
          // 3. Check if it's recent (within last 5 minutes)
          const isRecent = (Date.now() - report.timestamp) < 300000;

          if (dist <= 1.0 && isRecent) {
            // Trigger Critical Community Alert
            addToast(`🚨 NEIGHBORHOOD ALERT: ${report.userName} is in danger! (${Math.round(dist * 1000)}m away)`, "danger", 15000);
            
            // Visual feedback on map
            if (mapRef.current) {
              const pulse = L.circle([report.lat, report.lng], {
                radius: 200, color: '#ff0000', fillColor: '#ff0000', 
                fillOpacity: 0.3, className: 'sos-ripple-effect'
              }).addTo(mapRef.current);
              
              pulse.bindPopup(`🚨 SOS: ${report.userName} needs help!`).openPopup();
              setTimeout(() => { try { mapRef.current.removeLayer(pulse); } catch(e) {} }, 30000);
            }

            // Haptic/Vibrate
            if ("vibrate" in navigator) navigator.vibrate([500, 200, 500, 200, 500]);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [position?.[0], position?.[1], loggedInUser.id]);

  useEffect(() => {
    // Fetch initial saved places
    if (loggedInUser.id) {
      fetch(`http://localhost:5005/saved-places/${loggedInUser.id}`)
        .then(r => r.json()).then(d => setSavedPlaces(Array.isArray(d) ? d : []))
        .catch(() => setSavedPlaces([]));
    }
  }, []);

  // Fetch recent SOS reports
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('trinetra_sos_reports') || '[]');
    setRecentReports(saved.reverse().slice(0, 3)); // Show last 3
  }, [sosActive]);

  // ── Alert markers ───────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    alerts.forEach((a) => {
      L.marker([a.lat, a.lng], { icon: alertIcon(), interactive: false })
        .addTo(mapRef.current)
        .bindPopup(`⚠️ ${a.type}`);
    });
  }, [alerts, mapReady]);

  // ── Score ───────────────────────────────────────────────
  useEffect(() => {
    let s = 100;
    
    // Decrease score based on number of nearby alerts
    s -= alerts.length * 8;
    
    // Night penalty
    const h = new Date().getHours();
    if (h > 21 || h < 6) s -= 15;

    // Proximity to crime zones
    let zonePenalty = 0;
    let currentInRed = false;
    
    crimeZones.forEach(zone => {
      if (!position) return;
      const d = calcDistKm(position[0], position[1], zone.lat, zone.lng);
      
      if (zone.risk === 'red' && d < 0.12) { // Match visual 100m radius + small buffer
        zonePenalty = Math.max(zonePenalty, 65);
        currentInRed = true;
      } else if (zone.risk === 'yellow' && d < 0.1) { // Match visual 80m radius
        zonePenalty = Math.max(zonePenalty, 30);
      }
    });

    s -= zonePenalty;

    // Ensure score doesn't look "dead" for demo
    const ns = Math.max(s < 10 && !sosActive ? 12 : 0, s);
    setScore(ns);

    if ((ns < 50 || currentInRed) && !inDangerZone) {
      setInDangerZone(true);
      addToast("⚠️ Warning: You are in a high-risk area!", "danger", 6000);
      if ("vibrate" in navigator) navigator.vibrate([300, 100, 300, 100, 300]);
    } else if (ns >= 75 && !currentInRed) {
      setInDangerZone(false);
    }
  }, [alerts, crimeZones, position]);

  const posRef = useRef(position);
  useEffect(() => { posRef.current = position; }, [position]);

  // ── Trip Progress Tracker + Arrival Detection ──────────
  const arrivedFiredRef = useRef(false);
  useEffect(() => {
    if (!tripProgress || !position) return;
    const { totalDist, destLat, destLng, startLat, startLng } = tripProgress;
    // Distance from start to current position (covered)
    const covered = calcDistKm(startLat, startLng, position[0], position[1]) * 1000; // in meters
    // Distance from current position to destination (remaining)
    const remaining = calcDistKm(position[0], position[1], destLat, destLng) * 1000; // in meters
    const clampedCovered = Math.min(covered, totalDist);
    setTripProgress(prev => ({
      ...prev,
      coveredDist: clampedCovered,
      remainingDist: Math.max(0, totalDist - clampedCovered)
    }));

    // ── Destination Arrived → Push to Firestore for Guardian Alert ──
    if (remaining < 100 && !arrivedFiredRef.current) {
      arrivedFiredRef.current = true;
      addToast("🏁 You have arrived at your destination!", "success", 6000);
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);

      // Push ARRIVED event to Firestore (Guardian Dashboard listens to this)
      const firestoreNotify = async () => {
        try {
          const reportRef = doc(collection(db, "reports"));
          await setDoc(reportRef, {
            id: reportRef.id,
            type: "ARRIVED",
            userId: loggedInUser.id || "anonymous",
            userName: loggedInUser.name || "TRINETRA User",
            userMobile: loggedInUser.mobile || "N/A",
            destinationName: currentRoute?.dest || "Destination",
            lat: position[0],
            lng: position[1],
            timestamp: Date.now(),
            createdAt: serverTimestamp(),
            placeName: currentRoute?.dest || "Destination",
            status: "SAFE_ARRIVED"
          });
          console.log("✅ [Dashboard] Arrival notified to Guardian");
        } catch (e) {
          console.error("❌ Arrival Firestore push failed:", e);
        }
      };
      firestoreNotify();
    }

    // Reset arrivedFiredRef when route is cleared
    if (!tripProgress) arrivedFiredRef.current = false;
  }, [position?.[0], position?.[1], tripProgress]);

  useEffect(() => {
    const THRESH = 25, WINDOW = 1000, NEEDED = 5;
    let last = null, count = 0, lastShake = 0;
    
    const onMotion = (e) => {
      const acc = e.acceleration || e.accelerationIncludingGravity || {};
      const { x = 0, y = 0, z = 0 } = acc;
      
      if (!last) {
        last = { x, y, z };
        return;
      }

      const delta = Math.abs(x - last.x) + Math.abs(y - last.y) + Math.abs(z - last.z);
      if (delta > THRESH) {
        const now = Date.now();
        if (now - lastShake < WINDOW) {
          count++;
        } else {
          count = 1;
        }
        lastShake = now;
        
        if (count >= NEEDED) {
          triggerSOS();
          count = 0;
        }
      }
      last = { x, y, z };
    };

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, []); // triggerSOS is stable enough here but using posRef inside it is safer

  // Indian Police Siren using Web Audio API
  // Pattern: fast "wiu-wiu-wiu" sweep characteristic of Indian police vehicles
  const playSiren = () => {
    try {
      setSirenPlaying(true);
      setShowStopModal(false);
      setStopPasswordInput("");

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);

      // ── Main oscillator: sawtooth for piercing siren quality
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 900; // center frequency

      // ── Second oscillator: slight detune for thickness
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.value = 905;

      // ── Frequency LFO: "wiu-wiu" sweep (Indian siren is FAST ~1.5 Hz)
      // Sweeps from ~700 Hz to ~1100 Hz (±200 Hz around 900)
      const freqLFO = ctx.createOscillator();
      freqLFO.type = "sine";
      freqLFO.frequency.value = 1.5; // 1.5 sweeps/second = Indian police siren speed

      const freqLFOGain = ctx.createGain();
      freqLFOGain.gain.value = 200; // ±200 Hz sweep → 700 to 1100 Hz

      freqLFO.connect(freqLFOGain);
      freqLFOGain.connect(osc.frequency);
      freqLFOGain.connect(osc2.frequency);

      // ── Amplitude LFO: volume also pulses with the "wiu" rhythm
      const ampLFO = ctx.createOscillator();
      ampLFO.type = "sine";
      ampLFO.frequency.value = 1.5;

      const ampLFOGain = ctx.createGain();
      ampLFOGain.gain.value = 0.12;

      ampLFO.connect(ampLFOGain);

      // ── Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.28;

      ampLFOGain.connect(masterGain.gain);

      // ── Light distortion for mechanical horn texture
      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(512);
      for (let i = 0; i < 512; i++) {
        const x = (i * 2) / 512 - 1;
        curve[i] = (Math.PI + 60) * x / (Math.PI + 60 * Math.abs(x));
      }
      distortion.curve = curve;
      distortion.oversample = "4x";

      // Signal chain: oscs → distortion → masterGain → output
      osc.connect(distortion);
      osc2.connect(distortion);
      distortion.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Fade in
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.1);

      freqLFO.start(ctx.currentTime);
      ampLFO.start(ctx.currentTime);
      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      setSirenOscillator(osc);
      setSirenGain(masterGain);
      ctx._sirenExtra = { osc2, freqLFO, ampLFO };

      // Auto-stop after 5 minutes
      const stopTimer = setTimeout(() => {
        try {
          masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
          setTimeout(() => {
            try { osc.stop(); osc2.stop(); freqLFO.stop(); ampLFO.stop(); } catch (e) {}
          }, 350);
        } catch (e) {}
        setSirenPlaying(false);
        if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
        addToast("Siren stopped after 5 minutes", "info", 3000);
      }, 300000);

      ctx._sirenStopTimer = stopTimer;

      // ── Anti-Mute / Volume Persistence ──
      // Constantly reset gain to maximum level to prevent software-based silencing
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = setInterval(() => {
        if (masterGain) {
          masterGain.gain.setValueAtTime(0.35, ctx.currentTime); // Force high volume
        }
      }, 1000);

      // MediaSession for background persistence
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: '🚨 EMERGENCY SOS ACTIVE',
          artist: 'TRINETRA Safety System',
          album: 'Safety Protocol',
          artwork: [{ src: '/logo192.png', sizes: '192x192', type: 'image/png' }]
        });
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch (e) {
      console.error("Siren play error:", e);
      addToast("Could not play siren", "danger");
    }
  };

  // Function to stop siren with password
  const stopSiren = () => {
    if (stopPasswordInput === sirenPassword) {
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      try {
        if (audioContext) {
          if (audioContext._sirenStopTimer) clearTimeout(audioContext._sirenStopTimer);
          if (sirenGain) {
            sirenGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          }
          setTimeout(() => {
            try { sirenOscillator && sirenOscillator.stop(); } catch (e) {}
            try {
              if (audioContext._sirenExtra) {
                audioContext._sirenExtra.osc2.stop();
                audioContext._sirenExtra.freqLFO.stop();
                audioContext._sirenExtra.ampLFO.stop();
              }
            } catch (e) {}
          }, 350);
        }
      } catch (e) {}
      setSirenPlaying(false);
      setShowStopModal(false);
      setStopPasswordInput("");
      setResetFlow({ active: false, step: 0, otp: "", inputOtp: "", newPass: "" });
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
      addToast("Siren stopped successfully", "success", 3000);
    } else {
      addToast("Wrong password! Siren cannot be stopped.", "danger", 3000);
      setStopPasswordInput("");
    }
  };

  const handleForgotSirenPass = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setResetFlow({ ...resetFlow, active: true, step: 1, otp });
    addToast(`🛡️ TRINETRA Security: OTP sent to ${loggedInUser.email || "your registered email"}. (Code: ${otp})`, "success", 8000);
  };

  const verifySirenOtp = () => {
    if (resetFlow.inputOtp === resetFlow.otp) {
      setResetFlow({ ...resetFlow, step: 2 });
      addToast("OTP Verified. Please set a new password.", "success");
    } else {
      addToast("Invalid OTP. Please try again.", "danger");
    }
  };

  const resetSirenPassword = () => {
    if (resetFlow.newPass.length < 4) {
      addToast("Password must be at least 4 digits.", "danger");
      return;
    }
    setSirenPassword(resetFlow.newPass);
    localStorage.setItem("trinetra_siren_password", resetFlow.newPass);
    setResetFlow({ active: false, step: 0, otp: "", inputOtp: "", newPass: "" });
    addToast("SOS Password Reset Successfully! You can now stop the siren.", "success");
  };

  const triggerSOS = async () => {
    if (sosActiveRef.current) return;
    sosActiveRef.current = true;
    setSosActive(true);
    
    addToast("🚨 SOS Alert sent! Help is on the way.", "danger", 6000);
    if ("vibrate" in navigator) navigator.vibrate([500, 200, 500, 200, 500]);

    // ── Generate Official Incident Report ──
    const savedReports = JSON.parse(localStorage.getItem('trinetra_sos_reports') || '[]');
    const currentPos = posRef.current;
    const reportLat = currentPos?.[0] || 22.7196;
    const reportLng = currentPos?.[1] || 75.8577;

    const newReport = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      lat: reportLat,
      lng: reportLng,
      locationName: fullAddress || areaName || "GPS Location",
      message: "Emergency SOS triggered",
      userName: loggedInUser.name || "TRINETRA User",
      userMobile: loggedInUser.mobile || "N/A"
    };
    localStorage.setItem('trinetra_sos_reports', JSON.stringify([...savedReports, newReport]));
    
    // --- SYNC SOS REPORT TO FIRESTORE (Global Tactical Bridge) ---
    try {
      const reportRef = doc(collection(db, "reports"));
      const reportData = {
        id: reportRef.id,
        reportId: "SOS-" + Math.floor(Math.random() * 10000),
        type: "SOS",
        description: "CRITICAL SOS TRIGGERED FROM DASHBOARD",
        locationName: fullAddress || areaName || "GPS Location",
        timestamp: Date.now(),
        status: "ACTIVE",
        userName: loggedInUser.name || "Anonymous User",
        userMobile: loggedInUser.mobile || "N/A",
        userId: loggedInUser.id || "anonymous",
        lat: reportLat,
        lng: reportLng
      };
      
      await setDoc(reportRef, reportData);
      console.log("✅ [Dashboard] SOS Synced to Firestore:", reportData);

      // Trigger Divisional Alert for Commissioner
      const alertRef = doc(collection(db, "divisional_alerts"));
      await setDoc(alertRef, {
          source: "CITIZEN_DASHBOARD",
          targetDivision: "7", // Commissioner
          type: "PUBLIC_SOS",
          message: `URGENT: SOS Signal from ${loggedInUser.name || 'Citizen'} at ${reportData.locationName}`,
          timestamp: Date.now(),
          priority: "CRITICAL",
          status: "ACTIVE"
      });

    } catch (e) {
      console.error("❌ [Dashboard] Firestore SOS Sync Failed:", e);
    }
    
    // Trigger siren after short delay
    setTimeout(() => { playSiren(); }, 2000);
    
    // Reset lock after 10 seconds to allow reactivation later
    setTimeout(() => {
      sosActiveRef.current = false;
      setSosActive(false);
    }, 10000);
  };

  // ── Search ──────────────────────────────────────────────
  const performSearch = async (query) => {
    if (!query.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    try {
      // Create a tight viewbox around the current map position (approx 0.5 degree)
      const lat = position?.[0] || 22.7196;
      const lng = position?.[1] || 75.8577;
      const viewbox = `${lng-0.5},${lat+0.5},${lng+0.5},${lat-0.5}`;
      
      // Smart search: append current area if not specified to help Nominatim
      let smartQuery = query;
      if (!query.toLowerCase().includes("indore") && areaName.toLowerCase().includes("indore")) {
        smartQuery += " indore";
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(smartQuery)}&limit=10&countrycodes=in&viewbox=${viewbox}&bounded=0&accept-language=en`
      );
      const data = await res.json();
      const cleaned = data.map(item => ({
        ...item,
        display_name: item.display_name.replace(/Umriya/g, "Umariya")
      }));
      setSearchResults(cleaned);
      setSearchOpen(true);
    } catch { setSearchResults([]); }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => performSearch(q), 350);
  };

  const selectSearch = (place) => {
    setSearchQuery(place.display_name.split(",")[0]);
    setSearchOpen(false);
    if (!mapRef.current) return;
    const lat = parseFloat(place.lat), lng = parseFloat(place.lon);
    mapRef.current.flyTo([lat, lng], 16, { duration: 1.5 });
    
    // Trigger Details Panel
    setSelectedPlace({ ...place, lat, lng });
    setDetailsOpen(true);
    
    setAreaName(place.display_name.split(",").slice(0, 2).join(", "));
    try { if (destMarkerRef.current) mapRef.current.removeLayer(destMarkerRef.current); } catch {}
    destMarkerRef.current = L.marker([lat, lng], { icon: destIcon() })
      .addTo(mapRef.current);
  };

  // ── Route ────────────────────────────────────────────────
  const clearRoute = () => {
    setShowFullNav(false);
    setNavInstructions([]);
    setCurrentRoute(null);
    setTripProgress(null);
    try { if (routeLineRef.current && mapRef.current) { mapRef.current.removeLayer(routeLineRef.current); routeLineRef.current = null; } } catch {}
    try { if (destMarkerRef.current && mapRef.current) { mapRef.current.removeLayer(destMarkerRef.current); destMarkerRef.current = null; } } catch {}
    arrowMRef.current.forEach(m => { try { mapRef.current.removeLayer(m); } catch {} });
    arrowMRef.current = [];
    turnMRef.current.forEach(m => { try { mapRef.current.removeLayer(m); } catch {} });
    turnMRef.current = [];
    routeZoneMarkersRef.current.forEach(m => { try { mapRef.current.removeLayer(m); } catch {} });
    routeZoneMarkersRef.current = [];
  };

  const getRoute = async (destLat, destLng, destName) => {
    if (!mapRef.current) return;
    if (!position) { 
      addToast("Please enable location first.", "danger"); 
      setShowLocPrompt(true); 
      return; 
    }
    clearRoute();
    setRouteLoading(true);

    const start = { lat: position[0], lng: position[1] };
    const end = { lat: destLat, lng: destLng };

    try {
      const res = await fetch(ROUTING_URL(start, end));
      const data = await res.json();
      if (!data.routes?.[0]) {
        addToast("No route found. Try another destination.", "danger");
        setRouteLoading(false);
        return;
      }

      const geo = data.routes[0].geometry;
      const coords = geo.coordinates;
      const steps = data.routes[0].legs[0].steps;
      const dist = data.routes[0].distance;
      const dur = data.routes[0].duration;

      // ── Intelligent Safety Check & Rerouting ────────────────
      const checkSafety = (routeCoords) => {
        let hazards = 0;
        // Sample points every ~50m
        const sample = routeCoords.filter((_, i) => i % Math.max(1, Math.floor(routeCoords.length / 40)) === 0);
        for (const [rLng, rLat] of sample) {
          for (const zone of crimeZones) {
            if (zone.risk === 'red' && calcDistKm(rLat, rLng, zone.lat, zone.lng) < 0.15) hazards++;
          }
        }
        return hazards;
      };

      const initialHazards = checkSafety(coords);

      if (initialHazards > 0) {
        addToast("⚠️ Danger detected on route! Recalculating safer path...", "danger", 5000);
        
        // Fetch Alternatives from OSRM
        const altRes = await fetch(`${ROUTING_URL(start, end)}&alternatives=true`);
        const altData = await altRes.json();
        
        if (altData.routes && altData.routes.length > 1) {
          let safestRoute = altData.routes[0];
          let minHazards = initialHazards;
          let foundBetter = false;

          for (let i = 1; i < altData.routes.length; i++) {
            const hCount = checkSafety(altData.routes[i].geometry.coordinates);
            if (hCount < minHazards) {
              minHazards = hCount;
              safestRoute = altData.routes[i];
              foundBetter = true;
            }
          }

          if (foundBetter) {
            addToast("🛡️ TRINETRA: Safe alternate route found and applied.", "success", 5000);
            return renderRouteUI(safestRoute.geometry.coordinates, safestRoute.legs[0].steps, safestRoute.distance, safestRoute.duration, destLat, destLng, destName, minHazards > 0);
          }
        }
      }

      // Default Render
      renderRouteUI(coords, steps, dist, dur, destLat, destLng, destName, initialHazards > 0);
    } catch (e) {
      console.error("Routing error:", e);
      addToast("Route failed. Check your internet.", "danger");
    }
    setRouteLoading(false);
  };

  // Helper to render the route on map
  const renderRouteUI = (coords, steps, dist, dur, destLat, destLng, destName, hasHazard) => {
    const latlngs = coords.map(c => [c[1], c[0]]);
    const routeColor = hasHazard ? '#ea4335' : '#00e5a0';

    routeLineRef.current = L.polyline(latlngs, { color: routeColor, weight: 12, opacity: 0.15, lineCap: 'round' }).addTo(mapRef.current);
    const innerGlow = L.polyline(latlngs, { color: routeColor, weight: 6, opacity: 0.4, lineCap: 'round' }).addTo(mapRef.current);
    const coreLine = L.polyline(latlngs, { color: '#fff', weight: 2, opacity: 0.9, lineCap: 'round' }).addTo(mapRef.current);
    routeLineRef.current = L.featureGroup([routeLineRef.current, innerGlow, coreLine]).addTo(mapRef.current);

    destMarkerRef.current = L.marker([destLat, destLng], { icon: destIcon() }).addTo(mapRef.current).bindPopup(`🏁 ${destName}`);

    // Arrows
    const numArrows = Math.max(2, Math.min(Math.floor(dist / 200), 12));
    for (let i = 1; i <= numArrows; i++) {
      const idx = Math.floor((i / (numArrows + 1)) * (coords.length - 1));
      const pt = coords[idx], next = coords[Math.min(idx + 1, coords.length - 1)];
      if (!pt || !next) continue;
      const bearing = Math.atan2(next[0] - pt[0], next[1] - pt[1]) * (180 / Math.PI);
      arrowMRef.current.push(L.marker([pt[1], pt[0]], { icon: arrowIcon(bearing), interactive: false }).addTo(mapRef.current));
    }

    // Turns & Hazards
    steps.forEach((step, i) => {
      if (!step.maneuver?.location || i === 0) return;
      const m = L.marker([step.maneuver.location[1], step.maneuver.location[0]], { icon: turnMarkerIcon(turnEmoji(step.maneuver.type, step.maneuver.modifier), i === 1), interactive: false }).addTo(mapRef.current);
      turnMRef.current.push(m);
    });

    coords.forEach((c, idx) => {
      if (idx % 20 !== 0) return;
      crimeZones.forEach(zone => {
        if (zone.risk === 'red' && calcDistKm(c[1], c[0], zone.lat, zone.lng) < 0.15) {
          routeZoneMarkersRef.current.push(L.marker([c[1], c[0]], { icon: hazardIcon(zone.risk) }).addTo(mapRef.current).bindPopup(`<b>⚠️ Danger:</b> ${zone.label}`));
        }
      });
    });

    const lats = latlngs.map(p => p[0]), lngs = latlngs.map(p => p[1]);
    mapRef.current.fitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { padding: [60, 60] });
    setNavInstructions(steps.map(s => ({ instruction: s.maneuver.instruction, distance: s.distance > 1000 ? `${(s.distance/1000).toFixed(1)}km` : `${Math.round(s.distance)}m` })).slice(0, 10));
    setShowFullNav(true);
    setCurrentRoute({ dest: destName, dist, dur });
    setTripProgress({
      totalDist: dist,
      coveredDist: 0,
      remainingDist: dist,
      destLat,
      destLng,
      startLat: position[0],
      startLng: position[1]
    });
    setRouteLoading(false);
    
    if (map3D && maplibreRef.current) {
      syncRouteTo3D(coords);
    }
  };

  const syncRouteTo3D = (coords) => {
    const ml = maplibreRef.current;
    if (!ml || !ml.loaded()) return;

    if (ml.getLayer('route-3d')) ml.removeLayer('route-3d');
    if (ml.getSource('route-3d-src')) ml.removeSource('route-3d-src');

    ml.addSource('route-3d-src', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords }
      }
    });

    ml.addLayer({
      id: 'route-3d',
      type: 'line',
      source: 'route-3d-src',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#00e5a0',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });
  };

  const saveAllPlaces = async (item) => {
    // Modal now sends single item: { label, address, lat, lon }
    if (!item.address) return;
    addToast(`Saving ${item.label}...`, "info");
    
    try {
      // Use Firestore instead of localhost:5005
      const placeRef = doc(db, "users", loggedInUser.id, "savedPlaces", item.label);
      const placeData = {
        label: item.label,
        icon: item.label === "Home" ? "🏠" : "🏢",
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.address,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(placeRef, placeData);

      setSavedPlaces(p => {
        const current = Array.isArray(p) ? p : [];
        return [...current.filter(x => x.label !== item.label), { id: item.label, ...placeData }];
      });
      addToast(`${item.label} updated successfully!`, "success");
      
      // Move map to new location
      const newLat = parseFloat(item.lat);
      const newLng = parseFloat(item.lon);
      setPosition([newLat, newLng]);
      if (mapRef.current) mapRef.current.flyTo([newLat, newLng], 16);

    } catch (err) {
      console.error("Error saving location:", err);
      addToast("Error saving location to Firebase", "danger");
    }
  };

  const shareLocation = () => {
    const url = `https://www.google.com/maps?q=${position?.[0] || 23.2599},${position?.[1] || 77.4126}`;
    if (navigator.share) navigator.share({ title: "My Location – TRINETRA", url });
    else { navigator.clipboard?.writeText(url); addToast("Location link copied!", "success"); }
  };

  // ── Sync Map Style to Leaflet ────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    
    // Remove old layer
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    
    // Add new layer
    const t = TILES[mapStyle];
    tileLayerRef.current = L.tileLayer(t.url, { 
      attribution: t.attr, 
      maxZoom: 18, 
      noClip: true 
    }).addTo(mapRef.current);

    // If 3D is active, we might need to re-init it or change its style
    // (MapLibre style change is handled by the map3D effect usually)
  }, [mapStyle, mapReady]);

  const cycleMapStyle = () => {
    if (!isOnline) {
      addToast("Switching map styles requires internet. Using current cached view.", "info");
      return;
    }
    const idx = TILE_KEYS.indexOf(mapStyle);
    const nextStyle = TILE_KEYS[(idx + 1) % TILE_KEYS.length];
    setMapStyle(nextStyle);
    addToast(`🗺️ Map Style: ${TILES[nextStyle].label}`, "info", 2000);
  };

  const formatDur = (s) => {
    if (s >= 3600) return `${Math.round(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
    return `${Math.round(s / 60)} min`;
  };

  const scoreColor = score >= 80 ? "#34a853" : score >= 50 ? "#fbbc04" : "#ea4335";
  const scoreLabel = score >= 80 ? "Safe Zone" : score >= 50 ? "Caution" : "Danger";

  const dashboardContent = isMobile ? (
    <MobileDashboard user={loggedInUser} onLogout={handleLogout} triggerSOS={triggerSOS} />
  ) : (
    <div className={`nr-root ${dark ? "dark" : "light"}`}>
      <style>{`
        @keyframes pulse-gps {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        @keyframes sos-ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        .sos-ripple-effect {
          animation: sos-ripple 1.5s infinite;
          stroke-width: 2px;
        }
        .nr-popup .leaflet-popup-content-wrapper {
          background: var(--bg1);
          color: var(--text);
          border: 1px solid var(--accent);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
        }
        .nr-popup .leaflet-popup-tip {
          background: var(--accent);
        }
        .nr-popup button:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
          transition: all 0.2s;
        }

        /* ── Mobile UI Styles ────────────────────────────── */
        @media (max-width: 768px) {
          .nr-sidebar {
            width: 280px;
            left: -280px;
          }
          .nr-sidebar.open {
            left: 0;
            z-index: 1000;
          }
          .nr-left, .nr-right {
            display: none !important; /* Hide side panels on mobile map view */
          }
          .nr-main {
            grid-template-columns: 1fr !important;
            padding: 0 !important;
          }
          .topbar-center {
            display: none !important; /* Hide complex search on tiny headers */
          }
          .mobile-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background: var(--bg1);
            border-top: 1px solid var(--border);
            display: flex !important;
            justify-content: space-around;
            align-items: center;
            z-index: 900;
            backdrop-filter: blur(15px);
            padding-bottom: env(safe-area-inset-bottom);
          }
          .mob-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: var(--text3);
          }
          .mob-tab-icon { font-size: 20px; }
          .mob-tab-label { font-size: 10px; font-weight: 500; }
          
          .nr-sos-fab {
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #ea4335;
            color: white;
            border: none;
            box-shadow: 0 4px 15px rgba(234,67,53,0.4);
            z-index: 850;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          
          /* Mobile Place Details Sheet */
          .place-details-sheet {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: var(--bg1);
            border-top: 1px solid var(--border);
            border-radius: 24px 24px 0 0;
            z-index: 1000;
            padding: 16px 16px 32px 16px;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 85vh;
            overflow-y: auto;
          }
          .place-details-sheet.open {
            transform: translateY(0);
          }
          .sheet-handle {
            width: 40px; height: 4px; background: var(--border);
            border-radius: 2px; margin: 0 auto 16px auto;
          }
        }

        @media (min-width: 769px) {
          .mobile-bottom-nav {
            display: none !important;
          }
          
          .nr-sos-fab {
            display: flex !important;
            position: absolute;
            bottom: 20px; 
            left: 20px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 25px rgba(234, 67, 53, 0.5);
            z-index: 16000; /* Higher than AI agent */
            flex-direction: column;
            gap: 2px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          
          .nr-sos-fab:hover {
            transform: scale(1.1) translateY(-5px);
            box-shadow: 0 12px 35px rgba(234, 67, 53, 0.7);
          }
          
          .nr-sos-fab.active {
            animation: pulse-sos 1s infinite;
            background: #ff0000;
          }
          
          /* Desktop Place Details Side Panel */
          .place-details-sheet {
            position: fixed;
            top: 75px; left: 320px; /* Shifted to sit next to the left panel */
            width: 380px; bottom: 20px;
            background: var(--bg1);
            border: 1px solid var(--border);
            border-radius: 24px;
            z-index: 1000;
            padding: 24px 16px 16px 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            transform: translateX(-150%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
          }
          .place-details-sheet.open {
            transform: translateX(0);
          }
          .sheet-handle { display: none; }
          
          /* Mobile HUD Adjustments */
          .mobile-hud {
            top: 140px !important;
            right: 12px !important;
            left: auto !important;
            flex-direction: column;
            gap: 12px;
          }
          .mobile-hud .map-ctrl-btn {
            width: 44px;
            height: 44px;
            background: rgba(6, 8, 13, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(10px);
            border-radius: 12px;
          }
        }
      `}</style>
      <Toast toasts={toasts} />

      {/* ── Offline Banner ───────────────────────────────── */}
      {offlineBannerVisible && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: "linear-gradient(90deg, #ff8c00, #ff4d4d)",
          color: "#fff", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <span>📡 You're offline — Map tiles cached: {tileCacheCount} tiles available</span>
          <button
            onClick={() => setOfflineBannerVisible(false)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}
          >✕</button>
        </div>
      )}

      {/* ── Online restored toast ─────────────────────────── */}
      {!offlineBannerVisible && !isOnline && null}
      <LocationPromptModal 
        isOpen={showLocPrompt} 
        onEnable={() => { startTracking(); }} 
        onSkip={() => setShowLocPrompt(false)} 
        onManual={() => { setShowLocPrompt(false); addToast("📍 Click anywhere on the map to set your location", "info", 6000); }}
        gpsError={gpsError}
        isLoading={locLoading}
      />
      <PlaceManagerModal 
        isOpen={placeModalOpen} 
        onClose={() => setPlaceModalOpen(false)} 
        onSave={saveAllPlaces} 
        savedPlaces={savedPlaces} 
      />
      <PlaceDetailsPanel 
        place={selectedPlace} 
        isOpen={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        onGetRoute={getRoute} 
        onSave={saveAllPlaces} 
      />

      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* ── Topbar ──────────────────────────────────────── */}
      <header className="nr-topbar glass-card">
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)}><FaBars size={18} /></button>
        <Logo height={20} />
        <div style={{ marginLeft: '12px' }}>
          <ThemeToggle />
        </div>

        {/* Location & Search Container */}
        <div className="topbar-center" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: 'center' }}>
          {/* Location Pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border2)",
            borderRadius: 20, padding: "5px 14px", cursor: "pointer",
            maxWidth: 240, transition: 'all 0.2s'
          }} onClick={startTracking} className="hover-glow" title="Use Live Location">
            <span style={{ fontSize: 13 }}>📍</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {areaName}
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <input
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder="Search destination..."
              style={{
                width: "100%", padding: "6px 12px 6px 32px",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border2)",
                borderRadius: "18px", color: "var(--text)", fontSize: "12px",
                fontFamily: "inherit", outline: "none", transition: 'all 0.2s'
              }}
              className="search-input-glow"
            />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, opacity: 0.5 }}>🔍</span>
            
            {searchOpen && searchResults.length > 0 && (
              <div className="glass-card fade-up" style={{
                position: "absolute", top: "110%", left: 0, right: 0,
                background: "var(--bg2)", zIndex: 200,
                maxHeight: "300px", overflowY: "auto", padding: '4px'
              }}>
                {searchResults.map((r, i) => (
                  <div key={i} 
                    style={{ padding: "8px 12px", borderRadius: '8px', cursor: "pointer", fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ flex: 1 }} onClick={() => selectSearch(r)}>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>{r.display_name.split(",")[0]}</div>
                      <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: 2 }}>
                        {r.display_name.split(",").slice(1, 3).join(",")}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={(e) => { e.stopPropagation(); getRoute(r.lat, r.lon, r.display_name.split(",")[0]); setSearchOpen(false); }} 
                        title="Directions" style={{ background: 'var(--accent)', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '4px 10px', fontSize: '12px', color: 'white', fontWeight: 600 }}>🗺️ Directions</button>
                      <button onClick={(e) => { e.stopPropagation(); saveAllPlaces({ label: 'Home', address: r.display_name, lat: r.lat, lon: r.lon }); setSearchOpen(false); }} 
                        title="Set as Home" style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '6px', cursor: 'pointer', padding: '4px 6px', fontSize: '14px' }}>🏠</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <button className="topbar-btn" onClick={cycleMapStyle} title="Change Map Style">
            <FaLayerGroup size={16} />
          </button>
          <button className="topbar-btn" onClick={() => setNotifOpen(!notifOpen)} title="Notifications">
            <FaBell size={16} />
            {alerts.length > 0 && <span className="notif-badge">{alerts.length}</span>}
          </button>
        </div>
      </header>

      {/* Security Pulse Pulse Bar */}
      <div className="security-pulse"></div>

      {notifOpen && (
        <div className="notif-dropdown">
          <div className="notif-title">Nearby Alerts</div>
          {alerts.length === 0 && <div className="notif-empty">No alerts nearby ✅</div>}
          {alerts.map((a, i) => (
            <div key={i} className="notif-item">
              <div className="notif-dot" />
              <div><div className="notif-type">{a.type}</div><div className="notif-time">{a.time || "Just now"}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* ── Status Banner ────────────────────────────────── */}
      <div className="nr-banner" style={{ borderColor: scoreColor }}>
        <div className="banner-indicator" style={{ background: scoreColor }} />
        <span className="banner-label" style={{ color: scoreColor }}>{scoreLabel}</span>
        <span className="banner-sub">· {areaName} · {position && position[0] && position[1] ? `${Number(position[0]).toFixed(4)}°N ${Number(position[1]).toFixed(4)}°E` : "Fetching GPS..."}</span>
        {inDangerZone && <span className="danger-pill">⚠️ DANGER ZONE</span>}
      </div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <main className="nr-main">

        {/* Left Panel */}
        <aside className="nr-left">
          <div className="score-ring-wrap" style={{ position: 'relative' }}>
            <ScoreRing score={score} dark={dark} />
            <div style={{ position: 'absolute', bottom: -10, fontSize: 10, fontWeight: 700, color: scoreColor, textTransform: 'uppercase' }}>
              {scoreLabel}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ width: "100%" }}>
            <div className="panel-title" style={{ marginBottom: 6 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button onClick={() => { startTracking(); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "rgba(66,133,244,0.12)", border: "1px solid rgba(66,133,244,0.25)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#4285F4", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                <span>📍</span><span style={{ flex: 1 }}>Use My Location</span>
                {locLoading && <span style={{ fontSize: 10, opacity: 0.7 }}>...</span>}
              </button>
              <button onClick={shareLocation}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text2)", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                <span>📤</span><span style={{ flex: 1 }}>Share Location</span>
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position?.[0] || 23.2599},${position?.[1] || 77.4126}`, '_blank')}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "rgba(0,149,255,0.1)", border: "1px solid rgba(0,149,255,0.25)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#60b8ff", fontFamily: "inherit", width: "100%", textAlign: "left" }}
              >
                <span>🏙️</span><span style={{ flex: 1 }}>Open Street View</span>
              </button>
              <button onClick={() => navigate('/citizen-report')}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "rgba(255,152,0,0.1)", border: "1px solid rgba(255,152,0,0.3)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#ff9800", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                <span>📋</span><span style={{ flex: 1 }}>Report Incident</span>
              </button>
              <button onClick={() => setZoneCreatorOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text2)", fontFamily: "inherit", width: "100%", textAlign: "left" }}>
                <span>🟢🔴</span><span style={{ flex: 1 }}>Mark Safe/Danger Zone</span>
              </button>
            </div>
          </div>

          {/* Nearby Help */}
          <div style={{ width: "100%" }}>
            <div className="panel-title" style={{ marginBottom: 6 }}>Nearby Help</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {nearbyStations.slice(0, 4).map((item) => (
                <div key={item.label} onClick={() => getRoute(item.lat, item.lng, item.label)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--text2)" }}>{item.label}</span>
                  <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "'JetBrains Mono',monospace" }}>{Number(item.dist || 0).toFixed(1)}km</span>
                  <span style={{ fontSize: 10, color: "#4285F4" }}>🛣</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Places */}
          <div style={{ width: "100%" }}>
            {Array.isArray(savedPlaces) && savedPlaces.length > 0 && (
              <div className="panel-title" style={{ marginBottom: 8, color: 'var(--accent)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Saved Locations 📍</span>
                <button onClick={() => setPlaceModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '14px' }}>⚙️</button>
              </div>
            )}
            {Array.isArray(savedPlaces) && savedPlaces.map((p) => {
              const dist = position ? calcDistKm(position[0], position[1], p.lat, p.lng) : null;
              return (
                <div key={p.label} onClick={() => getRoute(p.lat, p.lng, p.label)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 12, color: "var(--text)", transition: 'all 0.2s' }}
                  className="hover-glow"
                >
                  <span>{p.icon}</span><span style={{ flex: 1, fontWeight: 500 }}>{p.label}</span>
                  <span style={{ fontSize: 10, color: "var(--accent)" }}>→</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Map Container */}
        <div className="nr-map-wrap" style={{ position: "relative" }}>
          
          {/* ── TACTICAL HUD OVERLAY ────────────────────────────────── */}
          <div className="tactical-hud">
            <div className="hud-corner top-left">
              <div className="hud-label">TRINETRA SATELLITE LINK</div>
              <div className="hud-value"><span className="status-dot-green"></span> ACTIVE • 24ms</div>
            </div>
            <div className="hud-corner top-right">
              <div className="hud-label">SECTOR SECURITY LEVEL</div>
              <div className="hud-value" style={{ color: score > 70 ? '#00e5a0' : '#ff4d4d' }}>
                {score > 70 ? 'SECURE' : 'CAUTION'}
              </div>
            </div>
            <div className="hud-corner bottom-right">
              <div className="hud-label">NEARBY PATROLS</div>
              <div className="hud-value">12 UNITS ACTIVE</div>
            </div>
            
            {/* Tactical Scanning Line */}
            <div className="hud-scanner"></div>
          </div>

          {/* Leaflet 2D map */}
          <div ref={containerRef} className="map-leaflet-inner" style={{ width: "100%", height: "100%", background: "transparent", opacity: map3D ? 0 : 1, pointerEvents: map3D ? 'none' : 'auto', transition: 'opacity 0.5s ease' }} />

          {/* MapLibre 3D map */}
          <div ref={map3dContainerRef} style={{ position: "absolute", inset: 0, opacity: map3D ? 1 : 0, pointerEvents: map3D ? 'auto' : 'none', transition: 'opacity 0.5s ease', zIndex: 5 }} />

          {/* Map Controls */}
          <div className={`map-ctrl-panel ${isMobile ? 'mobile-hud' : ''}`}>
            <button onClick={() => { if (position && mapRef.current) mapRef.current.flyTo(position, 18, { duration: 1.5 }); }} title="Recenter" className="map-ctrl-btn map-ctrl-locate">
              <FaLocationArrow />
            </button>
            <button onClick={() => setMap3D(v => !v)} title="3D/2D" className={`map-ctrl-btn map-ctrl-3d ${map3D ? 'active' : ''}`}>
              <FaCube />
            </button>
            <button onClick={() => setShowZones(v => !v)} title="Zones" className={`map-ctrl-btn map-ctrl-shield ${showZones ? 'active' : ''}`}>
              <FaShieldAlt />
            </button>
            <button onClick={cycleMapStyle} title="Style" className="map-ctrl-btn map-ctrl-layers">
              <FaLayerGroup />
            </button>
            {currentRoute && <button onClick={clearRoute} title="Clear" className="map-ctrl-btn map-ctrl-clear"><FaTimes /></button>}
          </div>

          {/* Floating Safety Score (Mobile Only) */}
          {isMobile && (
            <div className="mobile-score-badge fade-up">
              <div className="mobile-score-ring">
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={score >= 80 ? "#00e5a0" : "#ff4d4d"} strokeWidth="10" 
                    strokeDasharray="251.2" strokeDashoffset={251.2 - (score / 100) * 251.2} strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <span className="mobile-score-val">{score}</span>
              </div>
              <div className="mobile-score-info">
                <div className="mobile-score-label">SAFETY SCORE</div>
                <div className="mobile-score-status" style={{ color: score >= 80 ? "#00e5a0" : "#ff4d4d" }}>
                  {score >= 80 ? "SAFE ZONE" : "CAUTION"}
                </div>
              </div>
            </div>
          )}

          {/* Safety Overlays */}
          {showZones && (
            <div className="safety-legend" style={{ position: "absolute", bottom: 100, left: 12, zIndex: 10, background: "rgba(6,8,13,0.88)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3b0", textTransform: "uppercase", marginBottom: 8 }}>🛡️ Safety Zones</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff4d4d" }} /><span style={{ fontSize: 11, color: "#fff" }}>Danger Zone</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00e5a0" }} /><span style={{ fontSize: 11, color: "#fff" }}>Safe Zone</span></div>
              </div>
            </div>
          )}

          {/* ── TACTICAL TRIP PROGRESS BAR (Top Center) ─────────────────────────── */}
          {tripProgress && currentRoute && (
            <div className="fade-down" style={{
              position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
              zIndex: 1001, background: 'rgba(6,8,13,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,229,160,0.4)', borderRadius: '16px',
              padding: '12px 24px', minWidth: '320px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5a0', boxShadow: '0 0 10px #00e5a0', animation: 'pulse-gps 2s infinite' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#00e5a0', letterSpacing: '1px' }}>NAVIGATING TO: {currentRoute.dest.toUpperCase()}</span>
                </div>
                <button onClick={clearRoute} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 99, height: 8, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${Math.min(100, (tripProgress.coveredDist / tripProgress.totalDist) * 100)}%`,
                      background: 'linear-gradient(90deg, #4285F4, #00e5a0)',
                      transition: 'width 1s ease', boxShadow: '0 0 15px rgba(0,229,160,0.4)'
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 15 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>REMAINING</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>
                      {tripProgress.remainingDist >= 1000 ? (tripProgress.remainingDist/1000).toFixed(1) : Math.round(tripProgress.remainingDist)}
                      <span style={{ fontSize: 10, marginLeft: 2 }}>{tripProgress.remainingDist >= 1000 ? 'KM' : 'M'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                <span>PROGRESS: {Math.round((tripProgress.coveredDist / tripProgress.totalDist) * 100)}%</span>
                <span style={{ color: '#00e5a0' }}>SAFE ROUTE ACTIVE</span>
              </div>
            </div>
          )}

            {routeDangerWarning && (
              <div className="danger-warning-banner" style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 15, background: "linear-gradient(135deg, #ff4d4d, #ff8c00)", color: "#fff", borderRadius: 12, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠️ Route passes through danger zone!</span>
                <button onClick={() => setRouteDangerWarning(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>✕</button>
              </div>
            )}

            {/* Tactical FABs Container (SOS Only) */}
            <div style={{
              position: 'absolute',
              bottom: '80px',
              left: '20px',
              zIndex: 16000
            }}>
              <button 
                className={`nr-sos-fab ${sosActive ? "active" : ""}`} 
                onClick={triggerSOS}
                style={{ position: 'relative', bottom: 'auto', left: 'auto' }}
              >
                <span style={{ fontSize: '24px' }}>🚨</span>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>SOS</span>
              </button>
            </div>

            {/* AI Agent reverted to Right Side for Desktop */}
            <TrinetraAgent embedded={false} />
          </div>

        {/* Right Panel */}
        <aside className="nr-right">
          <div className="panel-section">
            <div className="panel-title">Safety Score</div>
            <div className="score-bar-wrap">
              <div className="score-bar">
                <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
              </div>
              <span className="score-num" style={{ color: scoreColor }}>{score}%</span>
            </div>
            <SafetyChart data={scoreHistory} />
          </div>

          <div className="panel-section">
            <div className="panel-title">Active Alerts ({alerts.length})</div>
            {alerts.length === 0 && <div className="no-alerts">✅ No alerts nearby</div>}
            {alerts.map((a, i) => (
              <div key={i} className="alert-card">
                <div className="alert-dot" />
                <div><div className="alert-type">{a.type}</div><div className="alert-meta">{a.time || "Recent"}</div></div>
              </div>
            ))}
          </div>

          <div className="panel-section">
            <div className="panel-title" style={{ color: '#ea4335', display: 'flex', justifyContent: 'space-between' }}>
              <span>🚨 RECENT INCIDENTS</span>
              <Link to="/reports" style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'none' }}>VIEW ALL</Link>
            </div>
            {recentReports.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentReports.slice(0, 3).map((r, i) => (
                  <Link key={i} to="/reports" style={{ textDecoration: 'none' }}>
                    <div className="alert-card" style={{ border: '1px solid rgba(234,67,53,0.15)', background: 'rgba(234,67,53,0.05)' }}>
                      <div className="alert-dot" style={{ background: '#ea4335' }} />
                      <div style={{ flex: 1 }}>
                        <div className="alert-type" style={{ color: 'var(--text)' }}>Incident #{r.id.toString().slice(-4)}</div>
                        <div className="alert-meta" style={{ fontSize: 9 }}>{new Date(r.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Overlays & Modals */}
      {zoneCreatorOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--bg2)", borderRadius: 16, padding: 24, width: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontWeight: 700 }}>📍 Mark Zone</span>
              <button onClick={() => setZoneCreatorOpen(false)}>×</button>
            </div>
            <button onClick={() => {
              if (!position) {
                addToast("Please enable location first.", "info"); 
                setShowLocPrompt(true);
                return; 
              }
              const color = zoneType === "safe" ? "#34a853" : "#ea4335";
              try {
                L.circle([position[0], position[1]], { radius: zoneRadius, color, fillColor: color, fillOpacity: 0.12, weight: 2, opacity: 0.5, noClip: true })
                  .addTo(mapRef.current).bindPopup(`${zoneType === "safe" ? "🟢" : "🔴"} ${zoneType} zone`);
              } catch {}
              setZoneCreatorOpen(false);
              addToast(`${zoneType === "safe" ? "🟢 Safe" : "🔴 Danger"} zone marked!`, "success");
            }} style={{
              width: "100%", padding: 13,
              background: zoneType === "safe" ? "linear-gradient(135deg, #34a853, #2d8f4e)" : "linear-gradient(135deg, #ea4335, #c5221f)",
              border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>
              {zoneType === "safe" ? "🟢 Mark Safe Zone" : "🔴 Mark Danger Zone"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {dashboardContent}

      {/* Siren Playing Indicator and Stop Modal */}
      {sirenPlaying && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.85)", zIndex: 99999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(15px)",
        }}>
          <div style={{
            background: "#121420", border: "2px solid #ff4d4d",
            borderRadius: 32, padding: 40, textAlign: "center",
            maxWidth: 420, width: '90%', boxShadow: "0 0 60px rgba(255, 77, 77, 0.4)",
            animation: "pulse-sos 1s infinite",
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🚨</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ff4d4d", marginBottom: 12 }}>
              POLICE SIREN ACTIVE
            </h2>
            
            {resetFlow.active ? (
               <div className="fade-up">
                  {resetFlow.step === 1 ? (
                    <>
                      <p style={{ color: '#ccc', marginBottom: 20 }}>Enter the 6-digit OTP sent to your registered email.</p>
                      <input 
                        type="text" placeholder="Enter OTP"
                        value={resetFlow.inputOtp} onChange={e => setResetFlow({...resetFlow, inputOtp: e.target.value})}
                        style={{ width: '100%', padding: '15px', background: '#0a0c10', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '18px', textAlign: 'center', marginBottom: '20px', letterSpacing: '8px' }}
                      />
                      <button onClick={verifySirenOtp} style={{ width: '100%', padding: '15px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}>Verify OTP</button>
                    </>
                  ) : (
                    <>
                      <p style={{ color: '#ccc', marginBottom: 20 }}>Set a new secure SOS Password (min 4 digits).</p>
                      <input 
                        type="password" placeholder="New Password"
                        value={resetFlow.newPass} onChange={e => setResetFlow({...resetFlow, newPass: e.target.value})}
                        style={{ width: '100%', padding: '15px', background: '#0a0c10', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}
                      />
                      <button onClick={resetSirenPassword} style={{ width: '100%', padding: '15px', background: '#00e5a0', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 700 }}>Reset & Save</button>
                    </>
                  )}
                  <button onClick={() => setResetFlow({ active: false, step: 0, otp: "", inputOtp: "", newPass: "" })} style={{ background: 'none', border: 'none', color: '#666', marginTop: 20, cursor: 'pointer' }}>Cancel Reset</button>
               </div>
            ) : (
              <>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 24, lineHeight: 1.6 }}>
                  Loud siren active to draw attention. Stop it by entering your emergency password.
                </p>
                
                <input
                  type="password"
                  placeholder="Enter password to stop"
                  value={stopPasswordInput}
                  onChange={(e) => setStopPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && stopSiren()}
                  style={{
                    width: "100%", padding: "16px", marginBottom: 16,
                    background: "#0a0c10", border: "1px solid #333",
                    borderRadius: 12, color: "#fff", fontSize: 16,
                    outline: "none", textAlign: "center", letterSpacing: "0.2em",
                  }}
                />
                
                <button
                  onClick={stopSiren}
                  style={{
                    width: "100%", padding: "16px", background: "linear-gradient(135deg, #ff4d4d, #cc0000)",
                    color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800,
                    cursor: "pointer", transition: "all 0.2s", boxShadow: '0 8px 20px rgba(255, 77, 77, 0.3)'
                  }}
                >
                  Stop Siren
                </button>

                <button 
                  onClick={handleForgotSirenPass}
                  style={{ background: 'none', border: 'none', color: '#4285F4', fontSize: '13px', marginTop: '20px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot Password?
                </button>
              </>
            )}
            
            <div style={{ fontSize: 12, color: "#555", marginTop: 24, fontWeight: 600 }}>
              ⏱️ AUTO-STOP IN 5 MINUTES
            </div>
          </div>
        </div>
      )}

      {/* Initial Password Setup Modal */}
      {showPassSetup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-card fade-up" style={{ padding: 40, width: '90%', maxWidth: 400, textAlign: 'center', background: '#1a1d2e', borderRadius: 32, border: '1px solid var(--accent)' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🛡️</div>
            <h2 style={{ color: '#fff', marginBottom: 12 }}>Secure Your SOS</h2>
            <p style={{ color: '#ccc', fontSize: 14, marginBottom: 28 }}>To prevent unauthorized disabling of your emergency siren, please set a 4-digit SOS password.</p>
            <input 
              type="password" placeholder="Set 4-digit Password" 
              value={stopPasswordInput} onChange={e => setStopPasswordInput(e.target.value.slice(0, 4))}
              style={{ width: '100%', padding: '16px', background: '#0a0c10', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '20px', textAlign: 'center', marginBottom: '24px', letterSpacing: '0.5em' }}
            />
            <button 
              onClick={() => {
                if (stopPasswordInput.length < 4) { addToast("Password must be 4 digits", "danger"); return; }
                setSirenPassword(stopPasswordInput);
                localStorage.setItem("trinetra_siren_password", stopPasswordInput);
                setShowPassSetup(false);
                setStopPasswordInput("");
                addToast("SOS Password Saved! Keep it safe.", "success");
              }}
              style={{ width: '100%', padding: '16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700 }}
            >
              Save Password
            </button>
          </div>
        </div>
      )}
    </>
  );
}
