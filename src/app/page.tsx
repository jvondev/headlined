import { Suspense } from 'react';

import { InsightPageLoadingSkeleton } from "@/components/insight-page-loading-skeleton";
import type { Insight, RssFeed } from "@/types";
import { serverSupabase } from "@/lib/server-supabase"; // Import server-side supabase client
import { getPaginatedInsights } from "@/lib/insights"; // Import getPaginatedInsights
import { supabase } from "@/lib/supabase"; // Import client-side supabase client for localStorage
import { HomepageInsightSlide } from "@/components/homepage-insight-slide"; // Import the new homepage slide component
import { InsightCarouselWrapper } from "@/components/insight-carousel-wrapper";
import { OnboardingProvider } from "@/context/onboarding-provider";



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
  tags: string[];
  source: string;
}

// Helper function to strip markdown headers
const stripMarkdownHeaders = (markdown: string): string => {
  return markdown.replace(/^(#+\s.*)/gm, '').trim();
};

// Helper function to map Article to Insight
const articleToInsight = (article: Article, allRssFeeds: RssFeed[]): Insight => {
  const feedInfo = allRssFeeds.find(feed => feed.url === article.originalFeedUrl);
  let tags: string[] = [];

  // Add tags from the article itself (which is now TEXT[])
  if (article.tags && Array.isArray(article.tags)) {
    tags = [...tags, ...article.tags];
  }

  // Add feed name as a tag if feedInfo exists
  if (feedInfo) {
    tags.push(feedInfo.name);
    if (feedInfo.tags) {
      tags = [...tags, ...feedInfo.tags];
    }
  }

  // Ensure uniqueness and remove empty strings
  tags = Array.from(new Set(tags.filter(t => t && t.trim() !== '')));

  return {
    slug: article.slug,
    description: article.description,
    thumbnailUrl: article.thumbnailUrl,
    tags: tags,
    topic_id: null, // Add this line
    deepDives: [], // deepDives are removed as per user request
    seo: { title: article.title, description: article.description },
    title: article.title,
    blogContent: article.blogContent,
  };
};

// Define readmoreHomepageInsight outside the component for metadata generation
const readmoreHomepageInsight: Insight = {
  slug: "home",
  title: "Welcome to ReadMore: Your Personal RSS Feed Reader",
  description: "Discover the best RSS reader experience. Follow your favorite RSS feeds, enjoy a TikTok-like scrolling interface, and get daily updates. Free and no login required.",
  tags: ["RSS", "RSS Reader", "News", "Free App"],
  seo: {
    title: "ReadMore: The Ultimate RSS Reader | Free & No Login",
    description: "Your new favorite RSS reader. Subscribe to any RSS feed, enjoy a seamless reading experience, and get summarized articles. ReadMore is a free RSS reader that respects your privacy.",
  },
  deepDives: [
    {
      type: "qna",
      title: "What is ReadMore?",
      icon: "HelpCircle",
      content: {
        questions: [
          {
            q: "What is an RSS reader?",
            a: "An RSS (Really Simple Syndication) reader is an application that aggregates content from various web sources, such as blogs and news websites, into a single, easy-to-read feed. Instead of visiting multiple websites, you get all the new articles in one place.",
          },
          {
            q: "Is ReadMore free to use?",
            a: "Yes, ReadMore is completely free to use. There are no hidden costs or premium features. We believe in providing a seamless reading experience for everyone.",
          },
          {
            q: "Do I need an account to use ReadMore?",
            a: "No, you don't need to create an account or log in to use ReadMore. We respect your privacy and offer a no-login-required experience. Just open the app and start reading.",
          },
        ],
      },
    },
    {
      type: "checklist",
      title: "Key Features",
      icon: "ListChecks",
      content: {
        items: [
          { text: "Subscribe to any RSS feed", isDone: true },
          { text: "TikTok-like scrolling interface for easy reading", isDone: true },
          { text: "Article summarizer to get the key points quickly", isDone: true },
          { text: "Daily updates from your favorite sources", isDone: true },
          { text: "Completely free, no hidden costs", isDone: true },
          { text: "No login or account required", isDone: true },
          { text: "Save your favorite articles to read later", isDone: true },
        ],
      },
    },
    {
      type: "howto",
      title: "How to use ReadMore",
      icon: "ListOrdered",
      content: {
        steps: [
          { title: "Discover Feeds", description: "Explore the feed library or add your own RSS feed URL." },
          { title: "Subscribe", description: "Click the 'Subscribe' button to add a feed to your personal collection." },
          { title: "Read", description: "Scroll through your feed like you would on TikTok. Click on a card to read the full article." },
          { title: "Save", description: "Save your favorite articles to read later." },
        ],
      },
    },
    {
      type: "comparison",
      title: "ReadMore vs. Others",
      icon: "Columns",
      content: {
        titleA: "ReadMore",
        titleB: "Other RSS Readers",
        items: [
          { feature: "Price", itemA: "Free", itemB: "Freemium/Paid" },
          { feature: "Login Required", itemA: "No", itemB: "Yes" },
          { feature: "UI/UX", itemA: "TikTok-like scroll", itemB: "Traditional list" },
          { feature: "Article Summarizer", itemA: "Yes", itemB: "No" },
        ],
      },
    },
    {
      type: "alternatives",
      title: "Alternatives to ReadMore",
      icon: "Shuffle",
      content: {
        points: [
          { name: "Feedly", description: "A popular RSS reader with a lot of features, but requires a subscription for some of them." },
          { name: "Inoreader", description: "A powerful RSS reader with a free tier, but with limitations." },
          { name: "The Old Reader", description: "A simple RSS reader with a social component." },
        ],
      },
    },
  ],
  blogContent: "", // No blog content for this static slide
};

export const metadata = {
  title: readmoreHomepageInsight.seo.title,
  description: readmoreHomepageInsight.seo.description,
  keywords: readmoreHomepageInsight.tags.join(', '),
  openGraph: {
    title: readmoreHomepageInsight.seo.title,
    description: readmoreHomepageInsight.seo.description,
    url: 'https://readmore.app', // Replace with your actual URL
    siteName: 'ReadMore',
    images: [
      {
        url: 'https://readmore.app/readmore_icon.webp', // Replace with your actual image URL
        width: 800,
        height: 600,
        alt: 'ReadMore App Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: readmoreHomepageInsight.seo.title,
    description: readmoreHomepageInsight.seo.description,
    creator: '@readmoreapp', // Replace with your Twitter handle
    images: ['https://readmore.app/readmore_icon.webp'], // Replace with your actual image URL
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ReadMore",
  "url": "https://readmore.app", // Replace with your actual URL
  "description": readmoreHomepageInsight.seo.description,
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://readmore.app/search?q={search_term_string}", // Replace with your actual search URL
    "query-input": "required name=search_term_string"
  }
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
      .select('name, url, topics ( name, id )');

    if (rssSourcesError) {
      throw new Error(rssSourcesError.message);
    }

    allRssFeeds = rssSources.map(source => ({
      name: source.name,
      url: source.url,
      tags: source.topics ? [source.topics.name] : [],
      topic_id: source.topics ? source.topics.id : null,
      sourceName: source.name.toLowerCase().replace(/\s/g, ''), // Simple sourceName generation
    }));

    // Fetch paginated blog posts using the new function
    const { insights, hasMore: newHasMore } = await getPaginatedInsights({ page: 1 });
    
    insightsForCarouselState = [...insights];
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<InsightPageLoadingSkeleton />}>
        <OnboardingProvider>
          <InsightCarouselWrapper
            initialInsights={[readmoreHomepageInsight, ...insightsForCarouselState]}
            initialHasMore={hasMore}
            shouldFetchPaginatedInsights={true}
          />
        </OnboardingProvider>
      </Suspense>
    </main>
  );
}