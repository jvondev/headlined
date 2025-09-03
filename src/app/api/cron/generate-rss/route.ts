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

export async function GET(request: Request) {
    try {
        const rssFeedsPath = path.join(process.cwd(), 'src', 'data', 'rss-feeds.json');
        const fileContents = await fs.promises.readFile(rssFeedsPath, 'utf8');
        const rssFeeds: RssFeed[] = JSON.parse(fileContents);

        if (rssFeeds.length === 0) {
            return NextResponse.json({ message: 'No RSS feeds configured.' }, { status: 200 });
        }

        const allProcessedArticles: RssArticle[] = []; // New array to collect all processed articles

        for (const rssFeed of rssFeeds) {
            try {
                const feed = await parser.parseURL(rssFeed.url);
                let articlesToProcess = feed.items;
                articlesToProcess = articlesToProcess.slice(0, 15); // Limit to 15 articles per feed

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
                        slug: (await generateSlug(item.title, rssFeed.url)).replace('rss-', ''), // Remove 'rss-' prefix
                        title: item.title,
                        summary: summary,
                        link: item.link,
                        pubDate: item.pubDate,
                        author: item.creator || '',
                        thumbnail: thumbnailUrl, // Renamed from thumbnailUrl
                    };

                    try {
                        const { blogContent, byline, deepDives, contentDoc } = await extractFullContent(item, basicArticleData); // Removed deepDives
                        const finalAuthor = byline || basicArticleData.author;

                        // If thumbnail is still not found, try to extract from contentDoc
                        if (!thumbnailUrl) {
                            const firstImage = contentDoc.querySelector('img');
                            if (firstImage && firstImage.src) {
                                thumbnailUrl = firstImage.src;
                            }
                        }

                        const finalArticle = {
                            ...basicArticleData,
                            author: finalAuthor,
                            blogContent,
                            originalFeedUrl: rssFeed.url, // Add originalFeedUrl
                            deepDives,
                        };

                        allProcessedArticles.push(finalArticle); // Collect the processed article

                    } catch (error: unknown) {
                        console.error(`Failed to process article ${item.title} (${item.link}):`, error);
                    }
                }
            } catch (error: unknown) {
                console.error(`Failed to parse feed ${rssFeed.url}:`, error);
            }
        }

        // --- Logic to group and save articles by category and source locally ---
        const groupedArticles: {
            [category: string]: {
                [sourceName: string]: RssArticle[];
            };
        } = {};

        for (const article of allProcessedArticles) {
            const feedInfo = rssFeeds.find(feed => feed.url === article.originalFeedUrl); // Use originalFeedUrl
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

        return NextResponse.json({
            message: 'RSS feeds processed and categorized JSONs saved locally successfully.',
            processedArticlesCount: allProcessedArticles.length,
            savedCategoryFilesCount: savedCategoryFiles.length,
            savedCategoryFiles: savedCategoryFiles,
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error processing RSS feeds:', error);
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error processing RSS feeds.', error: errorMessage }, { status: 500 });
    }
}