import { Suspense } from 'react';
import { InsightCarousel } from "@/components/insight-carousel";
import { InsightPageLoadingSkeleton } from "@/components/insight-page-loading-skeleton";
import type { Insight, RssFeed } from "@/types";
import { serverSupabase } from "@/lib/server-supabase"; // Import server-side supabase client
import { getPaginatedInsights } from "@/lib/insights"; // Import getPaginatedInsights
import { supabase } from "@/lib/supabase"; // Import client-side supabase client for localStorage

interface Article {
  slug: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  author: string;
  thumbnailUrl?: string; // Added thumbnailUrl
  blogContent: string;
  originalFeedUrl: string;
  category: string[]; // Changed to string[]
  source: string;
}

// Helper function to strip markdown headers
const stripMarkdownHeaders = (markdown: string): string => {
  return markdown.replace(/^(#+\s.*)/gm, '').trim();
};

// Helper function to map Article to Insight
const articleToInsight = (article: Article, allRssFeeds: RssFeed[]): Insight => {
  const feedInfo = allRssFeeds.find(feed => feed.url === article.originalFeedUrl);
  let categories: string[] = [];

  // Add categories from the article itself (which is now TEXT[])
  if (article.category && Array.isArray(article.category)) {
    categories = [...categories, ...article.category];
  }

  // Add feed name as a category if feedInfo exists
  if (feedInfo) {
    categories.push(feedInfo.name);
  }

  // Ensure uniqueness and remove empty strings
  categories = Array.from(new Set(categories.filter(c => c && c.trim() !== '')));

  return {
    slug: article.slug,
    description: article.description,
    thumbnailUrl: article.thumbnailUrl,
    category: categories,
    deepDives: [], // deepDives are removed as per user request
    seo: { title: article.title, description: article.description },
    title: article.title,
    blogContent: article.blogContent,
  };
};

export default async function HomePage() {
  let insightsForCarouselState: Insight[] = [];
  let allRssFeeds: RssFeed[] = [];
  let hasMore: boolean = false;
  let error: string | null = null;

  try {
    // Fetch all RSS feeds from Supabase to get names and categories
    const { data: rssSources, error: rssSourcesError } = await serverSupabase
      .from('rss_sources')
      .select('name, url, category');

    if (rssSourcesError) {
      throw new Error(rssSourcesError.message);
    }

    allRssFeeds = rssSources.map(source => ({
      name: source.name,
      url: source.url,
      category: source.category,
      sourceName: source.name.toLowerCase().replace(/\s/g, ''), // Simple sourceName generation
    }));

    // Fetch paginated blog posts using the new function
    const { insights, hasMore: newHasMore } = await getPaginatedInsights({ page: 1 });
    insightsForCarouselState = insights;
    hasMore = newHasMore;

  } catch (err: any) {
    console.error("Error fetching insights for homepage:", err.message);
    error = "Failed to load feed data. Please try again later.";
  }

  if (error) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center text-red-500">
          <h1 className="font-headline text-4xl font-bold">Error Loading Feed</h1>
          <p className="mt-2 text-lg text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (insightsForCarouselState.length === 0) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">No Articles Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">No articles found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <Suspense fallback={<div>Loading carousel...</div>}>
        <InsightCarousel
          initialInsights={insightsForCarouselState}
          initialHasMore={hasMore}
          shouldFetchPaginatedInsights={true} // Enable paginated fetching in the carousel
          // initialSlug, hasSeenOnboarding, and markOnboardingComplete will be handled client-side within InsightCarousel
        />
      </Suspense>
    </main>
  );
}