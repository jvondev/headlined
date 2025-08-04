
import { getInsightBySlug, getAdjacentInsights } from "@/lib/insights";
import { notFound } from "next/navigation";
import { BlogPageClient } from "./client";
import type { Metadata } from "next";

async function getArticleData(slug: string) {
    const insight = await getInsightBySlug(slug);
    if (!insight) {
        return { insight: undefined };
    }
    return { insight };
}

type BlogPageProps = {
    params: {
        slug: string;
    },
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  // Only pre-generate metadata for non-RSS articles for performance
  if(params.slug.startsWith('rss-')) {
    return { title: "InsightScroll" };
  }
  const { insight } = await getArticleData(params.slug);

  if (!insight) {
    return {};
  }

  return {
    title: insight.seo.title,
    description: insight.seo.description,
  };
}


export default async function BlogPostPage({ params, searchParams }: BlogPageProps) {
  // We only pre-fetch for non-RSS content for SEO and initial load performance.
  // The client component will handle fetching for RSS or if data is missing.
  const isRss = params.slug.startsWith('rss-');
  const fromSaved = searchParams.from === 'saved';
  let initialInsight;

  if (!isRss && !fromSaved) {
    const { insight } = await getArticleData(params.slug);
    if (!insight) {
      notFound();
    }
    initialInsight = insight;
  }
  
  // The client component will handle rendering, and fetching if necessary.
  return <BlogPageClient slug={params.slug} initialInsight={initialInsight} />;
}
