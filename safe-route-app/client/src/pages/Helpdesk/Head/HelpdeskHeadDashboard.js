import React, { useState, useEffect } from "react";
import HelpdeskHeadDesktop from "./Desktop/HelpdeskHeadDesktop";
import HelpdeskHeadMobile from "./Mobile/HelpdeskHeadMobile";

export default function HelpdeskHeadDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <HelpdeskHeadMobile user={user} onLogout={onLogout} />;
    }

    return <HelpdeskHeadDesktop user={user} onLogout={onLogout} />;
}
