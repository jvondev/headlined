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
    const slugParts = (params.slug as string[]) || [];
    const [mounted, setMounted] = useState(false);
    const [internalArticles, setInternalArticles] = useState<InternalArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        // Fetch published articles (this works client-side)
        // We fetch these even if slug length is not 3, because it's cheap and provides the data needed for Case 2
        fetch('/api/articles')
            .then(res => res.json())
            .then(data => {
                setInternalArticles(data.articles || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return <div className="min-h-screen bg-background" />;

    // Case 1: /article (root) -> Show article listing page
    if (slugParts.length === 0) {
        return <ArticleListingPage />;
    }

    // Case 2: /article/[category]/[subcategory]/[slug] - Internal article
    if (slugParts.length === 3) {
        const [category, subcategory, articleSlug] = slugParts;

        if (validateCategoryPath(category, subcategory)) {
            // Find in the fetched articles
            const internalArticle = internalArticles.find(
                a => a.category === category && a.subcategory === subcategory && a.slug === articleSlug
            );

            if (internalArticle && internalArticle.status === 'published') {
                return <InternalArticlePage article={internalArticle} />;
            }

            // If still loading, show a skeleton
            if (loading) {
                return <div className="min-h-screen bg-background animate-pulse" />;
            }
        }
    }

    // Case 3: Fallback - render the Client Page for legacy/external news articles
    // This component already handles both /news and legacy /article/YYYY-MM-DD paths
    return <ArticleClientPage />;
}

