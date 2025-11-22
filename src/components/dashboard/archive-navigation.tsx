"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Calendar } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ArchiveNavigation() {
    const router = useRouter();
    const [isPremium, setIsPremium] = useState<boolean>(false);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    const handleNavigation = (path: string) => {
        if (!isPremium) {
            // If not premium, maybe show a toast or just let the guard handle it?
            // Let's let the guard handle it on the page, so user sees the "Premium Feature" screen.
            router.push(path);
        } else {
            router.push(path);
        }
    };

    return (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar">
            <Button
                variant="outline"
                size="sm"
                className={cn("gap-2 rounded-full", !isPremium && "opacity-80")}
                onClick={() => handleNavigation("/yesterday")}
            >
                <Clock className="w-4 h-4" />
                Yesterday
            </Button>
            <Button
                variant="outline"
                size="sm"
                className={cn("gap-2 rounded-full", !isPremium && "opacity-80")}
                onClick={() => handleNavigation("/this-week")}
            >
                <CalendarDays className="w-4 h-4" />
                This Week
            </Button>
            <Button
                variant="outline"
                size="sm"
                className={cn("gap-2 rounded-full", !isPremium && "opacity-80")}
                onClick={() => handleNavigation("/this-month")}
            >
                <Calendar className="w-4 h-4" />
                This Month
            </Button>
        </div>
    );
}
