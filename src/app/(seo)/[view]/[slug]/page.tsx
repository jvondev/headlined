import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';
import { SeoFeed } from '@/components/seo/SeoFeed';
import { SeoCover } from '@/components/seo/seo-cover';
import { SEO_CONFIG, getSeoMetadata, CategoryId } from '@/lib/seo-config';

// Define Parameter Type
type Props = {
    params: Promise<{ view: string; slug: string }>
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
    const { view, slug } = await params;
    const category = view as CategoryId;

    // Get dynamic metadata from engine
    const seo = getSeoMetadata(category, slug);

    return {
        title: seo.title,
        description: seo.description,
        openGraph: {
            title: seo.title,
            description: seo.description,
            type: 'website',
            // images: ... (could add default OG image logic)
        },
        alternates: {
            canonical: `https://headlined.app/${category}/${slug}`
        },
        keywords: seo.aliases
    };
}

// 4. Page Component
export default async function SeoTopicPage({ params }: Props) {
    const { view, slug } = await params;
    const category = view as CategoryId;

    // Validate Category
    if (!SEO_CONFIG[category]) {
        notFound();
    }

    const data = getTopicData(category, slug);
    if (!data) {
        notFound();
    }

    // Get all dynamic texts
    const seo = getSeoMetadata(category, slug);

    // Stacked Schema Logic
    const schemas = [
        // CollectionPage
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": seo.title,
            "headline": seo.h1,
            "description": seo.intro,
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
        },
        // FAQ Schema for Rich Snippets
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": seo.faqs?.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                }
            })) || []
        },
        // Breadcrumb Schema
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://headlined.app"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": category.charAt(0).toUpperCase() + category.slice(1),
                    "item": `https://headlined.app/${category}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": seo.richTitle,
                    "item": `https://headlined.app/${category}/${slug}`
                }
            ]
        },
        // Organization Schema (E-E-A-T)
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Headlined",
            "url": "https://headlined.app",
            "logo": {
                "@type": "ImageObject",
                "url": "https://headlined.app/icon.png",
                "width": 512,
                "height": 512
            },
            "sameAs": [
                "https://twitter.com/headlinedapp",
                "https://github.com/headlined"
            ]
        },
        // WebPage Schema (Speakable & Accessibility)
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": seo.h1,
            "description": seo.intro,
            "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "p.intro-text"]
            },
            "inLanguage": "en-US",
            "isPartOf": {
                "@type": "WebSite",
                "name": "Headlined",
                "url": "https://headlined.app"
            }
        }
    ];

    // Add Entity Thing schema if Wikidata ID exists (Entity Salience)
    if (seo.wikidata) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Thing",
            "name": seo.richTitle,
            "description": seo.intro,
            "sameAs": `https://www.wikidata.org/wiki/${seo.wikidata}`,
            "url": `https://headlined.app/${category}/${slug}`
        } as any);
    }

    // Map Scraper Data to Post Type for SeoCover
    const mappedPosts: any[] = data.map((p: any) => ({
        slug: p.slug || '',
        title: p.title,
        description: p.description,
        link: p.link,
        thumbnail_url: p.thumbnail_url,
        topic: p.topic || category,
        summaries: [],
        date: p.created_at || new Date().toISOString()
    }));

    return (
        <main className="h-screen w-full bg-background flex flex-col overflow-hidden relative">
            {/* Inject Schemas */}
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            {/* The Cover Layer (Landing Experience) */}
            <SeoCover
                category={category}
                slug={slug}
                title={seo.h1}
                intro={seo.intro}
                richTitle={seo.richTitle}
                aliases={seo.aliases}
                faqs={seo.faqs}
                posts={mappedPosts}
                relatedTopics={data[0]?.relatedTopics}
            />

            {/* Client Feed (Background Layer, revealed on dismiss) */}
            <div className="flex-1 w-full relative z-0 flex items-center justify-center">
                <SeoFeed category={category} slug={slug} initialPosts={data} />
            </div>
        </main>
    );
}
