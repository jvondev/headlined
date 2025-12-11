import React, { FC, useEffect, useState, useCallback } from "react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
// TIKTOK: Removed WheelGesturesPlugin for instant snap
import { CarouselNav } from "@/components/carousel-nav";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";
import { usePathname } from "next/navigation";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { checkIfFeedHasPosts } from "@/lib/client-posts";
import { checkLicenseStatus } from "@/lib/license-manager";
import { KeyboardShortcutsHint } from "@/components/keyboard-shortcuts-hint";

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
    view: string;
};

export const SynchronizedCarousel: FC<SynchronizedCarouselProps> = ({ topics, interests, date, dateRange, initialViewState, isIntroPaused, periodLabel, view }) => {
    // pathname used only for legacy/fallback if view isn't provided, but we enforce view
    const { subscribedTopics, subscribedInterests } = useSubscribedFeeds();
    // Initialize state from sessionStorage if available to handle remounts (e.g. closing modal)
    const [isDashboardIntro, setIsDashboardIntro] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = sessionStorage.getItem(`dashboard_intro_${view}`);
            if (cached) return JSON.parse(cached);
        }
        return true;
    });

    // Update session storage when intro state changes
    useEffect(() => {
        sessionStorage.setItem(`dashboard_intro_${view}`, JSON.stringify(isDashboardIntro));
    }, [isDashboardIntro, view]);

    const [filteredItems, setFilteredItems] = useState<CarouselItem[]>([]);

    useEffect(() => {
        const filterItems = async () => {
            const baseItems: CarouselItem[] = [
                { name: "Saved", type: "none" as const, href: "/saved", icon: "Bookmark", isIconOnly: true },
                { name: "Dashboard", type: "none" as const, href: "/", icon: "LayoutDashboard", isIconOnly: true },
            ];

            const supportedViews = ["today", "yesterday", "this-week", "this-month", "archive"];

            if (supportedViews.includes(view)) {
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
                const isPremium = await checkLicenseStatus();
                const isArchiveMode = !!(date || dateRange);

                for (const item of allPotentialItems) {
                    const hasPosts = await checkIfFeedHasPosts(item.type as 'topic' | 'interest', item.name, date, dateRange);

                    // Logic:
                    // 1. If item has posts, always show it.
                    // 2. If it's archive mode AND user is NOT premium (Preview Mode), show it even if no posts (to show locked state).
                    // 3. If premium user in archive mode, only show if has posts (standard behavior).

                    if (hasPosts || (isArchiveMode && !isPremium)) {
                        validItems.push(item);
                    }
                }

                setFilteredItems([...baseItems, ...validItems, { name: "Explore", type: "none" as const, href: "/explore", icon: "Compass", isIconOnly: true }, { name: "Search", type: "none" as const, href: "/search", icon: "Search", isIconOnly: true }]);
            } else {
                setFilteredItems(baseItems);
            }
        };

        filterItems();
    }, [topics, interests, subscribedTopics, subscribedInterests, view, date, dateRange]);

    const allFilterItems = filteredItems;

    const getInitialIndex = useCallback(() => {
        // Try storage first
        if (typeof window !== 'undefined') {
            const cachedIndex = sessionStorage.getItem(`dashboard_index_${view}`);
            if (cachedIndex) return parseInt(cachedIndex, 10);
        }

        const supportedViews = ["today", "yesterday", "this-week", "this-month", "archive"];
        if (supportedViews.includes(view)) {
            const dashboardIndex = allFilterItems.findIndex(item => item.name === "Dashboard");
            if (dashboardIndex !== -1) return dashboardIndex;
        }
        return 0;
    }, [allFilterItems, view]);

    const [selectedIndex, setSelectedIndex] = useState(getInitialIndex());

    // TIKTOK-STYLE: Instant snap with fast duration
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 15, skipSnaps: false });
    const [navEmblaRef, navEmblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 20 });

    // Effect to handle the initial scroll position
    useEffect(() => {
        if (emblaApi) emblaApi.scrollTo(getInitialIndex(), true);
    }, [emblaApi, getInitialIndex]);

    const onSelect = useCallback((emblaMainApi: UseEmblaCarouselType[1]) => {
        if (!emblaMainApi || !navEmblaApi) return;
        const newSelectedIndex = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(newSelectedIndex);
        sessionStorage.setItem(`dashboard_index_${view}`, newSelectedIndex.toString());
    }, [navEmblaApi, allFilterItems, view]);

    const onNavClick = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    // TIKTOK-STYLE: Simple visibility toggle - no complex transforms
    useEffect(() => {
        if (!emblaApi) return;

        const updateVisibility = () => {
            const slides = emblaApi.slideNodes();
            const selectedIndex = emblaApi.selectedScrollSnap();

            slides.forEach((slide, index) => {
                const distance = Math.abs(index - selectedIndex);

                if (distance > 1) {
                    slide.style.opacity = '0';
                    slide.style.pointerEvents = 'none';
                } else {
                    slide.style.opacity = '1';
                    slide.style.pointerEvents = distance === 0 ? 'auto' : 'none';
                }
                slide.style.transform = 'translateZ(0)';
            });
        };

        emblaApi.on("select", updateVisibility);
        emblaApi.on("reInit", updateVisibility);
        updateVisibility();

        return () => {
            emblaApi.off("select", updateVisibility);
            emblaApi.off("reInit", updateVisibility);
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

    // Keyboard navigation for carousel
    useEffect(() => {
        if (!emblaApi) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore keyboard events if an input field is focused
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                return;
            }

            if (event.key === "ArrowLeft") {
                emblaApi.scrollPrev();
            } else if (event.key === "ArrowRight") {
                emblaApi.scrollNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [emblaApi]);


    const showNav = !isDashboardIntro || allFilterItems[selectedIndex]?.name !== "Dashboard";

    return (
        <div className="flex flex-col h-full relative">
            {showNav && (
                <div className="fixed top-0 left-0 right-0 z-20 w-full bg-transparent py-2 pointer-events-none">
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
                className="pt-[60px] md:pt-[48px]"
                isIntroPaused={isIntroPaused}
                periodLabel={periodLabel}
                view={view}
            />
            <KeyboardShortcutsHint />
        </div>
    );
};