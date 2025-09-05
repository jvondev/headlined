import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

interface RssFeedConfig {
  name: string;
  url: string;
  category: string;
  sourceName: string;
}

interface BlogPostData {
  slug: string;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  author?: string;
  thumbnailUrl?: string;
  originalFeedUrl: string;
  blogContent: string;
}

async function generateRssData() {
  console.log('Starting RSS data generation...');

  const rssFeedsConfigPath = path.join(process.cwd(), 'public', 'rss-feeds.json');
  const rssFeedsConfig: RssFeedConfig[] = JSON.parse(fs.readFileSync(rssFeedsConfigPath, 'utf-8'));

  const parser = new Parser();
  const allPostsByCategory: { [key: string]: { [source: string]: BlogPostData[] } } = {};

  for (const feedConfig of rssFeedsConfig) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const category = feedConfig.category.toLowerCase();
      const sourceName = feedConfig.sourceName;

      if (!allPostsByCategory[category]) {
        allPostsByCategory[category] = {};
      }
      if (!allPostsByCategory[category][sourceName]) {
        allPostsByCategory[category][sourceName] = [];
      }

      for (const item of feed.items) {
        if (item.link && item.title && item.pubDate) {
          let blogContent = item.content || item['content:encoded'] || '';
          const summary = item.contentSnippet || item.summary || item.description || '';

          if (!blogContent) {
            try {
              const response = await fetch(item.link);
              const html = await response.text();
              const doc = new JSDOM(html, {
                url: item.link
              });
              const reader = new Readability(doc.window.document);
              const article = reader.parse();
              if (article && article.content) {
                blogContent = article.content;
              }
            } catch (e) {
              console.error(`Failed to fetch and parse article from ${item.link}`, e);
            }
          }

          const post: BlogPostData = {
            slug: item.link.split('/').pop() || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
            title: item.title,
            summary: summary,
            link: item.link,
            pubDate: new Date(item.pubDate).toUTCString(), // Ensure consistent date format
            author: item.creator || item.author || '',
            thumbnailUrl: item.enclosure?.url || item.itunes?.image || item.image?.url || '',
            originalFeedUrl: feedConfig.url,
            blogContent: blogContent,
          };
          allPostsByCategory[category][sourceName].push(post);
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feedConfig.name} (${feedConfig.url}):`, error);
    }
  }

  // Write data to respective category JSON files
  const outputDir = path.join(process.cwd(), 'public', 'generated-categories');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const category in allPostsByCategory) {
    const categoryFilePath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(categoryFilePath, JSON.stringify(allPostsByCategory[category], null, 2));
    console.log(`Generated ${category}.json`);
  }

  console.log('RSS data generation complete.');
}

generateRssData().catch(console.error);
