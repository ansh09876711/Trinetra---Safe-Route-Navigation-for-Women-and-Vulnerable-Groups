import React, { useState, useEffect } from "react";
import WomenSupportMemberDesktop from "./Desktop/WomenSupportMemberDesktop";
import WomenSupportMemberMobile from "./Mobile/WomenSupportMemberMobile";

export default function WomenSupportMemberDashboard({ user, onLogout }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile) {
        return <WomenSupportMemberMobile user={user} onLogout={onLogout} />;
    }

    return <WomenSupportMemberDesktop user={user} onLogout={onLogout} />;
}
