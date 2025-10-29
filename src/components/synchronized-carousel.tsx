import React, { FC, useEffect, useState, useCallback } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { CarouselNav } from "@/components/carousel-nav";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";

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
    const { subscribedTopics, subscribedInterests } = useSubscribedFeeds();

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
        }

        return baseItems;
    }, [topics, interests, subscribedTopics, subscribedInterests, pathname]);

    const getInitialIndex = useCallback(() => {
        if (pathname === "/today" || pathname === "/") {
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            if (dashboardIndex !== -1) return dashboardIndex;
        }
        return 0;
    }, [allFilterItems, pathname]);

    const [selectedIndex, setSelectedIndex] = useState(getInitialIndex());
    const [lastSelectedIdentifier, setLastSelectedIdentifier] = useState<{ name: string; type: "topic" | "interest" | "none" } | null>(null);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 50 }, [WheelGesturesPlugin({ forceWheelAxis: 'x', wheelDraggingClass: 'is-wheel-dragging' })]);
    const [navEmblaRef, navEmblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 50 }, [WheelGesturesPlugin({ forceWheelAxis: 'x', wheelDraggingClass: 'is-wheel-dragging' })]);

    // Effect to handle the initial scroll position
    useEffect(() => {
        if (emblaApi) emblaApi.scrollTo(getInitialIndex(), true);
    }, [emblaApi, getInitialIndex]);

    const onSelect = useCallback((emblaMainApi: EmblaCarouselType) => {
        if (!emblaMainApi || !navEmblaApi) return;
        const newSelectedIndex = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(newSelectedIndex);

        const currentItem = allFilterItems[newSelectedIndex];
        if (currentItem) {
            setLastSelectedIdentifier({ name: currentItem.name, type: currentItem.type });
            const targetIndex = Math.max(0, newSelectedIndex - 1);
            navEmblaApi.scrollTo(targetIndex, true);
        }
    }, [navEmblaApi, allFilterItems]);

    const onNavClick = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    useEffect(() => {
        if (emblaApi) {
            emblaApi.on("select", onSelect);
            emblaApi.on("reInit", onSelect);
            return () => {
                emblaApi.off("select", onSelect);
                emblaApi.off("reInit", onSelect);
            };
        }
    }, [emblaApi, onSelect]);

    // Effect to update lastSelectedIdentifier when selectedIndex changes (e.g., from direct navigation or initial load)
    useEffect(() => {
        if (allFilterItems.length > selectedIndex) {
            const currentItem = allFilterItems[selectedIndex];
            setLastSelectedIdentifier({ name: currentItem.name, type: currentItem.type });
        }
    }, [selectedIndex, allFilterItems]);

    // Effect to handle changes in allFilterItems (e.g., subscriptions changing)
    useEffect(() => {
        if (!emblaApi || !navEmblaApi || !allFilterItems.length || lastSelectedIdentifier === null) return;

        let newIndex = -1;

        // Try to find the previously selected item by its identifier in the new list
        newIndex = allFilterItems.findIndex(
            item => item.name === lastSelectedIdentifier.name && item.type === lastSelectedIdentifier.type
        );

        if (newIndex !== -1) {
            setSelectedIndex(newIndex);
            emblaApi.scrollTo(newIndex, false); // Smooth scroll to the new position
        } else {
            // Fallback to Dashboard or the first item if the previously selected item is not found
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            const targetIndex = dashboardIndex !== -1 ? dashboardIndex : 0;
            setSelectedIndex(targetIndex);
            emblaApi.scrollTo(targetIndex, false); // Smooth scroll
            setLastSelectedIdentifier({ name: allFilterItems[targetIndex].name, type: allFilterItems[targetIndex].type });
        }

        navEmblaApi.reInit();
    }, [allFilterItems, emblaApi, navEmblaApi, lastSelectedIdentifier]);

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
                topics={topics}
                interests={interests}
            />
        </div>
    );
};