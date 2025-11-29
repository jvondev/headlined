"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { checkLicenseStatus } from "@repo/lib/utils/license-manager";

import { PremiumModal } from "@/components/support/premium-modal";

interface PremiumGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    disabled?: boolean;
}

export function PremiumGuard({ children, fallback, disabled }: PremiumGuardProps) {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    useEffect(() => {
        if (!disabled && isPremium === false) {
            // Block immediately for premium-only content
            setShowModal(true);
        }
    }, [isPremium, disabled]);

    if (disabled) {
        return <>{children}</>;
    }

    if (isPremium === null) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // If not premium and guard is enabled, block completely
    if (!isPremium) {
        return (
            <>
                {fallback || (
                    <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                        <div className="text-center space-y-4 p-8">
                            <p className="text-lg text-muted-foreground">Premium content</p>
                        </div>
                    </div>
                )}
                <PremiumModal isOpen={showModal} onClose={() => {
                    // Redirect to home if they try to close without upgrading
                    router.push('/today');
                }} />
            </>
        );
    }

    // User is premium, render children normally
    return <>{children}</>;
}
