import { useState, useEffect } from 'react';
import { checkLicenseStatus } from "@/lib/license-manager";
import { useAppUsage } from "@/hooks/use-app-usage";

export function useArchiveAccess() {
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const usage = useAppUsage();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLicenseStatus().then((status) => {
            setIsPremium(status);
            setIsLoading(false);
        });
    }, []);

    // Show only if user is Premium OR has used the app for > 2 days
    const hasAccess = isPremium || (usage.daysUsed > 2);

    return { hasAccess, isPremium, isLoading };
}
