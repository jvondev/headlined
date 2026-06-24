import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';
import { SeoFeed } from '@/components/seo/SeoFeed';
import { SeoCover } from '@/components/seo/seo-cover';
import { SEO_CONFIG, getSeoMetadata, CategoryId } from '@/lib/seo-config';
import { Suspense } from 'react';

// Define Parameter Type
type Props = {
    params: Promise<{
        category: string;
        subcategory: string;
        articleParams?: string[];
    }>
};

const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');

// 1. Generate Static Params (The Build List)
// We only generate params for the Topic Hubs (articleParams = empty)
// This ensures that the topic hub HTML is pre-rendered and acts as a router for all sub-paths.
export async function generateStaticParams() {
    const params: { category: string; subcategory: string; articleParams: string[] }[] = [];
    const seen = new Set<string>();

    const manifestPath = path.join(CACHE_DIR, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            for (const item of manifest) {
                const key = `${item.params.category}/${item.params.slug}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    params.push({
                        category: item.params.category,
                        subcategory: item.params.slug,
                        articleParams: [] // Pre-render the hub
                    });
                }
            }
        } catch (e) {
            console.error("Error parsing manifest", e);
        }
    }

    const { SEO_CATEGORIES } = await import('@/lib/seo-keywords');
    for (const [category, keywords] of Object.entries(SEO_CATEGORIES)) {
        for (const keyword of keywords as any[]) {
            const key = `${category}/${keyword.slug}`;
            if (!seen.has(key)) {
                seen.add(key);
                params.push({
                    category: category,
                    subcategory: keyword.slug,
                    articleParams: []
                });
            }
        }
    }

    return params;
}

function getTopicData(category: string, subcategory: string) {
    const filePath = path.join(CACHE_DIR, category, `${subcategory}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: categoryParam, subcategory, articleParams } = await params;

    // If we are on a deep article, we can't easily generate strict metadata on the server in "export" mode
    // without pre-rendering Every article. So we return the Topic metadata as a fallback or a generic news title.
    if (articleParams && articleParams.length > 0) {
        return {
            title: 'News | Headlined',
            robots: { index: true, follow: true }
        };
    }

    const category = categoryParam as CategoryId;
    const seo = getSeoMetadata(category, subcategory);

    return {
        title: seo.title,
        description: seo.description,
        openGraph: {
            title: seo.title,
            description: seo.description,
            type: 'website',
        },
        alternates: {
            canonical: `https://headlined.app/news/${category}/${subcategory}`
        },
        keywords: seo.aliases
    };
}

import { ArticleOverlay } from './article-overlay';

export default async function NewsCatchAllPage({ params }: Props) {
    const { category: categoryParam, subcategory, articleParams } = await params;
    const category = categoryParam as CategoryId;

    const isArticleView = articleParams && articleParams.length >= 4;
    const [year, month, day, slug] = isArticleView ? articleParams : [null, null, null, null];
    const date = isArticleView ? `${year}-${month}-${day}` : null;

    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <main className="h-screen w-full bg-background overflow-hidden relative">
                {/* 
                    Always render the Hub Feed. 
                    This ensures that if the article is closed, the user is back at the hub.
                    It also prevents 404/blank screen issues on direct navigation.
                */}
                <SeoFeed
                    category={category}
                    subcategory={subcategory}
                    initialPosts={[]}
                />

                {/* Overlaid Article View - Handled by a client-side wrapper to ensure reliability and no hydration mismatch */}
                <ArticleOverlay date={date} slug={slug} />
            </main>
        </Suspense>
    );
}
