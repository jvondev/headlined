"use client";

import { useState, useEffect } from 'react';
import ArticleClientPage from '@/app/article/[[...slug]]/client';

export function ArticleOverlay({ date, slug }: { date: string | null; slug: string | null }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !date || !slug) return null;

    return (
        <ArticleClientPage
            overrideDate={date}
            overrideSlug={slug}
        />
    );
}
