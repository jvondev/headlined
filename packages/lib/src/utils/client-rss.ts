import { RssFeed } from '@/types';

export const getClientRssFeeds = async (): Promise<RssFeed[]> => {
    try {
        const response = await fetch('/rss-feeds.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as RssFeed[];
    } catch (error) {
        console.error('Failed to load rss-feeds.json on client:', error);
        return [];
    }
};