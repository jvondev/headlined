"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Search, Laptop, Newspaper, Goal, Brain, Code, Shield } from "lucide-react";
import React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

const iconMap = {
    Bookmark,
    Compass,
    Search,
    Laptop,
    Newspaper,
    Goal,
    Brain,
    Code,
    Shield,
};

type CarouselNavProps = {
    topics: Topic[];
    interests: Interest[];
    activeFilterType: "topic" | "interest" | "none";
    activeFilterValue: string;
    onFilterChange: (type: "topic" | "interest", value: string) => void;
};

export function CarouselNav({
    topics = [],
    interests = [],
    activeFilterType,
    activeFilterValue,
    onFilterChange,
}: CarouselNavProps) {
    const pathname = usePathname();
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

    const allFilterItems = [
        { name: "Saved", type: "none" as const, href: "/saved", icon: iconMap.Bookmark, isIconOnly: true },
        ...(Array.isArray(topics) ? topics.map(topic => ({
            ...topic,
            type: "topic" as const,
            href: `/category/${topic.name}`,
            icon: topic.icon ? iconMap[topic.icon as keyof typeof iconMap] : undefined,
        })) : []),
        ...(Array.isArray(interests) ? interests.map(interest => ({
            ...interest,
            type: "interest" as const,
            href: `/category/${interest.name}`,
            icon: interest.icon ? iconMap[interest.icon as keyof typeof iconMap] : undefined,
        })) : []),
        { name: "Explore", type: "none" as const, href: "/explore", icon: iconMap.Compass, isIconOnly: true },
        { name: "Search", type: "none" as const, href: "/search", icon: iconMap.Search, isIconOnly: true },
    ];

    React.useEffect(() => {
        const activeItemName = activeFilterType === "none" ? 
            (pathname === "/saved" ? "Saved" : (pathname === "/explore" ? "Explore" : (pathname === "/search" ? "Search" : ""))) : 
            activeFilterValue;

        const activeItemRef = itemRefs.current[activeItemName];
        if (viewportRef.current && activeItemRef) {
            const viewportRect = viewportRef.current.getBoundingClientRect();
            const itemRect = activeItemRef.getBoundingClientRect();

            const scrollLeft = itemRect.left - viewportRect.left + viewportRef.current.scrollLeft;
            viewportRef.current.scrollTo({
                left: scrollLeft,
                behavior: "smooth",
            });
        }
    }, [activeFilterType, activeFilterValue, pathname]);

    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <ScrollAreaPrimitive.Viewport ref={viewportRef} className="h-full w-full rounded-[inherit]">
                <div className="flex items-center gap-2">
                    {allFilterItems.map(item => {
                        const isActive = item.type === "none" 
                            ? pathname === item.href 
                            : (activeFilterType === item.type && activeFilterValue === item.name);

                                            return (
                                                <Button
                                                    ref={el => itemRefs.current[item.name] = el}
                                                    variant={isActive ? "secondary" : "outline"}
                                                    size={item.isIconOnly ? "icon" : "sm"}
                                                    onClick={() => {
                                                        if (item.type === "none") {
                                                            // For Saved, Explore, Search, just update the active filter
                                                            onFilterChange(item.type, item.name);
                                                        } else {
                                                            onFilterChange(item.type, item.name);
                                                        }
                                                    }}
                                                    className={cn("rounded-full shrink-0", item.isIconOnly ? "" : "px-4")}
                                                >
                                                    {item.icon && <item.icon className={cn("h-4 w-4", { "mr-2": !item.isIconOnly })} />}
                                                    {!item.isIconOnly && item.name}
                                                </Button>
                                            );                    })}
                </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
    );
}
