import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import { sourcesData } from './sources';

const parser = new Parser();

// Directories
const OUTPUT_DIR = path.join(__dirname, '../output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');

// Banned keywords for filtering posts
const bannedKeywords = ['Only Fans', 'porn', 'sex', 'gambling', 'Form 13F', 'Form 13G', 'Form 144', 'deals', 'black friday', 'discount', 'best'];

// Banned thumbnail URLs (default/placeholder images to filter out)
const bannedThumbnails = [
    'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png'
];

// Phrases to remove from descriptions
const phrasesToRemoveFromDescription = [
    '(Source: Bloomberg)',
    'Read more of this story at Slashdot.'
];

// Phrases to remove from titles
const phrasesToRemoveFromTitle = [
    'Tell HN:',
    'Show HN:'
];

// --- Helper Functions ---

function cleanCdata(text: string): string {
    return text.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

function stripHtml(html: string): string {
    return parse(html).textContent || '';
}

function removePhrases(text: string | null, phrases: string[]): string | null {
    if (!text) return null;
    let cleanedText = text;
    for (const phrase of phrases) {
        cleanedText = cleanedText.replace(phrase, '').trim();
    }
    return cleanedText;
}

function truncateDescription(description: string | null): string | null {
    if (!description) return null;

    const paragraphs = description.split(/\n\s*\n/);
    let effectiveDescription = paragraphs[0] || '';

    const sentences = effectiveDescription.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    if (sentences.length > 5) {
        effectiveDescription = sentences.slice(0, 5).join('').trim();
    } else {
        effectiveDescription = sentences.join('').trim();
    }

    if (effectiveDescription.length < description.length && !/[.!?]$/.test(effectiveDescription)) {
        const lastSpaceIndex = effectiveDescription.lastIndexOf(' ');
        if (lastSpaceIndex > -1) {
            effectiveDescription = effectiveDescription.substring(0, lastSpaceIndex) + '...';
        } else {
            effectiveDescription = effectiveDescription + '...';
        }
    }

    return effectiveDescription.length > 0 ? effectiveDescription : null;
}

async function isImageLargeEnough(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        if (!response.ok) {
            if (response.status === 404) return false;
            return true;
        }

        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            const size = parseInt(contentLength, 10);
            if (size < 15000) return false; // Filter < 15KB
        }
        return true;
    } catch (e) {
        return true;
    }
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
                description = stripHtml(node.getAttribute('content')!) || null;
                description = removePhrases(description, phrasesToRemoveFromDescription);
                description = truncateDescription(description);
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
        return { description: null, thumbnail_url: null };
    }
}

// --- Main Logic ---

