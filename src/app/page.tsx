"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

  const [topics, setTopics] = useState<Topic[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [activeFilterType, setActiveFilterType] = useState<"topic" | "interest" | "none">("topic");
  const [activeFilterValue, setActiveFilterValue] = useState<string>("");

  const [initialPostsForFilter, setInitialPostsForFilter] = useState<Post[]>([]);
  const [initialHasMoreForFilter, setInitialHasMoreForFilter] = useState(false);
  const [isLoadingFilterPosts, setIsLoadingFilterPosts] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);

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
      } else if (interestParam) {
        setActiveFilterType("interest");
        setActiveFilterValue(interestParam);
      } else if (fetchedTopics.length > 0) {
        // Default to tech topic if no params
        setActiveFilterType("topic");
        setActiveFilterValue(DEFAULT_TOPIC_SLUG);
        router.replace(`/?topic=${DEFAULT_TOPIC_SLUG}`);
      }
    };
    fetchData();
  }, [router, searchParams]);

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
        } else if (activeFilterType === "none") {
            // Handle "Saved" and "Explore" here if they need to fetch posts
            // For now, we assume they navigate to a different page and don't fetch posts on the homepage
            setInitialPostsForFilter([]);
            setInitialHasMoreForFilter(false);
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
    fetchPostsForFilter();
  }, [activeFilterType, activeFilterValue, topics, interests]);

  const currentFilterName = activeFilterValue;

  return (
    <main className="min-h-screen w-full bg-background">
      <Suspense fallback={<PostPageLoadingSkeleton />}>
        <OnboardingProvider>
          <PageHeader
            topics={topics}
            interests={interests}
            activeFilterType={activeFilterType}
            activeFilterValue={activeFilterValue}
            onFilterChange={(type, value) => {
              if (type === "topic") {
                router.replace(`/?topic=${value}`);
              } else if (type === "interest") {
                router.replace(`/?interest=${value}`);
              } else if (value === "Saved") {
                router.push("/saved");
              } else if (value === "Explore") {
                router.push("/explore");
              }
            }}
          />

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
        </OnboardingProvider>
      </Suspense>
    </main>
  );
}