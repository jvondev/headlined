import type { RssFeed } from '@/types';

async function getAllRssFeeds(): Promise<RssFeed[]> {
    try {
        // Fetch from the public directory
        const response = await fetch('/rss-feeds.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as RssFeed[];
    } catch (error) {
        console.error('Failed to load rss-feeds.json:', error);
        return [];
    }
}

export const getFeedsByCategory = async (category: string) => {
    const feeds = await getAllRssFeeds();
    return feeds.filter(feed => feed.category.toLowerCase() === category.toLowerCase());
}

export const getFeedCategories = async () => {
    const feeds = await getAllRssFeeds();
    return [...new Set(feeds.map(feed => feed.category))];
}

export const getFeedInfoFromUrl = async (url: string): Promise<RssFeed | undefined> => {
    const feeds = await getAllRssFeeds();
    return feeds.find(feed => feed.url === url);
}

// A new function to get all feeds for other components
export const getRssFeeds = async (): Promise<RssFeed[]> => {
    return getAllRssFeeds();
};
