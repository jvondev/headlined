import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';
import { SeoFeed } from '@/components/seo/SeoFeed';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { SEO_CONFIG, CategoryId } from '@/lib/seo-config';

// Define Parameter Type
type Props = {
    params: { view: string; slug: string }
};

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');

// 1. Generate Static Params (The Build List)
export async function generateStaticParams() {
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.warn("No SEO manifest found. Skipping static generation for SEO pages.");
        return [];
    }

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        // Map 'category' from manifest to 'view' param
        return manifest.map((item: any) => ({
            view: item.params.category,
            slug: item.params.slug
        }));
    } catch (e) {
        console.error("Error parsing manifest", e);
        return [];
    }
}

// 2. Fetch Data (Local Helper)
function getTopicData(category: string, slug: string) {
    const filePath = path.join(CACHE_DIR, category, `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 3. Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { view, slug } = params;
    const category = view; // Alias for clarity
    const config = SEO_CONFIG[category as CategoryId] || SEO_CONFIG['keywords'];

    // Format slug for display (e.g. "san-diego" -> "San Diego")
    const formattedSlug = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const title = config.titleTemplate.replace(/{Slug}/g, formattedSlug);
    const description = config.descriptionTemplate.replace(/{Slug}/g, formattedSlug);

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            type: 'website',
            // images: ... (could add default OG image logic)
        },
        alternates: {
            canonical: `https://headlined.app/${category}/${slug}` // Update domain
        }
    };
}

// 4. Page Component
export default function SeoTopicPage({ params }: Props) {
    const { view, slug } = params;
    const category = view; // Alias

    // Validate Category
    if (!SEO_CONFIG[category as CategoryId]) {
        notFound();
    }

    const data = getTopicData(category, slug);
    if (!data) {
        notFound(); // Should not happen if generateStaticParams is correct
    }

    const config = SEO_CONFIG[category as CategoryId];
    const formattedSlug = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const h1 = config.h1Template.replace(/{Slug}/g, formattedSlug);
    const intro = config.introTemplate.replace(/{Slug}/g, formattedSlug);

    // Schema.org logic
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "headline": h1,
        "description": intro,
        "url": `https://headlined.app/${category}/${slug}`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": data.map((post: any, index: number) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": post.link,
                "name": post.title
            }))
        }
    };

    return (
        <main className="min-h-screen bg-background pt-20">
            {/* Schema Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header / Shell Content */}
            <header className="w-full max-w-4xl mx-auto px-4 mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4 capitalize">
                    {h1}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    {intro}
                </p>
            </header>

            {/* Client Feed */}
            <SeoFeed category={category} slug={slug} initialPosts={data} />

            {/* Internal Links & Footer Area */}
            <InternalLinks
                category={category as CategoryId}
                slug={slug}
                relatedTopics={data[0]?.relatedTopics}
            />
        </main>
    );
}
