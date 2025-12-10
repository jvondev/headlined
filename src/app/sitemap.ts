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
            url: `${baseUrl}/app/today`,
            lastModified: now,
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/app/yesterday`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/app/this-week`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/support`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic pSEO routes from manifest (now under /news)
    const pseoRoutes: MetadataRoute.Sitemap = [];
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            manifest.forEach((item: { params: { category: string; slug: string } }) => {
                const { category, slug } = item.params;
                // Add category hub page
                pseoRoutes.push({
                    url: `${baseUrl}/news/${category}`,
                    lastModified: now,
                    changeFrequency: 'daily',
                    priority: 0.8,
                });
                // Add topic page
                pseoRoutes.push({
                    url: `${baseUrl}/news/${category}/${slug}`,
                    lastModified: now,
                    changeFrequency: 'hourly',
                    priority: 0.9,
                });
            });
        } catch (e) {
            console.error('Error reading manifest for sitemap:', e);
        }
    }

    // Deduplicate category hub pages
    const uniqueRoutes = pseoRoutes.filter((route, index, self) =>
        index === self.findIndex((r) => r.url === route.url)
    );

    return [...staticRoutes, ...uniqueRoutes];
}

