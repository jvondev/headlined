"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Search, Laptop, Newspaper, Goal, Brain, Code, Shield, LucideProps } from "lucide-react";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

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

type CarouselItem = {
    name: string;
    type: "topic" | "interest" | "none";
    href: string;
    icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    isIconOnly?: boolean;
};

type CarouselNavProps = {
    topics: Topic[];
    interests: Interest[];
    activeFilterType: "topic" | "interest" | "none";
    activeFilterValue: string;
    onFilterChange: (type: "topic" | "interest" | "none", value: string) => void;
};

export function CarouselNav({
    topics = [],
    interests = [],
    activeFilterType,
    activeFilterValue,
    onFilterChange,
}: CarouselNavProps) {
    const pathname = usePathname();
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        axis: 'x',
        align: 'start',
        duration: 50, // Increased duration for smoother snap transition
    }, [WheelGesturesPlugin({
        forceWheelAxis: 'x',
        wheelDraggingClass: 'is-wheel-dragging'
    })]);
    const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

    const allFilterItems: CarouselItem[] = React.useMemo(() => [
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
    ], [topics, interests]);

    React.useEffect(() => {
        const activeItemName = activeFilterValue;
        const activeItemIndex = allFilterItems.findIndex(item => item.name === activeItemName);

        if (emblaApi && activeItemIndex !== -1) {
            emblaApi.scrollTo(activeItemIndex, true);
        }
    }, [activeFilterValue, topics, interests, emblaApi, allFilterItems]);

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex items-center">
                {allFilterItems.map(item => {
                    const isActive = item.type === "none" 
                        ? pathname === item.href 
                        : (activeFilterType === item.type && activeFilterValue === item.name);

                    return (
                        <div key={item.name} className="flex-[0_0_auto] mr-2 last:mr-0">
                            <Button
                                ref={el => { itemRefs.current[item.name] = el; }}
                                variant={isActive ? "secondary" : "outline"}
                                size={item.isIconOnly ? "icon" : "sm"}
                                onClick={() => {
                                    onFilterChange(item.type, item.name);
                                }}
                                className={cn("rounded-full", item.isIconOnly ? "" : "px-4")}
                            >
                                {item.icon && <item.icon className={cn("h-4 w-4", { "mr-2": !item.isIconOnly })} />}
                                {!item.isIconOnly && item.name}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
