'use client';

import dynamic from 'next/dynamic';
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSubscribedFeeds } from '@/hooks/use-subscribed-feeds';
import { useEffect, useState } from 'react';
import { checkIfFeedHasPosts } from '@/lib/client-posts';
import { Topic, Interest } from '@/types';

const SynchronizedCarousel = dynamic(
  () => import('@/components/synchronized-carousel').then(mod => mod.SynchronizedCarousel),
  {
    loading: () => <PostPageLoadingSkeleton />,
    ssr: false,
  }
);

export default function HomePage() {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();
  const { subscribedTopics, subscribedInterests } = useSubscribedFeeds();
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  useEffect(() => {
    const filterFeeds = async () => {
      setLoadingFeeds(true);
      const filteredTopics: Topic[] = [];
      for (const topic of topicsData) {
        const hasPosts = await checkIfFeedHasPosts("topic", topic.name);
        if (hasPosts) {
          filteredTopics.push(topic as Topic);
        }
      }
      setAvailableTopics(filteredTopics);

      const filteredInterests: Interest[] = [];
      for (const interest of interestsData) {
        const hasPosts = await checkIfFeedHasPosts("interest", interest.name);
        if (hasPosts) {
          filteredInterests.push(interest as Interest);
        }
      }
      setAvailableInterests(filteredInterests);
      setLoadingFeeds(false);
    };

    filterFeeds();
  }, []);


  return (
    <main className="h-screen w-full bg-background">
      <OnboardingProvider>
        <OnboardingFlow
          isOpen={!hasSeenOnboarding || (subscribedTopics.length === 0 && subscribedInterests.length === 0)}
          onClose={markOnboardingComplete}
          availableTopics={availableTopics}
          availableInterests={availableInterests}
        />
        {loadingFeeds ? (
          <PostPageLoadingSkeleton />
        ) : (
          <SynchronizedCarousel
            topics={availableTopics}
            interests={availableInterests}
          />
        )}
      </OnboardingProvider>
    </main>
  );
}
