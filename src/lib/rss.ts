
'use server';

import Parser from 'rss-parser';
import { RssArticle, DeepDive, MetadataItem, Insight, RssFeed } from '@/types';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { getFeedInfoFromUrl, getRssFeeds } from '@/data/rss-feeds';

const parser = new Parser({
    customFields: {
        item: [['media:content', 'mediaContent', { keepArray: false }]],
    }
});

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

turndownService.addRule('removeByline', {
    filter: (node) => {
        return node.classList.contains('detected-byline');
    },
    replacement: () => ''
});

turndownService.addRule('figcaption', {
    filter: 'figcaption',
    replacement: (content) => {
        return `
_${content.trim()}_
`; 
    }
});

const feedCache = new Map<string, { timestamp: number; data: RssArticle[] }>();
const articleCache = new Map<string, { timestamp: number; data: RssArticle }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes for cache

async function extractFullContent(item: any, existingArticleData: Omit<RssArticle, 'blogContent' | 'deepDives'>): Promise<{ blogContent: string, deepDives: DeepDive<'metadata'>[], byline: string }> {
    let finalHtmlContent = '';

    if (item.link) {
        try {
            const res = await fetch(item.link, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: CACHE_DURATION / 1000 } });
            if (res.ok) {
                const html = await res.text();
                const doc = new JSDOM(html, { url: item.link });
                const document = doc.window.document;
                
                const reader = new Readability(document.cloneNode(true) as Document);
                const readableArticle = reader.parse();

                if (readableArticle && readableArticle.textContent.length > 250) {
                    finalHtmlContent = readableArticle.content;
                } else {
                    finalHtmlContent = document.body.innerHTML;
                }
            } else {
                finalHtmlContent = item['content:encoded'] || item.content || '';
            }
        } catch (e) {
            console.warn(`Could not fetch or parse full article content for ${item.link}`, e);
            finalHtmlContent = item['content:encoded'] || item.content || '';
        }
    } else {
         finalHtmlContent = item['content:encoded'] || item.content || '';
    }

    const contentDoc = new JSDOM(`<div>${finalHtmlContent}</div>`).window.document;

    const bylineCandidates = Array.from(contentDoc.querySelectorAll('p, a, span, div, [data-testid="byline-new"]'));
    const bylines: string[] = [];
    bylineCandidates.slice(0, 10).forEach(node => {
        const text = node.textContent?.trim() || '';
        if (node.getAttribute('data-testid')?.includes('byline') || text.toLowerCase().includes('correspondent') || text.toLowerCase().includes('bbc news')) {
            if (text.length > 3 && text.length < 100) {
                 bylines.push(text);
                 node.classList.add('detected-byline');
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

    return { blogContent: markdownContent, deepDives: [metadataDeepDive], byline: finalByline };
}

async function generateSlug(title: string, feedUrl: string): Promise<string> {
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
  const cached = feedCache.get(feedUrl);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return cached.data;
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    
    const articles = (await Promise.all(
        (feed.items || []).map(async (item) => {
          if (!item.link || !item.title) return null;

          const summary = item.contentSnippet?.slice(0, 200) || item.content?.slice(0, 200) || '';
          let thumbnailUrl;
          if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
              thumbnailUrl = item.mediaContent.$.url;
          } else if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
              thumbnailUrl = item.enclosure.url;
          }

          return {
            slug: await generateSlug(item.title, feedUrl),
            feedUrl: feedUrl,
            title: item.title,
            headline: item.title,
            summary: summary,
            blogContent: '', 
            deepDives: [], 
            link: item.link || '',
            pubDate: item.pubDate,
            author: item.creator || item.author || '',
            thumbnailUrl: thumbnailUrl,
          };
        })
    )).filter((article) => article !== null) as RssArticle[];

    feedCache.set(feedUrl, { timestamp: Date.now(), data: articles });
    return articles;
  } catch (error) {
    console.error(`Failed to fetch or parse RSS feed from ${feedUrl}:`, error);
    return [];
  }
}

export async function getRssArticleBySlug(slug: string): Promise<RssArticle | undefined> {
    const cached = articleCache.get(slug);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
    
    const allFeeds = await getRssFeeds();
    const sourceName = slug.startsWith('rss-') ? slug.split('-')[1] : slug.split('-')[0];
    
    const feed = allFeeds.find(f => f.sourceName === sourceName);
    if (!feed) {
        console.error("No feed found for source:", sourceName);
        return undefined;
    }
    
    const liveFeed = await parser.parseURL(feed.url);
    const matchedItem = (await Promise.all(liveFeed.items.map(async item => ({ item, slug: item.title ? await generateSlug(item.title, feed.url) : ''}))))
                          .find(x => x.slug === slug)?.item;
    
    if (!matchedItem || !matchedItem.link || !matchedItem.title) {
        return undefined;
    }

    const summary = matchedItem.contentSnippet?.slice(0, 200) || matchedItem.content?.slice(0, 200) || '';
    let thumbnailUrl;
    if (matchedItem.mediaContent && matchedItem.mediaContent.$ && matchedItem.mediaContent.$.url) {
        thumbnailUrl = matchedItem.mediaContent.$.url;
    } else if (matchedItem.enclosure && matchedItem.enclosure.url && matchedItem.enclosure.type?.startsWith('image')) {
        thumbnailUrl = matchedItem.enclosure.url;
    }

    const basicArticleData = {
        slug: slug,
        feedUrl: feed.url,
        title: matchedItem.title,
        headline: matchedItem.title,
        summary: summary,
        link: matchedItem.link,
        pubDate: matchedItem.pubDate,
        author: matchedItem.creator || matchedItem.author || '',
        thumbnailUrl: thumbnailUrl,
    };
    
    const { blogContent, deepDives, byline } = await extractFullContent(matchedItem, basicArticleData);
    
    const finalAuthor = byline || basicArticleData.author;
    
    const finalArticle: RssArticle = {
        ...basicArticleData,
        author: finalAuthor,
        blogContent,
        deepDives,
    };
    
    articleCache.set(slug, { timestamp: Date.now(), data: finalArticle });
    return finalArticle;
}

export async function getAdjacentRssArticle(currentSlug: string): Promise<{ prev: RssArticle | null, next: RssArticle | null }> {
    const allFeeds = await getRssFeeds();
    const sourceName = currentSlug.startsWith('rss-') ? currentSlug.split('-')[1] : currentSlug.split('-')[0];
    const feed = allFeeds.find(f => f.sourceName === sourceName);
    if (!feed) return { prev: null, next: null };

    const articles = await getRssFeed(feed.url); 
    const currentIndex = articles.findIndex(article => article.slug === currentSlug);

    if (currentIndex === -1) {
        return { prev: null, next: null };
    }

    const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

    return { prev, next };
}

export async function rssToInsight(article: RssArticle): Promise<Insight> {
    const feedInfo = await getFeedInfoFromUrl(article.feedUrl);
    return {
        slug: article.slug, // Slug already has 'rss-' prefix
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
