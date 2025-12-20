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

    useEffect(() => {
        setMounted(true);

        // Detect slug from useParams OR window.location
        const rawSlug = (params.slug as string[]) || [];
        if (rawSlug.length > 0) {
            setSlugParts(rawSlug);
        } else {
            const pathname = window.location.pathname;
            // Handle /article/category/subcategory/slug
            const articleMatch = pathname.match(/\/article\/([^\/]+)\/([^\/]+)\/([^\/\?\#]+)/);
            if (articleMatch) {
                setSlugParts([articleMatch[1], articleMatch[2], articleMatch[3].replace(/\/$/, '')]);
            } else {
                // Handle legacy /article/YYYY-MM-DD/slug
                const legacyMatch = pathname.match(/\/article\/(\d{4}-\d{2}-\d{2})\/(.+)/);
                if (legacyMatch) {
                    setSlugParts([legacyMatch[1], legacyMatch[2].replace(/\/$/, '')]);
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
    if (slugParts.length === 0 && !loading) {
        return <ArticleListingPage />;
    }

    // Case 2: /article/[category]/[subcategory]/[slug] - Internal article
    if (slugParts.length === 3) {
        const [category, subcategory, articleSlug] = slugParts;

        if (validateCategoryPath(category, subcategory)) {
            // If still loading, show a skeleton instead of falling through
            if (loading) {
                return <div className="min-h-screen bg-background animate-pulse" />;
            }

            // Find in the fetched articles
            const internalArticle = internalArticles.find(
                a => a.category === category && a.subcategory === subcategory && a.slug === articleSlug
            );

            if (internalArticle && internalArticle.status === 'published') {
                return <InternalArticlePage article={internalArticle} />;
            }
        }
    }

    // Case 3: Fallback - render the Client Page for news articles or not-found
    // We only render this if we are NOT in the middle of loading an internal article
    if (loading && slugParts.length > 0) {
        return <div className="min-h-screen bg-background animate-pulse" />;
    }

    return <ArticleClientPage />;
}

