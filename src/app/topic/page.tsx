'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { SynchronizedCarousel } from "@/components/synchronized-carousel";

export default function TopicPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const topics = topicsData;
  const interests = interestsData;
  return (
    <main className="h-screen w-full bg-background">
      <Suspense fallback={<PostPageLoadingSkeleton />}>
        <OnboardingProvider>
          <SynchronizedCarousel
            topics={topics}
            interests={interests}
            initialFilterType="topic"
            initialFilterValue={topic || undefined}
          />
        </OnboardingProvider>







      </Suspense>







    </main>







  );







}




