"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useAppUsage } from "@/hooks/use-app-usage";

interface PremiumGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PremiumGuard({ children, fallback }: PremiumGuardProps) {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
    const router = useRouter();
    const usage = useAppUsage();

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    useEffect(() => {
        if (isPremium === false) {
            // Delayed Paywall Logic:
            // Only block if user has used the app for > 5 days AND has a 2-day streak.
            if (usage.daysUsed > 5 && usage.consecutiveDays >= 2) {
                router.replace("/support");
            }
        }
    }, [isPremium, usage, router]);

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
        if (usage.daysUsed > 5 && usage.consecutiveDays >= 2) {
            return null;
        }

        // If user is NOT "hooked" yet, allow free access (Hook Model).
        return <>{children}</>;
    }

    return <>{children}</>;
}
