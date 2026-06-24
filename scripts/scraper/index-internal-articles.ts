import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// --- Configuration ---
const MAX_URLS_TO_INDEX = 50;
const SCOPES = ['https://www.googleapis.com/auth/indexing'];

// Path to articles.json in the main ReadMore repo
// Assumes scraper-repo is a subdirectory of ReadMore
const ARTICLES_FILE = path.join(__dirname, '../../src/data/internal-articles/articles.json');

async function indexInternalArticles() {
    // 1. Check for API credentials
    const keyString = process.env.GOOGLE_JSON_KEY;
    if (!keyString) {
        console.error("❌ GOOGLE_JSON_KEY environment variable is missing.");
        process.exit(1);
    }

    console.log("Starting Internal Article Indexing Job...");

    if (!fs.existsSync(ARTICLES_FILE)) {
        console.error(`❌ Articles file not found: ${ARTICLES_FILE}`);
        process.exit(1);
    }

    let articles: any[] = [];
    try {
        const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
        articles = data.articles || [];
    } catch (e) {
        console.error("❌ Error reading articles file:", e);
        process.exit(1);
    }

    console.log(`Loaded ${articles.length} internal articles.`);

    // 2. Filter / Select Articles to Index
    // We prioritize articles updated recently, or just index all if count is low.
    // For now, let's take the most recently updated ones.
    const sortedArticles = articles.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    const topArticles = sortedArticles.slice(0, MAX_URLS_TO_INDEX);

    // 3. Authenticate
    console.log("\nAuthenticating with Google...");
    let authClient;
    try {
        const credentials = JSON.parse(keyString);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: SCOPES,
        });
        authClient = await auth.getClient();
    } catch (e) {
        console.error("❌ Authentication failed.", e);
        process.exit(1);
    }

    const indexing = google.indexing({
        version: 'v3',
        auth: authClient as any
    });

    // 4. Submit URLs
    console.log(`\nSubmitting ${topArticles.length} URLs...`);
    let successCount = 0;
    let failCount = 0;

    for (const article of topArticles) {
        // Validation
        if (!article.slug || !article.category || !article.subcategory) {
            console.warn(`⚠️ Skipping invalid article: ${article.title}`);
            continue;
        }

        // Construct URL
        const url = `https://headlined.app/article/${article.category}/${article.subcategory}/${article.slug}`;

        try {
            await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: 'URL_UPDATED'
                }
            });
            console.log(`✅ Indexed: ${url}`);
            successCount++;
            await new Promise(r => setTimeout(r, 200));
        } catch (e: any) {
            if (e.message && (e.message.includes('Permission denied') || e.message.includes('ownership'))) {
                console.log(`⚠️ Skipped (Ownership): ${url}`);
            } else {
                console.error(`❌ Failed: ${url} - ${e.message}`);
                failCount++;
            }
        }
    }

    console.log(`\nIndexing Complete. Success: ${successCount}, Failed: ${failCount}`);
}

indexInternalArticles().catch(console.error);
