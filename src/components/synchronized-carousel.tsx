import React, { FC, useEffect, useState, useCallback } from "react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
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
    const [slideStyles, setSlideStyles] = useState<React.CSSProperties[]>([]);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 25 }, [WheelGesturesPlugin({ forceWheelAxis: 'x', wheelDraggingClass: 'is-wheel-dragging' })]);
    const [navEmblaRef, navEmblaApi] = useEmblaCarousel({ loop: false, axis: 'x', align: 'start', duration: 25 }, [WheelGesturesPlugin({ forceWheelAxis: 'x', wheelDraggingClass: 'is-wheel-dragging' })]);

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
            const targetIndex = Math.max(0, newSelectedIndex - 1);
            navEmblaApi.scrollTo(targetIndex, true);
        }
    }, [navEmblaApi, allFilterItems]);

    const onNavClick = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        const applyTransforms = () => {
            const scrollProgress = emblaApi.scrollProgress();
            const slidesInView = emblaApi.slidesInView(true);
            const newSlideStyles: React.CSSProperties[] = [];

            emblaApi.scrollSnapList().forEach((snap, snapIndex) => {
                const diffToTarget = snap - scrollProgress;
                                                                const scale = 1 - Math.abs(diffToTarget * 0.9); // Scale down by 90% at the edges
                                                                const translateX = diffToTarget * 300; // Adjust horizontal position
                                                                                                newSlideStyles[snapIndex] = {
                                                                                                    transform: `scale(${scale}) translateX(${translateX}px)`,
                                                                                                    opacity: Math.max(0, 1 - Math.abs(diffToTarget * 1.5)), // Fade out completely
                                                                                                };            });
            setSlideStyles(newSlideStyles);
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



    return (
        <div className="flex flex-col h-full relative">
            <div className="fixed top-0 left-0 right-0 z-20 w-full bg-background py-2">
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
                slideStyles={slideStyles}
                className="pt-[52px]"
            />
        </div>
    );
};