'use server';

import { unstable_cache } from 'next/cache';
import { Insight, RssArticle } from '@/types';
import { getRssArticleBySlug, rssToInsight } from './rss';
import { serverSupabase } from './server-supabase';

const PAGE_SIZE = 10; // Define page size for pagination

// Helper function to map Supabase data to Insight type
const mapSupabaseInsightToInsightType = (supabaseData: any): Insight => {
  return {
    slug: supabaseData.slug,
    seo: {
      title: supabaseData.title || '',
      description: supabaseData.description || '',
    },
    category: supabaseData.category || [],
    title: supabaseData.title,
    description: supabaseData.description,
    deepDives: [],
    blogContent: supabaseData.blog_content || '',
    thumbnailUrl: supabaseData.thumbnail_url,
    author: supabaseData.author || '',
    originalFeedUrl: supabaseData.original_feed_url,
    createdAt: supabaseData.created_at, // Add createdAt field
  };
};

// Fetches all insights from Supabase (use with caution for large datasets)
export const getAllInsights = unstable_cache(
  async (): Promise<Insight[]> => {
    const { data, error } = await serverSupabase
      .from('blog_posts')
      .select('id, slug, category, title, description, created_at, updated_at, thumbnail_url, author');

    if (error) {
      console.error('Error fetching all insights:', error);
      return [];
    }
    return data.map(mapSupabaseInsightToInsightType) as Insight[];
  },
  ['all-insights'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
);

interface PaginatedInsightsOptions {
  page: number;
  category?: string;
  isRss?: boolean; // This will be handled by the main actions.ts, but kept for type compatibility
  preferences?: any; // TODO: Define a proper type for preferences
  feedUrls?: string[]; // Added for filtering by subscribed feeds
}

export const getPaginatedInsights = unstable_cache(
  async ({ page, category, feedUrls }: PaginatedInsightsOptions): Promise<{ insights: Insight[], hasMore: boolean }> => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE - 1; // Supabase range is inclusive

    let query = serverSupabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false }); // Order by creation date, newest first

    if (category) {
      query = query.filter('category', 'cs', `{${category}}`);
    }

    if (feedUrls && feedUrls.length > 0) {
      query = query.in('original_feed_url', feedUrls);
    }

    const { data, error } = await query.range(startIndex, endIndex + 1); // Fetch one extra to check hasMore

    if (error) {
      console.error('Error fetching paginated insights:', error);
      return { insights: [], hasMore: false };
    }

    const insights = data.slice(0, PAGE_SIZE).map(mapSupabaseInsightToInsightType) as Insight[];
    const hasMore = data.length > PAGE_SIZE;

    return { insights, hasMore };
  },
  ['paginated-insights'],
  { revalidate: 3600 }
);

export const getInsightBySlug = unstable_cache(
  async (slug: string): Promise<Insight | undefined> => {
    if (slug.startsWith('rss-')) {
      const article = await getRssArticleBySlug(slug);
      if (!article) return undefined;
      return await rssToInsight(article);
    }

    const { data, error } = await serverSupabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching insight by slug ${slug}:`, error);
      return undefined;
    }
    return mapSupabaseInsightToInsightType(data) as Insight;
  },
  ['insight-by-slug'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
);

export const getAdjacentInsights = unstable_cache(
  async (slug: string): Promise<{ prev: Insight | null, next: Insight | null }> => {
    const { data: currentInsight, error: currentError } = await serverSupabase
      .from('blog_posts')
      .select('created_at')
      .eq('slug', slug)
      .single();

    if (currentError || !currentInsight) {
      console.error(`Error fetching current insight for adjacent check for slug ${slug}:`, currentError);
      return { prev: null, next: null };
    }

    const currentCreatedAt = currentInsight.created_at;

    // Fetch previous insight (older created_at)
    const { data: prevInsightData, error: prevError } = await serverSupabase
      .from('blog_posts')
      .select('id, slug, category, title, description, created_at, updated_at, thumbnail_url, author')
      .order('created_at', { ascending: false }) // Get the closest older one
      .limit(1);

    // Fetch next insight (newer created_at)
    const { data: nextInsightData, error: nextError } = await serverSupabase
      .from('blog_posts')
      .select('id, slug, category, title, description, created_at, updated_at, thumbnail_url, author')
      .gt('created_at', currentCreatedAt) // Greater than current created_at
      .order('created_at', { ascending: true }) // Get the closest newer one
      .limit(1);

    if (prevError) {
      console.error('Error fetching previous insight:', prevError);
    }
    if (nextError) {
      console.error('Error fetching next insight:', nextError);
    }

    const prev = prevInsightData && prevInsightData.length > 0 ? mapSupabaseInsightToInsightType(prevInsightData[0]) : null;
    const next = nextInsightData && nextInsightData.length > 0 ? mapSupabaseInsightToInsightType(nextInsightData[0]) : null;

    return {
      prev,
      next,
    };
  },
  ['adjacent-insights'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
);

export const getRandomInsightSlug = unstable_cache(
  async (): Promise<string | null> => {
    // First, get the total count of insights
    const { count, error: countError } = await serverSupabase
      .from('blog_posts')
      .select('count', { count: 'exact' });

    if (countError) {
      console.error('Error fetching insight count:', countError);
      return null;
    }

    if (count === null || count === 0) {
      return null; // No insights available
    }

    // Generate a random offset
    const randomIndex = Math.floor(Math.random() * count);

    // Fetch a single random insight using the offset
    const { data, error } = await serverSupabase
      .from('blog_posts')
      .select('slug')
      .range(randomIndex, randomIndex) // Fetch only one record at the random index
      .single();

    if (error || !data) {
      console.error('Error fetching random insight slug:', error);
      return null;
    }

    return data.slug;
  },
  ['random-insight-slug'],
  { revalidate: 3600 } // Cache for an hour
);

export const getInsightsBySlugs = unstable_cache(
  async (slugs: string[]): Promise<Insight[]> => {
    if (!slugs || slugs.length === 0) {
      return [];
    }

    const { data, error } = await serverSupabase
      .from('blog_posts')
      .select('*')
      .in('slug', slugs);

    if (error) {
      console.error('Error fetching insights by slugs:', error);
      return [];
    }

    return data.map(mapSupabaseInsightToInsightType) as Insight[];
  },
  ['insights-by-slugs'],
  { revalidate: 3600 }
);

export const getFilteredInsights = unstable_cache(
  async (feedUrls: string[]): Promise<Insight[]> => {
    if (!feedUrls || feedUrls.length === 0) {
      return [];
    }

    const { data, error } = await serverSupabase
      .from('blog_posts')
      .select('*')
      .in('original_feed_url', feedUrls)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching filtered insights:', error);
      return [];
    }

    return data.map(mapSupabaseInsightToInsightType) as Insight[];
  },
  ['filtered-insights'],
  { revalidate: 3600 }
);