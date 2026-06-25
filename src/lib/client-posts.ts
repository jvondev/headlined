'use client';

import { Post } from '@/types';
import { addPosts, getAllPostsFromIndexedDB, clearAllPosts, clearOldPosts, getPostsByDate, getPostsDateRange, getReadHistory, getLastFetchTime, setLastFetchTime } from './indexeddb';
import { topicsData } from '@/data/topics-data';
import { interestsData } from '@/data/interests-data';


const PAGE_SIZE = 10; // Define page size for pagination
const LAST_SYNC_TIMESTAMP_KEY = 'lastSyncTimestamp'; // Keeping for legacy/backup, but primary is IDB metadata
const FEED_TODAY_KEY = 'feed:today';

let allPosts: Post[] = [];
let isFetchingAllPosts = false;

// Cache for randomized/sorted posts to maintain consistency across pagination
let filteredPostsCache: Record<string, Post[]> = {};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Note: Archive access is ONLY for premium users
// The app usage check (in use-archive-access.ts) should only control UI visibility
// (showing/hiding History nav item) but should NOT grant data access to historical posts

export const fetchAllPosts = async (): Promise<Post[]> => {
  // 1. Try to load from in-memory cache first for fast initial load
  if (allPosts.length > 0) {
    return allPosts;
  }

  // 2. Otherwise, trigger background sync (which will handle IndexedDB or network fetch)
  return await synchronizePostsInBackground();
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

    // Check Cache Validity (6 Hours)
    const lastFetch = await getLastFetchTime(FEED_TODAY_KEY);
    const now = Date.now();
    const cacheDuration = 6 * 60 * 60 * 1000; // 6 Hours
    const isCacheStale = !lastFetch || (now - lastFetch > cacheDuration);

    // Always attempt to fetch from network if no posts in memory or cache is stale
    if (allPosts.length === 0 || isCacheStale) {
      try {
        console.log(`Fetching /today feed (Stale: ${isCacheStale})`);

        // Construct the URL for today's data
        const today = new Date().toISOString().split('T')[0];
        const todayYear = today.split('-')[0];
        const url = `https://corsproxy.io/?` + encodeURIComponent(`https://github.com/jvondev/headlined/releases/download/rss-data-${todayYear}/${today}.json`);

        const response = await fetch(url);
        let networkPosts: Post[] = [];
        let dateToSave = today;

        if (!response.ok) {
          // If today's file isn't ready yet, try yesterday's
          if (response.status === 404) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const yesterdayYear = yesterday.split('-')[0];
            const yesterdayUrl = `https://corsproxy.io/?` + encodeURIComponent(`https://github.com/jvondev/headlined/releases/download/rss-data-${yesterdayYear}/${yesterday}.json`);
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
        const isPremium = true;
        const daysToKeep = isPremium ? 30 : 1; // Keep 30 days for premium, 1 day for free

        // Clear old posts based on retention policy
        await clearOldPosts(daysToKeep);

        // Add new posts
        await addPosts(networkPosts);
        await setLastFetchTime(FEED_TODAY_KEY, now); // Update metadata

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
    const isPremium = true;
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
  // 0. Check Access - Archive access is PREMIUM ONLY
  const isPremium = true;
  if (!isPremium) {
    return []; // Non-premium users cannot access historical data
  }

  // 1. Check IndexedDB first
  const localPosts = await getPostsByDate(date);
  if (localPosts.length > 0) {
    return localPosts;
  }

  // 2. Fetch from network
  try {
    const year = date.split('-')[0];
    const url = `https://corsproxy.io/?` + encodeURIComponent(`https://github.com/jvondev/headlined/releases/download/rss-data-${year}/${date}.json`);
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
  // 0. Check Access - Archive access is PREMIUM ONLY
  const isPremium = true;
  if (!isPremium) {
    return []; // Non-premium users cannot access historical data
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
export const getFilteredPosts = async ({ topic_name, search_query, interest_name, date, dateRange }: { topic_name?: string; search_query?: string; interest_name?: string; date?: string; dateRange?: { start: string; end: string } }): Promise<Post[]> => {
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
    filteredPosts = filteredPosts.filter(post => {
      if (!post.topic) return false;
      if (Array.isArray(post.topic)) {
        return post.topic.includes(topic_name);
      }
      return post.topic === topic_name;
    });
  }

  if (interest_name) {
    const interest = interestsData.find(i => i.name === interest_name);
    if (interest) {
      const searchTerms = [interest.name, ...(interest.aliases || [])].map(t => t.toLowerCase());
      filteredPosts = filteredPosts.filter(post => {
        const content = `${post.title} ${post.description || ''}`.toLowerCase();
        return searchTerms.some(term => content.includes(term));
      });
    } else {
      // Handle custom interest (keyword)
      const searchTerm = interest_name.toLowerCase();
      filteredPosts = filteredPosts.filter(post => {
        const content = `${post.title} ${post.description || ''}`.toLowerCase();
        return content.includes(searchTerm);
      });
    }
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
export const getPaginatedPosts = async ({
  page,
  topic_name,
  search_query,
  date,
  dateRange,
  refreshOrder = false
}: {
  page: number;
  topic_name?: string;
  search_query?: string;
  date?: string;
  dateRange?: { start: string; end: string };
  refreshOrder?: boolean;
}): Promise<{ posts: Post[], hasMore: boolean }> => {

  const cacheKey = JSON.stringify({ topic_name, search_query, date, dateRange });

  let posts = filteredPostsCache[cacheKey];

  if (refreshOrder || !posts) {
    const filteredPosts = await getFilteredPosts({ topic_name, search_query, date, dateRange });

    // Fetch read history to sort read posts to bottom
    const history = await getReadHistory();
    const readSlugs = new Set(history.map(h => h.slug));

    const unreadPosts = filteredPosts.filter(p => !readSlugs.has(p.slug));
    const readPosts = filteredPosts.filter(p => readSlugs.has(p.slug));

    // Randomize unread posts
    const shuffledUnread = shuffleArray(unreadPosts);

    // Randomize read posts
    const shuffledRead = shuffleArray(readPosts);

    // Combine: Random Unread + Random Read
    posts = [...shuffledUnread, ...shuffledRead];

    // Update cache
    filteredPostsCache[cacheKey] = posts;
  }

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  const hasMore = posts.length > endIndex;

  return { posts: paginatedPosts, hasMore };
};

export const checkIfFeedHasPosts = async (type: 'topic' | 'interest', name: string, date?: string, dateRange?: { start: string; end: string }): Promise<boolean> => {
  const posts = await getFilteredPosts({
    topic_name: type === 'topic' ? name : undefined,
    interest_name: type === 'interest' ? name : undefined,
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