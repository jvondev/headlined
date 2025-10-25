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

  const [initialPostsForFilter, setInitialPostsForFilter] = useState<Post[]>([]);
  const [initialHasMoreForFilter, setInitialHasMoreForFilter] = useState(false);
  const [isLoadingFilterPosts, setIsLoadingFilterPosts] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Fetch posts for the active filter only when the slide is active
  useEffect(() => {
    const fetchPostsForFilter = async () => {
      const currentItem = allFilterItems[selectedIndex];
      if (!currentItem || (currentItem.type === "none" && currentItem.name !== "Saved" && currentItem.name !== "Explore" && currentItem.name !== "Search" && currentItem.name !== "Dashboard")) return;

      setIsLoadingFilterPosts(true);
      setFilterError(null);
      setInitialPostsForFilter([]);
      setInitialHasMoreForFilter(false);

      let fetchedPosts: Post[] = [];
      let hasMore = false;

      try {
        if (currentItem.type === "topic") {
          const currentTopic = topics.find(t => t.name === currentItem.name);
          if (!currentTopic) {
            setFilterError("Topic not found.");
            return;
          }
          const result = await getPaginatedPosts({ page: 1, topic_id: currentTopic.id });
          fetchedPosts = result.posts;
          hasMore = result.hasMore;
        } else if (currentItem.type === "interest") {
          const currentInterest = interests.find(i => i.name === currentItem.name);
          if (!currentInterest) {
            setFilterError("Interest not found.");
            return;
          }
          const searchQuery = [currentInterest.name, ...(currentInterest.aliases || [])].join(' OR ');
          const result = await getPaginatedPosts({ page: 1, search_query: searchQuery });
          fetchedPosts = result.posts;
          hasMore = result.hasMore;
        } else if (currentItem.type === "none") {
          // For Saved, Explore, Search, Dashboard, we don't fetch posts here directly
          // Their content will be rendered by their respective components
          setIsLoadingFilterPosts(false);
        }
        setInitialPostsForFilter(fetchedPosts);
        setInitialHasMoreForFilter(hasMore);
      } catch (err: any) {
        console.error("Error fetching posts for filter:", err.message);
        setFilterError("Failed to load posts for this filter.");
      } finally {
        setIsLoadingFilterPosts(false);
      }
    };

    if (emblaApi && selectedIndex === allFilterItems.findIndex(item => item.name === activeFilterValue)) {
      fetchPostsForFilter();
    }
  }, [selectedIndex, activeFilterType, activeFilterValue, topics, interests, allFilterItems, emblaApi]);

  return (
    <div className="flex-1 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {allFilterItems.map((item, index) => (
          <div key={item.name} className="flex-[0_0_100%] h-full">
            {selectedIndex === index && (
              <React.Fragment>
                {item.name === "Saved" && <SavedContent isLoading={isLoadingFilterPosts} />}
                {item.name === "Dashboard" && <DashboardContent />}
                {item.type === "topic" || item.type === "interest" ? (
                  isLoadingFilterPosts ? (
                    <PostPageLoadingSkeleton />
                  ) : filterError ? (
                    <div className="text-center text-red-500 py-16">
                      <h1 className="font-headline text-4xl font-bold">Error</h1>
                      <p className="mt-2 text-lg text-muted-foreground">{filterError}</p>
                    </div>
                  ) : initialPostsForFilter.length === 0 ? (
                    <div className="text-center py-16">
                      <h1 className="font-headline text-4xl font-bold">No Posts Found</h1>
                      <p className="mt-2 text-lg text-muted-foreground">No posts found for "{item.name}".</p>
                    </div>
                  ) : (
                    <PostCarousel
                      initialPosts={initialPostsForFilter}
                      initialSlug={initialPostsForFilter[0]?.slug || ""}
                      initialHasMore={initialHasMoreForFilter}
                      shouldFetchPaginatedPosts={true}
                      hasSeenOnboarding={hasSeenOnboarding}
                      markOnboardingComplete={markOnboardingComplete}
                      topicId={item.type === "topic" ? (topics.find(t => t.name === item.name)?.id || "") : undefined}
                      searchQuery={item.type === "interest" ? (interests.find(i => i.name === item.name)?.name || "") : undefined}
                    />
                  )
                ) : null}
                {item.name === "Explore" && <ExploreContent isLoading={isLoadingFilterPosts} />}
                {item.name === "Search" && <SearchContent isLoading={isLoadingFilterPosts} />}
              </React.Fragment>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};