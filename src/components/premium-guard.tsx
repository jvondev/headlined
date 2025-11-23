"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useAppUsage } from "@/hooks/use-app-usage";

interface PremiumGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    disabled?: boolean;
}

export function PremiumGuard({ children, fallback, disabled }: PremiumGuardProps) {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
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
                router.replace("/support");
            }
        }
    }, [isPremium, usage, router, disabled]);

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

    if (!isPremium) {
        // If user is "hooked", the useEffect above will redirect.
        // While redirecting, show nothing or loader.
        if (usage.daysUsed > 2) {
            return null;
        }

        // If user is NOT "hooked" yet, allow free access (Hook Model).
        return <>{children}</>;
    }

    return <>{children}</>;
}
