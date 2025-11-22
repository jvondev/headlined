"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkLicenseStatus } from "@/lib/license-manager";
import { PremiumUpsellModal } from "@/components/support/premium-upsell-modal";

interface PremiumGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PremiumGuard({ children, fallback }: PremiumGuardProps) {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    if (isPremium === null) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isPremium) {
        if (fallback) return <>{fallback}</>;

        return (
            <div className="flex h-full w-full flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
                <div className="rounded-full bg-primary/10 p-6">
                    <Lock className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight">Premium Feature</h2>
                    <p className="text-muted-foreground">
                        This feature is available exclusively to ReadMore Plus subscribers.
                        Upgrade to access unlimited history, distraction-free reading, and more.
                    </p>
                </div>
                <PremiumUpsellModal
                    trigger={
                        <Button size="lg" className="font-semibold">
                            Upgrade to Plus
                        </Button>
                    }
                />
            </div>
        );
    }

    return <>{children}</>;
}
