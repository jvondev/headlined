"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { checkLicenseStatus } from "@/lib/license-manager";

export function AdScripts() {
    // Temporarily disabled to prevent console errors and external script issues
    return null;

    /*
    const [isPremium, setIsPremium] = useState<boolean | null>(null);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    // If status is unknown (null) or premium (true), don't render ads yet.
    if (isPremium !== false) return null;

    return (
        <>
            <Script
                src="https://cdn.apitiny.net/scripts/v2.0/main.js"
                data-site-id="69229d201caeadfb3c21dd85"
                data-test-mode={process.env.NEXT_PUBLIC_AD_TEST_MODE || "false"}
                strategy="afterInteractive"
            />
        </>
    );
    */
}
