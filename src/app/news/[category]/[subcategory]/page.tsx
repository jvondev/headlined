import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';
import { SeoFeed } from '@/components/seo/SeoFeed';
import { SeoCover } from '@/components/seo/seo-cover';
import { SEO_CONFIG, getSeoMetadata, CategoryId } from '@/lib/seo-config';

// Define Parameter Type
type Props = {
    params: Promise<{ category: string; subcategory: string }>
};

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');

// 1. Generate Static Params (The Build List)
// Generate params from BOTH manifest (has data) AND seo-keywords.ts (all defined keywords)
export async function generateStaticParams() {
    const params: { category: string; subcategory: string }[] = [];
    const seen = new Set<string>();

    // First, add all routes from manifest (these have actual data)
    const manifestPath = path.join(CACHE_DIR, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            for (const item of manifest) {
                const key = `${item.params.category}/${item.params.slug}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    params.push({
                        category: item.params.category,
                        subcategory: item.params.slug
                    });
                }
            }
        } catch (e) {
            console.error("Error parsing manifest", e);
        }
    }

    // Second, add all routes from seo-keywords.ts (even if no data yet)
    // This ensures all defined keywords have a page
    const { SEO_CATEGORIES } = await import('@/lib/seo-keywords');
    for (const [category, keywords] of Object.entries(SEO_CATEGORIES)) {
        for (const keyword of keywords as any[]) {
            const key = `${category}/${keyword.slug}`;
            if (!seen.has(key)) {
                seen.add(key);
                params.push({
                    category: category,
                    subcategory: keyword.slug
                });
            }
        }
    }

    return params;
}

// 2. Fetch Data (Local Helper)
function getTopicData(category: string, subcategory: string) {
    const filePath = path.join(CACHE_DIR, category, `${subcategory}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 3. Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: categoryParam, subcategory } = await params;
    const category = categoryParam as CategoryId;

    // Get dynamic metadata from engine
    const seo = getSeoMetadata(category, subcategory);

    return {
        title: seo.title,
        description: seo.description,
        openGraph: {
            title: seo.title,
            description: seo.description,
            type: 'website',
        },
        alternates: {
            canonical: `https://headlined.app/news/${category}/${subcategory}`
        },
        keywords: seo.aliases
    };
}

// 4. Page Component
import { Suspense } from 'react';

// ... (previous imports and functions)

// 4. Page Component
export default async function SeoTopicPage({ params }: Props) {
    // ... (params logic matches original)
    const { category: categoryParam, subcategory } = await params;
    const category = categoryParam as CategoryId;

    // Validate Category
    if (!SEO_CONFIG[category]) {
        notFound();
    }

    const data = getTopicData(category, subcategory);
    const seo = getSeoMetadata(category, subcategory);

    // ... (Stack Schema Logic matches original)
    // Stacked Schema Logic
    const schemas = [
        // CollectionPage
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": seo.title,
            "headline": seo.h1,
            "description": seo.intro,
            "url": `https://headlined.app/news/${category}/${subcategory}`,
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": (data || []).map((post: any, index: number) => ({
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
                    "name": "News",
                    "item": "https://headlined.app/news"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": category.charAt(0).toUpperCase() + category.slice(1),
                    "item": `https://headlined.app/news/${category}`
                },
                {
                    "@type": "ListItem",
                    "position": 4,
                    "name": seo.richTitle,
                    "item": `https://headlined.app/news/${category}/${subcategory}`
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
            "url": `https://headlined.app/news/${category}/${subcategory}`
        } as any);
    }

    // Handle case when no data exists yet
    if (!data || data.length === 0) {
        return (
            <main className="min-h-screen bg-background flex flex-col">
                {/* Inject Schemas (still useful for SEO even without content) */}
                {schemas.map((schema, i) => (
                    <script
                        key={i}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                ))}

                {/* No Content Yet State */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="max-w-md space-y-6">
                        {/* Breadcrumb */}
                        <nav aria-label="Breadcrumb" className="mb-8">
                            <ol className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                                <span className="opacity-30">/</span>
                                <li><a href="/news" className="hover:text-foreground transition-colors">News</a></li>
                                <span className="opacity-30">/</span>
                                <li><a href={`/news/${category}`} className="hover:text-foreground transition-colors capitalize">{category}</a></li>
                                <span className="opacity-30">/</span>
                                <li className="text-foreground">{seo.richTitle}</li>
                            </ol>
                        </nav>

                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{seo.h1}</h1>
                        <p className="text-lg text-muted-foreground">{seo.intro}</p>

                        <div className="pt-8 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Content Coming Soon
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We're gathering the latest news for this topic. Check back soon for updates.
                            </p>
                        </div>

                        <div className="pt-8">
                            <a
                                href={`/news/${category}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                            >
                                Browse {category.charAt(0).toUpperCase() + category.slice(1)} Topics
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
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
        date: p.created_at || new Date().toISOString(),
        fullText: p.fullText || p.full_text || p.content || null,
        readingTime: p.readingTime || p.min,
        keywords: p.keywords || []
    }));

    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
                    subcategory={subcategory}
                    title={seo.h1}
                    intro={seo.intro}
                    richTitle={seo.richTitle}
                    aliases={seo.aliases}
                    faqs={seo.faqs}
                    posts={mappedPosts}
                    relatedTopics={data[0]?.relatedTopics}
                />

                {/* Client Feed (Background Layer, revealed on dismiss) */}
                <div className="flex-1 w-full relative z-0 flex items-center justify-center mt-6">
                    <SeoFeed category={category} subcategory={subcategory} initialPosts={data} />
                </div>
            </main>
        </Suspense>
    );
}
