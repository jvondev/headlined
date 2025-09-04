import { NextResponse } from 'next/server';

import { extractFullContent, generateSlug } from '@/lib/rss';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { RssArticle, RssFeed } from '@/types'; // Added RssFeed type

const parser = new Parser({
    customFields: {
        item: [['media:content', 'mediaContent', { keepArray: false }]],
    }
});

// Helper to slugify category names for file paths
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// New function containing the core logic
export async function generateAndSaveRssData() {
    const rssFeedsPath = path.join(process.cwd(), 'src', 'data', 'rss-feeds.json');
    const fileContents = await fs.promises.readFile(rssFeedsPath, 'utf8');
    const rssFeeds: RssFeed[] = JSON.parse(fileContents);

    if (rssFeeds.length === 0) {
        console.log('No RSS feeds configured.');
        return {
            message: 'No RSS feeds configured.',
            processedArticlesCount: 0,
            savedCategoryFilesCount: 0,
            savedCategoryFiles: [],
        };
    }

    const allProcessedArticles: RssArticle[] = [];

    for (const rssFeed of rssFeeds) {
        try {
            const feed = await parser.parseURL(rssFeed.url);
            let articlesToProcess = feed.items;
            articlesToProcess = articlesToProcess.slice(0, 15);

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
                    slug: (await generateSlug(item.title, rssFeed.url)).replace('rss-', ''),
                    title: item.title,
                    summary: summary,
                    link: item.link,
                    pubDate: item.pubDate,
                    author: item.creator || '',
                    thumbnailUrl: thumbnailUrl,
                    originalFeedUrl: rssFeed.url,
                };

                try {
                    const { blogContent, byline, contentDoc } = await extractFullContent(item, basicArticleData);
                    const finalAuthor = byline || basicArticleData.author;

                    if (!thumbnailUrl) {
                        const imagePatterns = [
                            /<meta\s+property="og:image"\s+content="([^"]+)"/,
                            /<meta\s+name="twitter:image"\s+content="([^"]+)"/,
                            /<img[^>]+src="([^"]+)"/
                        ];

                        const contentHtml = contentDoc.body.innerHTML;

                        for (const pattern of imagePatterns) {
                            const match = contentHtml.match(pattern);
                            if (match && match[1]) {
                                thumbnailUrl = match[1];
                                break;
                            }
                        }
                    }

                    const finalArticle = {
                        ...basicArticleData,
                        author: finalAuthor,
                        blogContent,
                        thumbnailUrl: thumbnailUrl,
                    };

                    allProcessedArticles.push(finalArticle);

                } catch (error: unknown) {
                    console.error(`Failed to process article ${item.title} (${item.link}):`, error);
                }
            }
        } catch (error: unknown) {
            console.error(`Failed to parse feed ${rssFeed.url}:`, error);
        }
    }

    const groupedArticles: {
        [category: string]: {
            [sourceName: string]: RssArticle[];
        };
    } = {};

    for (const article of allProcessedArticles) {
        const feedInfo = rssFeeds.find(feed => feed.url === article.originalFeedUrl);
        if (feedInfo) {
            const category = feedInfo.category;
            const sourceName = feedInfo.sourceName;

            if (!groupedArticles[category]) {
                groupedArticles[category] = {};
            }
            if (!groupedArticles[category][sourceName]) {
                groupedArticles[category][sourceName] = [];
            }
            groupedArticles[category][sourceName].push(article);
        } else {
            console.warn(`Could not find feed info for article: ${article.slug}`);
        }
    }

    const categoryOutputDir = path.join(process.cwd(), 'public', 'generated-categories');
    if (fs.existsSync(categoryOutputDir)) {
        fs.rmSync(categoryOutputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(categoryOutputDir, { recursive: true });

    const savedCategoryFiles: string[] = [];
    for (const category in groupedArticles) {
        if (Object.prototype.hasOwnProperty.call(groupedArticles, category)) {
            const categorySlug = slugify(category);
            const filePath = path.join(categoryOutputDir, `${categorySlug}.json`);
            const fileContent = JSON.stringify(groupedArticles[category], null, 2);

            try {
                fs.writeFileSync(filePath, fileContent);
                savedCategoryFiles.push(filePath);
                console.log(`Successfully saved ${filePath} locally.`);
            } catch (saveError) {
                console.error(`Failed to save ${filePath} locally:`, saveError);
            }
        }
    }

    return {
        message: 'RSS feeds processed and categorized JSONs saved locally successfully.',
        processedArticlesCount: allProcessedArticles.length,
        savedCategoryFilesCount: savedCategoryFiles.length,
        savedCategoryFiles: savedCategoryFiles,
    };
}

export async function GET(request: Request) {
    try {
        const result = await generateAndSaveRssData();
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        console.error('Error processing RSS feeds:', error);
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error processing RSS feeds.', error: errorMessage }, { status: 500 });
    }
}