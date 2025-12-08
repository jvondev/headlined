"use client";

import Link from 'next/link';
import { Network } from 'lucide-react';
import { SEO_CATEGORIES, SeoKeywordDef } from '@/lib/seo-keywords';
import { CategoryId } from '@/lib/seo-config';

interface InternalLinksProps {
    currentCategory: CategoryId;
    currentSlug: string;
}

export function InternalLinks({ currentCategory, currentSlug }: InternalLinksProps) {
    // Get category configuration from the SEO_CATEGORIES array
    const categoryConfig = SEO_CATEGORIES.find((cat) => cat.id === currentCategory);

    if (!categoryConfig) return null;

    // Filter out current slug and limit to 8 items
    const relatedLinks = categoryConfig.items
        .filter((item: SeoKeywordDef) => item.slug !== currentSlug)
        .slice(0, 8);

    if (relatedLinks.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
                <Network className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    More in {categoryConfig.label}
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedLinks.map((item: SeoKeywordDef) => (
                    <Link
                        key={item.slug}
                        href={`/${currentCategory}/${item.slug}`}
                        className="group flex flex-col p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:scale-[1.02]"
                    >
                        <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                        </span>
                        {item.aliases && item.aliases.length > 0 && (
                            <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {item.aliases[0]}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
