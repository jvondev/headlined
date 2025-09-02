import type { RssFeed } from '@/types';

// This function now fetches from the public JSON file.
async function getAllRssFeeds(): Promise<RssFeed[]> {
    try {
        const response = await fetch('/rss-feeds.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
         console.error('Could not fetch rss-feeds.json:', error);
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
