"use client";

import React, { FC } from "react";
import { EmblaCarouselType } from "embla-carousel-react";
import { PostCarousel } from "@/components/post-carousel";
import { SavedContent } from "@/components/saved-content";
import { ExploreContent } from "@/components/explore-content";
import { SearchContent } from "@/components/search-content";
import { DashboardContent } from "@/components/dashboard-content";
import { CarouselStateProvider } from "@/context/carousel-state-context";
import type { Topic, Interest } from "@/types";

type CarouselItem = {
  name: string;
  type: "topic" | "interest" | "none";
  href: string;
  icon?: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<SVGSVGElement>>;
  isIconOnly?: boolean;
};

type MainContentCarouselProps = {
  emblaRef: (instance: HTMLElement | null) => void;
  emblaApi: EmblaCarouselType | undefined;
  allFilterItems: CarouselItem[];
  selectedIndex: number;
  topics: Topic[];
  interests: Interest[];
};

export const MainContentCarousel: FC<MainContentCarouselProps> = ({
  emblaRef,
  emblaApi,
  allFilterItems,
  selectedIndex,
  topics,
  interests,
}) => {
  return (
    <div className="flex-1 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        <CarouselStateProvider>
          {allFilterItems.map((item, index) => (
            <div
              key={item.name}
              className="flex-[0_0_100%] h-full"
            >
              {item.name === "Saved" && <SavedContent />}
              {item.name === "Dashboard" && <DashboardContent />}
              {(item.type === "topic" || item.type === "interest") && (
                <PostCarousel
                  shouldFetchPaginatedPosts={selectedIndex === index}
                  topicName={item.type === "topic" ? item.name : undefined}
                  searchQuery={item.type === "interest" ? item.name : undefined}
                />
              )}
              {item.name === "Explore" && <ExploreContent />}
              {item.name === "Search" && <SearchContent />}
            </div>
          ))}
        </CarouselStateProvider>
      </div>
    </div>
  );
};
