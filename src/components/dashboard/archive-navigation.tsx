"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
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

    const pathname = usePathname();

    const renderButtons = () => {
        if (pathname === "/yesterday") {
            // Logic for "2 Days Ago", "3 Days Ago", "4 Days Ago"
            // For now, let's just link to specific dates or placeholders
            // Since we don't have dynamic routes for specific dates yet, we might need to use query params or just show the buttons visually for now.
            // Assuming the user wants to navigate to these days.
            // Let's use query params on the archive page or similar.
            // Actually, the user asked for "last 2 day, last 3 days and last 4 day"
            // Let's implement navigation to /archive?date=...

            const today = new Date();
            const getPastDate = (days: number) => {
                const d = new Date(today);
                d.setDate(today.getDate() - days);
                return d.toISOString().split('T')[0];
            };

            return (
                <>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${getPastDate(2)}`)}>
                        <Clock className="w-4 h-4" /> 2 Days Ago
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${getPastDate(3)}`)}>
                        <Clock className="w-4 h-4" /> 3 Days Ago
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${getPastDate(4)}`)}>
                        <Clock className="w-4 h-4" /> 4 Days Ago
                    </Button>
                </>
            );
        }

        if (pathname === "/this-week") {
            return (
                <>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/yesterday")}>
                        <Clock className="w-4 h-4" /> Yesterday
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/today")}>
                        <CalendarDays className="w-4 h-4" /> Today
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/this-month")}>
                        <Calendar className="w-4 h-4" /> This Month
                    </Button>
                </>
            );
        }

        if (pathname === "/this-month") {
            return (
                <>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/yesterday")}>
                        <Clock className="w-4 h-4" /> Yesterday
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/today")}>
                        <CalendarDays className="w-4 h-4" /> Today
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/this-week")}>
                        <Calendar className="w-4 h-4" /> This Week
                    </Button>
                </>
            );
        }

        // Default (e.g. for /today or others)
        return (
            <>
                <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/yesterday")}>
                    <Clock className="w-4 h-4" /> Yesterday
                </Button>
                <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/this-week")}>
                    <CalendarDays className="w-4 h-4" /> This Week
                </Button>
                <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/this-month")}>
                    <Calendar className="w-4 h-4" /> This Month
                </Button>
            </>
        );
    };

    return (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar justify-start md:justify-center w-full px-4 md:px-0">
            {renderButtons()}
        </div>
    );
}
