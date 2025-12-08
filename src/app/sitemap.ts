import { MetadataRoute } from 'next';
import * as fs from 'fs';
import * as path from 'path';
import { SEO_CONFIG, CategoryId } from '@/lib/seo-config';

// Base URL from env or default
const BASE_URL = 'https://headlined.app';
const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');

export async function generateSitemaps() {
    // 1. Static Pages
    const sitemaps = [
        { id: 0 }, // Main pages
    ];

    return sitemaps;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    // Main static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
    ];

    // Read PSEO Manifest
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            // Map manifest items to sitemap entries
            const seoRoutes = manifest.map((item: any) => ({
                url: `${BASE_URL}/${item.params.category}/${item.params.slug}`,
                lastModified: new Date(item.lastUpdated || new Date()),
                changeFrequency: 'hourly' as const,
                priority: 0.8,
                // Google News extension not directly supported in Next.js built-in type yet, 
                // but standard sitemap is crucial first.
            }));

            return [...routes, ...seoRoutes];
        } catch (e) {
            console.error("Error reading manifest for sitemap", e);
        }
    }

    return routes;
}
