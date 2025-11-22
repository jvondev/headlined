"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Calendar } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppUsage } from "@/hooks/use-app-usage";

export function ArchiveNavigation() {
    const router = useRouter();
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const usage = useAppUsage();

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    // Show only if user is Premium OR has used the app for > 5 days with 2+ day streak
    const shouldShow = isPremium || (usage.daysUsed > 5 && usage.consecutiveDays >= 2);

    if (!shouldShow) {
        return null;
    }

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar justify-start md:justify-center w-full px-4 md:px-0">
            <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-2 rounded-full"
                onClick={() => handleNavigation("/yesterday")}
            >
                <Clock className="w-4 h-4" />
                Yesterday
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-2 rounded-full"
                onClick={() => handleNavigation("/this-week")}
            >
                <CalendarDays className="w-4 h-4" />
                This Week
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-2 rounded-full"
                onClick={() => handleNavigation("/this-month")}
            >
                <Calendar className="w-4 h-4" />
                This Month
            </Button>
        </div>
    );
}
