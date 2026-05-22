import React, { useState, useEffect } from "react";
import WomenSupportHeadDesktop from "./Desktop/WomenSupportHeadDesktop";
import WomenSupportHeadMobile from "./Mobile/WomenSupportHeadMobile";

export default function WomenSupportHeadDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile) {
        return <WomenSupportHeadMobile user={user} onLogout={onLogout} />;
    }

    return <WomenSupportHeadDesktop user={user} onLogout={onLogout} />;
}
