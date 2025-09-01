import { NextResponse } from 'next/server';
import { RssCombiner } from 'rss-combiner';
import { getRssFeeds } from '@/data/rss-feeds';
import { extractFullContent, generateSlug } from '@/lib/rss'; // Reusing existing logic
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const rssFeeds = await getRssFeeds();
        const feedUrls = rssFeeds.map(feed => feed.url);

        if (feedUrls.length === 0) {
            return NextResponse.json({ message: 'No RSS feeds configured.' }, { status: 200 });
        }

        const combiner = new RssCombiner({
            feeds: feedUrls,
            maxItems: 50, // Limit items per feed to avoid excessive processing
        });

        const combinedFeed = await combiner.combine();
        const articlesToProcess = combinedFeed.items;

        const outputDir = path.join(process.cwd(), 'public', 'generated-articles');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const processedArticles = [];

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
                slug: await generateSlug(item.title, item.feedUrl || ''), // Assuming feedUrl is available from rss-combiner or can be derived
                feedUrl: item.feedUrl || '',
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

            } catch (error) {
                console.error(`Failed to process and save article ${item.title} (${item.link}):`, error);
            }
        }

        return NextResponse.json({ message: 'RSS feeds processed and saved successfully.', processedCount: processedArticles.length }, { status: 200 });

    } catch (error) {
        console.error('Error processing RSS feeds:', error);
        return NextResponse.json({ message: 'Error processing RSS feeds.', error: error.message }, { status: 500 });
    }
}
