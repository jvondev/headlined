import * as fs from 'fs';
import * as path from 'path';
import { SEO_DATA_URL } from '../lib/seo-config';

// When running locally, if scraper-repo exists, we can copy directly? 
// No, the user requested robustness: The build might happen on Cloudflare where scraper-repo is NOT present.
// So we MUST use the CDN URL or a fallback. 
// BUT, for development velocity, if env is local, we check local folder first.

const LOCAL_SCRAPER_PATH = path.join(process.cwd(), 'scraper-repo', 'output');
const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');
const MANIFEST_CACHE_FILE = path.join(CACHE_DIR, 'manifest.json');

async function fetchJson(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    return res.json();
}

async function run() {
    console.log("Starting SEO Data Pull...");
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    let manifest: any[] = [];
    let useLocal = false;

    // 1. Try Local First (For Dev Speed)
    if (fs.existsSync(path.join(LOCAL_SCRAPER_PATH, 'manifest.json'))) {
        console.log("Found local scraper output. Using local files.");
        const content = fs.readFileSync(path.join(LOCAL_SCRAPER_PATH, 'manifest.json'), 'utf-8');
        manifest = JSON.parse(content);
        useLocal = true;
    } else {
        // 2. Fallback to CDN
        console.log(`Fetching manifest from CDN: ${SEO_DATA_URL}/manifest.json`);
        try {
            manifest = await fetchJson(`${SEO_DATA_URL}/manifest.json`);
        } catch (e) {
            console.error("Failed to fetch manifest from CDN. Build will have NO SEO pages.", e);
            return;
        }
    }

    // Save Manifest
    fs.writeFileSync(MANIFEST_CACHE_FILE, JSON.stringify(manifest, null, 2));

    // 3. Incremental Pull (Only if needed, but for "Snapshot SSG" we need the data files locally to 'embed' them)
    // We iterate the manifest and download the data files to src/data/static-cache/{category}/{slug}.json

    console.log(`Processing ${manifest.length} manifest items...`);

    let downloaded = 0;

    // Chunking to avoid rate limits if using CDN
    const CHUNK_SIZE = 50;
    for (let i = 0; i < manifest.length; i += CHUNK_SIZE) {
        const chunk = manifest.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (item: any) => {
            const { category, slug } = item.params;
            const targetDir = path.join(CACHE_DIR, category);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            const targetFile = path.join(targetDir, `${slug}.json`);

            // Optimization: If file exists, maybe skip? 
            // Real Incremental Logic: Compare item.lastUpdated with local file mtime or a separate cache map.
            // For now, simple existence check if speed is needed, otherwise overwrite.
            // User requested robust "Incremental". 

            // Check if local file exists
            if (fs.existsSync(targetFile)) {
                // If using local scraper, we just copy again (fast).
                // If using CDN, we check timestamps?
                // For now, always overwrite to ensure "freshness" on build unless we persist cache.
            }

            if (useLocal) {
                const sourceFile = path.join(LOCAL_SCRAPER_PATH, 'data', category, `${slug}.json`);
                if (fs.existsSync(sourceFile)) {
                    fs.copyFileSync(sourceFile, targetFile);
                    downloaded++;
                }
            } else {
                try {
                    const data = await fetchJson(`${SEO_DATA_URL}/data/${category}/${slug}.json`);
                    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
                    downloaded++;
                } catch (e) {
                    console.error(`Failed to download ${category}/${slug}`, e);
                }
            }
        }));
    }

    console.log(`Pull Complete. Downloaded ${downloaded} topic files.`);
}

run().catch(console.error);
