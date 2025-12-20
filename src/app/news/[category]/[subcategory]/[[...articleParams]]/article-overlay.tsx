"use client";

import { useState, useEffect } from 'react';
import ArticleClientPage from '@/app/article/[[...slug]]/client';

export function ArticleOverlay({ date: propDate, slug: propSlug }: { date: string | null; slug: string | null }) {
    const [mounted, setMounted] = useState(false);
    const [urlParams, setUrlParams] = useState<{ date: string; slug: string } | null>(null);

    useEffect(() => {
        setMounted(true);

        // If we don't have props (e.g. landing on a deep link that wasn't pre-rendered),
        // we detect the article from the URL.
        if (!propDate || !propSlug) {
            const pathname = window.location.pathname;
            // Pattern: /news/[category]/[subcategory]/YYYY/MM/DD/slug
            const match = pathname.match(/\/news\/[^\/]+\/[^\/]+\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/\?\#]+)/);
            if (match) {
                setUrlParams({
                    date: `${match[1]}-${match[2]}-${match[3]}`,
                    slug: match[4]
                });
            }
        }
    }, [propDate, propSlug]);

    if (!mounted) return null;

    const finalDate = propDate || urlParams?.date;
    const finalSlug = propSlug || urlParams?.slug;

    if (!finalDate || !finalSlug) return null;

    return (
        <ArticleClientPage
            overrideDate={finalDate}
            overrideSlug={finalSlug}
        />
    );
}
