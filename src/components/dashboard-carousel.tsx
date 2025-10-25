"use client";

import React, { FC } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { MainContentCarousel } from "@/components/main-content-carousel";
import type { Topic, Interest } from "@/types";

type DashboardCarouselProps = {
    topics: Topic[];
    interests: Interest[];
};

export const DashboardCarousel: FC<DashboardCarouselProps> = ({ topics, interests }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        axis: 'x',
        align: 'start',
        duration: 50,
    });

    const allFilterItems = [
        { name: "Dashboard", type: "none" as const, href: "/" },
    ];

    return (
        <div className="flex flex-col h-full py-2 px-4">
            <MainContentCarousel
                emblaRef={emblaRef}
                emblaApi={emblaApi}
                allFilterItems={allFilterItems}
                selectedIndex={0}
                activeFilterType={"none"}
                activeFilterValue={"Dashboard"}
                topics={topics}
                interests={interests}
            />
        </div>
    );
};
