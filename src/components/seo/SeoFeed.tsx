"use client";

import { useEffect, useState } from 'react';
import { Post } from '@/types'; // Ensure types match or adapt
import { PostCard } from '@/components/post-card';  // Assuming this exists from /today view
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
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Hydrate/Refresh from CDN to get the absolute latest if build is stale
        const fetchFreshData = async () => {
            try {
                const res = await fetch(`${SEO_DATA_URL}/data/${category}/${slug}.json`);
                if (res.ok) {
                    const freshData: ScraperPost[] = await res.json();

                    // Simple logic: If fresh data has more recent items, update.
                    // Or just replacing for simplicity as CDN is source of truth.
                    // We check if the top item is different to avoid flickering?
                    if (freshData.length > 0 && freshData[0].link !== posts[0]?.link) {
                        setPosts(freshData);
                    }
                }
            } catch (e) {
                // Fail silently, fall back to static data
                console.warn("Could not fetch fresh SEO data", e);
            }
        };

        fetchFreshData();
    }, [category, slug]);

    // Map ScraperPost to the 'Post' type required by PostCard 
    // We might need to adapt the fields. PostCard usually expects a 'Post' object.
    // Let's create a mapper function or assume PostCard can handle it.
    // For this 'Headlined' app, I'll need to double check PostCard props.
    // I will inspect /today implementation details later if needed.
    // For now, I'll map to a generic "Post-like" structure.

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                    <div key={post.link} className='flex flex-col h-full'>
                        {/* We recycle the existing PostCard or create a simplified version if dependencies are complex */}
                        <div className="border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                            {post.thumbnail_url && (
                                <div className="aspect-video w-full overflow-hidden">
                                    <img
                                        src={post.thumbnail_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="p-4 flex flex-col flex-1">
                                <span className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                    {post.topic || category}
                                </span>
                                <h2 className="text-lg font-bold leading-tight mb-2 hover:underline">
                                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                                        {post.title}
                                    </a>
                                </h2>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                                    {post.description}
                                </p>
                                <div className="text-xs text-muted-foreground mt-auto pt-4 border-t">
                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
