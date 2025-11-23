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
                    className="h-auto py-1 px-3 ml-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-md md:text-lg text-muted-foreground font-medium hover:text-foreground transition-all duration-300 group focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm"
                >
                    <span className="mr-1 group-hover:text-primary transition-colors">{navData.current.label}</span>
                    <ChevronDown className="w-4 h-4 opacity-50 group-hover:translate-y-0.5 group-hover:text-primary transition-all duration-300" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="center"
                className="w-64 bg-card/60 backdrop-blur-2xl border-border/40 shadow-2xl rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200"
            >
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-2 py-1.5 mb-1">Time Travel</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => handleNavigation(navData.options.today.path)}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                    >
                        <navData.options.today.icon className="w-4 h-4 mr-3 text-primary" />
                        <span className="font-medium">{navData.options.today.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleNavigation(navData.options.yesterday.path)}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                    >
                        <navData.options.yesterday.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="font-medium">{navData.options.yesterday.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleNavigation(navData.options.twoDaysAgo.path)}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                    >
                        <navData.options.twoDaysAgo.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="font-medium">{navData.options.twoDaysAgo.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleNavigation(navData.options.threeDaysAgo.path)}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                    >
                        <navData.options.threeDaysAgo.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="font-medium">{navData.options.threeDaysAgo.label}</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/30 my-2" />
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-2 py-1.5 mb-1">Summaries</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => handleNavigation(navData.options.thisWeek.path)}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                    >
                        <navData.options.thisWeek.icon className="w-4 h-4 mr-3 text-orange-500" />
                        <span className="font-medium">{navData.options.thisWeek.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleNavigation(navData.options.thisMonth.path)}
                        className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                    >
                        <navData.options.thisMonth.icon className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="font-medium">{navData.options.thisMonth.label}</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
