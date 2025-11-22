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
  icon?: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<SVGSVGElement>>;
  isIconOnly?: boolean;
};

import { usePathname } from "next/navigation";

type MainContentCarouselProps = {
  emblaRef: (instance: HTMLElement | null) => void;
  emblaApi: UseEmblaCarouselType[1] | undefined;
  allFilterItems: CarouselItem[];
  selectedIndex: number;
  topics: Topic[];
  interests: Interest[];
  className?: string;
  date?: string;
  dateRange?: { start: string; end: string };
  setIsDashboardIntro?: (isIntro: boolean) => void;
};

const MainContentCarouselComponent: FC<MainContentCarouselProps> = ({
  emblaRef,
  emblaApi,
  allFilterItems,
  selectedIndex,
  topics,
  interests,
  className,
  date,
  dateRange,
  setIsDashboardIntro,
}) => {
  const pathname = usePathname();

  const greetingData = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = "Good Evening";
    if (hour < 5) timeGreeting = "Good Night";
    else if (hour < 12) timeGreeting = "Good Morning";
    else if (hour < 18) timeGreeting = "Good Afternoon";

    if (pathname === "/yesterday" && date) {
      const d = new Date(date);
      return {
        mainText: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        subText: timeGreeting
      };
    }
    if (pathname === "/archive" && date) {
      const d = new Date(date);
      return {
        mainText: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        subText: timeGreeting
      };
    }
    if (pathname === "/this-week" && dateRange) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        mainText: `${startStr} - ${endStr}`,
        subText: timeGreeting
      };
    }
    if (pathname === "/this-month" && dateRange) {
      const start = new Date(dateRange.start);
      return {
        mainText: start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        subText: timeGreeting
      };
    }

    return { mainText: undefined, subText: undefined };
  }, [pathname, date, dateRange]);

  return (
    <div className={cn("flex-1 overflow-hidden", className)} ref={emblaRef}>
      <div className="flex h-full">
        <CarouselStateProvider>
          {allFilterItems.map((item, index) => {
            return (
              <div
                key={item.name}
                className="flex-[0_0_100%] h-full will-change-[transform,opacity] transition-transform transition-opacity duration-200 ease-out"
              >
                {item.name === "Saved" && <SavedContent />}
                {item.name === "Dashboard" && (
                  <DashboardContent
                    setIsIntroMode={setIsDashboardIntro}
                    greetingMainText={greetingData.mainText}
                    greetingSubText={greetingData.subText}
                  />
                )}
                {(item.type === "topic" || item.type === "interest") && (
                  <PostCarousel
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
