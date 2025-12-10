import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Rss } from 'lucide-react';
import { SEO_CONFIG, CategoryId } from '@/lib/seo-config';
import { SEO_CATEGORIES, SeoKeywordDef } from '@/lib/seo-keywords';

// Define Parameter Type
type Props = {
    params: Promise<{ category: string }>;
};

// Generate static params for all categories
export async function generateStaticParams() {
    return Object.keys(SEO_CONFIG).map(category => ({
        category: category
    }));
}

// Generate metadata for each category page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: categoryParam } = await params;
    const category = categoryParam as CategoryId;

    if (!SEO_CONFIG[category]) {
        return { title: 'Not Found' };
    }

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `${categoryName} News & Updates | Headlined`,
        description: `Browse all ${categoryName.toLowerCase()} topics. Curated news feeds updated continuously from verified sources.`,
        alternates: {
            canonical: `https://headlined.app/news/${category}`
        }
    };
}

// Category Hub Page
export default async function CategoryHubPage({ params }: Props) {
    const { category: categoryParam } = await params;
    const category = categoryParam as CategoryId;

    // Validate category exists
    if (!SEO_CONFIG[category]) {
        notFound();
    }

    // Get all keywords for this category
    const keywords: SeoKeywordDef[] = SEO_CATEGORIES[category] || [];
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

    // Breadcrumb schema
    const breadcrumbSchema = {
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
                "name": categoryName,
                "item": `https://headlined.app/news/${category}`
            }
        ]
    };

    // CollectionPage schema
    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${categoryName} News Hub`,
        "description": `All ${categoryName.toLowerCase()} topics available on Headlined`,
        "url": `https://headlined.app/news/${category}`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": keywords.map((kw, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://headlined.app/news/${category}/${kw.slug}`,
                "name": kw.title
            }))
        }
    };

    return (
        <main className="min-h-screen bg-background">
            {/* Schema markup */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />

            {/* Hero Section */}
            <header className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                        <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                        <span className="opacity-30">/</span>
                        <li><Link href="/news" className="hover:text-foreground transition-colors">News</Link></li>
                        <span className="opacity-30">/</span>
                        <li className="text-foreground capitalize">{categoryName}</li>
                    </ol>
                </nav>

                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                        <Rss className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{categoryName} News</h1>
                        <p className="text-muted-foreground mt-1">
                            {keywords.length} topics available
                        </p>
                    </div>
                </div>

                <p className="text-lg text-muted-foreground max-w-2xl">
                    Browse all {categoryName.toLowerCase()} topics. Each feed is curated from verified sources and updated continuously.
                </p>
            </header>

            {/* Topics Grid */}
            <section className="px-6 pb-16 max-w-5xl mx-auto">
                <h2 className="text-xl font-semibold mb-6">All {categoryName} Topics</h2>

                {keywords.length === 0 ? (
                    <p className="text-muted-foreground">No topics available in this category yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {keywords.map((keyword) => (
                            <Link
                                key={keyword.slug}
                                href={`/news/${category}/${keyword.slug}`}
                                className="group relative overflow-hidden p-6 bg-card hover:bg-card/80 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {keyword.title}
                                        </h3>
                                        {keyword.aliases.length > 0 && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                Also: {keyword.aliases.slice(0, 2).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Section - Link to App */}
            <section className="px-6 py-16 bg-muted/30 border-t">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Want personalized feeds?</h2>
                    <p className="text-muted-foreground mb-6">
                        Open Headlined to pick your topics and get a daily news feed tailored to your interests.
                    </p>
                    <Link
                        href="/app/today"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Open App
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
