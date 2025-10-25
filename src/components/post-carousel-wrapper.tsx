"use client";

import { FC } from "react";
import { PostCarousel } from "@/components/post-carousel";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";
import type { Post } from "@/types";

type PostCarouselWrapperProps = {
  initialPosts: Post[];
  initialHasMore: boolean;
  shouldFetchPaginatedPosts?: boolean;
};

export const PostCarouselWrapper: FC<PostCarouselWrapperProps> = ({
  initialPosts,
  initialHasMore,
  shouldFetchPaginatedPosts,
}) => {
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();

  return (
    <PostCarousel
      initialPosts={initialPosts}
      initialHasMore={initialHasMore}
      shouldFetchPaginatedPosts={shouldFetchPaginatedPosts}
      initialSlug={initialPosts[0]?.slug || ""} // Pass the slug of the first post
      hasSeenOnboarding={hasSeenOnboarding}
      markOnboardingComplete={markOnboardingComplete}
    />
  );
};