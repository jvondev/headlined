import { CompendiaPost } from '@/types';
import { fetchRecentWorks } from '@repo/lib/utils/openalex';
import { addPosts, getPostsByDate, getPostsDateRange } from './indexeddb';
import { subDays, format } from 'date-fns';

export const getFeedPosts = async (view: string = 'today', page: number = 1): Promise<CompendiaPost[]> => {
    console.log(`[getFeedPosts] START - view=${view}, page=${page}`);

    // Determine date range based on view
    let fromDate: string;
    let toDate: string | undefined;
    const today = new Date();

    if (view === 'today') {
        const threeDaysAgo = subDays(today, 3);
        fromDate = format(threeDaysAgo, 'yyyy-MM-dd');
        toDate = format(today, 'yyyy-MM-dd');
    } else if (view === 'yesterday') {
        const fourDaysAgo = subDays(today, 4);
        const yesterday = subDays(today, 1);
        fromDate = format(fourDaysAgo, 'yyyy-MM-dd');
        toDate = format(yesterday, 'yyyy-MM-dd');
    } else if (view === 'this-week') {
        const lastWeek = subDays(today, 7);
        fromDate = format(lastWeek, 'yyyy-MM-dd');
    } else {
        const lastMonth = subDays(today, 30);
        fromDate = format(lastMonth, 'yyyy-MM-dd');
    }

    console.log(`[getFeedPosts] Date range: fromDate=${fromDate}, toDate=${toDate}`);

    // 1. Try IndexedDB first
    let localPosts: CompendiaPost[] = [];
    try {
        if (toDate) {
            localPosts = await getPostsDateRange(fromDate, toDate);
        } else {
            const futureDate = format(new Date(Date.now() + 86400000 * 365), 'yyyy-MM-dd');
            localPosts = await getPostsDateRange(fromDate, futureDate);
        }
        console.log(`[getFeedPosts] IndexedDB returned ${localPosts.length} posts`);
    } catch (e) {
        console.warn("[getFeedPosts] Failed to read from IDB", e);
    }

    if (localPosts.length > 0 && page === 1) {
        console.log(`[getFeedPosts] Using ${localPosts.length} cached posts, refreshing in background`);
        refreshInBackground(page, { fromDate, toDate });
        return localPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // 2. Fetch from API
    console.log(`[getFeedPosts] Fetching from OpenAlex API...`);
    try {
        const apiPosts = await fetchRecentWorks(page, 10, { fromDate, toDate });
        console.log(`[getFeedPosts] OpenAlex API returned ${apiPosts.length} posts`);

        if (apiPosts.length > 0) {
            await addPosts(apiPosts);
            console.log(`[getFeedPosts] Saved ${apiPosts.length} posts to IndexedDB`);
            return apiPosts;
        }

        // If still no posts, try an even wider range for 'today'
        if (view === 'today' && page === 1 && apiPosts.length === 0) {
            console.log("[getFeedPosts] No posts found for today (3 days). Trying last 7 days...");
            const lastWeek = subDays(today, 7);
            const lastWeekDate = format(lastWeek, 'yyyy-MM-dd');

            const fallbackPosts = await fetchRecentWorks(page, 10, { fromDate: lastWeekDate });
            console.log(`[getFeedPosts] 7-day fallback returned ${fallbackPosts.length} posts`);
            if (fallbackPosts.length > 0) {
                await addPosts(fallbackPosts);
                return fallbackPosts;
            }
        }

        // ABSOLUTE FALLBACK: fetch latest without date filter
        if (page === 1 && apiPosts.length === 0) {
            console.log("[getFeedPosts] Still no posts. Fetching absolute latest...");
            const latestPosts = await fetchRecentWorks(1, 10);
            console.log(`[getFeedPosts] Absolute fallback returned ${latestPosts.length} posts`);
            if (latestPosts.length > 0) {
                await addPosts(latestPosts);
                return latestPosts;
            }
        }

        console.log("[getFeedPosts] No posts found after all attempts");
        return [];
    } catch (error) {
        console.error("[getFeedPosts] Failed to fetch posts:", error);
        return localPosts;
    }
};

const refreshInBackground = async (page: number, filters: any) => {
    try {
        const apiPosts = await fetchRecentWorks(page, 10, filters);
        if (apiPosts.length > 0) {
            await addPosts(apiPosts);
        }
    } catch (e) {
        console.error("Background refresh failed", e);
    }
}
