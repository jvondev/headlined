import { Suspense } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { getTopics } from "@/data/topics";
import { getAllInterests } from "@/data/interests";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { SynchronizedCarousel } from "@/components/synchronized-carousel";

export default async function HomePage() {
  const topics = await getTopics();
  const interests = await getAllInterests();

  return (
    <main className="min-h-screen w-full bg-background">
      <Suspense fallback={<PostPageLoadingSkeleton />}>
        <OnboardingProvider>
          <SynchronizedCarousel
            topics={topics}
            interests={interests}
          />
        </OnboardingProvider>
      </Suspense>
    </main>
  );
}