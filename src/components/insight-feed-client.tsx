'use client';

import { useEffect, useState } from 'react';
import { Insight } from '@/types';
import { getFilteredInsights } from '@/lib/insights';
import { useInView } from '@/hooks/use-in-view';
import { InsightView } from './insight-view';
import { InsightPageLoadingSkeleton } from './insight-page-loading-skeleton';

export function InsightFeedClient() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { ref, inView } = useInView();

  useEffect(() => {
    const fetchInitialInsights = async () => {
      setLoading(true);
      try {
        const subscribedFeeds = JSON.parse(localStorage.getItem('subscribedFeeds') || '[]');
        const fetchedInsights = await getFilteredInsights(subscribedFeeds);
        setInsights(fetchedInsights);
        setHasMore(false); // For now, assume no more pages with filtered insights
      } catch (error) {
        console.error('Error fetching initial filtered insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialInsights();
  }, []);

  // TODO: Implement infinite scrolling for filtered insights if needed
  // useEffect(() => {
  //   if (inView && hasMore && !loading) {
  //     setPage((prevPage) => prevPage + 1);
  //     // Fetch more insights here
  //   }
  // }, [inView, hasMore, loading]);

  if (loading) {
    return <InsightPageLoadingSkeleton />;
  }

  if (insights.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No insights found for your subscribed feeds.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {insights.map((insight) => (
        <InsightView key={insight.slug} insight={insight} isActive={true} />
      ))}
      <div ref={ref} className="h-10" /> {/* Sentinel for infinite scroll */}
    </div>
  );
}
