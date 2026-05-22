import React, { useState, useEffect } from "react";
import AnalyticsIntelHeadDesktop from "./Desktop/AnalyticsIntelHeadDesktop";
import AnalyticsIntelHeadMobile from "./Mobile/AnalyticsIntelHeadMobile";

export default function AnalyticsIntelHeadDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <AnalyticsIntelHeadMobile user={user} onLogout={onLogout} />;
    }

    return <AnalyticsIntelHeadDesktop user={user} onLogout={onLogout} />;
}
