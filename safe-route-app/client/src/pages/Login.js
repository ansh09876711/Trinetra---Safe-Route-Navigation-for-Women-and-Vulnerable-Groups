import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import "./Landing.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("trinetra_user")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("trinetra_user", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="hero-mesh">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      <div style={{
        width: '100%', maxWidth: '400px', padding: '40px',
        background: 'var(--glass)', borderRadius: '30px',
        border: '1px solid var(--border)', backdropFilter: 'blur(40px)',
        zIndex: 10, animation: 'slideUp 0.5s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Logo height={40} />
          <h2 className="gradient-text" style={{ marginTop: '24px', fontSize: '28px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '8px' }}>Login to your safety companion</p>
        </div>

        {error && (
          <div style={{
            padding: '12px', background: 'rgba(255,77,77,0.1)',
            border: '1px solid rgba(255,77,77,0.2)', borderRadius: '12px',
            color: '#ff8080', fontSize: '13px', marginBottom: '20px', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text2)', marginLeft: '4px' }}>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: '12px', color: 'var(--text)', outline: 'none', fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text2)', marginLeft: '4px' }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: '12px', color: 'var(--text)', outline: 'none', fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hero-cta-primary"
            style={{ width: '100%', marginTop: '12px', height: '52px' }}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text3)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
