"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { PostCarousel } from "@/components/post-carousel";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import type { Post, Topic, Interest } from "@/types";
import { getPaginatedPosts } from "@/lib/posts";
import { getTopics } from "@/data/topics";
import { getAllInterests } from "@/data/interests";
import { SavedContent } from "@/components/saved-content";
import { ExploreContent } from "@/components/explore-content";
import { SearchContent } from "@/components/search-content";

type MainContentCarouselProps = {
  activeFilterType: "topic" | "interest" | "none";
  activeFilterValue: string;
  topics: Topic[];
  interests: Interest[];
};

export const MainContentCarousel: FC<MainContentCarouselProps> = ({
  activeFilterType,
  activeFilterValue,
  topics,
  interests,
}) => {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: 'x',
    startIndex: 0,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'x',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);

  const [initialPostsForFilter, setInitialPostsForFilter] = useState<Post[]>([]);
  const [initialHasMoreForFilter, setInitialHasMoreForFilter] = useState(false);
  const [isLoadingFilterPosts, setIsLoadingFilterPosts] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Fetch posts for the active filter
  useEffect(() => {
    const fetchPostsForFilter = async () => {
      if (topics.length === 0 && interests.length === 0) return;
      if (!activeFilterValue && activeFilterType !== "none") return; // Wait until an active filter is set

      setIsLoadingFilterPosts(true);
      setFilterError(null);
      setInitialPostsForFilter([]);
      setInitialHasMoreForFilter(false);

      let fetchedPosts: Post[] = [];
      let hasMore = false;

      try {
        if (activeFilterType === "topic") {
          const currentTopic = topics.find(t => t.name === activeFilterValue);
          if (!currentTopic) {
            setFilterError("Topic not found.");
            return;
          }
          const result = await getPaginatedPosts({ page: 1, topic_id: currentTopic.id });
          fetchedPosts = result.posts;
          hasMore = result.hasMore;
        } else if (activeFilterType === "interest") {
          const currentInterest = interests.find(i => i.name === activeFilterValue);
          if (!currentInterest) {
            setFilterError("Interest not found.");
            return;
          }
          const searchQuery = [currentInterest.name, ...(currentInterest.aliases || [])].join(' OR ');
          const result = await getPaginatedPosts({ page: 1, search_query: searchQuery });
          fetchedPosts = result.posts;
          hasMore = result.hasMore;
        } else if (activeFilterType === "none") {
            // For Saved, Explore, Search, we don't fetch posts here directly
            // Their content will be rendered by their respective components
            // Set loading to false immediately as MainContentCarousel doesn't fetch their data
            setIsLoadingFilterPosts(false);
        }
        setInitialPostsForFilter(fetchedPosts);
        setInitialHasMoreForFilter(hasMore);
      } catch (err: any) {
        console.error("Error fetching posts for filter:", err.message);
        setFilterError("Failed to load posts for this filter.");
      } finally {
        // Only set loading to false if it was true, to avoid flickering
        if (isLoadingFilterPosts) {
            setIsLoadingFilterPosts(false);
        }
      }
    };
    fetchPostsForFilter();
  }, [activeFilterType, activeFilterValue, topics, interests]);

  const currentFilterName = activeFilterValue;

  // Determine the index of the active slide
  const slideIndexMap = useRef<Record<string, number>>({});
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Build the map of filter values to slide indices
    slideIndexMap.current["Saved"] = 0;
    slideIndexMap.current["TopicsAndInterests"] = 1; // Represents the combined topics/interests slide
    slideIndexMap.current["Explore"] = 2;
    slideIndexMap.current["Search"] = 3;

    let newIndex = 0;
    if (activeFilterType === "none") {
        if (activeFilterValue === "Saved") {
            newIndex = slideIndexMap.current["Saved"];
        } else if (activeFilterValue === "Explore") {
            newIndex = slideIndexMap.current["Explore"];
        } else if (activeFilterValue === "Search") {
            newIndex = slideIndexMap.current["Search"];
        }
    } else if (activeFilterType === "topic" || activeFilterType === "interest") {
        newIndex = slideIndexMap.current["TopicsAndInterests"];
    }
    setSelectedIndex(newIndex);

    if (emblaApi) {
      emblaApi.scrollTo(newIndex, true);
    }
  }, [activeFilterType, activeFilterValue, topics, interests, emblaApi]);

  return (
    <div className="flex-1 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {/* Saved Page */}
        <div className="flex-[0_0_100%] h-full">
          <SavedContent isLoading={activeFilterType === "none" && activeFilterValue === "Saved" && isLoadingFilterPosts} />
        </div>

        {/* Topics and Interests Posts */}
        <div className="flex-[0_0_100%] h-full">
            {isLoadingFilterPosts ? (
                <PostPageLoadingSkeleton />
            ) : filterError ? (
                <div className="text-center text-red-500 py-16">
                    <h1 className="font-headline text-4xl font-bold">Error</h1>
                    <p className="mt-2 text-lg text-muted-foreground">{filterError}</p>
                </div>
            ) : initialPostsForFilter.length === 0 ? (
                <div className="text-center py-16">
                    <h1 className="font-headline text-4xl font-bold">No Posts Found</h1>
                    <p className="mt-2 text-lg text-muted-foreground">No posts found for "{currentFilterName}".</p>
                </div>
            ) : (
                <PostCarousel
                    initialPosts={initialPostsForFilter}
                    initialSlug={initialPostsForFilter[0]?.slug || ""}
                    initialHasMore={initialHasMoreForFilter}
                    shouldFetchPaginatedPosts={true}
                    hasSeenOnboarding={hasSeenOnboarding}
                    markOnboardingComplete={markOnboardingComplete}
                    topicId={activeFilterType === "topic" ? (topics.find(t => t.name === activeFilterValue)?.id || "") : undefined}
                    searchQuery={activeFilterType === "interest" ? (interests.find(i => i.name === activeFilterValue)?.name || "") : undefined}
                />
            )}
        </div>

        {/* Explore Page */}
        <div className="flex-[0_0_100%] h-full">
          <ExploreContent isLoading={activeFilterType === "none" && activeFilterValue === "Explore" && isLoadingFilterPosts} />
        </div>

        {/* Search Page */}
        <div className="flex-[0_0_100%] h-full">
          <SearchContent isLoading={activeFilterType === "none" && activeFilterValue === "Search" && isLoadingFilterPosts} />
        </div>
      </div>
    </div>
  );
};