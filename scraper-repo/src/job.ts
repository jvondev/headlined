import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';
import { parse } from 'node-html-parser';
import { sourcesData, resolveTopicFromUrl } from './sources';
import { extractArticle, fetchAndExtract, ExtractedArticle } from './article-extractor';
import { Classifier } from './classifier';
import { BucketManager } from './bucket-manager';

// ============================================================================
// DAILY JOB - RSS Scraper with Full Text Extraction and Batching Support
// ============================================================================

const parser = new Parser();

// Directories
const OUTPUT_DIR = path.join(__dirname, '../output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');
const ERROR_LOG_FILE = path.join(OUTPUT_DIR, 'error-log.json');

// --- Configuration ---

// Banned keywords for filtering posts (exact match, case-insensitive)
const bannedKeywords = [
    // Adult/Inappropriate content
    'Only Fans', 'onlyfans', 'porn', 'pornography', 'xxx', 'sex tape', 'nsfw',
    'gambling', 'casino', 'slot machine', 'sports betting',

    // Financial filings (noise for general news)
    'Form 13F', 'Form 13G', 'Form 144', 'SEC filing',

    // Shopping events & promotions
    'black friday', 'cyber monday', 'prime day', 'prime week', 'amazon prime day',
    'singles day', 'boxing day', 'memorial day sale', 'labor day sale',
    'holiday sale', 'holiday deals', 'christmas sale', 'christmas deals',
    'end of year sale', 'year end sale', 'clearance sale', 'flash sale',
    'doorbuster', 'door buster', 'limited time offer', 'limited time deal',

    // Deal/Discount terminology
    'best deals', 'top deals', 'deals today', 'daily deals', 'hot deals',
    'deal of the day', 'deal alert', 'price drop', 'price cut',
    'discount code', 'coupon code', 'promo code', 'voucher code',
    'save money', 'save big', 'huge savings', 'massive discount',
    'lowest price', 'best price', 'price match', 'unbeatable price',
    'budget pick', 'budget friendly', 'affordable pick',

    // Product recommendation listicles (affiliate content)
    'best of 2024', 'best of 2025', 'top picks', 'our picks',
    'editors choice', 'staff picks', 'we tested', 'we reviewed',
    'buying guide', 'gift guide', 'holiday gift', 'gift ideas',

    // Shopping action words
    'buy now', 'shop now', 'order now', 'get it now', 'grab it now',
    'add to cart', 'checkout', 'free shipping', 'fast shipping',
    'in stock', 'back in stock', 'selling fast', 'selling out',
    'hurry', 'act fast', 'dont miss', 'last chance', 'final hours',

    // Affiliate/Sponsored markers
    'affiliate link', 'sponsored post', 'paid partnership',
    'we earn commission', 'we may earn', 'as an amazon associate',
];

