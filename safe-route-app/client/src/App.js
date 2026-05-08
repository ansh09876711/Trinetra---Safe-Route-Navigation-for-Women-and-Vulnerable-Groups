import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import SOS from "./pages/SOS";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Stations from "./pages/Stations";
import Taxi from "./pages/Taxi";
import SOSReports from "./pages/SOSReports";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SafetyGuidelines from "./pages/SafetyGuidelines";
import CommunityForum from "./pages/CommunityForum";
import HelpCenter from "./pages/HelpCenter";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import TrinetraAgent from "./components/TrinetraAgent";
import "./index.css";

// ── Auth Guard ──────────────────────────────────────────────────
// Checks localStorage for logged-in user. If not found → /login
function ProtectedRoute({ children }) {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("trinetra_user") || "null"); }
    catch { return null; }
  })();

  if (!user || !user.name) {
    // Redirect to login, preserve intended destination
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <TrinetraAgent />
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/"               element={<Landing />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/how-it-works"   element={<HowItWorks />} />
        <Route path="/privacy"        element={<PrivacyPolicy />} />
        <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
        <Route path="/community"      element={<CommunityForum />} />
        <Route path="/help"           element={<HelpCenter />} />

        {/* ── Protected Routes (login required) ── */}
        <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/enhanced-dashboard" element={<ProtectedRoute><EnhancedDashboard /></ProtectedRoute>} />
        <Route path="/sos"                element={<ProtectedRoute><SOS /></ProtectedRoute>} />
        <Route path="/profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/history"            element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/analytics"          element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/stations"           element={<ProtectedRoute><Stations /></ProtectedRoute>} />
        <Route path="/taxi"               element={<ProtectedRoute><Taxi /></ProtectedRoute>} />
        <Route path="/reports"            element={<ProtectedRoute><SOSReports /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
