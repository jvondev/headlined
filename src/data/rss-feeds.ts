'use server';

import type { RssFeed } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const rssFeedsPath = path.join(process.cwd(), 'src/data/rss-feeds.json');

// This function now reads from the JSON file, making it dynamic.
async function getAllRssFeeds(): Promise<RssFeed[]> {
    try {
        const fileContents = await fs.readFile(rssFeedsPath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
         console.error('Could not read rss-feeds.json:', error);
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

// A new function to get all feeds for other server components
export const getRssFeeds = async (): Promise<RssFeed[]> => {
    return getAllRssFeeds();
};
