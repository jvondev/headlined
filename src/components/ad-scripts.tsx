"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { checkLicenseStatus } from "@/lib/license-manager";

export function AdScripts() {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    // If status is unknown (null) or premium (true), don't render ads yet.
    // Wait, if null (loading), we might want to wait? 
    // If we render ads and then remove them, it's bad.
    // If we don't render ads and then add them, it's better.
    // So if isPremium is true, return null.
    // If isPremium is null, return null (wait).
    // Only if isPremium is false, render ads.

    if (isPremium !== false) return null;

    return (
        <>
            <Script
                src="https://cdn.apitiny.net/scripts/v2.0/main.js"
                data-site-id="69229d201caeadfb3c21dd85"
                data-test-mode="true"
                strategy="afterInteractive"
            />
        </>
    );
}
