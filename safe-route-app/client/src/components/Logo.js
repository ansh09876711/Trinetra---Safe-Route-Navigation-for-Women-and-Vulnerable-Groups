import React from 'react';
import logoImg from '../assests/logo.png';

const Logo = ({ height = 32, showText = true }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',
      alignItems: 'center', 
      gap: 8,
      cursor: 'pointer',
    }}>
      {/* Logo Image — same visual size as text */}
      <div style={{ 
        height: height * 2.5, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <img 
          src={logoImg} 
          alt="TRINETRA" 
          style={{ 
            height: '100%', 
            width: 'auto',
            filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))' 
          }} 
        />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontWeight: 800, 
            fontSize: height * 0.75,
            letterSpacing: '0.05em',
            background: 'linear-gradient(to bottom, #FFD700, #B8860B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1
          }}>
            TRINETRA
          </span>
          <span style={{ 
            fontSize: height * 0.22, 
            color: '#D4AF37',
            fontWeight: 600, 
            letterSpacing: '0.2em',
            marginTop: 3,
            textTransform: 'uppercase',
            opacity: 0.8
          }}>
            Eye of Protection
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;