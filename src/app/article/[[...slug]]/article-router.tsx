'use client';

import { useParams } from 'next/navigation';
import ArticleClientPage from './client';
import ArticleListingPage from './listing';
import InternalArticlePage from './internal';
import { getArticleBySlug, validateCategoryPath } from '@/lib/article-service';
import { useEffect, useState } from 'react';

export default function ArticlePageRouter() {
    const params = useParams();
    const slugParts = (params.slug as string[]) || [];
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
            const internalArticle = getArticleBySlug(category, subcategory, articleSlug);
            if (internalArticle && internalArticle.status === 'published') {
                return <InternalArticlePage article={internalArticle} />;
            }
        }
    }

    // Case 3: Fallback - render the Client Page for legacy/external news articles
    // This component already handles both /news and legacy /article/YYYY-MM-DD paths
    return <ArticleClientPage />;
}
