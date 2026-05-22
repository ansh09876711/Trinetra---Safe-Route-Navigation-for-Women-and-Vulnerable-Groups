import React, { useState, useEffect } from "react";
import TaxiHeadDesktop from "./Desktop/TaxiHeadDesktop";
import TaxiHeadMobile from "./Mobile/TaxiHeadMobile";

export default function TaxiHeadDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile) {
        return <TaxiHeadMobile user={user} onLogout={onLogout} />;
    }

    return <TaxiHeadDesktop user={user} onLogout={onLogout} />;
}
