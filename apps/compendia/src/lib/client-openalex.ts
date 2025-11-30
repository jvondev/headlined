import { CompendiaPost } from '@/types';
import { fetchRecentWorks } from './openalex';
import { addPosts, getPostsDateRange } from './indexeddb';
import { subDays, format } from 'date-fns';

export const getFeedPosts = async (view: string = 'today', page: number = 1): Promise<CompendiaPost[]> => {
    let fromDate: string;
    let toDate: string | undefined;
    const today = new Date();

    // 1. Determine Date Range
    const todayStr = format(today, 'yyyy-MM-dd');

    if (view === 'today') {
        fromDate = todayStr;
        toDate = todayStr;
    } else if (view === 'yesterday') {
        const yesterday = subDays(today, 1);
        const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
        fromDate = yesterdayStr;
        toDate = yesterdayStr;
    } else if (view === 'this-week') {
        const lastWeek = subDays(today, 7);
        fromDate = format(lastWeek, 'yyyy-MM-dd');
        toDate = todayStr;
    } else {
        const lastMonth = subDays(today, 30);
        fromDate = format(lastMonth, 'yyyy-MM-dd');
        toDate = todayStr;
    }

    // 2. Check IndexedDB
    let localPosts: CompendiaPost[] = [];
    try {
        if (toDate) {
            localPosts = await getPostsDateRange(fromDate, toDate);
        } else {
            const futureDate = format(new Date(Date.now() + 86400000 * 365), 'yyyy-MM-dd');
            localPosts = await getPostsDateRange(fromDate, futureDate);
        }
    } catch (e) {
        console.error("Failed to read from IndexedDB:", e);
    }

    // Sort local posts by date descending
    localPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 3. If we have enough local data, return it (unless it's page 1 and we want to ensure freshness, but for now we trust the cache if it's substantial)
    // If we have > 20 posts, we assume we have a good cache for this view.
    if (localPosts.length >= 20) {
        // If requesting page 1, return all local posts (client-side pagination can handle slicing if needed, 
        // or we can slice here. But the carousel expects a full list or appends).
        // The carousel logic appends. If we return a huge list, it might duplicate if not handled.
        // But here we are just returning the "source of truth".

        // If we are on page 1, we might want to try a background refresh if the latest post is old?
        // For now, let's keep it simple: Use Cache if available.
        return localPosts;
    }

    // 4. If insufficient data, Fetch from API (Batch of 200)
    // Only fetch if we are on page 1 (or if we really ran out, but with 200 items that shouldn't happen often for a single session)
    if (page === 1 || localPosts.length === 0) {
        try {
            console.log(`Fetching 200 posts for view: ${view} (${fromDate} - ${toDate || 'now'})`);
            // Use random sampling to get a diverse set of papers
            const apiPosts = await fetchRecentWorks(1, 200, { fromDate, toDate, random: true });

            if (apiPosts.length > 0) {
                // Store in DB (this triggers pruning)
                await addPosts(apiPosts);

                // Return the API posts (sorted)
                return apiPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
        } catch (error) {
            console.error("Failed to fetch from API:", error);
        }
    }

    // Fallback: Return whatever local data we have
    return localPosts;
};
