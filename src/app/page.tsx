"use client";

import { useEffect, useState } from "react";
import { InsightCarousel } from "@/components/insight-carousel";
import { InsightPageLoadingSkeleton } from "@/components/insight-page-loading-skeleton";
import { getRssFeeds, getFeedCategories } from "@/data/rss-feeds"; // Assuming these are now client-side
import type { Insight, RssFeed, DeepDive, DeepDiveType } from "@/types"; // Import RssFeed type, DeepDive, DeepDiveType
import { useOnboardingStatus } from "@/hooks/use-onboarding-status"; // Import useOnboardingStatus

interface Article {
  slug: string;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  author: string;
  blogContent: string;
  originalFeedUrl: string;
}

interface ArticleWithTopic extends Article {
  topicCategory: string;
}

interface SubscribedFeed {
  id: string; // This will be the originalFeedUrl
  name: string;
}

// Helper function to strip markdown headers
const stripMarkdownHeaders = (markdown: string): string => {
  return markdown.replace(/^(#+\s.*)/gm, '').trim();
};

// Helper function to map Article to Insight
const articleToInsight = (article: ArticleWithTopic, allRssFeeds: RssFeed[], topicCategory: string): Insight => {
  const feedInfo = allRssFeeds.find(feed => feed.url === article.originalFeedUrl);
  const categories: string[] = [];

  if (feedInfo) {
    categories.push(feedInfo.name); // Add feed name as category
  }
  categories.push(topicCategory); // Add topic category

  const deepDives: DeepDive<DeepDiveType>[] = [];

  // Add RSS Biodata DeepDive
  if (feedInfo) {
    const cleanedBlogContent = stripMarkdownHeaders(article.blogContent);
    const snippet = cleanedBlogContent.substring(0, 200) + '...'; // Increased snippet length

    deepDives.push({
      type: 'article-summary',
      title: 'Article Summary',
      icon: 'BookText',
      content: {
        snippet: snippet,
        originalArticleUrl: article.link,
      },
    });
  }

  return {
    slug: article.slug,
    headline: article.title,
    summary: article.summary,
    thumbnailUrl: undefined, // Article doesn't have this, set to undefined
    category: categories, 
    deepDives: deepDives, // Populate deepDives
    seo: { title: article.title, description: article.summary },
    title: article.title, // Added missing property
    blogContent: article.blogContent, // Added missing property
    // Add other Insight properties with default/empty values if necessary
  };
};

export default function HomePage() {
  const [subscribedFeedIds, setSubscribedFeedIds] = useState<string[]>([]);
  const [articles, setArticles] = useState<ArticleWithTopic[]>([]); // Use ArticleWithTopic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insightsForCarouselState, setInsightsForCarouselState] = useState<Insight[]>([]); // New state for insights
  const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus(); // Get onboarding status
  const [initialCarouselSlug, setInitialCarouselSlug] = useState<string | undefined>(undefined);

  useEffect(() => {
    // 1. Read subscribed feed IDs from local storage
    const storedFeeds = localStorage.getItem("subscribedFeeds");
    if (storedFeeds) {
      const parsedFeeds: SubscribedFeed[] = JSON.parse(storedFeeds);
      setSubscribedFeedIds(parsedFeeds.map((feed) => feed.id));
    }

    // Try to get last viewed article slug from local storage
    const lastSlug = localStorage.getItem('lastViewedArticleSlug');
    if (lastSlug) {
      setInitialCarouselSlug(lastSlug);
      localStorage.removeItem('lastViewedArticleSlug'); // Clean up
    }
  }, []);

  useEffect(() => {
    if (subscribedFeedIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAndFilterArticles = async () => {
      setLoading(true);
      setError(null);
      let allFetchedArticles: ArticleWithTopic[] = []; // Use ArticleWithTopic

      const allRssFeeds = await getRssFeeds(); // Fetch all RSS feeds to get names

      // Assuming categories are fixed for now, or can be dynamically discovered
      const categories = ["design", "news", "tech"]; // Example categories

      for (const category of categories) {
        try {
          const response = await fetch(`/generated-categories/${category}.json`);
          if (!response.ok) {
            console.warn(`Could not fetch /generated-categories/${category}.json: ${response.status}`);
            continue;
          }
          const data = await response.json();
          // Data structure is { sourceName: Article[] }
          for (const sourceName in data) {
            if (Object.prototype.hasOwnProperty.call(data, sourceName)) {
              const sourceArticles: Article[] = data[sourceName];
              allFetchedArticles = [...allFetchedArticles, ...sourceArticles.map(article => ({ ...article, topicCategory: category }))];
            }
          }
        } catch (err) {
          console.error(`Error fetching articles for category ${category}:`, err);
          setError("Failed to load some feed data.");
        }
      }

      // Filter articles by subscribed feed IDs
      const filteredArticles = allFetchedArticles.filter((article) =>
        subscribedFeedIds.includes(article.originalFeedUrl)
      );

      // Sort by publication date (newest first)
      filteredArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA;
      });

      setArticles(filteredArticles);
      // Map articles to Insight objects for InsightCarousel and set the new state
      const mappedInsights: Insight[] = filteredArticles.map(article => articleToInsight(article, allRssFeeds, article.topicCategory));
      setInsightsForCarouselState(mappedInsights);
      setLoading(false);
    };

    fetchAndFilterArticles();
  }, [subscribedFeedIds]);

  if (loading) {
    return <InsightPageLoadingSkeleton />;
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

  if (subscribedFeedIds.length === 0) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">No Subscriptions</h1>
          <p className="mt-2 text-lg text-muted-foreground">You haven't subscribed to any feeds yet. Go to "Explore" to find some!</p>
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
      <InsightCarousel 
        initialInsights={insightsForCarouselState} 
        initialSlug={initialCarouselSlug || insightsForCarouselState[0]?.slug} // Use stored slug or first article
        initialHasMore={false} // Assuming all data is loaded initially
        hasSeenOnboarding={hasSeenOnboarding} // Pass prop
        markOnboardingComplete={markOnboardingComplete} // Pass prop
      />
    </main>
  );
}