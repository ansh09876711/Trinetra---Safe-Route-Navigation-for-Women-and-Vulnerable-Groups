import React, { useState, useEffect } from "react";
import HelpdeskMemberDesktop from "./Desktop/HelpdeskMemberDesktop";
import HelpdeskMemberMobile from "./Mobile/HelpdeskMemberMobile";

export default function HelpdeskMemberDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <HelpdeskMemberMobile user={user} onLogout={onLogout} />;
    }

    return <HelpdeskMemberDesktop user={user} onLogout={onLogout} />;
}
