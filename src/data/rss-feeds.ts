// src/data/rss-feeds.ts
'use client'; // Mark as client-side

import type { RssFeed } from '@/types';

async function getAllRssFeeds(): Promise<RssFeed[]> {
    try {
        const response = await fetch('/rss-feeds.json'); // Always fetch from public URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as RssFeed[];
    } catch (error) {
        console.error('Failed to load rss-feeds.json on client:', error);
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

export const getRssFeeds = async (): Promise<RssFeed[]> => {
    return getAllRssFeeds();
};