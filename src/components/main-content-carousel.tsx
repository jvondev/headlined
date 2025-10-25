"use client";

import React, { FC, useEffect, useState } from "react";
import { EmblaCarouselType } from "embla-carousel-react";
import { PostCarousel } from "@/components/post-carousel";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import type { Post, Topic, Interest } from "@/types";
import { getPaginatedPosts } from "@/lib/posts";
import { SavedContent } from "@/components/saved-content";
import { ExploreContent } from "@/components/explore-content";
import { SearchContent } from "@/components/search-content";
import { DashboardContent } from "@/components/dashboard-content";

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
  emblaApi: EmblaCarouselType | undefined;
  allFilterItems: CarouselItem[];
  selectedIndex: number;
  activeFilterType: "topic" | "interest" | "none";
  activeFilterValue: string;
  topics: Topic[];
  interests: Interest[];
};

export const MainContentCarousel: FC<MainContentCarouselProps> = ({
  emblaRef,
  emblaApi,
  allFilterItems,
  selectedIndex,
  activeFilterType,
  activeFilterValue,
  topics,
  interests,
}) => {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();





  return (
    <div className="flex-1 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {allFilterItems.map((item, index) => (
          <div key={item.name} className={cn("flex-[0_0_100%] h-full", { "hidden": selectedIndex !== index })}>
            <React.Fragment>
                {item.name === "Saved" && <SavedContent />}
                {item.name === "Dashboard" && <DashboardContent />}
                {(item.type === "topic" || item.type === "interest") && (
                  <PostCarousel
                    shouldFetchPaginatedPosts={true}
                    hasSeenOnboarding={hasSeenOnboarding}
                    markOnboardingComplete={markOnboardingComplete}
                    topicName={item.type === "topic" ? (topics.find(t => t.name === item.name)?.name || "") : undefined}
                    searchQuery={item.type === "interest" ? (interests.find(i => i.name === item.name)?.name || "") : undefined}
                  />
                )}
                {item.name === "Explore" && <ExploreContent />}
                {item.name === "Search" && <SearchContent />}
              </React.Fragment>
          </div>
        ))}
      </div>
    </div>
  );
};