'use server';

import { RssFeed } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export const getServerRssFeeds = async (): Promise<RssFeed[]> => {
    try {
        const filePath = path.join(process.cwd(), 'public', 'rss-feeds.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return data as RssFeed[];
    } catch (error) {
        console.error('Failed to load rss-feeds.json on server:', error);
        return [];
    }
};
