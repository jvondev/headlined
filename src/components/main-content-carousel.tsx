"use client";

import React, { FC, useMemo } from "react";
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
  icon?: string;
  isIconOnly?: boolean;
};

import { usePathname } from "next/navigation";

type MainContentCarouselProps = {
  emblaRef: (instance: HTMLElement | null) => void;
  allFilterItems: CarouselItem[];
  selectedIndex: number;
  className?: string;
  date?: string;
  dateRange?: { start: string; end: string };
  setIsDashboardIntro?: (isIntro: boolean) => void;
  initialViewState?: "intro" | "dashboard";
  isIntroPaused?: boolean;
  periodLabel?: string;
  view?: string;
};

const MainContentCarouselComponent: FC<MainContentCarouselProps> = ({
  emblaRef,
  allFilterItems,
  selectedIndex,
  className,
  date,
  dateRange,
  setIsDashboardIntro,
  initialViewState,
  isIntroPaused,
  periodLabel,
  view = 'today'
}) => {
  const greetingData = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = "Good Evening";
    if (hour < 5) timeGreeting = "Good Night";
    else if (hour < 12) timeGreeting = "Good Morning";
    else if (hour < 18) timeGreeting = "Good Afternoon";

    if (view === "yesterday" && date) {
      const d = new Date(date);
      return {
        mainText: timeGreeting,
        subText: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      };
    }
    if (view === "archive" && date) {
      const d = new Date(date);
      return {
        mainText: timeGreeting,
        subText: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      };
    }
    if (view === "this-week" && dateRange) {
      const [sY, sM, sD] = dateRange.start.split('-').map(Number);
      const [eY, eM, eD] = dateRange.end.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);

      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        mainText: timeGreeting,
        subText: `${startStr} - ${endStr}`
      };
    }
    if (view === "this-month" && dateRange) {
      const [sY, sM, sD] = dateRange.start.split('-').map(Number);
      const [eY, eM, eD] = dateRange.end.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);

      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        mainText: timeGreeting,
        subText: `${startStr} - ${endStr}`
      };
    }

    return { mainText: undefined, subText: undefined };
  }, [view, date, dateRange]);

  return (
    <div className={cn("flex-1 overflow-hidden", className)} ref={emblaRef}>
      <div className="flex h-full">
        <CarouselStateProvider>
          {allFilterItems.map((item, index) => {
            return (
              <div
                key={`${item.name}-${index}`}
                className="flex-[0_0_100%] h-full will-change-[transform,opacity] transition-transform transition-opacity duration-200 ease-out"
              >
                {item.name === "Saved" && <SavedContent />}
                {item.name === "Dashboard" && (
                  <DashboardContent
                    key={`dashboard-${view}-${date || ''}-${dateRange?.start || ''}-${dateRange?.end || ''}`}
                    setIsIntroMode={setIsDashboardIntro}
                    greetingMainText={greetingData.mainText}
                    greetingSubText={greetingData.subText}
                    initialViewState={initialViewState}
                    isIntroPaused={isIntroPaused}
                    date={date}
                    dateRange={dateRange}
                    periodLabel={periodLabel}
                  />
                )}
                {(item.type === "topic" || item.type === "interest") && (
                  <PostCarousel
                    key={`${item.name}-${view}-${date || ''}-${dateRange?.start || ''}-${dateRange?.end || ''}`}
                    shouldFetchPaginatedPosts={selectedIndex === index}
                    topicName={item.type === "topic" ? item.name : undefined}
                    searchQuery={item.type === "interest" ? item.name : undefined}
                    date={date}
                    dateRange={dateRange}
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
