import React, { useState, useEffect } from "react";
import CommissionerHeadDesktop from "./Desktop/CommissionerHeadDesktop";
import CommissionerHeadMobile from "./Mobile/CommissionerHeadMobile";

export default function CommissionerHeadDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <CommissionerHeadMobile user={user} onLogout={onLogout} />;
    }

    return <CommissionerHeadDesktop user={user} onLogout={onLogout} />;
}
