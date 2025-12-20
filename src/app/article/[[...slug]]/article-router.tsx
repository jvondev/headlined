'use client';

import { useParams } from 'next/navigation';
import ArticleClientPage from './client';
import ArticleListingPage from './listing';
import InternalArticlePage from './internal';
import { validateCategoryPath } from '@/lib/category-utils';
import { useEffect, useState } from 'react';
import { InternalArticle } from '@/types/article';

export default function ArticlePageRouter() {
    const params = useParams();
    const [mounted, setMounted] = useState(false);
    const [internalArticles, setInternalArticles] = useState<InternalArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [slugParts, setSlugParts] = useState<string[]>([]);
    const [isDeepLink, setIsDeepLink] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Detect slug from useParams OR window.location
        const rawSlug = (params.slug as string[]) || [];
        if (rawSlug.length > 0) {
            setSlugParts(rawSlug);
            setIsDeepLink(true);
        } else {
            const pathname = window.location.pathname;
            // Handle /article/category/subcategory/slug
            // Robust match for 4 segments: /article, category, subcategory, slug
            const articleMatch = pathname.match(/\/article\/([^\/]+)\/([^\/]+)\/([^\/\?\#]+)/);

            // Exclude legacy date paths from this specific match if needed, but stricter regex is better
            const isLegacyDate = pathname.match(/\/article\/\d{4}-\d{2}-\d{2}\//);

            if (articleMatch && !isLegacyDate) {
                setSlugParts([articleMatch[1], articleMatch[2], articleMatch[3].replace(/\/$/, '')]);
                setIsDeepLink(true);
            } else {
                // Handle legacy /article/YYYY-MM-DD/slug
                const legacyMatch = pathname.match(/\/article\/(\d{4}-\d{2}-\d{2})\/(.+)/);
                if (legacyMatch) {
                    setSlugParts([legacyMatch[1], legacyMatch[2].replace(/\/$/, '')]);
                    setIsDeepLink(true);
                }
            }
        }

        // Fetch published articles (this works client-side)
        fetch('/api/articles')
            .then(res => res.json())
            .then(data => {
                setInternalArticles(data.articles || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.slug]);

    // Prevent hydration mismatch
    if (!mounted) return <div className="min-h-screen bg-background" />;

    // Case 1: /article (root) -> Show article listing page
    // STRICT CHECK: Only if no slug parts detected.
    if (slugParts.length === 0 && !loading) {
        return <ArticleListingPage />;
    }

    // Case 2: /article/[category]/[subcategory]/[slug] - Internal article
    if (slugParts.length === 3) {
        const [category, subcategory, articleSlug] = slugParts;

        if (validateCategoryPath(category, subcategory)) {
            // If still loading, show a skeleton instead of falling through
            // IMPORTANT: If we have a deep link, we MUST wait for loading to finish
            if (loading) {
                return <div className="min-h-screen bg-background animate-pulse" />;
            }

            // Find in the fetched articles
            const internalArticle = internalArticles.find(
                a => a.category === category && a.subcategory === subcategory && a.slug === articleSlug
            );

            if (internalArticle) {
                // We show it even if status is not published if we want to allow deep links to work for preview-ish (optional)
                // But sticking to logic:
                if (internalArticle.status === 'published') {
                    return <InternalArticlePage article={internalArticle} />;
                }
            }
        }
    }

    // Case 3: Fallback / Loading for other patterns
    // If we detected a deep link but haven't finished loading internal articles yet, KEEP LOADING
    // Do NOT fall through to ArticleClientPage (which might redirect) until we are sure.
    if (loading && isDeepLink) {
        return <div className="min-h-screen bg-background animate-pulse" />;
    }

    // Case 4: Not an internal article or not found in list -> Pass to Client Page (redirects or shows fallback)
    // Only pass if we are sure it's not a root request
    return <ArticleClientPage />;
}

