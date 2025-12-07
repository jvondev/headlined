import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryId } from '@/lib/seo-config';

interface InternalLinksProps {
    category: CategoryId;
    slug: string;
    relatedTopics?: { category: string; slug: string; title: string }[];
}

export function InternalLinks({ category, slug, relatedTopics }: InternalLinksProps) {
    const formatSlug = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
                <ol className="flex items-center gap-2">
                    <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                    <ChevronRight className="h-4 w-4" />
                    <li>
                        <Link href={`/`} className="hover:text-foreground capitalize">{category}</Link>
                    </li>
                    <ChevronRight className="h-4 w-4" />
                    <li className="font-medium text-foreground capitalize" aria-current="page">
                        {formatSlug(slug)}
                    </li>
                </ol>
            </nav>

            {/* Related Topics */}
            {relatedTopics && relatedTopics.length > 0 && (
                <div className="border-t pt-6 bg-accent/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {relatedTopics.map((topic, i) => (
                            <Link
                                key={i}
                                href={`/${topic.category}/${topic.slug}`}
                                className="px-3 py-1.5 bg-background border rounded-full text-sm hover:bg-muted transition-colors"
                            >
                                {topic.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
