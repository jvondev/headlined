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

export const fetchAllPosts = async (): Promise<Post[]> => {
  // 1. Try to load from in-memory cache first for fast initial load
  if (allPosts.length > 0) {
    return allPosts;
  }

  // 2. Otherwise, trigger background sync (which will handle IndexedDB or network fetch)
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
  const trigger = now > cleanupThresholdTime && lastSyncDate < cleanupThresholdTime;
  return trigger;
};

const synchronizePostsInBackground = async (): Promise<Post[]> => {
  if (isFetchingAllPosts) {
    // If a fetch is already in progress, wait for it to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isFetchingAllPosts && allPosts.length > 0) { // Check if fetching is done and posts are available
          clearInterval(checkInterval);
          resolve(allPosts);
        } else if (!isFetchingAllPosts) { // If fetching is done but no posts, resolve empty
          clearInterval(checkInterval);
          resolve([]);
        }
      }, 100);
    });
  }

  isFetchingAllPosts = true;
  try {
    let postsToReturn: Post[] = [];
    let fetchedFromNetwork = false;

    // Always attempt to fetch from network if no posts in memory or a full sync is needed
    if (allPosts.length === 0 || shouldTriggerFullSync()) {
      try {
        // Construct the URL for today's data
        const today = new Date().toISOString().split('T')[0];
        const url = `https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-/output/${today}.json`;

        const response = await fetch(url);
        if (!response.ok) {
          // If today's file isn't ready yet, try yesterday's
          if (response.status === 404) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const yesterdayUrl = `https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-/output/${yesterday}.json`;
            const yesterdayResponse = await fetch(yesterdayUrl);
            if (!yesterdayResponse.ok) {
              throw new Error(`HTTP error! status: ${yesterdayResponse.status}`);
            }
            const networkPosts = await yesterdayResponse.json();
            await clearAllPosts();
            await addPosts(networkPosts);
            localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, new Date().toISOString());
            postsToReturn = networkPosts;
            fetchedFromNetwork = true;
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const networkPosts = await response.json();

          // Clear all existing posts and add new ones from network
          await clearAllPosts();
          await addPosts(networkPosts);
          localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, new Date().toISOString());
          postsToReturn = networkPosts; // Use network data
          fetchedFromNetwork = true;
        }
      } catch (networkError) {
        // Fallback to IndexedDB if network fetch fails
        console.error("Network fetch failed:", networkError);
      }
    }

    // If not fetched from network (either skipped or failed), try IndexedDB
    if (!fetchedFromNetwork) {
      const indexedDBPosts = await getAllPostsFromIndexedDB();
      postsToReturn = indexedDBPosts;
    }

    allPosts = postsToReturn; // Update in-memory cache
    return allPosts;
  } catch (error) {
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

export const checkIfFeedHasPosts = async (type: 'topic' | 'interest', name: string): Promise<boolean> => {
  const { posts } = await getPaginatedPosts({
    page: 1,
    topic_name: type === 'topic' ? name : undefined,
    search_query: type === 'interest' ? name : undefined,
  });
  return posts.length > 0;
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