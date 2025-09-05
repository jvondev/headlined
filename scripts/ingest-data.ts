import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL and/or Service Role Key are not set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface RssSource {
  name: string;
  url: string;
  category: string;
  sourceName: string;
  fallbackIconUrl?: string;
  cardBackgroundColor?: string;
  labelFontColor?: string;
}

interface BlogPost {
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

async function ingestRssSources() {
  console.log('Ingesting RSS sources...');
  const rssFeedsPath = path.join(process.cwd(), 'public', 'rss-feeds.json');
  const rssFeeds: RssSource[] = JSON.parse(fs.readFileSync(rssFeedsPath, 'utf-8'));

  for (const feed of rssFeeds) {
    const { data, error } = await supabase
      .from('rss_sources')
      .upsert(
        {
          name: feed.name,
          url: feed.url,
          category: feed.category,
          card_background_color: feed.cardBackgroundColor,
          label_font_color: feed.labelFontColor,
          fallback_icon_url: feed.fallbackIconUrl,
        },
        { onConflict: 'url' } // Upsert based on URL to avoid duplicates
      );

    if (error) {
      console.error(`Error ingesting RSS source ${feed.name}:`, error);
    } else {
      console.log(`Successfully ingested RSS source: ${feed.name}`);
    }
  }
  console.log('Finished ingesting RSS sources.');
}

async function ingestBlogPosts() {
  console.log('Ingesting blog posts...');
  const categoriesDir = path.join(process.cwd(), 'public', 'generated-categories');
  const categoryFiles = await glob(`${categoriesDir}/**/*.json`);

  for (const filePath of categoryFiles) {
    const categoryName = path.basename(path.dirname(filePath));
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const sourceName in fileContent) {
      if (Object.prototype.hasOwnProperty.call(fileContent, sourceName)) {
        const posts: BlogPost[] = fileContent[sourceName];

        for (const post of posts) {
          const { data, error } = await supabase
            .from('blog_posts')
            .upsert(
              {
                slug: post.slug,
                title: post.title,
                summary: post.summary,
                link: post.link,
                pub_date: post.pubDate ? new Date(post.pubDate).toISOString() : null,
                author: post.author,
                thumbnail_url: post.thumbnailUrl,
                original_feed_url: post.originalFeedUrl,
                blog_content: post.blogContent,
                category: categoryName,
                source: sourceName,
              },
              { onConflict: 'link' } // Upsert based on link to avoid duplicates
            );

          if (error) {
            console.error(`Error ingesting blog post ${post.title}:`, error);
          } else {
            console.log(`Successfully ingested blog post: ${post.title}`);
          }
        }
      }
    }
  }
  console.log('Finished ingesting blog posts.');
}

async function main() {
  await ingestRssSources();
  console.log('Data ingestion complete.');
}

main().catch(console.error);
