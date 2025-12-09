"use client";

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { PostCarousel } from '@/components/post-carousel';
import { OnboardingProvider } from '@/context/onboarding-provider';
import { SEO_DATA_URL } from '@/lib/seo-config';
import { checkLicenseStatus } from "@/lib/license-manager";
// Define the shape of data from our scraper
interface ScraperPost {
    slug: string;
    title: string;
    description: string;
    link: string;
    thumbnail_url: string;
    created_at: string;
    topic: string;
    // Support multiple casing variants from different scrapers
    full_text?: string;
    fullText?: string;
    content?: string;
    min?: number;
    readingTime?: number;
}

interface SeoFeedProps {
    category: string;
    slug: string;
    initialPosts: ScraperPost[];
}

export function SeoFeed({ category, slug, initialPosts }: SeoFeedProps) {
    const [posts, setPosts] = useState<ScraperPost[]>(initialPosts);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    useEffect(() => {
        // Hydrate/Refresh from CDN to get the absolute latest if build is stale
        const fetchFreshData = async () => {
            try {
                const res = await fetch(`${SEO_DATA_URL}/data/${category}/${slug}.json`);
                if (res.ok) {
                    const freshData: ScraperPost[] = await res.json();
                    if (freshData.length > 0 && freshData[0].link !== posts[0]?.link) {
                        setPosts(freshData);
                    }
                }
            } catch (e) {
                console.warn("Could not fetch fresh SEO data", e);
            }
        };

        fetchFreshData();
    }, [category, slug]);

    // Ad Injection Logic
    const createNativeAdPost = (): Post => {
        return {
            slug: `ad-native-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Sponsored Content',
            description: 'Sponsored',
            link: '#',
            thumbnail_url: null,
            topic: 'Sponsored',
            summaries: [],
            date: new Date().toISOString().split('T')[0]
        };
    };

    // Map to 'Post' type
    const mappedPosts: Post[] = posts.map(p => ({
        slug: p.slug || 'unknown',
        title: p.title,
        description: p.description,
        link: p.link,
        thumbnail_url: p.thumbnail_url,
        topic: p.topic || category,
        summaries: [], // SEO posts don't have generated summaries yet
        date: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fullText: p.fullText || p.full_text || p.content || null,
        readingTime: p.readingTime || p.min
    }));

    // Inject Ads
    const postsWithAds = (() => {
        if (isPremium) return mappedPosts;

        const withAds: Post[] = [];
        let nextAdDistance = Math.floor(Math.random() * 5) + 4;

        for (const post of mappedPosts) {
            withAds.push(post);
            nextAdDistance -= 1;

            if (nextAdDistance <= 0) {
                withAds.push(createNativeAdPost());
                nextAdDistance = Math.floor(Math.random() * 5) + 4;
            }
        }
        return withAds;
    })();

    return (
        <div className="h-full w-full">
            <OnboardingProvider>
                <PostCarousel
                    posts={postsWithAds}
                    topicName={category}
                    isPremium={isPremium}
                />
            </OnboardingProvider>
        </div>
    );
}
