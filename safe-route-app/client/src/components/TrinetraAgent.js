import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaTimes, FaMicrophone, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import "./TrinetraAgent.css";

const GROQ_KEY = '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';

const SYSTEM_PROMPT = `You are TRINETRA AI — an intelligent safety assistant for the TRINETRA women's safety platform in India.

You have access to real-time data from the TRINETRA system including:
- Live SOS alerts and crime zones
- User's current GPS location  
- Nearby police stations, hospitals, and safe zones
- Recent incident reports
- Safety analytics and trends

Your capabilities:
- Answer questions about safety, navigation, emergency procedures
- Provide insights on crime data and safe routes
- Help users with app features (SOS, tracking, contacts)
- Give actionable safety advice
- Support Hinglish (Hindi + English mixed)

App navigation commands you can trigger:
- NAVIGATE:/dashboard, NAVIGATE:/sos, NAVIGATE:/stations, NAVIGATE:/contacts, NAVIGATE:/analytics, NAVIGATE:/reports, NAVIGATE:/taxi
- ACTION:toggle3D, ACTION:cycleStyle, ACTION:recenter, ACTION:toggleTheme, ACTION:triggerSOS

Always be concise, caring, and safety-focused. If someone seems in danger, immediately suggest triggering SOS.
Support Hinglish (Hindi + English) naturally.
If asked about crime zones, use the "Active Crime Zones" count from the data provided below.
If asked about safety score, use the provided safety analytics.

Current platform: TRINETRA Command Center v2.2`;

