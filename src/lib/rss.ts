'use server';

import { RssArticle, DeepDive, MetadataItem, Insight, RssFeed } from '@/types';
import fs from 'fs';
import path from 'path';

async function loadRssFeeds(): Promise<RssFeed[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'rss-feeds.json');
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as RssFeed[];
    } catch (error) {
        console.error('Failed to load rss-feeds.json:', error);
        return [];
    }
}

async function getFeedInfoFromUrl(url: string): Promise<RssFeed | undefined> {
    const feeds = await loadRssFeeds();
    return feeds.find(feed => feed.url === url);
}

import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
});

// Ensure headings are preserved for ad insertion logic
turndownService.addRule('h1', {
    filter: 'h1',
    replacement: (content) => `\n# ${content}\n\n`
});

turndownService.addRule('h2', {
    filter: 'h2',
    replacement: (content) => `\n## ${content}\n\n`
});

turndownService.addRule('author-bio', {
  filter: function (node, options) {
    if (node.nodeName !== 'P') {
      return false;
    }
    const text = node.textContent || '';
    return text.trim().startsWith('is a ');
  },
  replacement: function (content, node, options) {
    return '';
  }
});




turndownService.addRule('figcaption', {
    filter: 'figcaption',
    replacement: (content) => {
        return `\n_${content.trim()}_\n`; 
    }
});


const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes for cache

export async function extractFullContent(item: any, existingArticleData: Omit<RssArticle, 'blogContent' | 'deepDives'>): Promise<{ blogContent: string, deepDives: DeepDive<'metadata'>[], byline: string, contentDoc: Document }> {
    console.log('Extracting content for link:', item.link);
    let finalHtmlContent = item.content || item['content:encoded'] || '';

    // Heuristic: If the initial content is too short, try fetching the full article
    const MIN_CONTENT_LENGTH = 500; // Adjust as needed

    if ((!finalHtmlContent || finalHtmlContent.length < MIN_CONTENT_LENGTH) && item.link) {
        try {
            const res = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log('Fetch response OK:', res.ok);
            if (res.ok) {
                const html = await res.text();
                const doc = new JSDOM(html, { url: item.link });
                const document = doc.window.document;
                
                const reader = new Readability(document.cloneNode(true) as Document);
                const readableArticle = reader.parse();

                if (readableArticle) {
                    finalHtmlContent = readableArticle.content;
                } else {
                    // Fallback to body innerHTML if Readability fails
                    finalHtmlContent = document.body.innerHTML;
                }
            } else {
                // If fetch failed, and no content in item, finalHtmlContent remains empty
                // or retains its original (possibly short) value
            }
        } catch (e) {
            console.warn(`Could not fetch or parse full article content for ${item.link}`, e);
            // If fetch failed, and no content in item, finalHtmlContent remains empty
            // or retains its original (possibly short) value
        }
    }

    const contentDoc = new JSDOM(`<div>${finalHtmlContent}</div>`).window.document;

    contentDoc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            const isGreyPlaceholderInUrl = src.toLowerCase().includes('grey-placeholder');

            const width = parseInt(img.getAttribute('width') || '0', 10);
            const height = parseInt(img.getAttribute('height') || '0', 10);
            const isTiny = (width > 0 && width <= 5) || (height > 0 && height <= 5); // e.g., 1x1, 5x5 pixels

            if (isGreyPlaceholderInUrl || isTiny) {
                img.remove();
            }
        }
    });

    // --- Byline Removal Logic ---
    // More aggressive, unconditional removal for selectors known to be bylines.
    const unconditionalBylineSelectors = [
        'div[class*="_1n017go5"]', // for author in theverge (old)
        'div.duet--article--byline-and-date', // for standard article byline
        'div.duet--article--article-byline-small-author-bio', // for standard article author bio
        'p.duet--article--byline-author-bio', // for author bio
        '.c-byline', // for recirculation river bylines
        'div.duet--quick-post--byline', // for quick post bylines
    ];

    unconditionalBylineSelectors.forEach(selector => {
        contentDoc.querySelectorAll(selector).forEach(node => {
            console.log(`Unconditionally removing element with selector '${selector}':`, node.textContent?.trim());
            node.remove();
        });
    });

    

    // Common selectors for bylines. Add more as needed based on observed patterns.
    const bylineSelectors = [
        '[data-testid*="byline"]',
        '.byline',
        '.author',
        '.article-byline',
        'span[itemprop="author"]',
        'div[class*="author"]',
        'p[class*="byline"]',
        'address', 
        // Sometimes bylines are in address tags
    ];

    bylineSelectors.forEach(selector => {
        contentDoc.querySelectorAll(selector).forEach(node => {
            const text = node.textContent?.trim() || '';
            // Heuristic to avoid removing too much: check text length and common byline keywords
            if (text.length > 5 &&
                (text.toLowerCase().includes('by ') ||
                 text.toLowerCase().includes('correspondent') ||
                 text.toLowerCase().includes('staff writer') ||
                 text.toLowerCase().includes('contributor') ||
                 text.toLowerCase().includes('editor') ||
                 text.toLowerCase().includes('reporter') ||
                 text.toLowerCase().includes('writes for') ||
                 text.toLowerCase().includes('is a'))) { // Added more keywords
                node.remove(); // Remove the entire element
                console.log('Removed potential byline element:', text);
            }
        });
    });

    // The byline extraction below is now primarily for metadata, not for content removal.
    const bylines: string[] = [];
    // Re-evaluate byline candidates after removal to get the actual byline for metadata
    const finalBylineCandidates = Array.from(contentDoc.querySelectorAll('p, a, span, div, [data-testid*="byline"], .byline, .author, .article-byline'));
    finalBylineCandidates.slice(0, 10).forEach(node => {
        const text = node.textContent?.trim() || '';
        if (node.getAttribute('data-testid')?.includes('byline') || text.toLowerCase().includes('correspondent') || text.toLowerCase().includes('bbc news') || text.toLowerCase().includes('by ')) {
            if (text.length > 3 && text.length < 100) {
                 bylines.push(text);
            }
        }
    });
    const finalByline = [...new Set(bylines)].join('\n');
    
    // Check if there are any headings. If not, inject a default "Summary" h2 heading.
    const hasHeadings = contentDoc.querySelector('h1, h2, h3, h4');
    let markdownContent = turndownService.turndown(contentDoc.body.innerHTML);
    if (!hasHeadings) {
        markdownContent = `## Summary\n\n${markdownContent}`;
    }

    
    const metadataItems: MetadataItem[] = [];
    if(existingArticleData.author) metadataItems.push({ label: 'Author', value: existingArticleData.author });
    if(existingArticleData.pubDate) metadataItems.push({ label: 'Published', value: new Date(existingArticleData.pubDate).toLocaleDateString() });
    if(existingArticleData.link) metadataItems.push({ label: 'Original Link', value: existingArticleData.link });

    const metadataDeepDive: DeepDive<'metadata'> = {
      type: 'metadata',
      title: 'Article Details',
      icon: 'Info',
      content: {
        items: metadataItems,
      },
    };

    return { blogContent: markdownContent, deepDives: [metadataDeepDive], byline: finalByline, contentDoc };
}