// Regex patterns for promotional content detection (more flexible matching)
const bannedPatterns: RegExp[] = [
    // Percentage discounts: "50% off", "up to 70% off", "save 30%"
    /\b\d{1,2}%\s*(off|discount|savings?)\b/i,
    /\bsave\s+\d{1,2}%/i,
    /\bup\s+to\s+\d{1,2}%\s*off\b/i,

    // Dollar amounts: "save $100", "$50 off", "under $20"
    /\bsave\s+\$\d+/i,
    /\$\d+\s*off\b/i,
    /\bunder\s+\$\d+/i,
    /\bjust\s+\$\d+/i,
    /\bonly\s+\$\d+/i,
    /\bfrom\s+\$\d+/i,
    /\bstarting\s+at\s+\$\d+/i,

    // Price comparisons: "was $100, now $50"
    /\bwas\s+\$\d+[,\s]+now\s+\$\d+/i,
    /\bregularly?\s+\$\d+/i,
    /\bnormally\s+\$\d+/i,

    // "X best" listicle patterns
    /\b\d+\s+best\s+(deals?|products?|items?|gifts?|picks?|things?|ways?)\b/i,
    /\bbest\s+\d+\b/i,

    // Time-limited offers
    /\b(today|tonight|this\s+week)\s+only\b/i,
    /\bends?\s+(soon|today|tonight|tomorrow)\b/i,
    /\b(hours?|days?|minutes?)\s+left\b/i,
    /\b(limited\s+)?stock\s+(remaining|left|available)\b/i,

    // Generic promotional language
    /\b(grab|snag|score|get)\s+(this|these|the)\s+deal/i,
    /\bdeal\s+of\s+the\s+(day|week|month|year)\b/i,
    /\b(massive|huge|incredible|amazing|insane)\s+(deal|discount|savings?|sale)\b/i,
    /\b(don't|do\s+not)\s+miss\s+(this|these|out)\b/i,
];

/**
 * Check if content matches promotional/deal patterns
 */
function isPromotionalContent(text: string): boolean {
    const lowerText = text.toLowerCase();

    // Check exact keyword matches
    if (bannedKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
        return true;
    }

    // Check regex patterns
    if (bannedPatterns.some(pattern => pattern.test(text))) {
        return true;
    }

    return false;
}

// Banned thumbnail URLs
const bannedThumbnails = [
    'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png'
];

// Phrases to remove from description
const phrasesToRemoveFromDescription = [
    '(Source: Bloomberg)',
    'Read more of this story at Slashdot.'
];

// Byline patterns to remove from description (regex)
const descriptionBylinePatterns = [
    // "By Author Name CITY, Date (Source) -"
    /^By\s+[A-Z][a-z]+\s+[A-Z][a-z]+(\s+and\s+[A-Z][a-z]+\s+[A-Z][a-z]+)?\s+[A-Z]{2,}.*?\(Reuters\)\s*-?\s*/i,
    /^By\s+[A-Z][a-z]+\s+[A-Z][a-z]+(\s+and\s+[A-Z][a-z]+\s+[A-Z][a-z]+)?\s+[A-Z]{2,}.*?\(AP\)\s*-?\s*/i,
    /^By\s+[A-Z][a-z]+\s+[A-Z][a-z]+(\s+and\s+[A-Z][a-z]+\s+[A-Z][a-z]+)?\s+[A-Z]{2,}.*?\(AFP\)\s*-?\s*/i,
    /^By\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*/i,

    // "CITY, Month Day (Source) -" or "CITY (Source) -"
    /^[A-Z]{2,}[A-Z\s,]+\(Reuters\)\s*-?\s*/i,
    /^[A-Z]{2,}[A-Z\s,]+\(AP\)\s*-?\s*/i,
    /^[A-Z]{2,}[A-Z\s,]+\(AFP\)\s*-?\s*/i,
    /^[A-Z]{3,},?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\([^)]+\)\s*-?\s*/i,

    // "Dec 8 (Reuters) -"
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+\([^)]+\)\s*-?\s*/i,
];

/**
 * Clean bylines from description text
 */
function cleanDescriptionBylines(text: string | null): string | null {
    if (!text) return null;
    let cleaned = text;
    for (const pattern of descriptionBylinePatterns) {
        cleaned = cleaned.replace(pattern, '');
    }
    return cleaned.trim();
}

const phrasesToRemoveFromTitle = [
    'Tell HN:',
    'Show HN:'
];

// Concurrency limit for parallel fetches
const MAX_CONCURRENT_FETCHES = 5;

// Safety limit to prevent processing too many items from a single source
const MAX_ITEMS_PER_SOURCE = 100;

// --- Date Filtering ---

/**
 * Check if an RSS item was published today or yesterday.
 * This ensures we get fresh content and re-check yesterday for any missed items.
 */
function isRecentItem(item: any): boolean {
    // If no pubDate, include it to be safe
    if (!item.pubDate && !item.isoDate) return true;

    try {
        const itemDate = new Date(item.pubDate || item.isoDate);

        // Get today and yesterday at midnight (local time)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Item is recent if published today or yesterday
        return itemDate >= yesterday;
    } catch {
        // If date parsing fails, include the item to be safe
        return true;
    }
}

