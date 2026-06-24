"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export function AdScripts() {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);

    useEffect(() => {
        setIsPremium(true);

        // Add global error handler for apitiny script errors
        const originalError = console.error;
        console.error = (...args) => {
            // Suppress apitiny.net related errors
            const errorMessage = args.join(' ');
            if (errorMessage.includes('apitiny.net') ||
                errorMessage.includes('setupSite') ||
                errorMessage.includes("Cannot read properties of undefined (reading 'map')")) {
                return; // Silently ignore these errors
            }
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
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
                onLoad={() => {
                    // Ensure the script loaded successfully
                    console.log('[AdScripts] Apitiny script loaded');
                }}
                onError={(e) => {
                    // Handle script loading errors gracefully
                    console.warn('[AdScripts] Failed to load ad script, continuing without ads');
                }}
            />
        </>
    );
}
