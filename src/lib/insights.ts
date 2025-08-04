'use server';

import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

import { Insight, RssArticle } from '@/types';
import { getRssArticleBySlug, rssToInsight } from './rss';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PAGE_SIZE = 10; // Define page size for pagination

// Helper function to map Supabase data to Insight type
const mapSupabaseInsightToInsightType = (supabaseData: any): Insight => {
  return {
    slug: supabaseData.slug,
    seo: {
      title: supabaseData.seo_title || '',
      description: supabaseData.seo_description || '',
    },
    category: supabaseData.category || [],
    title: supabaseData.title,
    headline: supabaseData.headline,
    summary: supabaseData.summary,
    deepDives: supabaseData.deep_dives || [],
    blogContent: supabaseData.blog_content || '',
    // thumbnailUrl: supabaseData.thumbnailUrl, // Assuming this column exists if used
    author: supabaseData.author, // Assuming this column exists if used
  };
};

// Fetches all insights from Supabase (use with caution for large datasets)
export const getAllInsights = unstable_cache(
  async (): Promise<Insight[]> => {
    const { data, error } = await supabase
      .from('insights')
      .select('id, slug, seo_title, seo_description, category, title, headline, summary, author, created_at, updated_at');

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
}

export const getPaginatedInsights = unstable_cache(
  async ({ page, category }: PaginatedInsightsOptions): Promise<{ insights: Insight[], hasMore: boolean }> => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE - 1; // Supabase range is inclusive

    let query = supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false }); // Order by creation date, newest first

    if (category) {
      // Assuming category is stored as TEXT[] and we want to check if the array contains the category
      query = query.filter('category', 'cs', `{${category}}`);
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
      // Still handle RSS articles separately if they are not in the main insights table
      const article = await getRssArticleBySlug(slug);
      if (!article) return undefined;
      return await rssToInsight(article);
    }

    const { data, error } = await supabase
      .from('insights')
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
    const { data: currentInsight, error: currentError } = await supabase
      .from('insights')
      .select('created_at')
      .eq('slug', slug)
      .single();

    if (currentError || !currentInsight) {
      console.error(`Error fetching current insight for adjacent check for slug ${slug}:`, currentError);
      return { prev: null, next: null };
    }

    const currentCreatedAt = currentInsight.created_at;

    // Fetch previous insight (older created_at)
    const { data: prevInsightData, error: prevError } = await supabase
      .from('insights')
      .select('id, slug, seo_title, seo_description, category, title, headline, summary, author, created_at, updated_at')
      .lt('created_at', currentCreatedAt) // Less than current created_at
      .order('created_at', { ascending: false }) // Get the closest older one
      .limit(1);

    // Fetch next insight (newer created_at)
    const { data: nextInsightData, error: nextError } = await supabase
      .from('insights')
      .select('id, slug, seo_title, seo_description, category, title, headline, summary, author, created_at, updated_at')
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
    const { data, error } = await supabase.from('insights').select('slug');

    if (error || !data || data.length === 0) {
      console.error('Error fetching slugs for random selection:', error);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex].slug;
  },
  ['random-insight-slug'],
  { revalidate: 3600 } // Cache for an hour
);

export const getInsightsBySlugs = unstable_cache(
  async (slugs: string[]): Promise<Insight[]> => {
    if (!slugs || slugs.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('insights')
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