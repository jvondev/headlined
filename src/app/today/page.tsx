'use client';

import dynamic from 'next/dynamic';
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { OnboardingProvider } from "@/context/onboarding-provider";

const SynchronizedCarousel = dynamic(
  () => import('@/components/synchronized-carousel').then(mod => mod.SynchronizedCarousel),
  {
    loading: () => <PostPageLoadingSkeleton />,
    ssr: false,
  }
);

export default function HomePage() {
  const topics = topicsData;
  const interests = interestsData;

  return (
    <main className="h-screen w-full bg-background">
      <OnboardingProvider>
        <SynchronizedCarousel
          topics={topics}
          interests={interests}
        />
      </OnboardingProvider>
    </main>
  );
}
