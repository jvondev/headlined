import { getInsightBySlug, getAllInsights } from "@/lib/insights";
import { serverSupabase } from "@/lib/server-supabase";
import { InsightPageClient } from './client';
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getPaginatedInsights } from "@/lib/actions";
import { cookies } from "next/headers";
import { Suspense } from 'react';
import { InsightPageLoadingSkeleton } from '@/components/insight-page-loading-skeleton';

type InsightPageProps = {
    params: {
        slug: string;
    },
    searchParams: { [key: string]: string | string[] | undefined }
}

export const revalidate = 86400; // Revalidate every day

export async function generateStaticParams() {
  const { data: insights } = await serverSupabase
    .from('blog_posts')
    .select('slug')
    .order('created_at', { ascending: false })
    .limit(10); // Limit to 10 most recent insights for static generation

  return (insights || []).map((insight: { slug: string }) => ({
    slug: insight.slug,
  }));
}

function getDynamicParams(params: { slug: string }, searchParams: { [key: string]: string | string[] | undefined }) {
  return {
    slug: params.slug,
    category: searchParams?.category as string | undefined,
    deepDiveQuery: searchParams?.deepDive,
  };
}

export async function generateMetadata({ params, searchParams }: InsightPageProps): Promise<Metadata> {
  const { slug } = getDynamicParams(params, searchParams);
  const insight = await getInsightBySlug(slug);
  if (!insight) return {};

  return {
    title: insight.seo.title,
    description: insight.seo.description,
  };
}

export default function InsightPage({ params, searchParams }: InsightPageProps) {
  return (
    <Suspense fallback={<InsightPageLoadingSkeleton />}>
      <InsightPageWithData params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function InsightPageWithData({ params, searchParams }: InsightPageProps) {
  const { slug, category, deepDiveQuery } = getDynamicParams(params, searchParams);
  const initialDeepDiveIndex = deepDiveQuery ? parseInt(deepDiveQuery as string, 10) : undefined;
  
  // This page is now only for non-RSS insights
  if (slug.startsWith('rss-')) {
    notFound();
  }

  // Get preferences from cookies to perform initial sort
  const cookieStore = await cookies(); // Ensure correct type inference
  const preferencesCookie = cookieStore.get('insightPreferences');
  const preferences = preferencesCookie ? JSON.parse(preferencesCookie.value) : {};

  // Fetch standard insights, already sorted by preference
  const { insights, hasMore } = await getPaginatedInsights({ page: 1, category, isRss: false, preferences });
  const currentInsight = insights.find(i => i.slug === slug);

  // If the slug is not on the first page (e.g. from a direct link), fetch it directly
  // and prepend it to the list to ensure it's available for the carousel.
  if (!currentInsight) {
    const insight = await getInsightBySlug(slug);
    if (!insight) {
      notFound();
    }
    // Prepend the insight to the list. The carousel will start at this insight.
    insights.unshift(insight);
  }
  
  return (
    <InsightPageClient 
      initialInsights={insights} 
      slug={slug} 
      initialDeepDiveIndex={initialDeepDiveIndex}
      initialHasMore={hasMore}
    />
  );
}