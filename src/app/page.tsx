import { Suspense } from 'react';

import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import type { Post } from "@/types";
import { getPaginatedPosts } from "@/lib/posts"; // Import getPaginatedPosts
import { HomepagePostSlide } from "@/components/homepage-post-slide"; // Import the new homepage slide component
import { PostCarouselWrapper } from "@/components/post-carousel-wrapper";
import { OnboardingProvider } from "@/context/onboarding-provider";

// Helper function to generate summaries from a description
const generateSummariesFromDescription = (description: string, link: string, slug: string) => {
  if (!description) return [];
  const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map((sentence, index) => ({
    type: 'article-summary',
    title: `Summary (${index + 1}/${sentences.length})`,
    icon: 'BookText',
    content: {
      snippet: sentence,
      originalArticleUrl: link,
      slug: slug,
    },
  }));
};

// Define readmoreHomepagePost outside the component for metadata generation
const readmoreHomepagePost: Post = {
  id: "home",
  slug: "home",
  title: "Welcome to ReadMore: Your Personal RSS Feed Reader",
  description: "Discover the best RSS reader experience. Follow your favorite RSS feeds, enjoy a TikTok-like scrolling interface, and get daily updates. Free and no login required.",
  link: "/",
  thumbnail_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  topic_id: null,
  summaries: [],
};

readmoreHomepagePost.summaries = generateSummariesFromDescription(
  readmoreHomepagePost.description || '',
  readmoreHomepagePost.link,
  readmoreHomepagePost.slug
);

export const metadata = {
  title: "ReadMore: The Ultimate RSS Reader | Free & No Login",
  description: "Your new favorite RSS reader. Subscribe to any RSS feed, enjoy a seamless reading experience, and get summarized articles. ReadMore is a free RSS reader that respects your privacy.",
  openGraph: {
    title: "ReadMore: The Ultimate RSS Reader | Free & No Login",
    description: "Your new favorite RSS reader. Subscribe to any RSS feed, enjoy a seamless reading experience, and get summarized articles. ReadMore is a free RSS reader that respects your privacy.",
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
    title: "ReadMore: The Ultimate RSS Reader | Free & No Login",
    description: "Your new favorite RSS reader. Subscribe to any RSS feed, enjoy a seamless reading experience, and get summarized articles. ReadMore is a free RSS reader that respects your privacy.",
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
  "description": "Your new favorite RSS reader. Subscribe to any RSS feed, enjoy a seamless reading experience, and get summarized articles. ReadMore is a free RSS reader that respects your privacy.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://readmore.app/search?q={search_term_string}", // Replace with your actual search URL
    "query-input": "required name=search_term_string"
  }
};

export default async function HomePage() {
  let postsForCarouselState: Post[] = [];
  let hasMore: boolean = false;
  let error: string | null = null;

  try {
    // Fetch paginated blog posts using the new function
    const { posts, hasMore: newHasMore } = await getPaginatedPosts({ page: 1 });
    
    postsForCarouselState = [...posts];
    hasMore = newHasMore;

  } catch (err: any) {
    console.error("Error fetching posts for homepage:", err.message);
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

  if (postsForCarouselState.length === 0) {
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
      <Suspense fallback={<PostPageLoadingSkeleton />}>
        <OnboardingProvider>
          <PostCarouselWrapper
            initialPosts={[readmoreHomepagePost, ...postsForCarouselState]}
            initialHasMore={hasMore}
            shouldFetchPaginatedPosts={true}
          />
        </OnboardingProvider>
      </Suspense>
    </main>
  );
}