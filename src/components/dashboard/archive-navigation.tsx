"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, Clock, Calendar, ChevronDown, History, Sparkles } from "lucide-react";
import { checkLicenseStatus } from "@/lib/license-manager";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAppUsage } from "@/hooks/use-app-usage";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

    const navData = useMemo(() => {
        const today = new Date();
        const getPastDate = (days: number, fromDate?: Date) => {
            const d = new Date(fromDate || today);
            d.setDate(d.getDate() - days);
            return d.toISOString().split('T')[0];
        };
        const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        };
        const formatShortDate = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        let current = { label: todayStr, path: "/today", icon: Sparkles };

        // Define all possible navigation options
        const options = {
            today: { label: "Today", path: "/today", icon: Sparkles },
            yesterday: { label: "Yesterday", path: "/yesterday", icon: History },
            twoDaysAgo: { label: formatShortDate(getPastDate(2)), path: `/archive?date=${getPastDate(2)}`, icon: Clock },
            threeDaysAgo: { label: formatShortDate(getPastDate(3)), path: `/archive?date=${getPastDate(3)}`, icon: Clock },
            thisWeek: { label: "This Week", path: "/this-week", icon: CalendarDays },
            thisMonth: { label: "This Month", path: "/this-month", icon: Calendar },
        };

        // Determine current view
        if (pathname === "/yesterday") {
            current = { ...options.yesterday, label: yesterdayStr };
        } else if (pathname === "/archive") {
            const dateParam = searchParams.get("date");
            if (dateParam) {
                current = { label: formatDate(dateParam), path: `/archive?date=${dateParam}`, icon: Clock };
            }
        } else if (pathname === "/this-week") {
            current = options.thisWeek;
        } else if (pathname === "/this-month") {
            current = options.thisMonth;
        }

        return { current, options };
    }, [pathname, searchParams]);

    if (!shouldShow) {
        return null;
    }

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-auto p-0 hover:bg-transparent text-lg md:text-xl text-muted-foreground font-medium hover:text-foreground transition-colors group"
                >
                    <span className="mr-1">{navData.current.label}</span>
                    <ChevronDown className="w-4 h-4 opacity-50 group-hover:translate-y-0.5 transition-transform" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-card/80 backdrop-blur-xl border-border/50">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono">Time Travel</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleNavigation(navData.options.today.path)}>
                        <navData.options.today.icon className="w-4 h-4 mr-2 text-primary" />
                        <span>{navData.options.today.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation(navData.options.yesterday.path)}>
                        <navData.options.yesterday.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{navData.options.yesterday.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation(navData.options.twoDaysAgo.path)}>
                        <navData.options.twoDaysAgo.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{navData.options.twoDaysAgo.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation(navData.options.threeDaysAgo.path)}>
                        <navData.options.threeDaysAgo.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{navData.options.threeDaysAgo.label}</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono">Summaries</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleNavigation(navData.options.thisWeek.path)}>
                        <navData.options.thisWeek.icon className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{navData.options.thisWeek.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation(navData.options.thisMonth.path)}>
                        <navData.options.thisMonth.icon className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{navData.options.thisMonth.label}</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
