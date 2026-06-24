import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { Classifier } from './classifier';

// --- Configuration ---
const MAX_URLS_TO_INDEX = 45; // Safe limit (quota is 200)
const OUTPUT_DIR = path.join(__dirname, '../output');
const SCOPES = ['https://www.googleapis.com/auth/indexing'];

// High-value CPM topics that generally monetize well
const HIGH_VALUE_TOPICS = [
    'business', 'finance', 'technology', 'markets', 'crypto',
    'ai', 'health', 'science', 'real estate', 'insurance'
];

interface Post {
    slug: string;
    title: string;
    description: string | null;
    fullText: string | null;
    readingTime: number;
    keywords: string[];
    qualityScore: number; // 0.0 to 1.0 from scraper
    link: string;
    thumbnail_url: string | null;
    created_at: string;
    topic: string;
}

interface ScoredPost extends Post {
    indexScore: number;
}

/**
 * Calculate "Rank Potential" based on Content Quality and Value
 * Focuses on substance, completeness, and topic value rather than keywords.
 */
function calculateIndexScore(post: Post): number {
    let score = 0;

    // 1. Base Content Quality (Most Important)
    // The scraper's qualityScore checks for good formatting, sentence structure, etc.
    // Scale: 0-10 -> 0-40 points (Heavy weight on actual content quality)
    score += (post.qualityScore || 0) * 40;

    // 2. Content Substance (Word Count)
    // Google prefers "comprehensive" coverage even for news.
    // Penalize "thin content" (< 300 words).
    const wordCount = post.fullText ? post.fullText.split(/\s+/).length : 0;

    if (wordCount > 1000) {
        score += 15; // Comprehensive / Deep Dive
    } else if (wordCount > 600) {
        score += 10; // Standard robust news
    } else if (wordCount > 300) {
        score += 5;  // Acceptable minimum
    } else {
        score -= 20; // Penalty for thin content (likely to be ignored by Google)
    }

    // 3. Topic Value (CPM Potential)
    // Prioritize topics that traditionally have higher ad value or user interest.
    const topic = (post.topic || '').toLowerCase();
    if (HIGH_VALUE_TOPICS.some(t => topic.includes(t))) {
        score += 10;
    }

    // 4. Content Completeness (Visuals)
    // Articles with valid thumbnails perform significantly better in Google Discover/News.
    if (post.thumbnail_url) {
        score += 10;
    } else {
        score -= 10;
    }

    // 5. Information Density
    // Small bonus for articles that likely contain data/facts (numbers in title).
    // This is a subtle signal for "news value" vs "opinion".
    if (post.title && /\d/.test(post.title)) {
        score += 5;
    }

    return score;
}

/**
 * Check if the URL was recently indexed (simple local cache to avoid dupes in same run)
 * Note: Real duplicate prevention relies on the fact we only process "today's" file
 */
