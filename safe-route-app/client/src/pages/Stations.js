import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const TYPE_CONFIG = {
  Police:     { color: "#0095ff", bg: "rgba(0,149,255,0.1)",  border: "rgba(0,149,255,0.25)",  icon: "🚔" },
  Hospital:   { color: "#ff4d4d", bg: "rgba(255,77,77,0.1)",  border: "rgba(255,77,77,0.25)",  icon: "🏥" },
  Fire:       { color: "#ff8c00", bg: "rgba(255,140,0,0.1)",  border: "rgba(255,140,0,0.25)",  icon: "🚒" },
  Government: { color: "#00e5a0", bg: "rgba(0,229,160,0.1)",  border: "rgba(0,229,160,0.25)",  icon: "🏛️" },
};

// Overpass API query — 5 km radius around user
function buildOverpassQuery(lat, lng) {
  const r = 5000; // 5 km
  return `
    [out:json][timeout:25];
    (
      node["amenity"="police"](around:${r},${lat},${lng});
      way["amenity"="police"](around:${r},${lat},${lng});
      node["amenity"="hospital"](around:${r},${lat},${lng});
      way["amenity"="hospital"](around:${r},${lat},${lng});
      node["amenity"="fire_station"](around:${r},${lat},${lng});
      way["amenity"="fire_station"](around:${r},${lat},${lng});
      node["office"="government"](around:${r},${lat},${lng});
      node["amenity"="townhall"](around:${r},${lat},${lng});
    );
    out center 40;
  `;
}

function amenityToType(amenity, office) {
  if (amenity === "police") return "Police";
  if (amenity === "hospital") return "Hospital";
  if (amenity === "fire_station") return "Fire";
  if (office === "government" || amenity === "townhall") return "Government";
  return "Government";
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function navigateToDashboard(station) {
  sessionStorage.setItem("nr_route_to", JSON.stringify({
    lat: station.lat, lng: station.lng,
    name: station.name, icon: station.icon,
  }));
  window.location.href = "/dashboard?route=1";
}

function StationCard({ station, dist }) {
  const cfg = TYPE_CONFIG[station.type] || TYPE_CONFIG.Police;
  const phone = station.phone || "";
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const telUrl = cleanPhone ? `tel:${cleanPhone}` : null;
  const smsUrl = cleanPhone ? `sms:${cleanPhone}?body=${encodeURIComponent(`EMERGENCY: I need help. I am currently near ${station.name}. Please assist immediately.`)}` : null;

  return (
    <div style={{
      background: "var(--bg3)",
      border: `1px solid ${cfg.border}`,
      borderRadius: 14, padding: "14px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
        }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{station.name}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", color: cfg.color, background: cfg.bg,
              padding: "2px 6px", borderRadius: 99,
            }}>{station.type}</span>
          </div>
          {station.address && (
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, lineHeight: 1.4 }}>
              {station.address}
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: 10, color: cfg.color,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              padding: "2px 8px", borderRadius: 99,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              📍 {dist !== null ? formatDist(dist) : "Nearby"}
            </span>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>🕐 24/7</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => navigateToDashboard(station)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px", background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 9, color: cfg.color,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          📍 Directions
        </button>
        {telUrl ? (
          <a href={telUrl} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px", background: "rgba(0,149,255,0.1)", border: "1px solid rgba(0,149,255,0.25)",
            borderRadius: 9, color: "#60b8ff", fontSize: 12, fontWeight: 600,
            textDecoration: "none", fontFamily: "inherit",
          }}>📞 Call</a>
        ) : (
          <span style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "8px", background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 9, color: "var(--text3)", fontSize: 12,
          }}>No Phone</span>
        )}
        {smsUrl && (
          <a href={smsUrl} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px", background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 9, color: "var(--accent)", fontSize: 12, fontWeight: 600,
            textDecoration: "none", fontFamily: "inherit",
          }}>💬 SMS</a>
        )}
      </div>
    </div>
  );
}

