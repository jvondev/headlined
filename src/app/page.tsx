"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { cn } from "@/lib/utils";
import { PostCarousel } from "@/components/post-carousel";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { getTopics } from "@/data/topics";
import { getAllInterests } from "@/data/interests";
import { getPaginatedPosts } from "@/lib/posts";
import type { Post, Topic, Interest } from "@/types";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { PageHeader } from "@/components/shared/page-header";
import { useFullScreen } from "@/context/full-screen-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const DEFAULT_TOPIC_SLUG = "tech"; // Default topic

// Helper function to generate summaries from a description
const generateSummariesFromDescription = (description: string | null, link: string, slug: string) => {
  if (!description) return [];
  const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map((sentence, index) => ({
    type: 'article-summary',
    title: `Summary (${index + 1}/${sentences.length})`,
    icon: 'BookText',
    content: {
      snippet: sentence,
      originalArticleUrl: link,
      slug: slug,
    },
  }));
};

// Define readmoreHomepagePost outside the component for metadata generation
const readmoreHomepagePost: Post = {
  id: "home",
  slug: "home",
  title: "Welcome to ReadMore: Your Personal RSS Feed Reader",
  description: "Discover the best RSS reader experience. Follow your favorite RSS feeds, enjoy a TikTok-like scrolling interface, and get daily updates. Free and no login required.",
  link: "/",
  thumbnail_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  topic_id: null,
  summaries: [],
};

readmoreHomepagePost.summaries = generateSummariesFromDescription(
  readmoreHomepagePost.description,
  readmoreHomepagePost.link,
  readmoreHomepagePost.slug
);

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();
  const { isFullScreen, toggleFullScreen } = useFullScreen();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [activeFilterType, setActiveFilterType] = useState<"topic" | "interest">("topic");
  const [activeFilterValue, setActiveFilterValue] = useState<string>("");

  const [initialPostsForFilter, setInitialPostsForFilter] = useState<Post[]>([]);
  const [initialHasMoreForFilter, setInitialHasMoreForFilter] = useState(false);
  const [isLoadingFilterPosts, setIsLoadingFilterPosts] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Embla for horizontal topic/interest carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: 'x',
    startIndex: 0,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'x',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Fetch topics and interests on mount
  useEffect(() => {
    const fetchData = async () => {
      const fetchedTopics = await getTopics();
      setTopics(fetchedTopics);

      const fetchedInterests = await getAllInterests();
      setInterests(fetchedInterests);

      // Determine initial active filter
      const topicParam = searchParams.get("topic");
      const interestParam = searchParams.get("interest");

      if (topicParam) {
        setActiveFilterType("topic");
        setActiveFilterValue(topicParam);
        const initialIndex = fetchedTopics.findIndex(topic => topic.name === topicParam);
        if (initialIndex !== -1) {
          emblaApi?.scrollTo(initialIndex, false);
        }
      } else if (interestParam) {
        setActiveFilterType("interest");
        setActiveFilterValue(interestParam);
        // Need to adjust emblaApi scroll for interests if they are in the same carousel
        // For now, assume topics come first in the carousel
        const initialIndex = fetchedTopics.length + fetchedInterests.findIndex(interest => interest.name === interestParam);
        if (initialIndex !== fetchedTopics.length -1) { // Check if interest is found
          emblaApi?.scrollTo(initialIndex, false);
        }
      } else if (fetchedTopics.length > 0) {
        // Default to tech topic if no params
        setActiveFilterType("topic");
        setActiveFilterValue(DEFAULT_TOPIC_SLUG);
        const initialIndex = fetchedTopics.findIndex(topic => topic.name === DEFAULT_TOPIC_SLUG);
        if (initialIndex !== -1) {
          emblaApi?.scrollTo(initialIndex, false);
        }
        router.replace(`/?topic=${DEFAULT_TOPIC_SLUG}`);
      }
    };
    fetchData();
  }, [emblaApi, router, searchParams]);

  // Handle filter change via Embla API
  useEffect(() => {
    if (!emblaApi || topics.length === 0 || interests.length === 0) return;

    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      const totalTopics = topics.length;

      if (newIndex < totalTopics) {
        // It's a topic
        const newTopicSlug = topics[newIndex]?.name;
        if (newTopicSlug && (activeFilterType !== "topic" || activeFilterValue !== newTopicSlug)) {
          setActiveFilterType("topic");
          setActiveFilterValue(newTopicSlug);
          router.replace(`/?topic=${newTopicSlug}`);
        }
      } else {
        // It's an interest
        const interestIndex = newIndex - totalTopics;
        const newInterestSlug = interests[interestIndex]?.name;
        if (newInterestSlug && (activeFilterType !== "interest" || activeFilterValue !== newInterestSlug)) {
          setActiveFilterType("interest");
          setActiveFilterValue(newInterestSlug);
          router.replace(`/?interest=${newInterestSlug}`);
        }
      }
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, topics, interests, router, activeFilterType, activeFilterValue]);

  // Fetch posts for the active filter
  useEffect(() => {
    const fetchPostsForFilter = async () => {
      if (topics.length === 0 && interests.length === 0) return;
      if (!activeFilterValue) return; // Wait until an active filter is set

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
          // Combine interest name and aliases for search query
          const searchQuery = [currentInterest.name, ...(currentInterest.aliases || [])].join(' OR ');
          const result = await getPaginatedPosts({ page: 1, search_query: searchQuery });
          fetchedPosts = result.posts;
          hasMore = result.hasMore;
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
    fetchPostsForFilter();
  }, [activeFilterType, activeFilterValue, topics, interests]);

  const currentFilterName = activeFilterValue;

  return (
    <main className="min-h-screen w-full bg-background">
      <Suspense fallback={<PostPageLoadingSkeleton />}>
        <OnboardingProvider>
          <PageHeader
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
            topics={topics}
            interests={interests}
            activeFilterType={activeFilterType}
            activeFilterValue={activeFilterValue}
            onFilterChange={(type, value) => {
              if (type === "topic") {
                router.replace(`/?topic=${value}`);
              } else if (type === "interest") {
                router.replace(`/?interest=${value}`);
              }
            }}
          />

          {/* Horizontal Topic/Interest Carousel */}
          <div className="relative h-full w-full flex flex-col">
            <div className="flex-shrink-0 py-2">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {topics.map((topic) => (
                    <div key={topic.name} className="flex-[0_0_100%] px-4">
                      <h2 className="text-xl font-bold text-center">{topic.name}</h2>
                    </div>
                  ))}
                  {interests.map((interest) => (
                    <div key={interest.name} className="flex-[0_0_100%] px-4">
                      <h2 className="text-xl font-bold text-center">{interest.name}</h2>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-2">
                <Button onClick={scrollPrev} disabled={!emblaApi?.canScrollPrev()} variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button onClick={scrollNext} disabled={!emblaApi?.canScrollNext()} variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm rounded-full">
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Vertical Post Carousel for Active Filter */}
            <div className="flex-1">
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
          </div>
        </OnboardingProvider>
      </Suspense>
    </main>
  );
}