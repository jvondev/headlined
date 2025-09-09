"use client";

import { FC } from "react";
import { InsightCarousel } from "@/components/insight-carousel";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import type { Insight } from "@/types";

type InsightCarouselWrapperProps = {
  initialInsights: Insight[];
  initialHasMore: boolean;
  shouldFetchPaginatedInsights?: boolean;
};

export const InsightCarouselWrapper: FC<InsightCarouselWrapperProps> = ({
  initialInsights,
  initialHasMore,
  shouldFetchPaginatedInsights,
}) => {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();

  return (
    <InsightCarousel
      initialInsights={initialInsights}
      initialHasMore={initialHasMore}
      shouldFetchPaginatedInsights={shouldFetchPaginatedInsights}
      initialSlug={initialInsights[0]?.slug || ""} // Pass the slug of the first insight
      hasSeenOnboarding={hasSeenOnboarding}
      markOnboardingComplete={markOnboardingComplete}
    />
  );
};