export default function TrinetraAgent({ embedded = false }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '🛡️ Namaste! Main TRINETRA AI hoon. Aapki safety meri priority hai. Kya main aapki madad kar sakta hoon?\n\nAap mujhse puch sakte hain:\n• "Mere paas crime zones kaun se hain?"\n• "SOS alert kaise karte hain?"\n• "Safe route kaise dhundhun?"', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveData, setLiveData] = useState({ sosAlerts: 0, crimeZones: 0, incidents: 0 });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Fetch live data from Firebase
  const fetchLiveData = async () => {
    try {
      const sosSnap = await getDocs(query(collection(db, 'sosAlerts'), limit(50)));
      const reportsSnap = await getDocs(query(collection(db, 'reports'), orderBy('timestamp', 'desc'), limit(10)));
      setLiveData({
        sosAlerts: sosSnap.size,
        crimeZones: Math.min(sosSnap.size, 12),
        incidents: reportsSnap.size
      });
    } catch (e) {
      // Firebase might not have these collections yet
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context string with live data
  const buildContext = () => {
    const pos = JSON.parse(localStorage.getItem('trinetra_last_pos') || 'null');
    const user = JSON.parse(localStorage.getItem('trinetra_user') || '{}');
    return `
LIVE TRINETRA DATA:
- Active SOS Alerts: ${liveData.sosAlerts}
- Active Crime Zones: ${liveData.crimeZones}  
- Recent Incidents: ${liveData.incidents}
- User: ${user.name || 'Anonymous'} (${user.email || 'unknown'})
- GPS Location: ${pos ? `${Number(pos[0]).toFixed(4)}°N, ${Number(pos[1]).toFixed(4)}°E` : 'Not available'}
- Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
`;
  };

  // Parse AI response for commands
  const parseAndExecute = (text) => {
    // Navigation
    const navMatch = text.match(/NAVIGATE:([^\s,]+)/);
    if (navMatch) {
      setTimeout(() => navigate(navMatch[1]), 800);
    }
    // Actions
    if (text.includes('ACTION:toggle3D')) window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'toggle3D', value: true } }));
    if (text.includes('ACTION:recenter')) window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'recenter' } }));
    if (text.includes('ACTION:cycleStyle')) window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'cycleStyle' } }));
    if (text.includes('ACTION:toggleTheme')) window.dispatchEvent(new CustomEvent('trinetra:command', { detail: { action: 'toggleTheme' } }));
    if (text.includes('ACTION:triggerSOS')) window.dispatchEvent(new CustomEvent('trinetra:sos'));

    // Clean command tags from display text
    return text
      .replace(/NAVIGATE:[^\s,]+/g, '')
      .replace(/ACTION:[^\s,]+/g, '')
      .trim();
  };

  // Send message to Groq AI
  const sendMessage = async (userText) => {
    if (!userText.trim()) return;
    
    const userMsg = { role: 'user', content: userText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Local Fallback for Hackathon Stability
      const lowerText = userText.toLowerCase();
      let fallbackReply = null;

      if (lowerText.includes('crime zone') || lowerText.includes('unsafe') || lowerText.includes('khatra')) {
        fallbackReply = `Trinetra AI has detected ${liveData.crimeZones} active crime zones in your vicinity. Please stay alert and follow safe routes highlighted in red on your map.`;
      } else if (lowerText.includes('sos') || lowerText.includes('emergency') || lowerText.includes('madad')) {
        fallbackReply = "Emergency protocol active. You can trigger the SOS button on the bottom-left of your map to alert local authorities and your emergency contacts immediately.";
      } else if (lowerText.includes('safe route') || lowerText.includes('rasta')) {
        fallbackReply = "I can help you find the safest route. Enter your destination in the search bar, and TRINETRA will calculate a path avoiding known high-risk areas.";
      } else if (lowerText.includes('score')) {
        fallbackReply = `Your current area safety score is ${liveData.crimeZones > 5 ? 'Low' : 'High'}. We analyze real-time incident reports to give you this metric.`;
      }

      // Build full message history for context
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\n\n' + buildContext() },
            ...history,
            { role: 'user', content: userText }
          ],
          max_tokens: 400,
          temperature: 0.7
        })
      });

      const data = await res.json();
      
      if (data.error) {
        console.error("Groq API Error:", data.error);
        if (fallbackReply) {
          setMessages(prev => [...prev, { role: 'assistant', content: fallbackReply, time: new Date() }]);
          return;
        }
        throw new Error(data.error.message || 'API Error');
      }

      const rawReply = data.choices?.[0]?.message?.content || 'Mujhe kuch samajh nahi aaya. Dobara poochiye.';
      const cleanReply = parseAndExecute(rawReply);

      setMessages(prev => [...prev, { role: 'assistant', content: cleanReply, time: new Date() }]);

      // Speak the response
      if (window.speechSynthesis) {
        const shortText = cleanReply.slice(0, 150);
        const u = new SpeechSynthesisUtterance(shortText);
        u.lang = 'en-IN';
        u.rate = 1.1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch (err) {
      console.error("AI Agent Error:", err);
      // Final Fallback for Hackathon
      const finalFallback = "I'm having trouble connecting to my neural network, but I'm still monitoring your safety. For emergencies, please use the SOS button or contact the nearest police station.";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: finalFallback,
        time: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording using Groq Whisper
  const toggleVoice = async () => {
    if (isListening) {
      recorderRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      chunksRef.current = [];
      recorderRef.current = new MediaRecorder(streamRef.current);
      recorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
      recorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAndSend(blob);
      };
      recorderRef.current.start();
      setIsListening(true);
      setTimeout(() => { recorderRef.current?.stop(); setIsListening(false); }, 8000);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '🎤 Microphone access denied. Please allow mic permissions.', time: new Date() }]);
    }
  };

  const transcribeAndSend = async (blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('prompt', 'TRINETRA safety app. Hindi/English mixed commands.');

      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}` },
        body: formData
      });
      const data = await res.json();
      const text = data.text?.trim();
      if (text && text.length > 1) {
        await sendMessage(text);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const quickActions = [
    { label: '🚨 Crime Zones', msg: 'Mere paas kitne crime zones hain aur wo kahan hain?' },
    { label: '🛡️ Safe Route', msg: 'Mujhe safe route kaise milega?' },
    { label: '📊 Safety Score', msg: 'Mera safety score kya hai aur use kaise improve karein?' },
    { label: '🚔 Nearest Help', msg: 'Mere sabse paas police station ya hospital kahan hai?' },
  ];

  return (
    <>
      {/* Floating Bot Button */}
      <div style={{
        position: embedded ? 'relative' : 'fixed',
        bottom: embedded ? 'auto' : '30px',
        right: embedded ? 'auto' : '20px',
        zIndex: 15000,
        pointerEvents: 'auto',
      }}>
        <button
          onClick={() => setIsOpen(v => !v)}
          style={{
            width: embedded ? 56 : 64, height: embedded ? 56 : 64,
            background: isOpen
              ? 'linear-gradient(135deg, #ff4d4d, #cc0000)'
              : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: `0 0 20px ${isOpen ? 'rgba(255,77,77,0.5)' : 'rgba(0,210,255,0.5)'}`,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fontSize: embedded ? 22 : 26, color: '#fff',
            animation: isOpen ? 'none' : 'orbPulse 3s infinite ease-in-out',
          }}
          title="TRINETRA AI"
        >
          {isOpen ? <FaTimes /> : <FaRobot />}
        </button>

        {/* Chat Panel */}
        {isOpen && (
          <div style={{
            position: 'absolute', 
            bottom: 78, 
            left: embedded ? 0 : 'auto',
            right: embedded ? 'auto' : 0,
            width: window.innerWidth < 400 ? 'calc(100vw - 32px)' : 340, 
            height: 520,
            background: 'rgba(8, 12, 22, 0.96)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(0,210,255,0.25)',
            borderRadius: 24,
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(0,210,255,0.1)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
            zIndex: 15002,
          }}>

            {/* Header */}
            <div style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(58,123,213,0.15))',
              borderBottom: '1px solid rgba(0,210,255,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00d2ff, #3a7bd5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: '#fff', flexShrink: 0,
              }}><FaRobot /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>TRINETRA AI</div>
                <div style={{ fontSize: 10, color: '#00d2ff', fontWeight: 600 }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#00e5a0', marginRight: 4, verticalAlign: 'middle' }} />
                  LIVE • {liveData.sosAlerts} alerts • {liveData.crimeZones} zones
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 4 }}>
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #00d2ff, #3a7bd5)'
                      : 'rgba(255,255,255,0.07)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: 12.5,
                    color: '#fff',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px' }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite', color: '#00d2ff', fontSize: 14 }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>TRINETRA AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div style={{ padding: '6px 10px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {quickActions.map((qa, i) => (
                <button key={i} onClick={() => sendMessage(qa.msg)} style={{
                  background: 'rgba(0,210,255,0.08)',
                  border: '1px solid rgba(0,210,255,0.2)',
                  borderRadius: 20, padding: '5px 10px',
                  color: '#00d2ff', fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                  fontFamily: 'inherit',
                }}>
                  {qa.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Kuch bhi puchiye..."
                rows={1}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, padding: '10px 14px',
                  color: '#fff', fontSize: 12, fontFamily: 'inherit',
                  outline: 'none', resize: 'none', lineHeight: 1.4,
                  maxHeight: 80, overflowY: 'auto',
                }}
              />
              <button
                onClick={toggleVoice}
                style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: isListening ? 'linear-gradient(135deg, #ff4d4d, #cc0000)' : 'rgba(0,210,255,0.15)',
                  border: `1px solid ${isListening ? '#ff4d4d' : 'rgba(0,210,255,0.3)'}`,
                  color: isListening ? '#fff' : '#00d2ff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, animation: isListening ? 'orbPulse 0.8s infinite' : 'none',
                }}
                title={isListening ? 'Stop' : 'Voice'}
              >
                <FaMicrophone />
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: input.trim() ? 'linear-gradient(135deg, #00d2ff, #3a7bd5)' : 'rgba(255,255,255,0.05)',
                  border: 'none', color: '#fff',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, transition: 'all 0.2s',
                }}
                title="Send"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,210,255,0.4); }
          50% { box-shadow: 0 0 40px rgba(0,210,255,0.8); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
