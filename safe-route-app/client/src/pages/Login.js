import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { FaEnvelope, FaLock, FaUserShield, FaArrowRight, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../components/Logo";
import "./Login_v2.css";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let targetEmail = identifier;

    // --- 1. MASTER ADMIN (Team Management View) ---
    if (identifier === "admin@trinetra.com" && password === "Admin@9977") {
      localStorage.setItem("trinetra_user", JSON.stringify({
        id: "admin-master", 
        email: "admin@trinetra.com", 
        role: "admin", 
        name: "Admin Control",
        startTab: "team" // Start on Team Grid
      }));
      localStorage.setItem("trinetra_pass", password);
      navigate("/admin-dashboard");
      return;
    }

    // --- 2. SUPREME COMMISSIONER (War Room View) ---
    if (identifier === "chief@trinetra.gov.in" && password === "CHIEF#TRINETRA") {
      localStorage.setItem("trinetra_user", JSON.stringify({
        id: "commissioner-supreme", 
        email: "chief@trinetra.gov.in", 
        role: "admin", 
        name: "Supreme Commissioner",
        startTab: "overview" // Start on War Room Widgets
      }));
      localStorage.setItem("trinetra_pass", password);
      navigate("/admin-dashboard");
      return;
    }

    try {
      if (!identifier.includes("@")) {
        const q = query(collection(db, "users"), where("name", "==", identifier));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          targetEmail = querySnapshot.docs[0].data().email;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = { id: userCredential.user.uid, ...userDoc.data() };
        localStorage.setItem("trinetra_user", JSON.stringify(userData));
        localStorage.setItem("trinetra_pass", password);

        if (userData.status === "pending") {
          await auth.signOut();
          localStorage.clear();
          setError("ACCOUNT_PENDING: Your identity is currently being verified by the Helpdesk. Please wait for the confirmation email.");
          return;
        }

        if (userData.accountType === "divisional") {
          navigate(`/division-dashboard/${userData.divisionId}`);
        } else if (userData.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        localStorage.setItem("trinetra_user", JSON.stringify({ id: userCredential.user.uid, email: targetEmail, role: 'user' }));
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid credentials or access denied.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <Link to="/" className="back-home-v2">
        <FaArrowRight style={{ transform: 'rotate(180deg)' }} /> BACK TO HOME
      </Link>

      <div className="login-container">
        {/* Left Section: Visual */}
        <div className="login-visual" style={{ backgroundImage: `url('/login_bg.png')` }}>
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <Logo height={50} />
            <h1 style={{ marginTop: '30px' }}>WELCOME<br/>BACK!</h1>
            <p>Access the TRINETRA secure command center and stay protected with real-time AI intelligence.</p>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="login-form-area">
          <div className="form-header">
            <h2>Login</h2>
            <p>Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-field">
              <label>Name or Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  type="text" placeholder="name@example.com" required 
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)} 
                />
              </div>
            </div>

            <div className="input-field">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            <a href="#" className="forgot-link">Forgot password?</a>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="login-action-btn" disabled={loading}>
              {loading ? "VERIFYING..." : "LOGIN TO PORTAL"} <FaArrowRight />
            </button>
          </form>

          <div className="register-prompt">
            Don't have an account? <Link to="/register">Create Account</Link>
          </div>

          <div className="secure-tag" style={{ marginTop: '30px', justifyContent: 'center' }}>
            <FaShieldAlt /> SECURE ENCRYPTED CHANNEL
          </div>
        </div>
      </div>
    </div>
  );
}
