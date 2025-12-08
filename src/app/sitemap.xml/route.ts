import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');

export async function GET() {
    const baseUrl = 'https://headlined.app';
    let entries: string[] = [];

    // 1. Add Static Routes
    const staticRoutes = [
        '',
        '/about', // Assuming exists
        '/privacy',
        '/terms'
    ];

    staticRoutes.forEach(route => {
        entries.push(`
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`.trim());
    });

    // 2. Add PSEO Pages from Manifest
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            // Expected manifest format: { params: { category: string, slug: string } }[]

            manifest.forEach((item: any) => {
                const { category, slug } = item.params;
                entries.push(`
  <url>
    <loc>${baseUrl}/${category}/${slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <news:news>
      <news:publication>
        <news:name>Headlined</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date().toISOString()}</news:publication_date>
      <news:title>${slug.replace(/-/g, ' ')} News</news:title>
    </news:news>
  </url>`.trim());
            });
        } catch (e) {
            console.error("Error generating sitemap SEO entries", e);
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        }
    });
}
