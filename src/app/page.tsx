import { Suspense } from 'react';
import { InsightCarousel } from "@/components/insight-carousel";
import { InsightPageLoadingSkeleton } from "@/components/insight-page-loading-skeleton";
import type { Insight, RssFeed } from "@/types";
import { serverSupabase } from "@/lib/server-supabase"; // Import server-side supabase client
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
  category: string;
  source: string;
}

// Helper function to strip markdown headers
const stripMarkdownHeaders = (markdown: string): string => {
  return markdown.replace(/^(#+\s.*)/gm, '').trim();
};

// Helper function to map Article to Insight
const articleToInsight = (article: Article, allRssFeeds: RssFeed[]): Insight => {
  const feedInfo = allRssFeeds.find(feed => feed.url === article.originalFeedUrl);
  const categories: string[] = [];

  if (feedInfo) {
    categories.push(feedInfo.name); // Add feed name as category
  }
  categories.push(article.category); // Add topic category from article

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
  let articles: Article[] = [];
  let allRssFeeds: RssFeed[] = [];
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

    // Fetch blog posts from Supabase
    const { data: blogPosts, error: blogPostsError } = await serverSupabase
      .from('blog_posts')
      .select('slug, title, description, link, pub_date, author, thumbnail_url, original_feed_url, blog_content, category, source');

    if (blogPostsError) {
      throw new Error(blogPostsError.message);
    }

    articles = blogPosts.map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description || '',
      link: post.link,
      pubDate: post.pub_date || new Date().toISOString(),
      author: post.author || '',
      thumbnailUrl: post.thumbnail_url || '',
      originalFeedUrl: post.original_feed_url,
      blogContent: post.blog_content || '',
      category: post.category,
      source: post.source,
    }));

    // Sort by publication date (newest first)
    articles.sort((a, b) => {
      const dateA = new Date(a.pubDate || 0).getTime();
      const dateB = new Date(b.pubDate || 0).getTime();
      return dateB - dateA;
    });

  } catch (err: any) {
    console.error("Error fetching articles from Supabase:", err.message);
    error = "Failed to load feed data. Please try again later.";
  }

  const insightsForCarouselState: Insight[] = articles.map(article => articleToInsight(article, allRssFeeds));

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

  if (articles.length === 0) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">No Articles Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">No articles found for your subscribed feeds.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background">
      <Suspense fallback={<div>Loading carousel...</div>}>
        <InsightCarousel
          initialInsights={insightsForCarouselState}
          // subscribedFeedIds and initialSlug will be handled client-side within InsightCarousel
          // hasSeenOnboarding and markOnboardingComplete will be handled client-side within InsightCarousel
        />
      </Suspense>
    </main>
  );
}