export default function Stations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [userPos, setUserPos] = useState(() => {
    const saved = localStorage.getItem("trinetra_last_pos");
    return saved ? JSON.parse(saved) : null;
  });
  const [stations, setStations] = useState(() => {
    const saved = localStorage.getItem("trinetra_cached_stations");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!localStorage.getItem("trinetra_cached_stations"));
  const [locError, setLocError] = useState("");
  const [areaName, setAreaName] = useState(() => {
    return localStorage.getItem("trinetra_last_area") || "your location";
  });

  const loggedInUser = JSON.parse(localStorage.getItem("trinetra_user") || "{}");
  const userName = loggedInUser.name || "User";
  const userInitials = (loggedInUser.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("trinetra_user");
    window.location.href = "/";
  };

  const types = ["All", "Police", "Hospital", "Fire", "Government"];

  // Fetch real nearby stations from Overpass API
  async function fetchNearbyStations(lat, lng) {
    setLoading(true);
    try {
      const query = buildOverpassQuery(lat, lng);
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      
      if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Overpass API returned non-JSON data (possibly a timeout page).");
      }

      const data = await res.json();

      const parsed = data.elements
        .filter(el => {
          const slat = el.lat ?? el.center?.lat;
          const slng = el.lon ?? el.center?.lon;
          return slat && slng;
        })
        .map((el, i) => {
          const slat = el.lat ?? el.center?.lat;
          const slng = el.lon ?? el.center?.lon;
          const tags = el.tags || {};
          const type = amenityToType(tags.amenity, tags.office);
          const name = tags.name || tags["name:en"] || `${type} Station`;
          const address = [
            tags["addr:housename"],
            tags["addr:street"],
            tags["addr:suburb"] || tags["addr:city"],
          ].filter(Boolean).join(", ") || "";

          // Deep phone detection
          let phone = tags.phone || 
                      tags["contact:phone"] || 
                      tags["contact:mobile"] || 
                      tags["emergency:phone"] || 
                      tags["phone:emergency"] || 
                      tags["operator:phone"] || "";

          // Fallback for Indian emergency numbers if none found
          if (!phone) {
            if (type === "Police") phone = "100";
            else if (type === "Hospital") phone = "108";
            else if (type === "Fire") phone = "101";
            else phone = "112";
          }

          return {
            id: el.id || i,
            type, name, address, phone,
            lat: slat, lng: slng,
            icon: TYPE_CONFIG[type]?.icon || "📍",
          };
        });

      // Remove duplicates by name + type
      const seen = new Set();
      const unique = parsed.filter(s => {
        const key = `${s.type}::${s.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setStations(unique);
      localStorage.setItem("trinetra_cached_stations", JSON.stringify(unique));
    } catch (err) {
      console.error("Overpass fetch error:", err);
      if (stations.length === 0) {
        setLocError("Could not fetch nearby stations. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Reverse geocode for area name
  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const data = await res.json();
      const a = data.address || {};
      const name = a.suburb || a.neighbourhood || a.city || a.town || a.district || "your area";
      setAreaName(name);
      localStorage.setItem("trinetra_last_area", name);
    } catch {}
  }

  useEffect(() => {
    // If we have cached position, trigger a refresh immediately
    if (userPos) {
      fetchNearbyStations(userPos[0], userPos[1]);
      reverseGeocode(userPos[0], userPos[1]);
    }

    if (!navigator.geolocation) {
      setLocError("Location not supported by your browser.");
      setLoading(false);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: false, // Set to false for faster initial lock
      timeout: 8000,
      maximumAge: 60000 // Use location cached up to 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPos([lat, lng]);
        localStorage.setItem("trinetra_last_pos", JSON.stringify([lat, lng]));
        
        // Parallel fetch
        Promise.all([
          fetchNearbyStations(lat, lng),
          reverseGeocode(lat, lng)
        ]);
      },
      (err) => {
        if (!userPos) {
          setLocError("Location access denied. Enable GPS to see nearby stations.");
          setLoading(false);
        }
      },
      geoOptions
    );
  }, []);

  // Filter + sort by distance
  const filtered = filter === "All" ? stations : stations.filter(s => s.type === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (!userPos) return 0;
    return getDistance(userPos[0], userPos[1], a.lat, a.lng)
         - getDistance(userPos[0], userPos[1], b.lat, b.lng);
  });

  const filterCount = {};
  types.forEach(t => {
    filterCount[t] = t === "All" ? stations.length : stations.filter(s => s.type === t).length;
  });

  return (
    <div className="nr-root" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .st-panel { animation: slideUp 0.35s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* TOPBAR */}
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <button className="topbar-btn" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none" }}>
          <FaBars size={20} color="var(--text2)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚉</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Safe Stations</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          {loading ? "Fetching..." : `${sorted.length} place${sorted.length !== 1 ? "s" : ""}`}
        </div>
      </header>

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={loggedInUser} 
        onLogout={handleLogout}
      />

      {/* MAIN GRID */}
      <div className="st-grid" style={{
        display: "grid", gridTemplateColumns: "280px 1fr",
        flex: 1, minHeight: "calc(100vh - 57px)",
      }}>

        {/* LEFT — Filters */}
        <aside className="st-panel" style={{
          background: "var(--bg2)", borderRight: "1px solid var(--border)",
          padding: "20px 14px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto",
        }}>
          <div>
            <div className="panel-title" style={{ marginBottom: 12 }}>Categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {types.map((t) => {
                const cfg = TYPE_CONFIG[t];
                const isActive = filter === t;
                return (
                  <button key={t} onClick={() => setFilter(t)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 12px", borderRadius: 10, border: "1px solid",
                    borderColor: isActive && cfg ? cfg.border : isActive ? "var(--accent)" : "var(--border)",
                    background: isActive && cfg ? cfg.bg : isActive ? "rgba(0,229,160,0.1)" : "var(--bg3)",
                    color: isActive && cfg ? cfg.color : isActive ? "var(--accent)" : "var(--text2)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 18 }}>{t === "All" ? "📋" : cfg?.icon}</span>
                    <span style={{ flex: 1 }}>{t}</span>
                    <span style={{
                      fontSize: 10, background: isActive && cfg ? cfg.bg : "var(--bg2)",
                      padding: "2px 8px", borderRadius: 99,
                      color: isActive && cfg ? cfg.color : "var(--text3)",
                    }}>{filterCount[t] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location status */}
          <div style={{
            padding: "12px", borderRadius: 12,
            background: userPos ? "rgba(0,229,160,0.05)" : "rgba(255,77,77,0.05)",
            border: `1px solid ${userPos ? "rgba(0,229,160,0.15)" : "rgba(255,77,77,0.15)"}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: userPos ? "var(--accent)" : "var(--danger)", marginBottom: 4 }}>
              {userPos ? "📍 Location Active" : "📍 Location Needed"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>
              {userPos
                ? `Showing stations near ${areaName}, sorted by distance.`
                : locError || "Enable GPS to see nearby stations."}
            </div>
          </div>

          <div style={{
            marginTop: "auto", padding: "14px",
            background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)",
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              💡 Quick Tip
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>
              Tap "Directions" to open route on Dashboard map. Call or SMS directly.
            </div>
          </div>
        </aside>

        {/* RIGHT — Station Cards */}
        <main className="st-panel" style={{ background: "var(--bg)", padding: "20px", overflowY: "auto" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                {filter === "All" ? "All Safe Stations" : `${filter} Stations`}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                {loading
                  ? "🔍 Finding stations near you..."
                  : userPos
                    ? `${sorted.length} place${sorted.length !== 1 ? "s" : ""} near ${areaName} · Sorted by distance`
                    : `${sorted.length} place${sorted.length !== 1 ? "s" : ""}`}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "60px 20px", gap: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  border: "3px solid var(--border)",
                  borderTop: "3px solid var(--accent)",
                  animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ color: "var(--text3)", fontSize: 13 }}>
                  Getting your location & fetching nearby stations...
                </div>
              </div>
            )}

            {/* Error state */}
            {!loading && locError && stations.length === 0 && (
              <div style={{
                padding: "32px", textAlign: "center",
                background: "rgba(255,77,77,0.06)",
                border: "1px solid rgba(255,77,77,0.2)",
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
                <div style={{ color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>Location Required</div>
                <div style={{ color: "var(--text3)", fontSize: 13 }}>{locError}</div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !locError && sorted.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text3)" }}>
                No {filter !== "All" ? filter : ""} stations found nearby.
              </div>
            )}

            {/* Cards */}
            {!loading && sorted.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                dist={userPos ? getDistance(userPos[0], userPos[1], station.lat, station.lng) : null}
              />
            ))}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav" style={{ display: "flex" }}>
        {[
          { to: "/", icon: "🏠", label: "Home" },
          { to: "/sos", icon: "🆘", label: "SOS" },
          { to: "/stations", icon: "🚉", label: "Stations", active: true },
          { to: "/history", icon: "📜", label: "History" },
          { to: "/profile", icon: "👤", label: "Profile" },
        ].map((tab) => (
          <Link key={tab.to} to={tab.to} className={`mob-tab ${tab.active ? "active" : ""}`} style={{ textDecoration: "none" }}>
            <span className="mob-tab-icon">{tab.icon}</span>
            <span className="mob-tab-label">{tab.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .st-grid { display: flex !important; flex-direction: column !important; min-height: auto !important; padding-bottom: 70px !important; }
          .st-grid > aside { order: 0; border-right: none !important; border-bottom: 1px solid var(--border); }
          .st-grid > main { order: 1; min-height: 400px; }
          .mobile-bottom-nav { display: flex !important; }
        }
        @media (min-width: 901px) { .mobile-bottom-nav { display: none !important; } }
        .panel-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
      `}</style>
    </div>
  );
}
