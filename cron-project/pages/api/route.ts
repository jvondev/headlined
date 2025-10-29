import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import { sourcesData } from '../../data/sources';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be set in environment variables.");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
const parser = new Parser();

// Banned keywords for filtering posts
const bannedKeywords = ['Only Fans', 'porn', 'sex', 'gambling']; // Add more keywords as needed

// --- Helper Functions ---

function cleanCdata(text: string): string {
    return text.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

// Function to strip HTML tags from a string
function stripHtml(html: string): string {
    return parse(html).textContent || '';
}

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
                description = stripHtml(node.getAttribute('content')!) || null; // Strip HTML from description
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
    let title = item.title ? cleanCdata(item.title) : null;
    let link = item.link;
    let description: string | null = null;

    // Special handling for hnrss.org to ensure the correct article link is used
    // and to prevent using item.contentSnippet as description.
    if (source.url === 'https://hnrss.org/frontpage.atom') {
        if (item.content) {
            const contentHtml = parse(item.content);
            const articleLinkNode = contentHtml.querySelector('p a');
            if (articleLinkNode && articleLinkNode.text.startsWith('Article URL:')) {
                link = articleLinkNode.getAttribute('href');
            }
        }
        // For Hacker News, explicitly set description to null initially
        // so it relies on fetchArticleMetadata.
        description = null;
    } else if (item.contentSnippet) {
        description = stripHtml(cleanCdata(item.contentSnippet)) || null; // Strip HTML from contentSnippet
    }

    // For Slashdot, use item.description directly and strip HTML
    if (source.url === 'https://rss.slashdot.org/Slashdot/slashdot' && item.description) {
        description = stripHtml(cleanCdata(item.description)) || null;
    }

    if (!title || !link) {
        console.log(`Skipping item due to missing title or link: ${item.guid || 'N/A'}`);
        return;
    }

    // Filter by banned keywords
    // Use title and potential contentSnippet/description for filtering, but not for final description.
    const textToFilter = `${title} ${item.contentSnippet ? stripHtml(item.contentSnippet) : ''} ${item.description ? stripHtml(item.description) : ''}`.toLowerCase();
    if (bannedKeywords.some(keyword => textToFilter.includes(keyword.toLowerCase()))) {
        console.log(`Skipping item due to banned keyword: ${title}`);
        return;
    }

    const pub_date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

    let thumbnail_url = item.enclosure ? item.enclosure.url : null;

    if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
        thumbnail_url = item['media:content']['$'].url;
    }

    // Always fetch metadata if description or thumbnail is missing, or if it's hnrss/slashdot (to get a proper description/thumbnail)
    if ((!description || !thumbnail_url) || source.url === 'https://hnrss.org/frontpage.atom' || source.url === 'https://rss.slashdot.org/Slashdot/slashdot') {
        const metadata = await fetchArticleMetadata(link);
        if (!description) { // Only update if description is still null
            description = metadata.description;
        }
        if (!thumbnail_url) {
            thumbnail_url = metadata.thumbnail_url;
        }
    }

    // Slug generation fix:
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove all non-alphanumeric characters except spaces
        .trim() // Trim leading/trailing spaces
        .replace(/\s+/g, '-'); // Replace all spaces with hyphens

    // Truncate and ensure it doesn't end with a hyphen if truncated
    let slug = baseSlug.substring(0, 60);
    if (slug.endsWith('-')) {
        slug = slug.slice(0, -1);
    }
    // Ensure slug is not empty if title was problematic
    if (!slug) {
        console.warn(`Generated empty slug for title: ${title}. Using a fallback.`);
        slug = `post-${Date.now()}`;
    }


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
    } else if (source.url === 'https://rss.slashdot.org/Slashdot/slashdot' && link) {
        const matches = link.match(/https:\/\/([a-z]+)\.slashdot\.org/);
        if (matches && matches[1]) {
            const subdomain = matches[1];
            // Map Slashdot subdomains to topics
            switch (subdomain) {
                case 'it':
                case 'tech':
                case 'hardware':
                case 'developers': // Mapped to tech as per user request
                    topic = 'tech';
                    break;
                case 'science':
                    topic = 'science';
                    break;
                case 'games':
                    topic = 'gaming';
                    break;
                // Default case for news and any other unmapped subdomains
                case 'news':
                case 'yro': // Your Rights Online
                case 'books':
                default:
                    topic = 'news';
                    break;
            }
        } else {
            topic = 'news'; // Default if no specific subdomain found
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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const result = await runCronJob();
            res.status(200).json(result);
        } catch (error: any) {
            console.error("Cron job handler error:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}