// --- CLI Arguments ---
function parseArgs(): { batch: number | null; totalBatches: number | null; test: boolean } {
    const args = process.argv.slice(2);
    let batch: number | null = null;
    let totalBatches: number | null = null;
    let test = false;

    for (const arg of args) {
        if (arg.startsWith('--batch=')) {
            batch = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--total-batches=')) {
            totalBatches = parseInt(arg.split('=')[1], 10);
        } else if (arg === '--test') {
            test = true;
        }
    }

    return { batch, totalBatches, test };
}

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
            if (size < 15000) return false;
        }
        return true;
    } catch {
        return true;
    }
}

async function fetchArticleMetadata(url: string): Promise<{
    description: string | null;
    thumbnail_url: string | null;
    html: string | null;
}> {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(15000),
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
            }
        });
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
                description = cleanDescriptionBylines(description);
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

        return { description, thumbnail_url, html: text };
    } catch {
        return { description: null, thumbnail_url: null, html: null };
    }
}

// --- Error Logging ---
interface ErrorLogEntry {
    source: string;
    url: string;
    error: string;
    timestamp: string;
}

let errorLog: ErrorLogEntry[] = [];

function logError(source: string, url: string, error: string): void {
    errorLog.push({
        source,
        url,
        error,
        timestamp: new Date().toISOString()
    });
}

function saveErrorLog(): void {
    if (errorLog.length === 0) return;

    let existingErrors: ErrorLogEntry[] = [];
    if (fs.existsSync(ERROR_LOG_FILE)) {
        try {
            existingErrors = JSON.parse(fs.readFileSync(ERROR_LOG_FILE, 'utf-8'));
        } catch { }
    }

    // Keep only last 100 errors
    const combined = [...existingErrors, ...errorLog].slice(-100);
    fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify(combined, null, 2), 'utf-8');
}

// --- Output Schema ---
interface Post {
    slug: string;
    title: string;
    description: string | null;
    fullText: string | null;
    readingTime: number;
    keywords: string[];
    qualityScore: number;
    link: string;
    thumbnail_url: string | null;
    created_at: string;
    topic: string;
}

// --- Main Processing ---

async function processItem(item: any, source: any): Promise<Post | null> {
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
        description = cleanDescriptionBylines(description);
        description = truncateDescription(description);
    }

    if (!description && item['content:encoded']) {
        description = stripHtml(cleanCdata(item['content:encoded'])) || null;
        description = removePhrases(description, phrasesToRemoveFromDescription);
        description = cleanDescriptionBylines(description);
        description = truncateDescription(description);
    }

    if (source.url === 'https://rss.slashdot.org/Slashdot/slashdot' && item.description) {
        description = stripHtml(cleanCdata(item.description)) || null;
        description = removePhrases(description, phrasesToRemoveFromDescription);
        description = cleanDescriptionBylines(description);
        description = truncateDescription(description);
    }

    if (!title || !link) {
        return null;
    }

    // Check for promotional/deal content using enhanced filter
    const textToFilter = `${title} ${item.contentSnippet ? stripHtml(item.contentSnippet) : ''} ${item.description ? stripHtml(item.description) : ''}`;
    if (isPromotionalContent(textToFilter)) {
        return null;
    }

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

    if (thumbnail_url && bannedThumbnails.includes(thumbnail_url)) {
        thumbnail_url = null;
    }

    // Fetch article for metadata and full text
    let articleHtml: string | null = null;
    let extracted: ExtractedArticle = { fullText: null, readingTime: 0, keywords: [], qualityScore: 0 };

    const needsMetadataFetch = (!description || !thumbnail_url) ||
        source.url.includes('hnrss.org') ||
        source.url === 'https://rss.slashdot.org/Slashdot/slashdot' ||
        source.url === 'https://www.investing.com/rss/news.rss';

    try {
        const metadata = await fetchArticleMetadata(link);
        articleHtml = metadata.html;

        if (!description) {
            description = metadata.description;
        }
        if (!thumbnail_url) {
            thumbnail_url = metadata.thumbnail_url;
        }
    } catch (e: any) {
        logError(source.name, link, e.message || 'Fetch failed');
    }

    // Extract full text from fetched HTML
    if (articleHtml) {
        extracted = extractArticle(articleHtml, link);

        // Double-check extracted full text for promotional content
        // This catches things like the "Bonnie Blue" article where title/desc might pass but content is inappropriate
        if (extracted.fullText && isPromotionalContent(extracted.fullText)) {
            console.log(`[Filter] Blocked by content check: ${title}`);
            return null;
        }
    }

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

    // Use centralized topic resolver
    const topic = resolveTopicFromUrl(link, source.name, source.topic || 'news');

    return {
        slug,
        title,
        description,
        fullText: extracted.fullText,
        readingTime: extracted.readingTime,
        keywords: extracted.keywords,
        qualityScore: extracted.qualityScore,
        link,
        thumbnail_url,
        created_at: new Date().toISOString(),
        topic,
    };
}

