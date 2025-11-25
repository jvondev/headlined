"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, Clock, Calendar, ChevronDown, History, Sparkles } from "lucide-react";
import { useEffect, useState, useMemo, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useArchiveAccess } from "@/hooks/use-archive-access";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PremiumModal } from "@/components/support/premium-modal";
import { Heart } from "lucide-react";

function ArchiveNavigationContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { hasAccess: shouldShow, isPremium } = useArchiveAccess();
    const [showModal, setShowModal] = useState(false);

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

        // Define all possible navigation options with relative labels
        const options = {
            today: { label: "Today", path: "/today", icon: Sparkles },
            yesterday: { label: "Yesterday", path: "/yesterday", icon: History },
            twoDaysAgo: { label: "2 Days Ago", path: `/archive?date=${getPastDate(2)}`, icon: Clock },
            threeDaysAgo: { label: "3 Days Ago", path: `/archive?date=${getPastDate(3)}`, icon: Clock },
            thisWeek: { label: "This Week", path: "/this-week", icon: CalendarDays },
            thisMonth: { label: "This Month", path: "/this-month", icon: Calendar },
        };

        let current = options.today;

        // Determine current view and set label
        if (pathname === "/yesterday") {
            current = options.yesterday;
        } else if (pathname === "/archive") {
            const dateParam = searchParams.get("date");
            if (dateParam) {
                // Check if dateParam matches 2 or 3 days ago for relative labeling
                const twoDaysAgoDate = getPastDate(2);
                const threeDaysAgoDate = getPastDate(3);

                if (dateParam === twoDaysAgoDate) {
                    current = options.twoDaysAgo;
                } else if (dateParam === threeDaysAgoDate) {
                    current = options.threeDaysAgo;
                } else {
                    current = { label: formatDate(dateParam), path: `/archive?date=${dateParam}`, icon: Clock };
                }
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

    const renderMenuItem = (item: { label: string, path: string, icon: any }, isLocked: boolean = false) => (
        <DropdownMenuItem
            onClick={() => handleNavigation(item.path)}
            className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
        >
            <item.icon className={cn("w-4 h-4 mr-3", item === navData.options.today ? "text-primary" : "text-muted-foreground")} />
            <span className="font-medium flex-1">{item.label}</span>
            {isLocked && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-2">Preview</span>}
        </DropdownMenuItem>
    );

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-auto py-1 px-3 ml-2 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 group focus-visible:ring-0 focus-visible:ring-offset-0 shadow-sm"
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
                        {renderMenuItem(navData.options.today)}
                        {renderMenuItem(navData.options.yesterday, !isPremium)}
                        {renderMenuItem(navData.options.twoDaysAgo, !isPremium)}
                        {renderMenuItem(navData.options.threeDaysAgo, !isPremium)}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border/30 my-2" />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold px-2 py-1.5 mb-1">Summaries</DropdownMenuLabel>
                        {renderMenuItem(navData.options.thisWeek, !isPremium)}
                        {renderMenuItem(navData.options.thisMonth, !isPremium)}
                    </DropdownMenuGroup>

                    {!isPremium && (
                        <>
                            <DropdownMenuSeparator className="bg-border/30 my-2" />
                            <DropdownMenuItem
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-primary/10 text-primary focus:bg-primary/20 focus:text-primary cursor-pointer py-2.5 px-3 transition-colors duration-200"
                            >
                                <Heart className="w-4 h-4 mr-3 fill-primary text-primary" />
                                <span className="font-medium">Support ReadMore+</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}

export function ArchiveNavigation() {
    return (
        <Suspense fallback={null}>
            <ArchiveNavigationContent />
        </Suspense>
    );
}
