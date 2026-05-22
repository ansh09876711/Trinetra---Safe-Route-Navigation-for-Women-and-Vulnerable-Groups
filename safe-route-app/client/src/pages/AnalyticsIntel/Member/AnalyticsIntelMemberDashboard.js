import React, { useState, useEffect } from "react";
import AnalyticsIntelMemberDesktop from "./Desktop/AnalyticsIntelMemberDesktop";
import AnalyticsIntelMemberMobile from "./Mobile/AnalyticsIntelMemberMobile";

export default function AnalyticsIntelMemberDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <AnalyticsIntelMemberMobile user={user} onLogout={onLogout} />;
    }

    return <AnalyticsIntelMemberDesktop user={user} onLogout={onLogout} />;
}
