import type { MetadataRoute } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://headlined.app';
    const now = new Date().toISOString();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/today`,
            lastModified: now,
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/yesterday`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/this-week`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic PSEO routes from manifest
    const pseoRoutes: MetadataRoute.Sitemap = [];
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            manifest.forEach((item: { params: { category: string; slug: string } }) => {
                const { category, slug } = item.params;
                pseoRoutes.push({
                    url: `${baseUrl}/${category}/${slug}`,
                    lastModified: now,
                    changeFrequency: 'hourly',
                    priority: 0.9,
                });
            });
        } catch (e) {
            console.error('Error reading manifest for sitemap:', e);
        }
    }

    return [...staticRoutes, ...pseoRoutes];
}
