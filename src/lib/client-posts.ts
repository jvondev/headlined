'use client';

import { Post } from '@/types';
import { addPosts, getAllPostsFromIndexedDB, clearAllPosts, clearOldPosts, getPostsByDate, getPostsDateRange } from './indexeddb';
import { topicsData } from '@/data/topics-data';
import { checkLicenseStatus } from './license-manager';

const PAGE_SIZE = 10; // Define page size for pagination
const LAST_SYNC_TIMESTAMP_KEY = 'lastSyncTimestamp';

// TODO: Replace with actual GitHub Action run time and timezone
const GITHUB_ACTION_RUN_HOUR_UTC = 10; // Runs every day at 10:00 AM UTC
const CLEANUP_INTERVAL_HOURS = 1;

let allPosts: Post[] = [];
let isFetchingAllPosts = false;

// Helper to check access rights
const checkAccess = async (): Promise<boolean> => {
  const isPremium = await checkLicenseStatus();
  if (isPremium) return true;

  // Check usage for non-premium users
  if (typeof window === 'undefined') return false;
  const storedUsage = localStorage.getItem("app-usage");
  if (!storedUsage) return true; // New user, allow access

  try {
    const currentUsage = JSON.parse(storedUsage);
    const firstDate = new Date(currentUsage.firstLaunchDate || new Date().toISOString());
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - firstDate.getTime());
    const daysSinceFirstLaunch = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return daysSinceFirstLaunch <= 2;
  } catch (e) {
    return true; // Fallback to allow if parsing fails
  }
};

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
        let networkPosts: Post[] = [];
        let dateToSave = today;

        if (!response.ok) {
          // If today's file isn't ready yet, try yesterday's
          if (response.status === 404) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const yesterdayUrl = `https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-/output/${yesterday}.json`;
            const yesterdayResponse = await fetch(yesterdayUrl);
            if (!yesterdayResponse.ok) {
              throw new Error(`HTTP error! status: ${yesterdayResponse.status}`);
            }
            networkPosts = await yesterdayResponse.json();
            dateToSave = yesterday;
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          networkPosts = await response.json();
        }

        // Attach date to posts
        networkPosts = networkPosts.map(p => ({ ...p, date: dateToSave }));

        // Check license status for retention policy
        const isPremium = await checkLicenseStatus();
        const daysToKeep = isPremium ? 30 : 2; // Keep 30 days for premium, 2 days for free (today + yesterday fallback)

        // Clear old posts based on retention policy
        await clearOldPosts(daysToKeep);

        // Add new posts
        await addPosts(networkPosts);

        localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, new Date().toISOString());
        postsToReturn = networkPosts;
        fetchedFromNetwork = true;

      } catch (networkError) {
        // Fallback to IndexedDB if network fetch fails
        console.error("Network fetch failed:", networkError);
      }
    }

    // If not fetched from network (either skipped or failed), try IndexedDB
    if (!fetchedFromNetwork) {
      // For main dashboard, we typically want "today's" posts or the latest available.
      const indexedDBPosts = await getAllPostsFromIndexedDB();
      postsToReturn = indexedDBPosts;
    }

    // Enforce data access policy: Non-premium users only get today's data
    const isPremium = await checkLicenseStatus();
    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0];
      postsToReturn = postsToReturn.filter(post => post.date === today);
    }

    allPosts = postsToReturn; // Update in-memory cache
    return allPosts;
  } catch (error) {
    return [];
  } finally {
    isFetchingAllPosts = false;
  }
};

export const fetchArchivePosts = async (date: string): Promise<Post[]> => {
  // 0. Check Access
  const hasAccess = await checkAccess();
  if (!hasAccess) {
    return [];
  }

  // 1. Check IndexedDB first
  const localPosts = await getPostsByDate(date);
  if (localPosts.length > 0) {
    return localPosts;
  }

  // 2. Fetch from network
  try {
    const url = `https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-/output/${date}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return []; // No data for this date
      throw new Error(`Failed to fetch archive for ${date}`);
    }
    let posts: Post[] = await response.json();

    // Attach date
    posts = posts.map(p => ({ ...p, date }));

    // Save to IDB
    await addPosts(posts);

    return posts;
  } catch (error) {
    console.error(`Error fetching archive for ${date}:`, error);
    return [];
  }
};

export const fetchDateRangePosts = async (startDate: string, endDate: string): Promise<Post[]> => {
  // 0. Check Access
  const hasAccess = await checkAccess();
  if (!hasAccess) {
    return [];
  }

  // This is a bit complex because we need to iterate days.
  // Simple approach: iterate from start to end date.
  const start = new Date(startDate);
  const end = new Date(endDate);
  const posts: Post[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayPosts = await fetchArchivePosts(dateStr);
    posts.push(...dayPosts);
  }

  return posts;
};

// Get ALL filtered posts at once (optimized for local-first)
export const getFilteredPosts = async ({ topic_name, search_query, date, dateRange }: { topic_name?: string; search_query?: string; date?: string; dateRange?: { start: string; end: string } }): Promise<Post[]> => {
  let posts: Post[] = [];

  if (date) {
    posts = await fetchArchivePosts(date);
  } else if (dateRange) {
    posts = await fetchDateRangePosts(dateRange.start, dateRange.end);
  } else {
    posts = await fetchAllPosts();
  }

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

  return filteredPosts;
};

// Legacy pagination function (kept for compatibility)
export const getPaginatedPosts = async ({ page, topic_name, search_query, date, dateRange }: { page: number; topic_name?: string; search_query?: string; date?: string; dateRange?: { start: string; end: string } }): Promise<{ posts: Post[], hasMore: boolean }> => {
  const filteredPosts = await getFilteredPosts({ topic_name, search_query, date, dateRange });

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  const hasMore = filteredPosts.length > endIndex;

  return { posts: paginatedPosts, hasMore };
};

export const checkIfFeedHasPosts = async (type: 'topic' | 'interest', name: string, date?: string, dateRange?: { start: string; end: string }): Promise<boolean> => {
  const posts = await getFilteredPosts({
    topic_name: type === 'topic' ? name : undefined,
    search_query: type === 'interest' ? name : undefined,
    date,
    dateRange
  });
  return posts.length > 0;
};

export const getPostBySlug = async (slug: string): Promise<Post | undefined> => {
  // First try memory
  let post = allPosts.find(p => p.slug === slug);
  if (post) return post;

  // Then try IDB (all posts)
  const dbPosts = await getAllPostsFromIndexedDB();
  return dbPosts.find(p => p.slug === slug);
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