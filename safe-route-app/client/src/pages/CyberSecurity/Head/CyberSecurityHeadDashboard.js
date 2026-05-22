import React, { useState, useEffect } from "react";
import CyberSecurityHeadDesktop from "./Desktop/CyberSecurityHeadDesktop";
import CyberSecurityHeadMobile from "./Mobile/CyberSecurityHeadMobile";

export default function CyberSecurityHeadDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <CyberSecurityHeadMobile user={user} onLogout={onLogout} />;
    }

    return <CyberSecurityHeadDesktop user={user} onLogout={onLogout} />;
}
