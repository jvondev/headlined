"use client";

import React, { FC, useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { CarouselNav } from "@/components/carousel-nav";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";
import { Bookmark, Compass, Search, LucideProps } from "lucide-react";

const iconMap = {
    Bookmark,
    Compass,
    Search,
};

type CarouselItem = {
    name: string;
    type: "topic" | "interest" | "none";
    href: string;
    icon?: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    isIconOnly?: boolean;
};

type SynchronizedCarouselProps = {
    topics: Topic[];
    interests: Interest[];
};

export const SynchronizedCarousel: FC<SynchronizedCarouselProps> = ({ topics, interests }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        axis: 'x',
        align: 'start',
        duration: 50,
    }, [WheelGesturesPlugin({
        forceWheelAxis: 'x',
        wheelDraggingClass: 'is-wheel-dragging'
    })]);

    const [navEmblaRef, navEmblaApi] = useEmblaCarousel({
        loop: false,
        axis: 'x',
        align: 'start',
        duration: 50,
    }, [WheelGesturesPlugin({
        forceWheelAxis: 'x',
        wheelDraggingClass: 'is-wheel-dragging'
    })]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeFilterType, setActiveFilterType] = useState<"topic" | "interest" | "none">("none");
    const [activeFilterValue, setActiveFilterValue] = useState<string>("Saved");

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

    const onSelect = useCallback((emblaMainApi: EmblaCarouselType) => {
        if (!emblaMainApi || !navEmblaApi) return;
        const newSelectedIndex = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(newSelectedIndex);

        const currentItem = allFilterItems[newSelectedIndex];
        if (currentItem) {
            setActiveFilterType(currentItem.type);
            setActiveFilterValue(currentItem.name);
            navEmblaApi.scrollTo(newSelectedIndex, true);
        }
    }, [navEmblaApi, allFilterItems]);

    const onNavClick = useCallback((index: number) => {
        if (!emblaApi || !navEmblaApi) return;
        emblaApi.scrollTo(index);
    }, [emblaApi, navEmblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="flex flex-col h-full">
            <CarouselNav
                emblaRef={navEmblaRef}
                emblaApi={navEmblaApi}
                allFilterItems={allFilterItems}
                selectedIndex={selectedIndex}
                onNavClick={onNavClick}
            />
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