export async function generateSlug(title: string, feedUrl: string): Promise<string> {
    const feedInfo = await getFeedInfoFromUrl(feedUrl);
    const source = feedInfo?.sourceName || 'source';
    
    const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);

    return `rss-${source}-${sanitizedTitle}`;
}

export async function getRssFeed(feedUrl: string): Promise<RssArticle[]> {
    try {
      const articlesDir = path.join(process.cwd(), 'public', 'generated-articles');
      if (!fs.existsSync(articlesDir)) {
        return [];
      }

      const files = fs.readdirSync(articlesDir);
      const allArticles: RssArticle[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(articlesDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const article = JSON.parse(fileContent) as RssArticle;
          if (!feedUrl || article.originalFeedUrl === feedUrl) {
            allArticles.push(article);
          }
        }
      }
      return allArticles;
    } catch (error) {
      console.error(`Failed to read generated RSS feed from ${feedUrl}:`, error);
      return [];
    }
  }

export async function getRssArticleBySlug(slug: string): Promise<RssArticle | undefined> {
    try {
      const filePath = path.join(process.cwd(), 'public', 'generated-articles', `${slug}.json`);
      if (!fs.existsSync(filePath)) {
        return undefined;
      }
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const article = JSON.parse(fileContent) as RssArticle;
      return article;
    } catch (error) {
      console.error(`Failed to read generated article for slug ${slug}:`, error);
      return undefined;
    }
  }

export async function getAdjacentRssArticle(currentSlug: string): Promise<{ prev: RssArticle | null, next: RssArticle | null }> {
    const allFeeds = await loadRssFeeds();
    const sourceName = currentSlug.startsWith('rss-') ? currentSlug.split('-')[1] : currentSlug.split('-')[0];
    const feed = allFeeds.find(f => f.sourceName === sourceName);
    if (!feed) return { prev: null, next: null };

    const articles = await getRssFeed(feed.url!); 
    const currentIndex = articles.findIndex(article => article.slug === currentSlug);

    if (currentIndex === -1) {
        return { prev: null, next: null };
    }

    const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

    return { prev, next };
}

export async function rssToInsight(article: RssArticle): Promise<Insight> {
    const feedInfo = article.originalFeedUrl
        ? await getFeedInfoFromUrl(article.originalFeedUrl)
        : undefined;
    return {
        slug: article.slug, // Slug already has 'rss-' prefix
        seo: {
            title: article.title,
            description: article.description,
        },
        category: [feedInfo?.category || 'News', feedInfo?.name || ''],
        title: article.title,        
        description: article.description,
        deepDives: article.deepDives,
        blogContent: article.blogContent,
        thumbnailUrl: article.thumbnailUrl,
        author: article.author,
    }
}
