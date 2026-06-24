import * as fs from 'fs';
import * as path from 'path';
import { ClassificationResult } from './classifier';

export interface Post {
    slug: string; // The specific post slug
    title: string;
    description: string | null;
    link: string;
    thumbnail_url: string | null;
    created_at: string;
    topic: string; // Original source topic
    // New fields
    relatedTopics?: { category: string; slug: string; title: string }[];
}

export interface ManifestItem {
    params: {
        category: string;
        slug: string;
    };
    lastUpdated: string;
    count: number;
}

export class BucketManager {
    private outputDir: string;
    private dataDir: string;
    private manifestsDir: string;
    private sitemapsDir: string;
    private buckets: Map<string, Post[]> = new Map();
    private manifest: ManifestItem[] = [];

    // Domain for sitemap generation
    private baseUrl = 'https://headlined.app'; // Update this to real domain

    constructor(outputDir: string) {
        this.outputDir = outputDir;
        this.dataDir = path.join(outputDir, 'data');
        this.manifestsDir = path.join(outputDir, 'manifests');
        this.sitemapsDir = path.join(outputDir, 'sitemaps');
    }

    public async init() {
        // Create directories
        if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
        if (!fs.existsSync(this.manifestsDir)) fs.mkdirSync(this.manifestsDir, { recursive: true });
        if (!fs.existsSync(this.sitemapsDir)) fs.mkdirSync(this.sitemapsDir, { recursive: true });
    }

    // Add a post to local memory buckets
    public addPost(post: Post, classification: ClassificationResult) {
        const key = `${classification.category}/${classification.slug}`;
        if (!this.buckets.has(key)) {
            // Try to load existing bucket from disk to preserve history
            const file = path.join(this.dataDir, classification.category, `${classification.slug}.json`);
            if (fs.existsSync(file)) {
                try {
                    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
                    this.buckets.set(key, data);
                } catch (e) {
                    this.buckets.set(key, []);
                }
            } else {
                this.buckets.set(key, []);
            }
        }

        const bucket = this.buckets.get(key)!;

        // Deduplicate by link
        if (!bucket.some(p => p.link === post.link)) {
            bucket.push(post);
        }
    }

    // Process all buckets: Sort, Prune, Link, Save
    public async flush() {
        console.log("Flushing buckets...");
        const validSlugs: { category: string; slug: string }[] = [];

        // Split manifest storage
        const catManifests: Record<string, ManifestItem[]> = {};

        for (const [key, posts] of this.buckets.entries()) {
            const [category, slug] = key.split('/');

            // 1. Sort by date (newest first)
            posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // 2. Prune
            // Rule: Delete if < 3 posts
            if (posts.length < 3) {
                continue;
            }

            // Rule: Delete if lastUpdated > 60 days
            const lastPostDate = new Date(posts[0].created_at);
            const daysDiff = (Date.now() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysDiff > 60) {
                continue;
            }

            // 3. Graphing / Internal Linking (Mock for now, can be enhanced)
            // Ideally we find related topics by looking at other buckets that share the same posts
            // This is computationally expensive O(N^2), so simplified:
            // Just take top 3 posts and see what other categories they belong to? 
            // For now, we skip complex graph calc to ensure speed, or implemented later.

            // 4. Save Data
            const catDir = path.join(this.dataDir, category);
            if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });

            // Limit to top 100 for safety/file size (snapshot)
            const snapshot = posts.slice(0, 100);

            fs.writeFileSync(path.join(catDir, `${slug}.json`), JSON.stringify(snapshot, null, 2));

            // 5. Add to Manifest
            const item: ManifestItem = {
                params: { category, slug },
                lastUpdated: new Date().toISOString(),
                count: posts.length
            };

            if (!catManifests[category]) catManifests[category] = [];
            catManifests[category].push(item);

            validSlugs.push({ category, slug });
        }

        // Save Manifests
        for (const cat in catManifests) {
            fs.writeFileSync(path.join(this.manifestsDir, `${cat}.json`), JSON.stringify(catManifests[cat], null, 2));

            // Generate Sitemap for Category
            this.generateSitemap(cat, catManifests[cat]);
        }

        // Generate Sitemap Index
        this.generateSitemapIndex(Object.keys(catManifests));

        // Save Global Manifest (optional, but good for simple builds)
        const globalManifest = Object.values(catManifests).flat();
        fs.writeFileSync(path.join(this.outputDir, 'manifest.json'), JSON.stringify(globalManifest, null, 2));
    }

    private generateSitemap(category: string, items: ManifestItem[]) {
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(item => `  <url>
    <loc>${this.baseUrl}/${item.params.category}/${item.params.slug}</loc>
    <lastmod>${item.lastUpdated.split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
  </url>`).join('\n')}
</urlset>`;

        fs.writeFileSync(path.join(this.sitemapsDir, `${category}.xml`), sitemapContent);
    }

    private generateSitemapIndex(categories: string[]) {
        const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(cat => `  <sitemap>
    <loc>${this.baseUrl}/sitemaps/${cat}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

        fs.writeFileSync(path.join(this.outputDir, 'sitemap-index.xml'), indexContent);
    }
}
