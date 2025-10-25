"use client";

import React, { FC, useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { CarouselNav } from "@/components/carousel-nav";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { DynamicIcon } from "@/components/dynamic-icon";

type CarouselItem = {
    name: string;
    type: "topic" | "interest" | "none";
    href: string;
    icon?: string;
    isIconOnly?: boolean;
};

type SynchronizedCarouselProps = {
    topics: Topic[];
    interests: Interest[];
};

export const SynchronizedCarousel: FC<SynchronizedCarouselProps> = ({ topics, interests }) => {
    const pathname = usePathname();

    const initialFilterValue = "tech";
    const initialFilterType = "topic";

    const allFilterItems: CarouselItem[] = React.useMemo(() => [
        { name: "Saved", type: "none" as const, href: "/saved", icon: "Bookmark", isIconOnly: true },
        { name: "Dashboard", type: "none" as const, href: "/", icon: "LayoutDashboard", isIconOnly: true },
        ...(Array.isArray(topics) ? topics.map(topic => ({
            ...topic,
            type: "topic" as const,
            href: `/category/${topic.name}`,
            icon: topic.icon,
        })) : []),
        ...(Array.isArray(interests) ? interests.map(interest => ({
            ...interest,
            type: "interest" as const,
            href: `/category/${interest.name}`,
            icon: interest.icon,
        })) : []),
        { name: "Explore", type: "none" as const, href: "/explore", icon: "Compass", isIconOnly: true },
        { name: "Search", type: "none" as const, href: "/search", icon: "Search", isIconOnly: true },
    ], [topics, interests]);

    const initialSelectedIndex = React.useMemo(() => {
        if (pathname === "/") {
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            return dashboardIndex !== -1 ? dashboardIndex : 0;
        }
        const techIndex = allFilterItems.findIndex(item => item.name === initialFilterValue && item.type === initialFilterType);
        return techIndex !== -1 ? techIndex : 0;
    }, [allFilterItems, pathname]);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        axis: 'x',
        align: 'start',
        duration: 50,
        startIndex: initialSelectedIndex,
    }, [WheelGesturesPlugin({
        forceWheelAxis: 'x',
        wheelDraggingClass: 'is-wheel-dragging'
    })]);

    const [navEmblaRef, navEmblaApi] = useEmblaCarousel({
        loop: false,
        axis: 'x',
        align: 'start',
        duration: 50,
        startIndex: initialSelectedIndex,
    }, [WheelGesturesPlugin({
        forceWheelAxis: 'x',
        wheelDraggingClass: 'is-wheel-dragging'
    })]);

    const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
    const [activeFilterType, setActiveFilterType] = useState<"topic" | "interest" | "none">(
        pathname === "/" ? "none" : "topic"
    );
    const [activeFilterValue, setActiveFilterValue] = useState<string>(
        pathname === "/" ? "Dashboard" : "tech"
    );

    const onSelect = useCallback((emblaMainApi: EmblaCarouselType) => {
        if (!emblaMainApi || !navEmblaApi) return;
        const newSelectedIndex = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(newSelectedIndex);

        const currentItem = allFilterItems[newSelectedIndex];
        if (currentItem) {
            setActiveFilterType(currentItem.type);
            setActiveFilterValue(currentItem.name);
            const targetIndex = Math.max(0, newSelectedIndex - 1);
            navEmblaApi.scrollTo(targetIndex, true);
        }
    }, [navEmblaApi, allFilterItems]);

    const onNavClick = useCallback((index: number) => {
        if (!emblaApi || !navEmblaApi) return;
        emblaApi.scrollTo(index);
    }, [emblaApi, navEmblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="flex flex-col h-full relative">
            <div className="absolute top-0 left-0 right-0 z-20 bg-transparent py-2">
                <CarouselNav
                    emblaRef={navEmblaRef}
                    emblaApi={navEmblaApi}
                    allFilterItems={allFilterItems}
                    selectedIndex={selectedIndex}
                    onNavClick={onNavClick}
                />
            </div>
            <MainContentCarousel
                emblaRef={emblaRef}
                emblaApi={emblaApi}
                allFilterItems={allFilterItems}
                selectedIndex={selectedIndex}
                activeFilterType={activeFilterType}
                activeFilterValue={activeFilterValue}
                topics={topics}
                interests={interests}
            />
        </div>
    );
};
