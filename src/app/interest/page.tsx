'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { SynchronizedCarousel } from "@/components/synchronized-carousel";

function InterestCarousel() {
  const searchParams = useSearchParams();
  const interest = searchParams.get('interest');

  const topics = topicsData;
  const interests = interestsData;

  return (
    <OnboardingProvider>
      <SynchronizedCarousel
        topics={topics}
        interests={interests}
        initialFilterType="interest"
        initialFilterValue={interest || undefined}
      />
    </OnboardingProvider>
  );
}

export default function InterestPage() {
  return (
    <main className="h-screen w-full bg-background">
      <Suspense fallback={<PostPageLoadingSkeleton />}>
        <InterestCarousel />
      </Suspense>
    </main>
  );
}
