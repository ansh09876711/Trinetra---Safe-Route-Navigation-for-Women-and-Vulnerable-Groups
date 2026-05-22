import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Logo from "../components/Logo";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import "./Landing.css";

import "./Login_v2.css";
import { FaUser, FaPhone, FaIdCard, FaEnvelope, FaLock, FaCamera, FaUpload, FaShieldAlt } from "react-icons/fa";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(true); 
  const [toasts, setToasts] = useState([]);
  const [otpModal, setOtpModal] = useState({ open: false, type: "", value: "", input: "" });
  const [verifying, setVerifying] = useState({ email: false, mobile: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showFakeSms, setShowFakeSms] = useState(null);
  const navigate = useNavigate();
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [biometricPhoto, setBiometricPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAadhaarFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('biometric-video');
      if (video) video.srcObject = stream;
    } catch (err) {
      addToast("Camera access denied", "danger");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById('biometric-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/png');
    setBiometricPhoto(data);
    
    const stream = video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(t => t.stop());
    setCameraActive(false);
    addToast("Biometric snapshot captured", "success");
  };

  const handleAadhaarVerify = () => {
    if (aadhaar.length !== 12) return addToast("Invalid Aadhaar Number", "danger");
    if (mobile.length !== 10) return addToast("Please enter your 10-digit mobile number linked to Aadhaar", "warning");
    sendOtp('aadhaar');
  };

  const sendOtp = async (type) => {
    let value = "";
    if (type === 'email') value = email;
    else if (type === 'aadhaar') value = aadhaar;
    else value = mobile;

    if (!value) { 
      addToast(`Please enter your ${type} number/address first`, "danger"); 
      return; 
    }
    
    // 🚨 UPDATE THIS URL AFTER DEPLOYING BACKEND (e.g. https://your-app.onrender.com)
    const BACKEND_URL = "http://127.0.0.1:5005";

    setOtpModal({ open: true, type, value, input: "" });
    addToast(`Sending verification code to ${type}...`, "info");

    try {
      const res = await fetch(`${BACKEND_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`✅ Verification code has been sent!`, "success");
      } else {
        addToast(data.error || "Failed to send verification code.", "danger");
      }
    } catch (e) {
      console.error("OTP Error:", e);
      addToast("Connection to Security Server failed. Ensure backend is live.", "danger");
    }
  };

  const verifyOtp = async () => {
    // Master code still works for emergencies
    if (otpModal.input === "123456") {
      if (otpModal.type === 'email') setEmailVerified(true);
      else if (otpModal.type === 'aadhaar') setAadhaarVerified(true);
      else setMobileVerified(true);
      setOtpModal({ ...otpModal, open: false });
      return addToast(`Identity verified successfully!`, "success");
    }

    const BACKEND_URL = "http://127.0.0.1:5005";
    try {
      const res = await fetch(`${BACKEND_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: otpModal.value, otp: otpModal.input }),
      });
      const data = await res.json();
      if (res.ok) {
        if (otpModal.type === 'email') setEmailVerified(true);
        else if (otpModal.type === 'aadhaar') setAadhaarVerified(true);
        else setMobileVerified(true);
        setOtpModal({ ...otpModal, open: false });
        addToast(`Identity verified successfully!`, "success");
      } else {
        addToast(data.error || "Invalid verification code. Please try again.", "danger");
      }
    } catch (e) {
      addToast("Verification service unavailable.", "danger");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("trinetra_user")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!emailVerified) return addToast("Verify Email first", "danger");
    if (!aadhaarVerified) return addToast("Verify Aadhaar first", "danger");
    if (!aadhaarFile) return addToast("Aadhaar Card document required", "danger");
    if (!biometricPhoto) return addToast("Biometric Photo required", "danger");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        name,
        email,
        mobile,
        aadhaar,
        aadhaarFile,
        photo: biometricPhoto,
        status: 'pending', 
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userData);
      addToast("Application submitted. Pending Helpdesk approval.", "success");
      
      await auth.signOut();
      localStorage.clear();
      
      alert("SUCCESS: Your application has been submitted to TRINETRA Helpdesk. Once verified, you will receive an email and can then login.");
      navigate("/login");

    } catch (err) {
      setError(err.message);
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
        <div className="login-visual" style={{ backgroundImage: `url('/register_bg.png')` }}>
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <Logo height={50} />
            <h1 style={{ marginTop: '30px' }}>SECURE<br/>ENROLLMENT</h1>
            <p>Join the TRINETRA network. Your safety is verified through our multi-layered AI security protocol.</p>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="login-form-area">
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Enter your details for identity verification</p>
          </div>

          {error && (
            <div style={{
              padding: '12px', background: 'rgba(255,77,77,0.1)',
              border: '1px solid rgba(255,77,77,0.2)', borderRadius: '12px',
              color: '#ff8080', fontSize: '12px', marginBottom: '20px', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="auth-grid-v2">
              <div className="input-field">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input type="text" required placeholder="Legal Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
              <div className="input-field">
                <label>Mobile Number</label>
                <div className="input-wrapper">
                  <FaPhone className="input-icon" />
                  <input type="text" required placeholder="10 Digit Mobile" maxLength="10" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="input-field">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Aadhaar Number {aadhaarVerified && <span style={{ color: '#00e5a0' }}>✓ Verified</span>}
              </label>
              <div className="input-wrapper">
                <FaIdCard className="input-icon" />
                <input type="text" required placeholder="12 Digit Aadhaar" maxLength="12" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
                {!aadhaarVerified && (
                  <button type="button" className="verify-btn-v2" onClick={handleAadhaarVerify}>Verify</button>
                )}
              </div>
            </div>

            <div className="input-field" style={{ marginTop: '10px' }}>
              <input type="file" id="aadhaar-upload" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              <label htmlFor="aadhaar-upload" className="upload-label-v2">
                {aadhaarFile ? "✅ Aadhaar Card Selected" : "⬆ Upload Aadhaar Card (Image)"}
              </label>
              {aadhaarFile && (
                <div style={{ marginTop: '10px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--p-border)' }}>
                  <img src={aadhaarFile} alt="Aadhaar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="input-field" style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  Biometric Capture {biometricPhoto && <span style={{ color: '#00e5a0' }}>✓ Captured</span>}
              </label>
              
              {!cameraActive && !biometricPhoto ? (
                <button type="button" className="upload-label-v2" onClick={startCamera} style={{ width: '100%', color: 'var(--p-accent)', fontWeight: 800 }}>
                  📷 Open Neural Face Scan
                </button>
              ) : (
                <div className="biometric-area-v2" style={{ boxShadow: cameraActive ? '0 0 30px rgba(0, 229, 160, 0.2)' : 'none' }}>
                  {cameraActive ? (
                    <>
                      <video id="biometric-video" autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(124, 58, 237, 0.3)', borderRadius: '20px', pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', border: '2px solid var(--p-secondary)', borderRadius: '50%', opacity: 0.5, animation: 'pulseScan 2s infinite' }}></div>
                        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '2px', background: 'linear-gradient(to right, transparent, var(--p-secondary), transparent)', animation: 'scanLine 3s infinite linear' }}></div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button type="button" onClick={() => setCameraActive(false)} style={{ background: 'rgba(255,77,77,0.2)', color: '#ff4d4d', border: 'none', padding: '8px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: 800 }}>CANCEL</button>
                        <button type="button" onClick={capturePhoto} style={{ background: 'var(--p-primary)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 900, fontSize: '11px' }}>TAKE SCAN</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img src={biometricPhoto} alt="Biometric" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => setBiometricPhoto(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px' }}>RESCAN</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="auth-grid-v2">
              <div className="input-field">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Email {emailVerified && <span style={{ color: '#00e5a0' }}>✓</span>}
                </label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  {!emailVerified && <button type="button" className="verify-btn-v2" onClick={() => sendOtp('email')}>Verify</button>}
                </div>
              </div>
              <div className="input-field">
                <label>Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !emailVerified || !aadhaarVerified || !biometricPhoto}
              className="login-action-btn"
              style={{ marginTop: '10px' }}
            >
              {loading ? "ENROLLING..." : "SUBMIT APPLICATION"} <FaArrowRight />
            </button>
          </form>

          <div className="register-prompt">
            Already have an account? <Link to="/login">Login here</Link>
          </div>

          <div className="secure-tag" style={{ marginTop: '30px', justifyContent: 'center' }}>
            <FaShieldAlt /> ENCRYPTED BIOMETRIC CHANNEL
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 50000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)' }}>
          <div style={{ background: '#1a1033', padding: '35px', borderRadius: '32px', width: '90%', maxWidth: '380px', textAlign: 'center', border: '1px solid var(--p-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '24px' }}>Verify {otpModal.type === 'email' ? 'Email' : 'Aadhaar'}</h3>
            <p style={{ color: 'var(--p-text-dim)', fontSize: '14px', marginBottom: '24px' }}>Enter the code sent to<br/><b>{otpModal.value}</b></p>
            <input 
              type="text" maxLength="6" placeholder="000000"
              value={otpModal.input} onChange={e => setOtpModal({...otpModal, input: e.target.value})}
              style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--p-border)', borderRadius: '16px', color: '#fff', fontSize: '28px', textAlign: 'center', marginBottom: '25px', letterSpacing: '10px', outline: 'none' }}
            />
            <button onClick={verifyOtp} className="login-action-btn">VERIFY IDENTITY</button>
            <button onClick={() => setOtpModal({...otpModal, open: false})} style={{ background: 'none', border: 'none', color: 'var(--p-text-dim)', marginTop: '20px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Fake SMS Simulation */}
      {showFakeSms && (
        <div className="sms-notif" style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', zIndex: 60000, width: '90%', maxWidth: '350px', background: 'rgba(15, 10, 25, 0.95)', borderRadius: '24px', padding: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', animation: 'slideDownSms 0.5s ease' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, var(--p-primary), var(--p-secondary))', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px' }}><FaEnvelope /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '10px', color: 'var(--p-accent)', letterSpacing: '1px' }}>SECURITY PORTAL</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Verification Code: <b style={{ color: 'var(--p-accent)' }}>{showFakeSms.otp}</b></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseScan {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes scanLine {
          from { top: 0; }
          to { top: 100%; }
        }
        @keyframes slideDownSms {
          from { transform: translate(-50%, -100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Toast Overlay */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 60000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '16px 24px', borderRadius: '16px', 
            background: t.type === 'success' ? 'linear-gradient(135deg, #00e5a0, #00b87a)' : 'linear-gradient(135deg, #ff4d4d, #cc0000)',
            color: t.type === 'success' ? '#000' : '#fff', fontWeight: 800, fontSize: '14px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.5)', animation: 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: '1px solid rgba(255,255,255,0.2)', minWidth: '320px'
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
