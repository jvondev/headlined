"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { MainContentCarousel } from "@/components/main-content-carousel";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { getTopics } from "@/data/topics";
import { getAllInterests } from "@/data/interests";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import { OnboardingProvider } from "@/context/onboarding-provider";

const DEFAULT_TOPIC_SLUG = "tech"; // Default topic

export default function HomePage() {
  const searchParams = useSearchParams();
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [activeFilterType, setActiveFilterType] = useState<"topic" | "interest" | "none">("topic");
  const [activeFilterValue, setActiveFilterValue] = useState<string>("");

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
      }
    };
    fetchData();
  }, [searchParams]);

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
              setActiveFilterType(type);
              setActiveFilterValue(value);
            }}
          />

          <MainContentCarousel
            activeFilterType={activeFilterType}
            activeFilterValue={activeFilterValue}
            topics={topics}
            interests={interests}
          />
        </OnboardingProvider>
      </Suspense>
    </main>
  );
}