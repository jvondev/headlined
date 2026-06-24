import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { SEO_CONFIG, CategoryId } from '@/lib/seo-config';

// Title: 52 chars | Description: 158 chars
export const metadata: Metadata = {
    title: 'News Hub | Browse All Categories | Headlined',
    description: 'Browse all news categories on Headlined. Technology, business, design, and more—curated daily from verified sources. No login required.',
    alternates: {
        canonical: 'https://headlined.app/news'
    }
};

export default function NewsHubPage() {
    const categories = Object.keys(SEO_CONFIG) as CategoryId[];

    // Breadcrumb schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://headlined.app" },
            { "@type": "ListItem", "position": 2, "name": "News", "item": "https://headlined.app/news" }
        ]
    };

    return (
        <main className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <header className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
                <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                        <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                        <span className="opacity-30">/</span>
                        <li className="text-foreground">News</li>
                    </ol>
                </nav>

                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                        <Newspaper className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">News Hub</h1>
                        <p className="text-muted-foreground mt-1">{categories.length} categories available</p>
                    </div>
                </div>

                <p className="text-lg text-muted-foreground max-w-2xl">
                    Browse all news categories. Each category contains curated topic feeds updated continuously from verified sources.
                </p>
            </header>

            <section className="px-6 pb-16 max-w-5xl mx-auto">
                <h2 className="text-xl font-semibold mb-6">All Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category}
                            href={`/news/${category}`}
                            className="group p-6 bg-card hover:bg-card/80 rounded-2xl border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold capitalize group-hover:text-primary transition-colors">
                                    {category}
                                </h3>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="px-6 py-16 bg-muted/30 border-t">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Want personalized feeds?</h2>
                    <p className="text-muted-foreground mb-6">
                        Open Headlined to pick your topics and get a daily news feed tailored to your interests.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Open App <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
