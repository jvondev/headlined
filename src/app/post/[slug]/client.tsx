"use client";

import { PostCarousel } from "@/components/post-carousel";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { getPaginatedPosts } from "@/lib/actions";
import { useEffect, useState, useTransition } from "react";
import type { Post } from "@/types";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status"; // Added import
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"; // Added import

export function PostPageClient({ 
  initialPosts, 
  slug, 
  initialHasMore,
  shouldFetchPaginatedPosts = false
}: { 
  initialPosts: Post[], 
  slug: string, 
  initialHasMore: boolean,
  shouldFetchPaginatedPosts?: boolean
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentSlug, setCurrentSlug] = useState<string>(slug);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus(); // Added hook usage
  const [isLoading, setIsLoading] = useState(initialPosts.length === 0);
  
  useEffect(() => {
    // This effect ensures the carousel starts on the correct post
    // when the initial data is provided directly.
    if (initialPosts.length > 0) {
      const initialPost = initialPosts.find(i => i.slug === slug);
      if (initialPost) {
        const otherPosts = initialPosts.filter(i => i.slug !== slug);
        setPosts([initialPost, ...otherPosts]);
      } else {
        setPosts(initialPosts);
      }
      setCurrentSlug(slug);
    }
  }, [initialPosts, slug]);


  if (isLoading) {
    return <PostPageLoadingSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">No Content Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Could not load any articles for this view.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <PostCarousel 
        initialPosts={posts} 
        initialSlug={currentSlug}
        initialHasMore={hasMore}
        hasSeenOnboarding={hasSeenOnboarding}
        markOnboardingComplete={markOnboardingComplete}
      />
    </main>
  );
}