async function processItem(item: any, source: any): Promise<any | null> {
    let title = item.title ? stripHtml(cleanCdata(item.title)) : null;
    title = removePhrases(title, phrasesToRemoveFromTitle);

    let link = item.link;
    let description: string | null = null;

    if (source.url.includes('hnrss.org')) {
        if (item.content) {
            const contentHtml = parse(item.content);
            const articleLinkNode = contentHtml.querySelector('p a');
            if (articleLinkNode && articleLinkNode.text.startsWith('Article URL:')) {
                link = articleLinkNode.getAttribute('href');
            }
        }
        description = null;
    } else if (item.contentSnippet) {
        description = stripHtml(cleanCdata(item.contentSnippet)) || null;
        description = removePhrases(description, phrasesToRemoveFromDescription);
        description = truncateDescription(description);
    }

    if (!description && item['content:encoded']) {
        description = stripHtml(cleanCdata(item['content:encoded'])) || null;
        description = removePhrases(description, phrasesToRemoveFromDescription);
        description = truncateDescription(description);
    }

    if (source.url === 'https://rss.slashdot.org/Slashdot/slashdot' && item.description) {
        description = stripHtml(cleanCdata(item.description)) || null;
        description = removePhrases(description, phrasesToRemoveFromDescription);
        description = truncateDescription(description);
    }

    if (!title || !link) {
        return null;
    }

    const textToFilter = `${title} ${item.contentSnippet ? stripHtml(item.contentSnippet) : ''} ${item.description ? stripHtml(item.description) : ''}`.toLowerCase();
    if (bannedKeywords.some(keyword => textToFilter.includes(keyword.toLowerCase()))) {
        return null;
    }

    const pub_date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

    let thumbnail_url = item.enclosure ? item.enclosure.url : null;

    if (item['media:content']) {
        if (Array.isArray(item['media:content'])) {
            const sorted = item['media:content'].sort((a: any, b: any) => {
                const wA = a['$'] && a['$'].width ? parseInt(a['$'].width, 10) : 0;
                const wB = b['$'] && b['$'].width ? parseInt(b['$'].width, 10) : 0;
                return wB - wA;
            });
            const best = sorted[0];
            if (best) {
                const width = best['$'] && best['$'].width ? parseInt(best['$'].width, 10) : 0;
                if (width === 0 || width >= 300) {
                    if (best['$'] && best['$'].url) thumbnail_url = best['$'].url;
                    else if (best.url) thumbnail_url = best.url;
                }
            }
        } else {
            const m = item['media:content'];
            const width = m['$'] && m['$'].width ? parseInt(m['$'].width, 10) : (m.width ? parseInt(m.width, 10) : 0);
            if (width === 0 || width >= 300) {
                if (m['$'] && m['$'].url) thumbnail_url = m['$'].url;
                else if (m.url) thumbnail_url = m.url;
            }
        }
    }

    if (!thumbnail_url && item['media:thumbnail']) {
        if (item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
            thumbnail_url = item['media:thumbnail']['$'].url;
        } else if (item['media:thumbnail'].url) {
            thumbnail_url = item['media:thumbnail'].url;
        }
    }

    // Filter out banned thumbnail URLs (e.g., default Yahoo logo)
    if (thumbnail_url && bannedThumbnails.includes(thumbnail_url)) {
        thumbnail_url = null;
    }

    if ((!description || !thumbnail_url) || source.url.includes('hnrss.org') || source.url === 'https://rss.slashdot.org/Slashdot/slashdot' || source.url === 'https://www.investing.com/rss/news.rss') {
        const metadata = await fetchArticleMetadata(link);
        if (!description) {
            description = metadata.description;
        }
        if (!thumbnail_url) {
            thumbnail_url = metadata.thumbnail_url;
        }
    }

    // Filter out banned thumbnails again (in case they came from metadata fetch)
    if (thumbnail_url && bannedThumbnails.includes(thumbnail_url)) {
        thumbnail_url = null;
    }

    if (thumbnail_url) {
        const isLargeEnough = await isImageLargeEnough(thumbnail_url);
        if (!isLargeEnough) {
            thumbnail_url = null;
        }
    }

    if (!thumbnail_url) {
        return null;
    }

    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    let slug = baseSlug.substring(0, 60);
    if (slug.endsWith('-')) {
        slug = slug.slice(0, -1);
    }
    if (!slug) {
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
            switch (subdomain) {
                case 'it':
                case 'tech':
                case 'hardware':
                case 'developers':
                    topic = 'tech';
                    break;
                case 'science':
                    topic = 'science';
                    break;
                case 'games':
                    topic = 'gaming';
                    break;
                case 'news':
                case 'yro':
                case 'books':
                default:
                    topic = 'news';
                    break;
            }
        } else {
            topic = 'news';
        }
    }

    return {
        slug: slug,
        title: title,
        description: description,
        link: link,
        thumbnail_url: thumbnail_url,
        created_at: new Date().toISOString(),
        topic: topic,
    };
}

async function run() {
    console.log("Starting job...");
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyFile = path.join(OUTPUT_DIR, `${today}.json`);

    // Load existing index (list of links already scraped)
    let index: string[] = [];
    if (fs.existsSync(INDEX_FILE)) {
        try {
            index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
        } catch (e) {
            console.error("Error reading index file, starting fresh.");
        }
    }
    const indexSet = new Set(index);

    // Load existing daily data if any
    let dailyData: any[] = [];
    if (fs.existsSync(dailyFile)) {
        try {
            dailyData = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
        } catch (e) {
            console.error("Error reading daily file, starting fresh.");
        }
    }

    let newItemsCount = 0;

    for (const source of sourcesData) {
        console.log(`Processing source: ${source.name}`);
        try {
            const feed = await parser.parseURL(source.url);
            const items_to_process = feed.items.slice(0, source.max_items || feed.items.length);

            for (const item of items_to_process) {
                try {
                    const processed = await processItem(item, source);
                    if (processed && processed.link) {
                        // Check duplicates
                        if (!indexSet.has(processed.link)) {
                            dailyData.push(processed);
                            indexSet.add(processed.link);
                            newItemsCount++;
                        }
                    }
                } catch (err) {
                    console.error(`Error processing item from ${source.name}:`, err);
                }
            }
        } catch (e) {
            console.error(`Error fetching source ${source.name}:`, e);
        }
    }

    // Save updated data with explicit UTF-8 encoding
    fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2), 'utf-8');
    fs.writeFileSync(INDEX_FILE, JSON.stringify(Array.from(indexSet), null, 2), 'utf-8');

    console.log(`Job finished. Added ${newItemsCount} new items. Saved to ${dailyFile}`);
}

run().catch(console.error);
