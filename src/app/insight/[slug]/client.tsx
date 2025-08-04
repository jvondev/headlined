
"use client";

import { InsightCarousel } from "@/components/insight-carousel";
import { InsightPageLoadingSkeleton } from "@/components/insight-page-loading-skeleton";
import { getPaginatedInsights } from "@/lib/actions";
import { useEffect, useState, useTransition } from "react";
import type { Insight } from "@/types";

export function InsightPageClient({ 
  initialInsights, 
  slug, 
  initialDeepDiveIndex,
  rssCategories,
  rssSelectedCategory,
  initialHasMore
}: { 
  initialInsights: Insight[], 
  slug: string, 
  initialDeepDiveIndex?: number,
  rssCategories?: string[],
  rssSelectedCategory?: string,
  initialHasMore: boolean
}) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [currentSlug, setCurrentSlug] = useState<string>(slug);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(initialInsights.length === 0);
  
  useEffect(() => {
    // If we start with no insights (e.g., the main RSS page), fetch them now.
    const fetchInitialData = async () => {
      if (initialInsights.length === 0 && rssSelectedCategory) {
        setIsLoading(true);
        const { insights: fetchedInsights, hasMore: fetchedHasMore } = await getPaginatedInsights({
          page: 1,
          isRss: true,
          category: rssSelectedCategory,
        });

        if (fetchedInsights.length > 0) {
          setInsights(fetchedInsights);
          setCurrentSlug(fetchedInsights[0].slug); // Start with the first article
        }
        setHasMore(fetchedHasMore);
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [initialInsights.length, rssSelectedCategory]);


  useEffect(() => {
    // This effect ensures the carousel starts on the correct insight
    // when the initial data is provided directly.
    if (initialInsights.length > 0) {
      const initialInsight = initialInsights.find(i => i.slug === slug);
      if (initialInsight) {
        const otherInsights = initialInsights.filter(i => i.slug !== slug);
        setInsights([initialInsight, ...otherInsights]);
      } else {
        setInsights(initialInsights);
      }
      setCurrentSlug(slug);
    }
  }, [initialInsights, slug]);


  if (isLoading) {
    return <InsightPageLoadingSkeleton />;
  }

  if (insights.length === 0) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">No Content Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Could not load any articles for {rssSelectedCategory ? `'${rssSelectedCategory}'` : 'this view'}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <InsightCarousel 
        initialInsights={insights} 
        initialSlug={currentSlug}
        startOnDeepDive={initialDeepDiveIndex !== undefined} 
        initialDeepDiveIndex={initialDeepDiveIndex}
        rssCategories={rssCategories}
        rssSelectedCategory={rssSelectedCategory}
        initialHasMore={hasMore}
      />
    </main>
  );
}
