"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const rss_parser_1 = __importDefault(require("rss-parser"));
const node_html_parser_1 = require("node-html-parser");
const sources_1 = require("./sources");
const article_extractor_1 = require("./article-extractor");
const classifier_1 = require("./classifier");
const bucket_manager_1 = require("./bucket-manager");
// ============================================================================
// DAILY JOB - RSS Scraper with Full Text Extraction and Batching Support
// ============================================================================
const parser = new rss_parser_1.default();
// Directories
const OUTPUT_DIR = path.join(__dirname, '../output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');
const ERROR_LOG_FILE = path.join(OUTPUT_DIR, 'error-log.json');
// --- Configuration ---
// Banned keywords for filtering posts
const bannedKeywords = ['Only Fans', 'porn', 'sex', 'gambling', 'Form 13F', 'Form 13G', 'Form 144', 'deals', 'black friday', 'discount', 'best'];
// Banned thumbnail URLs
const bannedThumbnails = [
    'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png'
];
// Phrases to remove
const phrasesToRemoveFromDescription = [
    '(Source: Bloomberg)',
    'Read more of this story at Slashdot.'
];
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
function isRecentItem(item) {
    // If no pubDate, include it to be safe
    if (!item.pubDate && !item.isoDate)
        return true;
    try {
        const itemDate = new Date(item.pubDate || item.isoDate);
        // Get today and yesterday at midnight (local time)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        // Item is recent if published today or yesterday
        return itemDate >= yesterday;
    }
    catch {
        // If date parsing fails, include the item to be safe
        return true;
    }
}
// --- CLI Arguments ---
function parseArgs() {
    const args = process.argv.slice(2);
    let batch = null;
    let totalBatches = null;
    let test = false;
    for (const arg of args) {
        if (arg.startsWith('--batch=')) {
            batch = parseInt(arg.split('=')[1], 10);
        }
        else if (arg.startsWith('--total-batches=')) {
            totalBatches = parseInt(arg.split('=')[1], 10);
        }
        else if (arg === '--test') {
            test = true;
        }
    }
    return { batch, totalBatches, test };
}
// --- Helper Functions ---
function cleanCdata(text) {
    return text.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}
