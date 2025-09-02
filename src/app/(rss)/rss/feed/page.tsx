import { NextResponse } from 'next/server';
import { Feed } from 'feed';
import fs from 'fs';
import path from 'path';
import { RssArticle, RssFeed } from '@/types';
import { getRssFeeds } from '@/data/rss-feeds';

// Helper to slugify category names for file paths (copied from cron job)
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '');
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');

    if (!topic) {
        return new NextResponse('Please provide a topic query parameter (e.g., /rss/feed?topic=technology)', { status: 400 });
    }

    const topicSlug = slugify(topic);
    const filePath = path.join(process.cwd(), 'public', 'generated-categories', `${topicSlug}.json`);

    let groupedArticles: { [sourceName: string]: RssArticle[]; };
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        groupedArticles = JSON.parse(fileContent);
    } catch (error) {
        console.error(`Failed to read or parse JSON for topic ${topic}:`, error);
        return new NextResponse(`Could not find RSS feed for topic: ${topic}`, { status: 404 });
    }

    const feed = new Feed({
        title: `${topic} Articles RSS Feed`,
        description: `Latest articles categorized under ${topic}`,
        id: `https://readmore.com/rss/feed?topic=${topicSlug}`,
        link: `https://readmore.com/rss/feed?topic=${topicSlug}`,
        language: 'en',
        image: 'https://readmore.com/logo.png',
        favicon: 'https://readmore.com/favicon.ico',
        copyright: `All rights reserved ${new Date().getFullYear()}, ReadMore`,
        updated: new Date(),
        feedLinks: {
            rss2: `https://readmore.com/rss/feed?topic=${topicSlug}`,
        },
        author: {
            name: 'ReadMore',
            email: 'info@readmore.com',
            link: 'https://readmore.com',
        },
    });

    // Get all RSS feeds to map article feedUrl to RssFeed info
    const allRssFeeds = await getRssFeeds();

    for (const sourceName in groupedArticles) {
        if (Object.prototype.hasOwnProperty.call(groupedArticles, sourceName)) {
            const articles = groupedArticles[sourceName];
            for (const article of articles) {
                feed.addItem({
                    title: article.title,
                    id: article.link,
                    link: article.link,
                    description: article.summary,
                    content: article.blogContent, // Full content if available
                    author: [
                        {
                            name: article.author || 'Unknown',
                            link: article.link, // Link to the article itself
                        },
                    ],
                    date: article.pubDate ? new Date(article.pubDate) : new Date(),
                    image: article.thumbnail,
                });
            }
        }
    }

    return new Response(feed.rss2(), {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}

// This is a server component, so we export a GET function directly.
// No need for a default export for a page component that only serves data.
// If you want to render a page, you would keep the default export and fetch data inside it.
// For an RSS feed, we directly return the XML response.

// You can also define generateMetadata if needed for SEO, but for a pure RSS feed endpoint, it's less critical.
// export async function generateMetadata({ params, searchParams }: { params: { slug: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
//   const topic = searchParams.topic as string;
//   return {
//     title: `${topic} RSS Feed`,
//     description: `RSS feed for articles categorized under ${topic}`,
//     alternates: {
//       canonical: `/rss/feed?topic=${slugify(topic)}`,
//       types: {
//         'application/rss+xml': `/rss/feed?topic=${slugify(topic)}`,
//       },
//     },
//   };
// }
