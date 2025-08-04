
import { getInsightBySlug } from "@/lib/insights";
import { InsightPageClient } from "../../[slug]/client";
import { notFound } from "next/navigation";
import { getRssFeeds } from "@/data/rss-feeds";
import { getRssFeed } from "@/lib/rss";
import type { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

type InsightPageProps = {
    params: {
        slug: string;
    },
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateStaticParams() {
  const allFeeds = await getRssFeeds();
  const allArticlesPromises = allFeeds.map(feed => getRssFeed(feed.url));
  const allArticles = (await Promise.all(allArticlesPromises)).flat();

  return allArticles.map(article => ({
    slug: article.slug.replace(/^rss-/, ''), // Remove 'rss-' prefix for the param
  }));
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
  const deepDiveQuery = searchParams?.deepDive;
  const initialDeepDiveIndex = deepDiveQuery ? parseInt(deepDiveQuery as string, 10) : undefined;
  
  const initialInsight = await getInsightBySlug(fullSlug);

  if (!initialInsight) {
    notFound();
  }
  
  return (
    <InsightPageClient 
      initialInsights={[initialInsight]} // Pass only the current insight for static generation
      slug={fullSlug} 
      initialDeepDiveIndex={initialDeepDiveIndex}
      initialHasMore={false} // No more insights to load on a static page
    />
  );
}
