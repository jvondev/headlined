import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cron } from 'hono/cron';
import { HTTPException } from 'hono/http-exception';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import { sourcesData } from '../data/sources';
import 'dotenv/config';

const app = new Hono();
const parser = new Parser();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be set in environment variables.");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// --- Helper Functions ---

async function fetchArticleMetadata(url: string): Promise<{ description: string | null; thumbnail_url: string | null; }> {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const html = parse(text);

        let description: string | null = null;
        const descriptionSelectors = ['meta[property="og:description"]', 'meta[name="twitter:description"]', 'meta[name="description"]'];
        for (const selector of descriptionSelectors) {
            const node = html.querySelector(selector);
            if (node && node.getAttribute('content')) {
                description = node.getAttribute('content')!;
                break;
            }
        }

        let thumbnail_url: string | null = null;
        const thumbnailSelectors = ['meta[property="og:image"]', 'meta[name="twitter:image"]'];
        for (const selector of thumbnailSelectors) {
            const node = html.querySelector(selector);
            if (node && node.getAttribute('content')) {
                thumbnail_url = node.getAttribute('content')!;
                break;
            }
        }

        return { description, thumbnail_url };
    } catch (e: any) {
        console.error(`Error fetching metadata for ${url}: ${e.message}`);
        return { description: null, thumbnail_url: null };
    }
}

// --- Main Cron Job Logic ---

async function processItem(item: any, source: any): Promise<void> {
    const title = item.title;
    const link = item.link;

    if (!title || !link) {
        console.log(`Skipping item due to missing title or link: ${item.guid || 'N/A'}`);
        return;
    }

    const pub_date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

    let description = item.contentSnippet;
    let thumbnail_url = item.enclosure ? item.enclosure.url : null;

    if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
        thumbnail_url = item['media:content']['$'].url;
    }

    if (!description || !thumbnail_url) {
        const metadata = await fetchArticleMetadata(link);
        if (!description) {
            description = metadata.description;
        }
        if (!thumbnail_url) {
            thumbnail_url = metadata.thumbnail_url;
        }
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 100);

    let topic = source.topic || 'news';
    if (source.name === "Yahoo News" && link) {
        if (link.includes("finance.yahoo.com")) {
            topic = "finance";
        } else if (link.includes("autos.yahoo.com")) {
            topic = "auto";
        } else if (link.includes("tech.yahoo.com")) {
            topic = "tech";
        } else if (link.includes("health.yahoo.com")) {
            topic = "health";
        }
    }

    const post_data = {
        slug: slug,
        title: title,
        description: description,
        link: link,
        thumbnail_url: thumbnail_url,
        created_at: new Date().toISOString(),
        topic: topic,
    };

    try {
        const { error } = await supabase.from("posts").upsert(post_data, { onConflict: 'link' });
        if (error) throw error;
    } catch (e: any) {
        console.error(`Error upserting post for ${link}: ${e.message}`);
        throw e;
    }
}

async function runCronJob() {
    const start_time = Date.now();
    console.log("Starting RSS feed generation...");
    let processed_count = 0;
    let error_count = 0;

    for (const source of sourcesData) {
        try {
            console.log(`Fetching feed for source: ${source.name}`);
            const feed = await parser.parseURL(source.url);
            const items_to_process = feed.items.slice(0, source.max_items || feed.items.length);

            const tasks = items_to_process.map(item => processItem(item, source));
            const results = await Promise.allSettled(tasks);

            results.forEach(result => {
                if (result.status === 'rejected') {
                    error_count++;
                    console.error(`Error processing item: ${result.reason}`);
                } else {
                    processed_count++;
                }
            });

        } catch (e: any) {
            error_count++;
            console.error(`Failed to process feed for ${source.name}: ${e.message}`);
        }
    }

    const end_time = Date.now();
    const duration = (end_time - start_time) / 1000;
    console.log(`RSS feed generation finished in ${duration.toFixed(2)} seconds. Processed: ${processed_count}, Errors: ${error_count}`);

    return {
        message: `Cron job finished. Processed: ${processed_count}, Errors: ${error_count}`,
        duration_seconds: duration
    };
}

app.get('/api/index', async (c) => {
    const result = await runCronJob();
    return c.json(result);
});

export default app;

// Run the cron job directly if the script is executed from the command line
if (require.main === module) {
  console.log("Running cron job directly...");
  runCronJob().then(() => {
    console.log("Cron job finished.");
    process.exit(0);
  }).catch(error => {
    console.error("Cron job failed:", error);
    process.exit(1);
  });
}