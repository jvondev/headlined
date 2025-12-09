import * as fs from 'fs';
import * as path from 'path';
import { Classifier } from './classifier';
import { BucketManager } from './bucket-manager';

// ============================================================================
// MERGE OUTPUTS - Combines batch artifacts and runs classification ONCE
// Used by GitHub Actions after parallel batch jobs complete
// 
// Architecture:
// - Batches only SCRAPE (fast, parallel)
// - This merge step combines + classifies ONCE (single source of truth)
// - Uses same Classifier & BucketManager as local runs
// ============================================================================

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || path.join(__dirname, '../artifacts');
const OUTPUT_DIR = path.join(__dirname, '../output');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');

interface Post {
    slug: string;
    link: string;
    title: string;
    description: string | null;
    fullText: string | null;
    readingTime: number;
    keywords: string[];
    qualityScore: number;
    thumbnail_url: string | null;
    created_at: string;
    topic: string;
}

async function mergeOutputs() {
    const start = Date.now();
    console.log('Starting merge of batch outputs...');

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Load existing index
    let index: string[] = [];
    if (fs.existsSync(INDEX_FILE)) {
        try {
            index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
        } catch {
            console.log('Could not read index, starting fresh.');
        }
    }
    const indexSet = new Set(index);

    // Fingerprint set for deduplication
    const fingerprints = new Set<string>();

    // Today's merged data
    const today = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(OUTPUT_DIR, `${today}.json`);

    let mergedPosts: Post[] = [];

    // Load existing daily data if any (from previous runs today)
    if (fs.existsSync(dailyFile)) {
        try {
            mergedPosts = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
            for (const post of mergedPosts) {
                if (post.fullText) {
                    fingerprints.add(post.fullText.substring(0, 100));
                }
            }
            console.log(`Loaded ${mergedPosts.length} existing posts from today.`);
        } catch {
            console.log('Could not read daily file, starting fresh.');
        }
    }

    // Find all artifact directories
    if (!fs.existsSync(ARTIFACTS_DIR)) {
        console.log('No artifacts directory found.');
        return;
    }

    const batchDirs = fs.readdirSync(ARTIFACTS_DIR)
        .filter(d => d.startsWith('output-'))
        .map(d => path.join(ARTIFACTS_DIR, d));

    console.log(`Found ${batchDirs.length} batch artifacts.`);

    // ========================================
    // STEP 1: Merge all batch JSON files
    // ========================================
    let newPostsCount = 0;

    for (const batchDir of batchDirs) {
        const files = fs.readdirSync(batchDir)
            .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/));

        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(batchDir, file), 'utf-8');
                const posts: Post[] = JSON.parse(content);

                for (const post of posts) {
                    // Skip if already indexed
                    if (indexSet.has(post.link)) continue;

                    // Deduplication by content fingerprint
                    if (post.fullText) {
                        const fingerprint = post.fullText.substring(0, 100);
                        if (fingerprints.has(fingerprint)) continue;
                        fingerprints.add(fingerprint);
                    }

                    mergedPosts.push(post);
                    indexSet.add(post.link);
                    newPostsCount++;
                }
            } catch (e) {
                console.error(`Error reading ${file}:`, e);
            }
        }

        // Merge error logs
        const errorLog = path.join(batchDir, 'error-log.json');
        if (fs.existsSync(errorLog)) {
            const mainErrorLog = path.join(OUTPUT_DIR, 'error-log.json');
            let errors: any[] = [];
            if (fs.existsSync(mainErrorLog)) {
                try { errors = JSON.parse(fs.readFileSync(mainErrorLog, 'utf-8')); } catch { }
            }
            try {
                const batchErrors = JSON.parse(fs.readFileSync(errorLog, 'utf-8'));
                errors.push(...batchErrors);
            } catch { }
            fs.writeFileSync(mainErrorLog, JSON.stringify(errors, null, 2), 'utf-8');
        }
    }

    console.log(`Merged ${newPostsCount} new posts. Total: ${mergedPosts.length}`);

    // Sort by created_at (newest first)
    mergedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Write merged daily file
    fs.writeFileSync(dailyFile, JSON.stringify(mergedPosts, null, 2), 'utf-8');
    fs.writeFileSync(INDEX_FILE, JSON.stringify(Array.from(indexSet), null, 2), 'utf-8');

    // ========================================
    // STEP 2: Run Classification ONCE
    // Uses the SAME Classifier & BucketManager as local runs
    // ========================================
    console.log('Starting Classification & Aggregation...');

    const classifier = new Classifier();
    const bucketManager = new BucketManager(OUTPUT_DIR);
    await bucketManager.init();

    let totalClassified = 0;

    for (const post of mergedPosts) {
        const classifications = classifier.classify(post.title, post.description);
        if (classifications.length > 0) {
            for (const cls of classifications) {
                bucketManager.addPost(post as any, cls);
            }
            totalClassified++;
        }
    }

    // This generates: data/, manifests/, sitemaps/, manifest.json, sitemap-index.xml
    await bucketManager.flush();

    const end = Date.now();
    console.log(`Merge complete in ${((end - start) / 1000).toFixed(2)}s.`);
    console.log(`Total posts: ${mergedPosts.length} | Classified: ${totalClassified}`);
}

mergeOutputs().catch(console.error);
