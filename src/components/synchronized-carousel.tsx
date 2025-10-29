import React, { FC, useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { CarouselNav } from "@/components/carousel-nav";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { DynamicIcon } from "@/components/dynamic-icon";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds"; // Import the new hook

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
    initialFilterType?: "topic" | "interest" | "none";
    initialFilterValue?: string;
};

export const SynchronizedCarousel: FC<SynchronizedCarouselProps> = ({ topics, interests, initialFilterType, initialFilterValue }) => {
    const pathname = usePathname();

    const { subscribedTopics, subscribedInterests } = useSubscribedFeeds(); // Use the new hook

    const allFilterItems: CarouselItem[] = React.useMemo(() => {
        const baseItems: CarouselItem[] = [
            { name: "Saved", type: "none" as const, href: "/saved", icon: "Bookmark", isIconOnly: true },
            { name: "Dashboard", type: "none" as const, href: "/", icon: "LayoutDashboard", isIconOnly: true },
        ];

        if (pathname === "/today") {
            const subscribedTopicItems = subscribedTopics.map(topic => ({
                ...topic,
                type: "topic" as const,
                href: `/topic?topic=${topic.name}`,
                icon: topic.icon,
            }));
            const subscribedInterestItems = subscribedInterests.map(interest => ({
                ...interest,
                type: "interest" as const,
                href: `/interest?interest=${interest.name}`,
                icon: interest.icon,
            }));
            return [...baseItems, ...subscribedTopicItems, ...subscribedInterestItems, { name: "Explore", type: "none" as const, href: "/explore", icon: "Compass", isIconOnly: true }, { name: "Search", type: "none" as const, href: "/search", icon: "Search", isIconOnly: true }];
        } else if (initialFilterType && initialFilterValue) {
            // For /topic or /interest pages, add the specific topic/interest from the URL
            let specificItem: CarouselItem | undefined;
            if (initialFilterType === "topic") {
                const topic = topics.find(t => t.name === initialFilterValue);
                if (topic) {
                    specificItem = { ...topic, type: "topic" as const, href: `/topic?topic=${topic.name}`, icon: topic.icon };
                }
            } else if (initialFilterType === "interest") {
                const interest = interests.find(i => i.name === initialFilterValue);
                if (interest) {
                    specificItem = { ...interest, type: "interest" as const, href: `/interest?interest=${interest.name}`, icon: interest.icon };
                }
            }
            return specificItem ? [...baseItems, specificItem] : baseItems;
        }

        return baseItems; // Fallback
    }, [topics, interests, subscribedTopics, subscribedInterests, pathname, initialFilterType, initialFilterValue]);

    const initialSelectedIndex = React.useMemo(() => {
        if (pathname === "/today") {
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            return dashboardIndex !== -1 ? dashboardIndex : 0;
        } else if (initialFilterValue && initialFilterType) {
            const index = allFilterItems.findIndex(item => item.name === initialFilterValue && item.type === initialFilterType);
            return index !== -1 ? index : 0;
        } else if (pathname === "/") {
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            return dashboardIndex !== -1 ? dashboardIndex : 0;
        }
        const defaultInitialFilterValue = "tech";
        const defaultInitialFilterType = "topic";
        const techIndex = allFilterItems.findIndex(item => item.name === defaultInitialFilterValue && item.type === defaultInitialFilterType);
        return techIndex !== -1 ? techIndex : 0;
    }, [allFilterItems, pathname, initialFilterValue, initialFilterType]);

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
        initialFilterType || (pathname === "/") ? "none" : "topic"
    );
    const [activeFilterValue, setActiveFilterValue] = useState<string>(
        initialFilterValue || (pathname === "/") ? "Dashboard" : "tech"
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
