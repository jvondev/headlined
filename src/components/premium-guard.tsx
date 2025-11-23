"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useAppUsage } from "@/hooks/use-app-usage";

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
    const usage = useAppUsage();

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    useEffect(() => {
        if (!disabled && isPremium === false) {
            // Delayed Paywall Logic:
            // Only block if user has used the app for > 2 days.
            if (usage.daysUsed > 2) {
                setShowModal(true);
            }
        }
    }, [isPremium, usage, disabled]);

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

    // If blocked, show modal AND children (so the background is visible but blocked by modal overlay)
    // OR show modal and fallback?
    // User wants "SPA feel", so showing the underlying page (maybe blurred) is best.

    const isBlocked = !isPremium && usage.daysUsed > 2;

    return (
        <>
            {children}
            <PremiumModal isOpen={showModal} onClose={() => {
                // Optional: redirect to home if they close the modal without paying?
                // Or just keep it open?
                // For now, let's keep it open or redirect to home if they try to close it.
                // If we want to FORCE them, we shouldn't allow closing.
                // But PremiumModal uses Dialog which usually has a close button.
                // If they close it, they are still on the restricted page.
                // So we should probably redirect to home if they close it.
                router.push('/');
            }} />
        </>
    );
}
