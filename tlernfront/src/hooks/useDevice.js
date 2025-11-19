import { useState, useEffect } from "react";

export default function useDevice() {
    const [device, setDevice] = useState("desktop");

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();

        const isMobile = /mobile|iphone|ipod|android/.test(ua);
        const isTablet = /ipad|tablet|sm-t|lenovo tab/.test(ua);

        if (isMobile) setDevice("mobile");
        else if (isTablet) setDevice("tablet");
        else setDevice("desktop");
    }, []);

    return device;
}
