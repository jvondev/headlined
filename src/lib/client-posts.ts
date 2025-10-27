'use client';

import { Post } from '@/types';
import { addPosts, getAllPostsFromIndexedDB, clearAllPosts } from './indexeddb';
import { topicsData } from '@/data/topics-data';

const PAGE_SIZE = 10; // Define page size for pagination
const LAST_SYNC_TIMESTAMP_KEY = 'lastSyncTimestamp';

// TODO: Replace with actual GitHub Action run time and timezone
const GITHUB_ACTION_RUN_HOUR_UTC = 10; // Runs every day at 10:00 AM UTC
const CLEANUP_INTERVAL_HOURS = 1;

let allPosts: Post[] = [];
let isFetchingAllPosts = false;
let fetchedAllPostsFromNetwork = false; // Track if network fetch has completed

export const fetchAllPosts = async (): Promise<Post[]> => {
  // 1. Try to load from IndexedDB first for fast initial load
  if (allPosts.length > 0) {
    return allPosts;
  }

  const indexedDBPosts = await getAllPostsFromIndexedDB();
  if (indexedDBPosts.length > 0) {
    allPosts = indexedDBPosts;
    // Trigger background sync without awaiting it
    synchronizePostsInBackground();
    return allPosts;
  }

  // 2. If no posts in IndexedDB, fetch from network and then sync
  return await synchronizePostsInBackground();
};

const shouldTriggerFullSync = (): boolean => {
  const lastSyncTimestamp = localStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
  const now = new Date();

  // Calculate the GitHub Action run time for today
  const githubActionRunTimeToday = new Date();
  githubActionRunTimeToday.setUTCHours(GITHUB_ACTION_RUN_HOUR_UTC, 0, 0, 0);

  // Calculate the cleanup threshold time (1 hour after GitHub Action)
  const cleanupThresholdTime = new Date(githubActionRunTimeToday.getTime() + CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000);

  if (!lastSyncTimestamp) {
    // Never synced before, or localStorage was cleared, so trigger full sync
    return true;
  }

  const lastSyncDate = new Date(lastSyncTimestamp);

  // If current time is past cleanup threshold AND last sync was before cleanup threshold
  return now > cleanupThresholdTime && lastSyncDate < cleanupThresholdTime;
};

const synchronizePostsInBackground = async (): Promise<Post[]> => {
  if (isFetchingAllPosts) {
    // Wait for the ongoing fetch to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (fetchedAllPostsFromNetwork) {
          clearInterval(checkInterval);
          resolve(allPosts);
        }
      }, 100);
    });
  }

  isFetchingAllPosts = true;
  try {
    let postsToStore: Post[] = [];

    if (shouldTriggerFullSync()) {
      const response = await fetch('/posts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      postsToStore = await response.json();

      // Clear all existing posts and add new ones
      await clearAllPosts();
      await addPosts(postsToStore);
      localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, new Date().toISOString());
    } else {
      postsToStore = await getAllPostsFromIndexedDB();
    }

    allPosts = postsToStore; // Update in-memory cache
    fetchedAllPostsFromNetwork = true;
    return allPosts;
  } catch (error) {
    console.error('Error synchronizing posts:', error);
    return [];
  } finally {
    isFetchingAllPosts = false;
  }
};

export const getPaginatedPosts = async ({ page, topic_name, search_query }: { page: number; topic_name?: string; search_query?: string }): Promise<{ posts: Post[], hasMore: boolean }> => {
  const posts = await fetchAllPosts();

  let filteredPosts = posts;

  if (topic_name) {
    filteredPosts = filteredPosts.filter(post => post.topic === topic_name);
  }

  if (search_query) {
    const lowerCaseSearchQuery = search_query.toLowerCase();
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(lowerCaseSearchQuery) ||
      post.description?.toLowerCase().includes(lowerCaseSearchQuery) ||
      post.slug.toLowerCase().includes(lowerCaseSearchQuery)
    );
  }

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  const hasMore = filteredPosts.length > endIndex;

  return { posts: paginatedPosts, hasMore };
};

export const getPostBySlug = async (slug: string): Promise<Post | undefined> => {
  const posts = await fetchAllPosts();
  return posts.find(post => post.slug === slug);
};

export const getRandomPostSlug = async (): Promise<string | null> => {
  const posts = await fetchAllPosts();
  if (posts.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * posts.length);
  return posts[randomIndex].slug;
};

export const getPostsBySlugs = async (slugs: string[]): Promise<Post[]> => {
  if (!slugs || slugs.length === 0) {
    return [];
  }
  const posts = await fetchAllPosts();
  return posts.filter(post => slugs.includes(post.slug));
};

export const getAllPostsForSearch = fetchAllPosts;