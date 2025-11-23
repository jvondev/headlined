import React, { FC, useEffect, useState, useCallback } from "react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { CarouselNav } from "@/components/carousel-nav";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { checkIfFeedHasPosts } from "@/lib/client-posts";

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
    date?: string;
    dateRange?: { start: string; end: string };
    initialViewState?: "intro" | "dashboard";
    isIntroPaused?: boolean;
    periodLabel?: string;
};

export const SynchronizedCarousel: FC<SynchronizedCarouselProps> = ({ topics, interests, date, dateRange, initialViewState, isIntroPaused, periodLabel }) => {
    const pathname = usePathname();
    const { subscribedTopics, subscribedInterests } = useSubscribedFeeds();
    const [isDashboardIntro, setIsDashboardIntro] = useState(true);
    const [filteredItems, setFilteredItems] = useState<CarouselItem[]>([]);

    useEffect(() => {
        const filterItems = async () => {
            const baseItems: CarouselItem[] = [
                { name: "Saved", type: "none" as const, href: "/saved", icon: "Bookmark", isIconOnly: true },
                { name: "Dashboard", type: "none" as const, href: "/", icon: "LayoutDashboard", isIconOnly: true },
            ];

            if (pathname === "/today" || pathname === "/yesterday" || pathname === "/this-week" || pathname === "/this-month" || pathname === "/archive") {
                const subscribedTopicItems = subscribedTopics.map(topic => ({
                    ...topic,
                    type: "topic" as const,
                    href: `/topic?topic=${topic.name}`,
                    icon: topic.icon || undefined,
                }));
                const subscribedInterestItems = subscribedInterests.map(interest => ({
                    ...interest,
                    type: "interest" as const,
                    href: `/interest?interest=${interest.name}`,
                    icon: interest.icon || undefined,
                }));

                const allPotentialItems = [...subscribedTopicItems, ...subscribedInterestItems];
                const validItems: CarouselItem[] = [];

                for (const item of allPotentialItems) {
                    const hasPosts = await checkIfFeedHasPosts(item.type as 'topic' | 'interest', item.name, date, dateRange);
                    if (hasPosts) {
                        validItems.push(item);
                    }
                }

                setFilteredItems([...baseItems, ...validItems, { name: "Explore", type: "none" as const, href: "/explore", icon: "Compass", isIconOnly: true }, { name: "Search", type: "none" as const, href: "/search", icon: "Search", isIconOnly: true }]);
            } else {
                setFilteredItems(baseItems);
            }
        };

        filterItems();
    }, [topics, interests, subscribedTopics, subscribedInterests, pathname, date, dateRange]);

    const allFilterItems = filteredItems;

    const getInitialIndex = useCallback(() => {
        if (pathname === "/today" || pathname === "/" || pathname === "/yesterday" || pathname === "/this-week" || pathname === "/this-month" || pathname === "/archive") {
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            if (dashboardIndex !== -1) return dashboardIndex;
        }
        return 0;
    }, [allFilterItems, pathname]);

    const [selectedIndex, setSelectedIndex] = useState(getInitialIndex());

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 25 }, [WheelGesturesPlugin({ forceWheelAxis: 'x', wheelDraggingClass: 'is-wheel-dragging' })]);
    const [navEmblaRef, navEmblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 50 }, [WheelGesturesPlugin({ forceWheelAxis: 'x', wheelDraggingClass: 'is-wheel-dragging' })]);

    // Effect to handle the initial scroll position
    useEffect(() => {
        if (emblaApi) emblaApi.scrollTo(getInitialIndex(), true);
    }, [emblaApi, getInitialIndex]);

    const onSelect = useCallback((emblaMainApi: UseEmblaCarouselType[1]) => {
        if (!emblaMainApi || !navEmblaApi) return;
        const newSelectedIndex = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(newSelectedIndex);
    }, [navEmblaApi, allFilterItems]);

    const onNavClick = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    // Direct DOM manipulation for animations - NO React state updates
    useEffect(() => {
        if (!emblaApi) return;

        const applyTransforms = () => {
            const scrollProgress = emblaApi.scrollProgress();
            const slides = emblaApi.slideNodes();
            const snapList = emblaApi.scrollSnapList();

            slides.forEach((slide, index) => {
                const snap = snapList[index];
                const diffToTarget = snap - scrollProgress;
                const scale = 1 - Math.abs(diffToTarget * 0.9);
                const translateX = diffToTarget * 300;

                slide.style.transform = `scale(${scale}) translateX(${translateX}px) translateZ(0)`;
                slide.style.opacity = Math.max(0, 1 - Math.abs(diffToTarget * 1.5)).toString();
            });
        };

        emblaApi.on("scroll", applyTransforms);
        emblaApi.on("reInit", applyTransforms);
        applyTransforms(); // Apply initial transforms

        return () => {
            emblaApi.off("scroll", applyTransforms);
            emblaApi.off("reInit", applyTransforms);
        };
    }, [emblaApi, allFilterItems.length]);

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


    const showNav = !isDashboardIntro || allFilterItems[selectedIndex]?.name !== "Dashboard";

    return (
        <div className="flex flex-col h-full relative">
            {showNav && (
                <div className="fixed top-0 left-0 right-0 z-20 w-full bg-background py-2">
                    <CarouselNav
                        emblaRef={navEmblaRef}
                        emblaApi={navEmblaApi}
                        allFilterItems={allFilterItems}
                        selectedIndex={selectedIndex}
                        onNavClick={onNavClick}
                    />
                </div>
            )}
            <MainContentCarousel
                emblaRef={emblaRef}
                emblaApi={emblaApi}
                allFilterItems={allFilterItems}
                selectedIndex={selectedIndex}
                topics={topics}
                interests={interests}
                date={date}
                dateRange={dateRange}
                setIsDashboardIntro={setIsDashboardIntro}
                initialViewState={initialViewState}
                className="pt-[52px]"
                isIntroPaused={isIntroPaused}
                periodLabel={periodLabel}
            />
        </div>
    );
};