"use client";

import Link from 'next/link';
import { Network } from 'lucide-react';
import { SEO_CATEGORIES, SeoKeywordDef } from '@/lib/seo-keywords';
import { CategoryId } from '@/lib/seo-config';
import { cn } from "@/lib/utils";

interface InternalLinksProps {
    currentCategory: CategoryId;
    currentSlug: string;
}

export function InternalLinks({ currentCategory, currentSlug }: InternalLinksProps) {
    // Access Record directly
    // @ts-ignore - Validating category existence
    const categoryItems = SEO_CATEGORIES[currentCategory];

    if (!categoryItems) return null;

    // Filter out current slug and limit to 8 items
    const relatedLinks = categoryItems
        .filter((item: SeoKeywordDef) => item.slug !== currentSlug)
        .slice(0, 8);

    if (relatedLinks.length === 0) return null;

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
                <Network className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    More in {currentCategory}
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedLinks.map((item: SeoKeywordDef, index: number) => (
                    <Link
                        key={item.slug}
                        href={`/${currentCategory}/${item.slug}`}
                        className={cn(
                            "group flex flex-col p-4 rounded-2xl bg-card/20 border border-border/40 hover:bg-card/60 hover:border-primary/20 transition-all duration-300 hover:shadow-sm",
                            index >= 6 && "hidden md:flex" // Hide last 2 items on mobile (total 6 visible) to prevent overflow/too long list
                        )}
                    >
                        <span className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 group-hover:text-primary/80 transition-colors">
                            Topic
                        </span>
                        <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2 leading-tight">
                            {item.title}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