async function indexPages() {
    // 1. Check for API credentials
    const keyString = process.env.GOOGLE_JSON_KEY;
    if (!keyString) {
        console.error("❌ GOOGLE_JSON_KEY environment variable is missing.");
        process.exit(1);
    }

    // Parse arguments
    const isDryRun = process.argv.includes('--dry-run');

    console.log(`Starting Google Indexing Job... (Dry Run: ${isDryRun})`);

    // 2. Load today's data file
    const today = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(OUTPUT_DIR, `${today}.json`);

    if (!fs.existsSync(dailyFile)) {
        console.error(`❌ No data file found for today: ${dailyFile}`);
        process.exit(0); // Not an error, just nothing to do
    }

    let posts: Post[] = [];
    try {
        posts = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
    } catch (e) {
        console.error("❌ Error reading daily file:", e);
        process.exit(1);
    }

    console.log(`Loaded ${posts.length} posts from ${today}.json`);

    // 3. Filter and Score
    const scoredPosts: ScoredPost[] = posts
        .filter(p => p.link && p.fullText) // Must have clear link and content
        .map(p => ({
            ...p,
            indexScore: calculateIndexScore(p)
        }));

    // Sort by Score DESC
    scoredPosts.sort((a, b) => b.indexScore - a.indexScore);

    // 4. Select Top N
    const topPosts = scoredPosts.slice(0, MAX_URLS_TO_INDEX);

    if (topPosts.length === 0) {
        console.log("No valid posts found to index.");
        return;
    }

    console.log(`\nSelected Top ${topPosts.length} Articles for Indexing:`);

    // Initialize Classifier
    const classifier = new Classifier();

    topPosts.forEach((p, i) => {
        console.log(`${i + 1}. [${p.indexScore.toFixed(1)}] ${p.title} (${p.topic})`);
    });

    if (isDryRun) {
        console.log("\n⚠️ Dry Run Mode: Skipping actual API calls.");
        return;
    }

    // 5. Authenticate with Google
    console.log("\nAuthenticating with Google...");

    // Write key to temporary file because GoogleAuth expects a file path or environment strat
    // We'll use credentials object directly if possible, but 'googleapis' often behaves better with auth client
    let authClient;
    try {
        const credentials = JSON.parse(keyString);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: SCOPES,
        });
        authClient = await auth.getClient();
    } catch (e) {
        console.error("❌ Authentication failed. Check your JSON key format.", e);
        process.exit(1);
    }

    // Fix: Explicitly cast or pass auth in a way compatible with the overloaded type
    // Using 'any' cast for authClient is a safe workaround when types mismatch slightly between versions
    const indexing = google.indexing({
        version: 'v3',
        auth: authClient as any
    });

    // 6. Submit URLs
    console.log("\nSubmitting URLs...");
    let successCount = 0;
    let failCount = 0;

    for (const post of topPosts) {
        // Construct the correct internal URL
        // 1. Classify to get correct category/subcategory
        const classifications = classifier.classify(post.title, post.description);

        let category = 'news'; // Default category
        // Avoid 'general' and try to use topic as subcategory if classifier misses
        let subcategory = post.topic ? post.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'updates';

        if (classifications.length > 0) {
            category = classifications[0].category;
            subcategory = classifications[0].slug;
        } else {
            // Fallback: simple topic map if classifier fails
            const t = (post.topic || '').toLowerCase();
            if (t.includes('finance') || t.includes('business') || t.includes('market')) category = 'finance';
            else if (t.includes('tech') || t.includes('science') || t.includes('ai')) category = 'tech';
            else if (t.includes('sport')) category = 'sports';
            else category = 'news';
        }

        // 2. Format Date: YYYY/MM/DD
        const dateObj = new Date(post.created_at || new Date().toISOString());
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');

        // Format: https://headlined.app/news/[category]/[subcategory]/[yyyy]/[mm]/[dd]/[slug]
        const internalUrl = `https://headlined.app/news/${category}/${subcategory}/${yyyy}/${mm}/${dd}/${post.slug}`;

        try {
            // Google Indexing API - URL_UPDATED
            await indexing.urlNotifications.publish({
                requestBody: {
                    url: internalUrl,
                    type: 'URL_UPDATED'
                }
            });
            console.log(`✅ Indexed: ${internalUrl}`);
            successCount++;

            // Tiny delay to be nice to the API
            await new Promise(r => setTimeout(r, 200));

        } catch (e: any) {
            // Handle expected permissions/ownership errors gracefully as skips
            if (e.message && (e.message.includes('Permission denied') || e.message.includes('ownership'))) {
                console.log(`⚠️ Skipped (Ownership): ${internalUrl}`);
            } else {
                console.error(`❌ Failed: ${internalUrl} - ${e.message}`);
                failCount++;
            }
        }
    }

    console.log(`\nIndexing Complete. Success: ${successCount}, Failed: ${failCount}`);
}

indexPages().catch(console.error);
