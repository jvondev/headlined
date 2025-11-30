import { CompendiaPost } from '@/types';
import { fetchRecentWorks } from './openalex';
import { addPosts, getPostsDateRange } from './indexeddb';
import { subDays, format } from 'date-fns';

export const getFeedPosts = async (view: string = 'today', page: number = 1): Promise<CompendiaPost[]> => {
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

    // Try IndexedDB first
    let localPosts: CompendiaPost[] = [];
    try {
        if (toDate) {
            localPosts = await getPostsDateRange(fromDate, toDate);
        } else {
            const futureDate = format(new Date(Date.now() + 86400000 * 365), 'yyyy-MM-dd');
            localPosts = await getPostsDateRange(fromDate, futureDate);
        }
    } catch (e) {
        // Ignore cache errors
    }

    if (localPosts.length > 0 && page === 1) {
        refreshInBackground(page, { fromDate, toDate });
        return localPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Fetch from API
    try {
        const apiPosts = await fetchRecentWorks(page, 10, { fromDate, toDate });

        if (apiPosts.length > 0) {
            await addPosts(apiPosts);
            return apiPosts;
        }

        // Fallback for 'today'
        if (view === 'today' && page === 1) {
            const lastWeek = subDays(today, 7);
            const fallbackPosts = await fetchRecentWorks(page, 10, { fromDate: format(lastWeek, 'yyyy-MM-dd') });
            if (fallbackPosts.length > 0) {
                await addPosts(fallbackPosts);
                return fallbackPosts;
            }
        }

        // Absolute fallback
        if (page === 1 && apiPosts.length === 0) {
            const latestPosts = await fetchRecentWorks(1, 10);
            if (latestPosts.length > 0) {
                await addPosts(latestPosts);
                return latestPosts;
            }
        }

        return [];
    } catch (error) {
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
        // Ignore
    }
}
