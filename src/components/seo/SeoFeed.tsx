"use client";

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { PostCarousel } from '@/components/post-carousel';
import { OnboardingProvider } from '@/context/onboarding-provider';
import { SEO_DATA_URL } from '@/lib/seo-config';

// Define the shape of data from our scraper
interface ScraperPost {
    slug: string;
    title: string;
    description: string;
    link: string;
    thumbnail_url: string;
    created_at: string;
    topic: string;
}

interface SeoFeedProps {
    category: string;
    slug: string;
    initialPosts: ScraperPost[];
}

export function SeoFeed({ category, slug, initialPosts }: SeoFeedProps) {
    const [posts, setPosts] = useState<ScraperPost[]>(initialPosts);

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

    // Map to 'Post' type
    const mappedPosts: Post[] = posts.map(p => ({
        slug: p.slug || 'unknown',
        title: p.title,
        description: p.description,
        link: p.link,
        thumbnail_url: p.thumbnail_url,
        topic: p.topic || category,
        summaries: [], // SEO posts don't have generated summaries yet
        date: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    return (
        <div className="h-full w-full">
            <OnboardingProvider>
                <PostCarousel
                    posts={mappedPosts}
                    topicName={category}
                    // Ensure checking for premium status isn't checking 'undefined'
                    isPremium={false} // Start as false, let it hydrate
                />
            </OnboardingProvider>
        </div>
    );
}
