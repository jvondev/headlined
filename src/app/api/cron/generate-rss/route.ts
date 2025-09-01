import { NextResponse } from 'next/server';
import { getRssFeeds } from '@/data/rss-feeds';
import { extractFullContent, generateSlug } from '@/lib/rss';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [['media:content', 'mediaContent', { keepArray: false }]],
    }
});

export async function GET(request: Request) {
    try {
        const rssFeeds = await getRssFeeds();

        if (rssFeeds.length === 0) {
            return NextResponse.json({ message: 'No RSS feeds configured.' }, { status: 200 });
        }

        const outputDir = path.join(process.cwd(), 'public', 'generated-articles');
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(outputDir, { recursive: true });

        const processedArticles = [];

        for (const rssFeed of rssFeeds) {
            try {
                const feed = await parser.parseURL(rssFeed.url);
                let articlesToProcess = feed.items;
                articlesToProcess = articlesToProcess.slice(0, 20);

                for (const item of articlesToProcess) {
                    if (!item.link || !item.title) {
                        console.warn('Skipping article due to missing link or title:', item);
                        continue;
                    }

                    const summary = item.contentSnippet?.slice(0, 200) || item.content?.slice(0, 200) || '';
                    let thumbnailUrl;
                    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
                        thumbnailUrl = item.mediaContent.$.url;
                    } else if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
                        thumbnailUrl = item.enclosure.url;
                    }

                    const basicArticleData = {
                        slug: await generateSlug(item.title, rssFeed.url),
                        feedUrl: rssFeed.url,
                        title: item.title,
                        headline: item.title,
                        summary: summary,
                        link: item.link,
                        pubDate: item.pubDate,
                        author: item.creator || '',
                        thumbnailUrl: thumbnailUrl,
                    };

                    try {
                        const { blogContent, deepDives, byline } = await extractFullContent(item, basicArticleData);
                        const finalAuthor = byline || basicArticleData.author;

                        const finalArticle = {
                            ...basicArticleData,
                            author: finalAuthor,
                            blogContent,
                            deepDives,
                        };

                        const filePath = path.join(outputDir, `${finalArticle.slug}.json`);
                        fs.writeFileSync(filePath, JSON.stringify(finalArticle, null, 2));
                        processedArticles.push(finalArticle.slug);

                    } catch (error: unknown) {
                        console.error(`Failed to process and save article ${item.title} (${item.link}):`, error);
                    }
                }
            } catch (error: unknown) {
                console.error(`Failed to parse feed ${rssFeed.url}:`, error);
            }
        }

        return NextResponse.json({ message: 'RSS feeds processed and saved successfully.', processedCount: processedArticles.length }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error processing RSS feeds:', error);
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error processing RSS feeds.', error: errorMessage }, { status: 500 });
    }
}