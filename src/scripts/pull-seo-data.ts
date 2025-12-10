import * as fs from 'fs';
import * as path from 'path';
import { SEO_DATA_URL } from '../lib/seo-config';

// When running locally, if scraper-repo exists, we can copy directly? 
// No, the user requested robustness: The build might happen on Cloudflare where scraper-repo is NOT present.
// So we MUST use the CDN URL or a fallback. 
// BUT, for development velocity, if env is local, we check local folder first.

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');
const MANIFEST_CACHE_FILE = path.join(CACHE_DIR, 'manifest.json');

// Max articles per topic for crawler preview (keeps data fresh and build size small)
const MAX_ARTICLES_PER_TOPIC = 10;

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

    // Force CDN Usage
    console.log(`Fetching manifest from CDN: ${SEO_DATA_URL}/manifest.json`);
    try {
        manifest = await fetchJson(`${SEO_DATA_URL}/manifest.json`);
    } catch (e) {
        console.error("Failed to fetch manifest from CDN. Build will have NO SEO pages.", e);
        return;
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

            try {
                let data = await fetchJson(`${SEO_DATA_URL}/data/${category}/${slug}.json`);

                // Sort by created_at (newest first) and limit to MAX_ARTICLES_PER_TOPIC
                if (Array.isArray(data)) {
                    data = data.sort((a: any, b: any) => {
                        const dateA = new Date(a.created_at || 0).getTime();
                        const dateB = new Date(b.created_at || 0).getTime();
                        return dateB - dateA; // Newest first
                    }).slice(0, MAX_ARTICLES_PER_TOPIC);
                }

                fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
                downloaded++;
            } catch (e) {
                console.error(`Failed to download ${category}/${slug}`, e);
            }
        }));
    }

    console.log(`Pull Complete. Downloaded ${downloaded} topic files.`);
}

run().catch(console.error);
