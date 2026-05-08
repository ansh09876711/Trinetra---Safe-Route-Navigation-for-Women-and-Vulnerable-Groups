import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaMicrophone, FaRobot, FaTimes, FaDownload, FaExclamationTriangle } from "react-icons/fa";
import "./TrinetraAgent.css";

const GROQ_KEY = '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';

export default function TrinetraAgent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [aiPetName, setAiPetName] = useState(localStorage.getItem("trinetra_pet_name") || "");
  
  const aiActiveRef = useRef(false);
  const aiListeningRef = useRef(false);
  const aiLockRef = useRef(false);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const lastMicLevelRef = useRef(0);
  const sosActiveRef = useRef(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // ── INIT VOICE ENGINE ──
  const initVoiceAI = async () => {
    try {
      // Resume if already exists
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
            console.log("🔊 Trinetra AI: AudioContext Resumed");
        }
        if (aiListeningRef.current) return;
      }

      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
      }

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(streamRef.current);
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      setListening(true);
      aiListeningRef.current = true;
      console.log("🤖 Trinetra AI Engine: ONLINE");
      startCommandEngine();
    } catch (err) {
      console.error("Mic Error:", err);
      setTranscript("❌ Microphone error. Please allow mic access.");
    }
  };

  const startCommandEngine = () => {
    let isSpeaking = false;
    let silenceStart = 0;
    let speechStart = 0;

    const startVADRecorder = async () => {
        if (!streamRef.current) return;
        try {
            recorderRef.current = new MediaRecorder(streamRef.current);
            recorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorderRef.current.onstop = () => {
                if (chunksRef.current.length > 0) {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    transcribeAudio(blob);
                }
                chunksRef.current = [];
            };
            recorderRef.current.start();
        } catch(e) { console.error("Recorder Error:", e); }
    };

    const monitorVAD = () => {
      if (!analyserRef.current || !aiListeningRef.current) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const level = (sum / dataArray.length);
      setMicLevel(level * 4);
      lastMicLevelRef.current = level;
      
      const now = Date.now();
      // ULTRA SENSITIVITY (Threshold 5)
      if (level > 5) { 
        silenceStart = 0;
        if (!isSpeaking) {
          isSpeaking = true;
          speechStart = now;
          startVADRecorder();
        }
      } else if (isSpeaking) {
        if (silenceStart === 0) silenceStart = now;
        if (now - silenceStart > 1200) {
          if (recorderRef.current && recorderRef.current.state === 'recording') {
            recorderRef.current.stop();
          }
          isSpeaking = false;
          silenceStart = 0;
        }
      }
      requestAnimationFrame(monitorVAD);
    };
    monitorVAD();
  };

  const transcribeAudio = async (blob) => {
    if (aiLockRef.current) return;
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("prompt", "Trinetra safety app. Commands: open history, analytics, safe stations, SOS. Hinglish support: Bachao, chalo, dikhao, rasta.");

    setThinking(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_KEY}` },
        body: formData
      });
      setThinking(false);
      const data = await res.json();
      const text = data.text?.toLowerCase()?.trim();
      if (!text || text.length < 2) return;

      console.log("🎤 AI Processing:", text);

      // ── IMPROVED COMMAND DETECTION (Sleep Priority) ──
      if (!aiActiveRef.current) {
          const sleepWords = ["bye", "sleep", "stop", "close"];
          const wakeWords = ["trinetra", "netra", "tra", "tree netra", "tri netra", "try netra", "hey netra", "hello", "hey", "trini"];
          
          // Check for SLEEP first
          if (sleepWords.some(word => text.includes(word))) {
              setActive(false);
              aiActiveRef.current = false;
              setTranscript("");
              return;
          }

          // Check for WAKE
          if (wakeWords.some(word => text.includes(word))) {
              console.log("⭐ WAKE WORD DETECTED:", text);
              activateAI();
              // Extract any following command
              const parts = text.split(/trinetra|netra|hello|hey|tree|tri|try|trini/);
              const cmd = parts[parts.length - 1].trim();
              if (cmd.length > 2) setTimeout(() => processCommand(cmd), 1200);
              return;
          }
          return; 
      }

      setTranscript(`🧠 ${text}`);
      processCommand(text);
    } catch (err) {}
  };

  const activateAI = () => {
    aiActiveRef.current = true;
    setActive(true);
    speak("Hello! I am Trinetra. How can I help you today?");
  };

  const processCommand = (text) => {
    // ── NAVIGATION ──
    if (text.includes("open") || text.includes("go to") || text.includes("show") || text.includes("take me to")) {
      if (text.includes("report") || text.includes("sos reports") || text.includes("incident")) {
        speak("Opening SOS reports page.");
        navigate("/reports"); return;
      }
      if (text.includes("dashboard") || text.includes("home")) {
        speak("Heading to your dashboard.");
        navigate("/dashboard"); return;
      }
      if (text.includes("profile") || text.includes("account")) {
        speak("Opening your profile.");
        navigate("/profile"); return;
      }
      if (text.includes("analytics") || text.includes("stats") || text.includes("charts")) {
        speak("Opening safety analytics.");
        navigate("/analytics"); return;
      }
      if (text.includes("sos") || text.includes("emergency page") || text.includes("help page")) {
        speak("Opening emergency controls.");
        navigate("/sos"); return;
      }
      if (text.includes("history") || text.includes("past")) {
        speak("Showing your travel history.");
        navigate("/history"); return;
      }
      if (text.includes("station") || text.includes("safe stations")) {
        speak("Locating nearby safe stations.");
        navigate("/stations"); return;
      }
      if (text.includes("taxi") || text.includes("safe taxi") || text.includes("cab")) {
        speak("Opening safe taxi service.");
        navigate("/taxi"); return;
      }
    }

    // ── ACTIONS ──
    if (text.includes("download") && (text.includes("report") || text.includes("data"))) {
      downloadReports();
      speak("Generating and downloading your incident reports.");
      return;
    }

    // ── SYSTEM CONTROLS (Dispatched to Dashboard) ──
    if (text.includes("3d") || text.includes("three d")) {
      speak("Switching to 3D satellite view.");
      window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'toggle3D', value: true } }));
      return;
    }
    if (text.includes("2d") || text.includes("two d") || text.includes("flat")) {
      speak("Switching to 2D standard view.");
      window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'toggle3D', value: false } }));
      return;
    }
    if (text.includes("map style") || text.includes("change map") || text.includes("satellite")) {
      speak("Cycling map layers.");
      window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'cycleStyle' } }));
      return;
    }
    if (text.includes("dark") || text.includes("light") || text.includes("mode") || text.includes("theme")) {
      speak("Toggling application theme.");
      window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'toggleTheme' } }));
      return;
    }

    if (text.includes("where am i") || text.includes("my location") || text.includes("current location")) {
      speak("Checking your GPS coordinates. You are currently being tracked for safety.");
      window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'recenter' } }));
      return;
    }

    if (text.includes("bye") || text.includes("stop") || text.includes("sleep") || text.includes("close") || text.includes("khuda hafiz")) {
      aiActiveRef.current = false;
      setActive(false);
      speak("Trinetra AI going to sleep. Goodbye.");
      setTimeout(() => setTranscript(""), 2000);
      return;
    }

    // Default: Talk to Smart Brain
    askSmartAI(text);
  };

  const askSmartAI = async (userText) => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are TRINETRA Global AI. You help navigate the app. Commands: OPEN_REPORTS, OPEN_DASHBOARD, DOWNLOAD_DATA, TRIGGER_SOS. Be brief." },
            { role: "user", content: userText }
          ]
        })
      });
      const data = await response.json();
      const aiReply = data.choices[0].message.content;
      speak(aiReply);
      setTranscript(aiReply);
    } catch (err) {}
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    aiLockRef.current = true;
    u.onend = () => { aiLockRef.current = false; };
    window.speechSynthesis.speak(u);
  };

  const triggerSOS = () => {
    if (sosActiveRef.current) return;
    sosActiveRef.current = true;
    speak("SOS Triggered! I am alerting everyone.");
    // In a real app, this would hit a global event or context
    window.dispatchEvent(new CustomEvent('trinetra:sos')); 
    setTimeout(() => { sosActiveRef.current = false; }, 10000);
  };

  const downloadReports = () => {
    const data = localStorage.getItem("trinetra_sos_reports") || "[]";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trinetra_incident_report_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  // ── AUTO-START & RESUME LOGIC ──
  useEffect(() => {
    const handleAction = () => {
        initVoiceAI();
    };
    
    // Resume on focus (Browsers often suspend background tabs)
    const handleFocus = () => {
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    window.addEventListener('click', handleAction, { once: true });
    window.addEventListener('touchstart', handleAction, { once: true });
    window.addEventListener('focus', handleFocus);
    
    return () => {
        window.removeEventListener('click', handleAction);
        window.removeEventListener('touchstart', handleAction);
        window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className={`trinetra-global-agent ${active ? "agent-active" : ""}`}>
      {/* Global HUD Transcript (Top) */}
      {(transcript || thinking) && (
        <div className="global-ai-hud fade-down">
            <div className="hud-content">
                <span className="hud-icon">{thinking ? "🧠" : "🔊"}</span>
                <span className="hud-text">{thinking ? "Thinking..." : transcript}</span>
            </div>
        </div>
      )}

      <div className={`agent-orb ${thinking ? "thinking" : ""} ${micLevel > 5 ? "hearing" : ""}`} 
           onClick={() => { 
             setActive(!active); 
             initVoiceAI(); // Force init on click
           }}>
        <div className="orb-inner">
            <FaRobot />
            <div className="mic-wave" style={{ transform: `scale(${1 + micLevel/50})` }}></div>
        </div>
      </div>
      
      {active && (
        <div className="agent-panel glass-card fade-up">
           <div className="agent-header">
              <span>TRINETRA GLOBAL AI</span>
              <button onClick={() => setActive(false)}><FaTimes /></button>
           </div>
           <div className="agent-body">
              <p className="transcript">{transcript || "How can I help you today?"}</p>
              <div className="listening-indicator">
                 <div className="dot"></div>
                 <span>{listening ? "AI Listening" : "Initializing..."}</span>
              </div>
              {/* Visual Level Meter */}
              <div className="voice-meter">
                 <div className="meter-fill" style={{ width: `${Math.min(100, micLevel * 2)}%`, background: micLevel > 5 ? '#00e5a0' : '#00d2ff' }}></div>
              </div>
           </div>
           <div className="agent-footer">
              <button onClick={downloadReports} title="Download Data"><FaDownload /></button>
              <button onClick={triggerSOS} className="btn-sos" title="Trigger SOS"><FaExclamationTriangle /></button>
           </div>
        </div>
      )}
    </div>
  );
}
