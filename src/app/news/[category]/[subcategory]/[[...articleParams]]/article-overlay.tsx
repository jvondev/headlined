"use client";

import { useState, useEffect } from 'react';
import ArticleClientPage from '@/app/article/[[...slug]]/client';

export function ArticleOverlay({ date: propDate, slug: propSlug }: { date: string | null; slug: string | null }) {
    const [mounted, setMounted] = useState(false);
    const [urlParams, setUrlParams] = useState<{ date: string; slug: string } | null>(null);

    useEffect(() => {
        setMounted(true);

        // IMMEDIATE CHECK: Check window location for deep link if props are missing
        // This handles the SPA fallback scenario where server props are empty but URL is deep
        if (!propDate || !propSlug) {
            const pathname = window.location.pathname;
            // Pattern: /news/[category]/[subcategory]/YYYY/MM/DD/slug
            const match = pathname.match(/\/news\/[^\/]+\/[^\/]+\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/([^\/\?\#]+)/);

            if (match) {
                const year = match[1];
                const month = match[2].padStart(2, '0');
                const day = match[3].padStart(2, '0');

                // Immediately set params to render article
                setUrlParams({
                    date: `${year}-${month}-${day}`,
                    slug: match[4].replace(/\/$/, '')
                });
            }
        }
    }, [propDate, propSlug]);

    if (!mounted) return null;

    const finalDate = propDate || urlParams?.date;
    const finalSlug = propSlug || urlParams?.slug;

    // If we have a date/slug (either from props or URL), RENDER IMMEDIATELY
    if (finalDate && finalSlug) {
        return (
            <ArticleClientPage
                overrideDate={finalDate}
                overrideSlug={finalSlug}
            />
        );
    }

    return null;
}