// --- Parallel Processing with Concurrency Limit ---

async function processInParallel<T, R>(
    items: T[],
    processor: (item: T) => Promise<R | null>,
    concurrency: number
): Promise<(R | null)[]> {
    const results: (R | null)[] = [];
    const executing: Promise<void>[] = [];

    for (const item of items) {
        const promise = processor(item).then(result => {
            results.push(result);
        }).catch(() => {
            results.push(null);
        });

        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
            // Remove completed promises
            const completed = executing.filter(p => {
                let resolved = false;
                p.then(() => { resolved = true; }).catch(() => { resolved = true; });
                return !resolved;
            });
            executing.length = 0;
            executing.push(...completed);
        }
    }

    await Promise.all(executing);
    return results;
}

// Simpler batch parallel processing
async function processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R | null>,
    batchSize: number = MAX_CONCURRENT_FETCHES
): Promise<(R | null)[]> {
    const results: (R | null)[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
            batch.map(item => processor(item))
        );

        for (const result of batchResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push(null);
            }
        }
    }

    return results;
}

// --- Main Logic ---

async function run() {
    const { batch, totalBatches, test } = parseArgs();

    console.log("Starting job...");
    if (batch !== null && totalBatches !== null) {
        console.log(`Running batch ${batch + 1} of ${totalBatches}`);
    }

    const start = Date.now();

    const today = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(OUTPUT_DIR, `${today}.json`);

    // Load existing index (smart caching - skip already scraped)
    let index: string[] = [];
    if (fs.existsSync(INDEX_FILE)) {
        try {
            index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
        } catch {
            console.error("Error reading index file, starting fresh.");
        }
    }
    const indexSet = new Set(index);

    // Fingerprint set for deduplication
    const fingerprints = new Set<string>();

    // Load existing daily data
    let dailyData: Post[] = [];
    if (fs.existsSync(dailyFile)) {
        try {
            dailyData = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
            // Build fingerprints from existing data
            for (const post of dailyData) {
                if (post.fullText) {
                    fingerprints.add(post.fullText.substring(0, 100));
                }
            }
        } catch {
            console.error("Error reading daily file, starting fresh.");
        }
    }

    // Determine active sources based on batch/test mode
    let activeSources = [...sourcesData];

    // Test mode flag for limiting items
    let testModeLimit: number | null = null;

    if (test) {
        console.log("⚠️ RUNNING IN TEST MODE: Limiting to 1 source and 10 items.");
        activeSources = sourcesData.slice(0, 1);
        testModeLimit = 10;
    } else if (batch !== null && totalBatches !== null) {
        // Auto-scaling: Calculate how many batches are actually needed
        // Target: ~5 sources per batch, minimum 1 batch, max 8 batches
        const targetSourcesPerBatch = 5;
        const neededBatches = Math.min(
            totalBatches,
            Math.max(1, Math.ceil(sourcesData.length / targetSourcesPerBatch))
        );

        // Skip this batch if not needed
        if (batch >= neededBatches) {
            console.log(`⏭️ Batch ${batch + 1} not needed (only ${neededBatches} batches required for ${sourcesData.length} sources). Skipping.`);
            return;
        }

        // Split sources into batches
        const sourcesPerBatch = Math.ceil(sourcesData.length / neededBatches);
        const startIdx = batch * sourcesPerBatch;
        const endIdx = Math.min(startIdx + sourcesPerBatch, sourcesData.length);
        activeSources = sourcesData.slice(startIdx, endIdx);
        console.log(`🔄 Batch ${batch + 1}/${neededBatches} | Processing sources ${startIdx + 1}-${endIdx} of ${sourcesData.length}`);
    }

    let newItemsCount = 0;

    for (const source of activeSources) {
        console.log(`Processing source: ${source.name}`);
        try {
            const feed = await parser.parseURL(source.url);

            // Dynamic date filtering: get only today and yesterday's items
            // Then apply safety limit to prevent processing too many
            const limit = testModeLimit || MAX_ITEMS_PER_SOURCE;
            const recentItems = feed.items
                .filter(isRecentItem)
                .slice(0, limit);

            const skippedOldItems = feed.items.length - recentItems.length -
                (feed.items.length > limit ? feed.items.length - limit : 0);

            // Filter out already indexed items BEFORE expensive fetches (smart caching)
            const newItems = recentItems.filter(item => {
                const link = item.link;
                return link && !indexSet.has(link);
            });

            const cachedCount = recentItems.length - newItems.length;
            console.log(`  ${newItems.length} new | ${cachedCount} cached | ${skippedOldItems} old (filtered)`);

            // Process in parallel batches
            const results = await processBatch(
                newItems,
                (item) => processItem(item, source),
                MAX_CONCURRENT_FETCHES
            );

            for (const processed of results) {
                if (processed && processed.link) {
                    // Deduplication by content fingerprint
                    if (processed.fullText) {
                        const fingerprint = processed.fullText.substring(0, 100);
                        if (fingerprints.has(fingerprint)) {
                            console.log(`  Skipped duplicate: ${processed.title.substring(0, 40)}...`);
                            continue;
                        }
                        fingerprints.add(fingerprint);
                    }

                    dailyData.push(processed);
                    indexSet.add(processed.link);
                    newItemsCount++;
                }
            }
        } catch (e: any) {
            console.error(`Error fetching source ${source.name}:`, e.message);
            logError(source.name, source.url, e.message || 'Feed fetch failed');
        }
    }

    // Save daily data
    fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2), 'utf-8');
    fs.writeFileSync(INDEX_FILE, JSON.stringify(Array.from(indexSet), null, 2), 'utf-8');
    saveErrorLog();

    console.log(`Scrape finished. Added ${newItemsCount} items.`);

    // Classification: Only run in LOCAL mode (not batch mode)
    // In GitHub Actions, classification runs ONCE in merge-outputs.ts
    // This ensures single source of truth and faster parallel execution
    if (batch === null) {
        console.log("Starting Aggregation & Classification...");

        const classifier = new Classifier();
        const bucketManager = new BucketManager(OUTPUT_DIR);
        await bucketManager.init();

        let totalClassified = 0;

        for (const post of dailyData) {
            const classifications = classifier.classify(post.title, post.description);
            if (classifications.length > 0) {
                for (const cls of classifications) {
                    bucketManager.addPost(post, cls);
                }
                totalClassified++;
            }
        }

        await bucketManager.flush();

        const end = Date.now();
        console.log(`Job Complete in ${((end - start) / 1000).toFixed(2)}s. Classified ${totalClassified} posts.`);
    } else {
        const end = Date.now();
        console.log(`Batch ${batch} complete in ${((end - start) / 1000).toFixed(2)}s. Classification will run in merge step.`);
    }
}

run().catch(console.error);
