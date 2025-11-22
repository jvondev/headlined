"use client";

import { useEffect, useState } from "react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumGuard({ children }: { children: React.ReactNode }) {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const check = async () => {
            const status = await checkLicenseStatus();
            setIsPremium(status);
        };
        check();
    }, []);

    if (isPremium === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    if (!isPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Lock className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight">Premium Feature</h2>
                    <p className="text-muted-foreground">
                        This archive is available exclusively to ReadMore+ supporters.
                        Unlock 30-day history, weekly digests, and more.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.push("/today")}>
                        Back to Today
                    </Button>
                    <Button onClick={() => router.push("/support")}>
                        Upgrade to Plus
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
