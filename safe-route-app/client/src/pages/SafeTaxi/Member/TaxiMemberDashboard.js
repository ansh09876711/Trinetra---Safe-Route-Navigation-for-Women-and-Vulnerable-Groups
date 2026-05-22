import React, { useState, useEffect } from "react";
import TaxiMemberDesktop from "./Desktop/TaxiMemberDesktop";
import TaxiMemberMobile from "./Mobile/TaxiMemberMobile";

export default function TaxiMemberDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile) {
        return <TaxiMemberMobile user={user} onLogout={onLogout} />;
    }

    return <TaxiMemberDesktop user={user} onLogout={onLogout} />;
}
