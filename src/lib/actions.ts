'use server'

import { getPaginatedInsights as getSupabasePaginatedInsights } from '@/lib/insights'
import { getRssFeed } from '@/lib/rss'
import { getFeedCategories, getFeedsByCategory, getFeedInfoFromUrl, getRssFeeds as getAllFeeds } from '@/data/rss-feeds'
import { Insight, RssArticle } from '@/types'
import { getCount, updateCount } from '@/lib/save-counts';

const PAGE_SIZE = 10;

type Preferences = {
    [category: string]: number;
};

async function rssToInsight(article: RssArticle): Promise<Insight> {
    const feedInfo = await getFeedInfoFromUrl(article.feedUrl);
    return {
        slug: article.slug, // The slug from getRssFeed now includes 'rss-' prefix
        seo: {
            title: article.title,
            description: article.summary,
        },
        category: [feedInfo?.category || 'News', feedInfo?.name || ''],
        title: article.title,
        headline: article.headline,
        summary: article.summary,
        deepDives: article.deepDives,
        blogContent: article.blogContent,
        thumbnailUrl: article.thumbnailUrl,
        author: article.author,
    }
}


export async function getPaginatedInsights({
    page,
    category,
    isRss = false,
    preferences = {},
}: {
    page: number,
    category?: string,
    isRss?: boolean,
    preferences?: Preferences,
}): Promise<{ insights: Insight[], hasMore: boolean }> {

  if (isRss) {
    let allItems: RssArticle[] = [];

    let feedsToFetch;
    if (category) {
        feedsToFetch = await getFeedsByCategory(category);
    } else {
        feedsToFetch = await getAllFeeds();
    }

    let articles: RssArticle[] = [];
    const feedPromises = feedsToFetch.map(feed => getRssFeed(feed.url));
    const allFeeds = await Promise.allSettled(feedPromises);

    allFeeds.forEach(result => {
        if (result.status === 'fulfilled') {
            articles.push(...result.value);
        }
    });

    // Sort RSS articles by date
    articles.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
    });

    allItems = articles;

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    const paginatedItems = allItems.slice(startIndex, endIndex);
    const hasMore = endIndex < allItems.length;

    const insights = await Promise.all((paginatedItems as RssArticle[]).map(rssToInsight));

    return { insights, hasMore };
  } else {
    // For non-RSS, use the Supabase-backed getPaginatedInsights
    const { insights, hasMore } = await getSupabasePaginatedInsights({ page, category, preferences });
    return { insights, hasMore };
  }
}


// --- Save Count Actions ---
/*
export async function getSaveCount(itemId: string) {
    if (!itemId) return 0;
    return getCount(itemId);
}

export async function updateSaveCount(itemId: string, action: 'increment' | 'decrement') {
    if (!itemId) return 0;
    return updateCount(itemId, action);
}
*/