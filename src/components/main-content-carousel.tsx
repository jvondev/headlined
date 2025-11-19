"use client";

import React, { FC } from "react";
import { UseEmblaCarouselType } from "embla-carousel-react";
import { PostCarousel } from "@/components/post-carousel";
import { SavedContent } from "@/components/saved-content";
import { ExploreContent } from "@/components/explore-content";
import { SearchContent } from "@/components/search-content";
import { DashboardContent } from "@/components/dashboard-content";
import { CarouselStateProvider } from "@/context/carousel-state-context";
import type { Topic, Interest } from "@/types";
import { cn } from "@/lib/utils";

type CarouselItem = {
  name: string;
  type: "topic" | "interest" | "none";
  href: string;
  icon?: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<SVGSVGElement>>;
  isIconOnly?: boolean;
};

type MainContentCarouselProps = {
  emblaRef: (instance: HTMLElement | null) => void;
  emblaApi: UseEmblaCarouselType[1] | undefined;
  allFilterItems: CarouselItem[];
  selectedIndex: number;
  topics: Topic[];
  interests: Interest[];
  slideStyles: React.CSSProperties[];
  className?: string;
};

const MainContentCarouselComponent: FC<MainContentCarouselProps> = ({
  emblaRef,
  emblaApi,
  allFilterItems,
  selectedIndex,
  topics,
  interests,
  slideStyles,
  className,
}) => {
  return (
    <div className={cn("flex-1 overflow-hidden", className)} ref={emblaRef}>
      <div className="flex h-full">
        <CarouselStateProvider>
          {allFilterItems.map((item, index) => {
            return (
              <div
                key={item.name}
                className="flex-[0_0_100%] h-full will-change-[transform,opacity] transition-transform transition-opacity duration-200 ease-out"
                style={slideStyles[index]}
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
                {item.name === "Search" && <SearchContent isLoading={false} />}
              </div>
            );
          })}
        </CarouselStateProvider>
      </div>
    </div>
  );
};

export const MainContentCarousel = React.memo(MainContentCarouselComponent);
