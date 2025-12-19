"use client";

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { PostCarousel } from '@/components/post-carousel';
import { OnboardingProvider } from '@/context/onboarding-provider';
import { checkLicenseStatus } from "@/lib/license-manager";
import { getSeoMetadata, CategoryId, SEO_DATA_URL } from '@/lib/seo-config';
import { SeoCover } from './seo-cover';

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
    keywords?: string[];
}

interface SeoFeedProps {
    category: string;
    subcategory: string;
    initialPosts: ScraperPost[];
}

export function SeoFeed({ category, subcategory, initialPosts }: SeoFeedProps) {
    const [posts, setPosts] = useState<ScraperPost[]>(initialPosts);
    const [isPremium, setIsPremium] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    const seo = getSeoMetadata(category as CategoryId, subcategory);

    // Map to 'Post' type (without ads - same on server and client)
    const mappedPosts: Post[] = posts.map(p => ({
        slug: p.slug || 'unknown',
        title: p.title,
        description: p.description,
        link: p.link,
        thumbnail_url: p.thumbnail_url,
        topic: p.topic || subcategory, // Use subcategory as primary topic for finding
        summaries: [], // SEO posts don't have generated summaries yet
        date: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fullText: p.fullText || p.full_text || p.content || null,
        readingTime: p.readingTime || p.min,
        keywords: p.keywords || []
    }));

    // Mark as mounted after hydration to avoid SSR mismatch
    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    useEffect(() => {
        // Hydrate/Refresh from CDN to get the absolute latest if build is stale
        const fetchFreshData = async () => {
            try {
                // 1. Try local cache first (Instant)
                const { getPostsByTopic, addPosts, getLastFetchTime, setLastFetchTime } = await import('@/lib/indexeddb');

                // CRITICAL: Query by subcategory because SEO data is sharded by it
                const cached = await getPostsByTopic(subcategory);
                const cacheKey = `topic:${category}/${subcategory}`;
                const lastFetch = await getLastFetchTime(cacheKey);
                const cacheDuration = 6 * 60 * 60 * 1000; // 6 Hours

                if (cached && cached.length > 0) {
                    setPosts(cached as unknown as ScraperPost[]);
                }

                // 2. Check if we really need to fetch network?
                const now = Date.now();
                if (lastFetch && (now - lastFetch < cacheDuration)) {
                    // Only skip if we actually HAVE the data in IndexedDB
                    if (cached && cached.length > 0) {
                        console.log(`Cache valid for ${cacheKey}, skipping network.`);
                        return;
                    }
                }

                // 3. Fetch fresh from Network (Background)
                const res = await fetch(`${SEO_DATA_URL}/data/${category}/${subcategory}.json`);
                if (res.ok) {
                    const freshData: ScraperPost[] = await res.json();

                    if (freshData.length > 0) {
                        // Check if we need to update
                        const freshLink = freshData[0].link;
                        const validCached = cached && cached.length > 0;
                        const isDifferent = !validCached || (cached[0].link !== freshLink);

                        if (isDifferent) {
                            console.log("Updating from network...");
                            setPosts(freshData);

                            // 4. Cache the new data
                            // Map ScraperPost -> Post for DB
                            const postsToSave: Post[] = freshData.map(p => ({
                                slug: p.slug || 'unknown',
                                title: p.title,
                                description: p.description,
                                link: p.link,
                                thumbnail_url: p.thumbnail_url,
                                topic: subcategory, // Tag with subcategory for target retrieval
                                summaries: [],
                                date: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                fullText: p.fullText || p.full_text || p.content || null,
                                readingTime: p.readingTime || p.min,
                                keywords: p.keywords || []
                            }));
                            await addPosts(postsToSave);
                            await setLastFetchTime(cacheKey, now);
                        } else {
                            // Data is same, but let's update timestamp
                            await setLastFetchTime(cacheKey, now);
                        }
                    }
                }
            } catch (e) {
                console.warn("Could not fetch fresh SEO data", e);
            }
        };

        fetchFreshData();
    }, [category, subcategory]);

    // Ad Injection Logic - ONLY after hydration to avoid SSR mismatch
    const postsWithAds = (() => {
        // Don't inject ads until mounted (client-side only)
        if (!hasMounted || isPremium) return mappedPosts;

        const createNativeAdPost = (): Post => ({
            slug: `ad-native-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Sponsored Content',
            description: 'Sponsored',
            link: '#',
            thumbnail_url: null,
            topic: 'Sponsored',
            summaries: [],
            date: new Date().toISOString().split('T')[0]
        });

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

    // If we're not mounted yet OR have no posts yet, show a clean state or skeleton 
    // to avoid the "No Posts Found" flash during network fetch
    if (!hasMounted || (posts.length === 0)) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="h-4 w-32 bg-muted rounded" />
                </div>
            </div>
        );
    }

    const seoCoverSlide = (
        <SeoCover
            category={category}
            subcategory={subcategory}
            title={seo.h1}
            intro={seo.intro}
            richTitle={seo.richTitle}
            aliases={seo.aliases}
            faqs={seo.faqs}
            posts={mappedPosts}
            relatedTopics={[]}
        />
    );

    return (
        <div className="h-full w-full">
            <OnboardingProvider>
                <PostCarousel
                    posts={postsWithAds}
                    topicName={category}
                    isPremium={isPremium}
                    topComponent={seoCoverSlide}
                    topComponentPadding={false}
                />
            </OnboardingProvider>
        </div>
    );
}

