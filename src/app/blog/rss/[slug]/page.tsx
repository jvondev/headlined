
import { Suspense } from "react";
import { BlogPageClient } from "../../[slug]/client";
import type { Metadata } from "next";
import { getRssFeeds } from "@/data/rss-feeds";
import { getRssFeed } from "@/lib/rss";
import { getInsightBySlug } from "@/lib/insights";
import { notFound } from "next/navigation";

export const revalidate = 86400; // Revalidate every 24 hours



// This function is for metadata generation only.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const fullSlug = `rss-${params.slug}`;
  const insight = await getInsightBySlug(fullSlug);

  if (!insight) {
    return {};
  }

  return {
    title: insight.seo.title,
    description: insight.seo.description,
  };
}

// This page component is now a server component.
export default async function RssBlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const fullSlug = `rss-${params.slug}`;
  const initialInsight = await getInsightBySlug(fullSlug);

  if (!initialInsight) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogPageClient slug={fullSlug} initialInsight={initialInsight} />
    </Suspense>
  );
}
