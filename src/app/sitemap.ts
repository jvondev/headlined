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
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/today`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ];

    // Dynamic pSEO routes
    const pseoRoutes: MetadataRoute.Sitemap = [];
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            manifest.forEach((item: { params: { category: string; slug: string } }) => {
                const { category, slug } = item.params;
                pseoRoutes.push({
                    url: `${baseUrl}/news/${category}`,
                    lastModified: now,
                    changeFrequency: 'daily',
                    priority: 0.8,
                });
                pseoRoutes.push({
                    url: `${baseUrl}/news/${category}/${slug}`,
                    lastModified: now,
                    changeFrequency: 'hourly',
                    priority: 0.9,
                });
            });
        } catch (e) { }
    }

    // Article routes
    const articleRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = fs.readdirSync(CACHE_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        for (const category of categories) {
            const categoryDir = path.join(CACHE_DIR, category);
            if (!fs.existsSync(categoryDir)) continue;

            const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.json'));

            for (const file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(categoryDir, file), 'utf-8'));
                    for (const post of data) {
                        const postDate = post.created_at
                            ? new Date(post.created_at).toISOString().split('T')[0]
                            : new Date().toISOString().split('T')[0];
                        const slug = post.slug || '';
                        if (!slug) continue;

                        const [year, month, day] = postDate.split('-');
                        const rawTopic = Array.isArray(post.topic) ? (post.topic.length > 0 ? post.topic[0] : null) : post.topic;
                        const topic = rawTopic ? rawTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general';

                        articleRoutes.push({
                            url: `${baseUrl}/news/${category}/${topic}/${year}/${month}/${day}/${slug}`,
                            lastModified: post.created_at || now,
                            changeFrequency: 'daily',
                            priority: 0.7,
                        });
                    }
                } catch (e) { }
            }
        }
    } catch (e) { }

    const uniqueRoutes = [...staticRoutes, ...pseoRoutes, ...articleRoutes].filter((route, index, self) =>
        index === self.findIndex((r) => r.url === route.url)
    );

    return uniqueRoutes;
}
