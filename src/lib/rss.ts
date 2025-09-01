'use server';

import { RssArticle, DeepDive, MetadataItem, Insight, RssFeed } from '@/types';
import { getFeedInfoFromUrl, getRssFeeds } from '@/data/rss-feeds';
import fs from 'fs';
import path from 'path';
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

turndownService.addRule('removeByline', {
    filter: (node) => {
        return node.classList.contains('detected-byline');
    },
    replacement: () => ''
});

turndownService.addRule('figcaption', {
    filter: 'figcaption',
    replacement: (content) => {
        return `\n_${content.trim()}_\n`; 
    }
});


const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes for cache

export async function extractFullContent(item: any, existingArticleData: Omit<RssArticle, 'blogContent' | 'deepDives'>): Promise<{ blogContent: string, deepDives: DeepDive<'metadata'>[], byline: string }> {
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
          if (article.feedUrl === feedUrl) {
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