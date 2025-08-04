
import { getInsightBySlug } from "@/lib/insights";
import { InsightPageClient } from "../../[slug]/client";
import { notFound } from "next/navigation";
import { getPaginatedInsights } from "@/lib/actions";
import { getRssFeeds, getFeedCategories } from "@/data/rss-feeds";
import type { Metadata } from "next";

type InsightPageProps = {
    params: {
        slug: string;
    },
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: InsightPageProps): Promise<Metadata> {
  // We need to add the prefix back for the lookup
  const insight = await getInsightBySlug(`rss-${params.slug}`);
  if (!insight) return {};

  return {
    title: insight.seo.title,
    description: insight.seo.description,
  };
}


export default async function RssInsightPage({ params, searchParams }: InsightPageProps) {
  const fullSlug = `rss-${params.slug}`;
  const allFeeds = await getRssFeeds();
  const allCategories = await getFeedCategories();

  // Use the slug to determine the category for fetching related insights
  const sourceName = params.slug.split('-')[0];
  const feed = allFeeds.find(f => f.sourceName === sourceName);
  const category = feed?.category;

  const deepDiveQuery = searchParams?.deepDive;
  const initialDeepDiveIndex = deepDiveQuery ? parseInt(deepDiveQuery as string, 10) : undefined;
  
  // Fetch insights for the specific RSS category
  const { insights, hasMore } = await getPaginatedInsights({ page: 1, category, isRss: true });
  const currentInsight = insights.find(i => i.slug === fullSlug);

  // If the slug is not on the first page, fetch it directly and add it
  if (!currentInsight) {
    const insight = await getInsightBySlug(fullSlug);
    if (!insight) {
      notFound();
    }
    // Prepend the missing insight to the list to ensure it's available
    insights.unshift(insight);
  }
  
  return (
    <InsightPageClient 
      initialInsights={insights} 
      slug={fullSlug} 
      initialDeepDiveIndex={initialDeepDiveIndex}
      initialHasMore={hasMore}
      rssCategories={allCategories}
      rssSelectedCategory={category}
    />
  );
}
