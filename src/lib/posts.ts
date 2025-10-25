'use server';

import { unstable_cache } from 'next/cache';
import { Post } from '@/types';
import { serverSupabase } from './server-supabase';

const PAGE_SIZE = 10; // Define page size for pagination

// Helper function to map Supabase data to Post type
const mapSupabasePostToPostType = (supabaseData: any): Post => {
  return {
    id: supabaseData.id,
    slug: supabaseData.slug,
    title: supabaseData.title,
    description: supabaseData.description,
    link: supabaseData.link,
    thumbnail_url: supabaseData.thumbnail_url,
    created_at: supabaseData.created_at,
    updated_at: supabaseData.updated_at,
    topic_id: supabaseData.topic_id,
    summaries: [], // Assuming summaries are not stored in the posts table
  };
};

// Fetches all posts from Supabase (use with caution for large datasets)
export const getAllPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const { data, error } = await serverSupabase
      .from('posts')
      .select('*');

    if (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
    return data.map(mapSupabasePostToPostType) as Post[];
  },
  ['all-posts'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
);

interface PaginatedPostsOptions {
  page: number;
  topic_id?: string;
  search_query?: string; // Add optional search_query
}

export const getPaginatedPosts = unstable_cache(
  async ({ page, topic_id, search_query }: PaginatedPostsOptions): Promise<{ posts: Post[], hasMore: boolean }> => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE - 1; // Supabase range is inclusive

    let query = serverSupabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false }); // Order by creation date, newest first

    if (search_query) {
      // Perform full-text search if search_query is provided
      query = query.textSearch('fts', search_query);
    } else if (topic_id) {
      // Filter by topic_id if no search_query
      query = query.eq('topic_id', topic_id);
    }

    const { data, error } = await query.range(startIndex, endIndex + 1); // Fetch one extra to check hasMore

    if (error) {
      console.error('Error fetching paginated posts:', error);
      return { posts: [], hasMore: false };
    }

    const posts = data.slice(0, PAGE_SIZE).map(mapSupabasePostToPostType) as Post[];
    const hasMore = data.length > PAGE_SIZE;

    return { posts, hasMore };
  },
  ['paginated-posts'],
  { revalidate: 3600 }
);

export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<Post | undefined> => {
    const { data, error } = await serverSupabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      return undefined;
    }
    return mapSupabasePostToPostType(data) as Post;
  },
  ['post-by-slug'], // Cache key
  { revalidate: 3600 } // Revalidate every hour
);

export const getRandomPostSlug = unstable_cache(
  async (): Promise<string | null> => {
    // First, get the total count of posts
    const { count, error: countError } = await serverSupabase
      .from('posts')
      .select('count', { count: 'exact' });

    if (countError) {
      console.error('Error fetching post count:', countError);
      return null;
    }

    if (count === null || count === 0) {
      return null; // No posts available
    }

    // Generate a random offset
    const randomIndex = Math.floor(Math.random() * count);

    // Fetch a single random post using the offset
    const { data, error } = await serverSupabase
      .from('posts')
      .select('slug')
      .range(randomIndex, randomIndex) // Fetch only one record at the random index
      .single();

    if (error || !data) {
      console.error('Error fetching random post slug:', error);
      return null;
    }

    return data.slug;
  },
  ['random-post-slug'],
  { revalidate: 3600 } // Cache for an hour
);

export const getPostsBySlugs = unstable_cache(
  async (slugs: string[]): Promise<Post[]> => {
    if (!slugs || slugs.length === 0) {
      return [];
    }

    const { data, error } = await serverSupabase
      .from('posts')
      .select('*')
      .in('slug', slugs);

    if (error) {
      console.error('Error fetching posts by slugs:', error);
      return [];
    }

    return data.map(mapSupabasePostToPostType) as Post[];
  },
  ['posts-by-slugs'],
  { revalidate: 3600 }
);