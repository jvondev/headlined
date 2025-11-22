"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, Clock, Calendar } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppUsage } from "@/hooks/use-app-usage";

export function ArchiveNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
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

    const renderButtons = () => {
        const today = new Date();
        const getPastDate = (days: number, fromDate?: Date) => {
            const d = new Date(fromDate || today);
            d.setDate(d.getDate() - days);
            return d.toISOString().split('T')[0];
        };
        const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        if (pathname === "/yesterday") {
            return (
                <>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/today")}>
                        <CalendarDays className="w-4 h-4" /> Today
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${getPastDate(2)}`)}>
                        <Clock className="w-4 h-4" /> 2 Days Ago
                    </Button>
                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${getPastDate(3)}`)}>
                        <Clock className="w-4 h-4" /> 3 Days Ago
                    </Button>
                </>
            );
        }

        if (pathname === "/archive") {
            const currentDateStr = searchParams.get("date");
            if (currentDateStr) {
                const currentDate = new Date(currentDateStr);
                const prevDay1 = getPastDate(1, currentDate);
                const prevDay2 = getPastDate(2, currentDate);

                return (
                    <>
                        <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation("/today")}>
                            <CalendarDays className="w-4 h-4" /> Today
                        </Button>
                        <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${prevDay1}`)}>
                            <Clock className="w-4 h-4" /> {formatDate(prevDay1)}
                        </Button>
                        <Button variant="outline" size="sm" className="flex-shrink-0 gap-2 rounded-full" onClick={() => handleNavigation(`/archive?date=${prevDay2}`)}>
                            <Clock className="w-4 h-4" /> {formatDate(prevDay2)}
                        </Button>
                    </>
                );
            }
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