function stripHtml(html) {
    return (0, node_html_parser_1.parse)(html).textContent || '';
}
function removePhrases(text, phrases) {
    if (!text)
        return null;
    let cleanedText = text;
    for (const phrase of phrases) {
        cleanedText = cleanedText.replace(phrase, '').trim();
    }
    return cleanedText;
}
function truncateDescription(description) {
    if (!description)
        return null;
    const paragraphs = description.split(/\n\s*\n/);
    let effectiveDescription = paragraphs[0] || '';
    const sentences = effectiveDescription.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    if (sentences.length > 5) {
        effectiveDescription = sentences.slice(0, 5).join('').trim();
    }
    else {
        effectiveDescription = sentences.join('').trim();
    }
    if (effectiveDescription.length < description.length && !/[.!?]$/.test(effectiveDescription)) {
        const lastSpaceIndex = effectiveDescription.lastIndexOf(' ');
        if (lastSpaceIndex > -1) {
            effectiveDescription = effectiveDescription.substring(0, lastSpaceIndex) + '...';
        }
        else {
            effectiveDescription = effectiveDescription + '...';
        }
    }
    return effectiveDescription.length > 0 ? effectiveDescription : null;
}
async function isImageLargeEnough(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
        if (!response.ok) {
            if (response.status === 404)
                return false;
            return true;
        }
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            const size = parseInt(contentLength, 10);
            if (size < 15000)
                return false;
        }
        return true;
    }
    catch {
        return true;
    }
}
async function fetchArticleMetadata(url) {
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
        const html = (0, node_html_parser_1.parse)(text);
        let description = null;
        const descriptionSelectors = ['meta[property="og:description"]', 'meta[name="twitter:description"]', 'meta[name="description"]'];
        for (const selector of descriptionSelectors) {
            const node = html.querySelector(selector);
            if (node && node.getAttribute('content')) {
                description = stripHtml(node.getAttribute('content')) || null;
                description = removePhrases(description, phrasesToRemoveFromDescription);
                description = truncateDescription(description);
                break;
            }
        }
        let thumbnail_url = null;
        const thumbnailSelectors = ['meta[property="og:image"]', 'meta[name="twitter:image"]'];
        for (const selector of thumbnailSelectors) {
            const node = html.querySelector(selector);
            if (node && node.getAttribute('content')) {
                thumbnail_url = node.getAttribute('content');
                break;
            }
        }
        return { description, thumbnail_url, html: text };
    }
    catch {
        return { description: null, thumbnail_url: null, html: null };
    }
}
let errorLog = [];
function logError(source, url, error) {
    errorLog.push({
        source,
        url,
        error,
        timestamp: new Date().toISOString()
    });
}
function saveErrorLog() {
    if (errorLog.length === 0)
        return;
    let existingErrors = [];
    if (fs.existsSync(ERROR_LOG_FILE)) {
        try {
            existingErrors = JSON.parse(fs.readFileSync(ERROR_LOG_FILE, 'utf-8'));
        }
        catch { }
    }
    // Keep only last 100 errors
    const combined = [...existingErrors, ...errorLog].slice(-100);
    fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify(combined, null, 2), 'utf-8');
}
// --- Main Processing ---
async function processItem(item, source) {
    let title = item.title ? stripHtml(cleanCdata(item.title)) : null;
    title = removePhrases(title, phrasesToRemoveFromTitle);
    let link = item.link;
    let description = null;
    if (source.url.includes('hnrss.org')) {
        if (item.content) {
            const contentHtml = (0, node_html_parser_1.parse)(item.content);
            const articleLinkNode = contentHtml.querySelector('p a');
            if (articleLinkNode && articleLinkNode.text.startsWith('Article URL:')) {
                link = articleLinkNode.getAttribute('href');
            }
        }
        description = null;
    }
    else if (item.contentSnippet) {
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
    let thumbnail_url = item.enclosure ? item.enclosure.url : null;
    if (item['media:content']) {
        if (Array.isArray(item['media:content'])) {
            const sorted = item['media:content'].sort((a, b) => {
                const wA = a['$'] && a['$'].width ? parseInt(a['$'].width, 10) : 0;
                const wB = b['$'] && b['$'].width ? parseInt(b['$'].width, 10) : 0;
                return wB - wA;
            });
            const best = sorted[0];
            if (best) {
                const width = best['$'] && best['$'].width ? parseInt(best['$'].width, 10) : 0;
                if (width === 0 || width >= 300) {
                    if (best['$'] && best['$'].url)
                        thumbnail_url = best['$'].url;
                    else if (best.url)
                        thumbnail_url = best.url;
                }
            }
        }
        else {
            const m = item['media:content'];
            const width = m['$'] && m['$'].width ? parseInt(m['$'].width, 10) : (m.width ? parseInt(m.width, 10) : 0);
            if (width === 0 || width >= 300) {
                if (m['$'] && m['$'].url)
                    thumbnail_url = m['$'].url;
                else if (m.url)
                    thumbnail_url = m.url;
            }
        }
    }
    if (!thumbnail_url && item['media:thumbnail']) {
        if (item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
            thumbnail_url = item['media:thumbnail']['$'].url;
        }
        else if (item['media:thumbnail'].url) {
            thumbnail_url = item['media:thumbnail'].url;
        }
    }
    if (thumbnail_url && bannedThumbnails.includes(thumbnail_url)) {
        thumbnail_url = null;
    }
    // Fetch article for metadata and full text
    let articleHtml = null;
    let extracted = { fullText: null, readingTime: 0, keywords: [], qualityScore: 0 };
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
    }
    catch (e) {
        logError(source.name, link, e.message || 'Fetch failed');
    }
    // Extract full text from fetched HTML
    if (articleHtml) {
        extracted = (0, article_extractor_1.extractArticle)(articleHtml, link);
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
    let topic = source.topic || 'news';
    if (source.name === "Yahoo News" && link) {
        if (link.includes("finance.yahoo.com"))
            topic = "finance";
        else if (link.includes("autos.yahoo.com"))
            topic = "auto";
        else if (link.includes("tech.yahoo.com"))
            topic = "tech";
        else if (link.includes("health.yahoo.com"))
            topic = "health";
    }
    else if (source.url === 'https://rss.slashdot.org/Slashdot/slashdot' && link) {
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
                default:
                    topic = 'news';
                    break;
            }
        }
    }
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
async function processInParallel(items, processor, concurrency) {
    const results = [];
    const executing = [];
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
async function processBatch(items, processor, batchSize = MAX_CONCURRENT_FETCHES) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(batch.map(item => processor(item)));
        for (const result of batchResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            }
            else {
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
    let index = [];
    if (fs.existsSync(INDEX_FILE)) {
        try {
            index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
        }
        catch {
            console.error("Error reading index file, starting fresh.");
        }
    }
    const indexSet = new Set(index);
    // Fingerprint set for deduplication
    const fingerprints = new Set();
    // Load existing daily data
    let dailyData = [];
    if (fs.existsSync(dailyFile)) {
        try {
            dailyData = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
            // Build fingerprints from existing data
            for (const post of dailyData) {
                if (post.fullText) {
                    fingerprints.add(post.fullText.substring(0, 100));
                }
            }
        }
        catch {
            console.error("Error reading daily file, starting fresh.");
        }
    }
    // Determine active sources based on batch/test mode
    let activeSources = [...sources_1.sourcesData];
    // Test mode flag for limiting items
    let testModeLimit = null;
    if (test) {
        console.log("⚠️ RUNNING IN TEST MODE: Limiting to 1 source and 10 items.");
        activeSources = sources_1.sourcesData.slice(0, 1);
        testModeLimit = 10;
    }
    else if (batch !== null && totalBatches !== null) {
        // Split sources into batches
        const sourcesPerBatch = Math.ceil(sources_1.sourcesData.length / totalBatches);
        const startIdx = batch * sourcesPerBatch;
        const endIdx = Math.min(startIdx + sourcesPerBatch, sources_1.sourcesData.length);
        activeSources = sources_1.sourcesData.slice(startIdx, endIdx);
        console.log(`Processing sources ${startIdx + 1} to ${endIdx} of ${sources_1.sourcesData.length}`);
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
            const results = await processBatch(newItems, (item) => processItem(item, source), MAX_CONCURRENT_FETCHES);
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
        }
        catch (e) {
            console.error(`Error fetching source ${source.name}:`, e.message);
            logError(source.name, source.url, e.message || 'Feed fetch failed');
        }
    }
    // Save daily data
    fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2), 'utf-8');
    fs.writeFileSync(INDEX_FILE, JSON.stringify(Array.from(indexSet), null, 2), 'utf-8');
    saveErrorLog();
    console.log(`Scrape finished. Added ${newItemsCount} items.`);
    // Classification (incremental - only process new posts)
    console.log("Starting Aggregation & Classification...");
    const classifier = new classifier_1.Classifier();
    const bucketManager = new bucket_manager_1.BucketManager(OUTPUT_DIR);
    await bucketManager.init();
    // Only process today's file for incremental classification
    // Full retroactive classification can be done separately if needed
    let totalClassified = 0;
    for (const post of dailyData) {
        // Skip if already classified (check if it exists in any bucket)
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
}
run().catch(console.error);
