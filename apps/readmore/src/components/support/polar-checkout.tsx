"use client";

import { useEffect, useRef } from "react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";

interface PolarCheckoutProps {
    checkoutUrl: string;
    theme?: "light" | "dark";
    onClose?: () => void;
    onSuccess?: (data: any) => void;
}

export function PolarCheckout({
    checkoutUrl,
    theme = "light",
    onClose,
    onSuccess,
}: PolarCheckoutProps) {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;

        const openCheckout = async () => {
            try {
                const checkout = await PolarEmbedCheckout.create(checkoutUrl, theme as "light" | "dark");

                isInitialized.current = true;

                checkout.addEventListener("close", (event) => {
                    console.log("Checkout closed");
                    if (onClose) onClose();
                });

                checkout.addEventListener("success", (event) => {
                    console.log("Purchase successful!", event.detail);
                    if (onSuccess) onSuccess(event.detail);
                });

            } catch (error) {
                console.error("Failed to initialize Polar checkout:", error);
            }
        };

        openCheckout();

        return () => {
            // Cleanup if necessary, though PolarEmbedCheckout might handle its own cleanup
            // or we might need to manually remove the iframe if the component unmounts
            // but the SDK documentation doesn't explicitly mention a destroy method for the embed instance itself
            // that removes it from DOM on unmount.
            // Usually these embeds append to body or a specific container.
            // If it appends to body, we might need to be careful.
            // However, for now we'll trust the SDK or let it persist until closed.
        };
    }, [checkoutUrl, theme, onClose, onSuccess]);

    return null; // The embed usually opens as a modal/overlay
}
