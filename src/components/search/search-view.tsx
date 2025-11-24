"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchInput } from './search-input';
import { getFilteredPosts } from '@/lib/client-posts';
import { Post } from '@/types';
import { PostView } from '@/components/post-view';
import { checkLicenseStatus } from '@/lib/license-manager';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { PremiumModal } from '@/components/support/premium-modal';
import { PostPageLoadingSkeleton } from '@/components/post-page-loading-skeleton';

export function SearchView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get('q') || '';
    const topic = searchParams.get('topic') || undefined;
    const interest = searchParams.get('interest') || undefined;

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const [results, premiumStatus] = await Promise.all([
                getFilteredPosts({ search_query: q, topic_name: topic, interest_name: interest }),
                checkLicenseStatus()
            ]);
            setPosts(results);
            setIsPremium(premiumStatus);
            setLoading(false);
        };

        fetchResults();
    }, [q, topic, interest]);

    const handleSearch = (query: string, filters: { type: 'all' | 'topic' | 'interest'; value?: string }) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (filters.type !== 'all' && filters.value) {
            params.set(filters.type, filters.value);
        }
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
                <SearchInput initialQuery={q} onSearch={handleSearch} />
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <PostPageLoadingSkeleton />
                ) : (
                    <>
                        {/* Banner for Premium Subscription to Search Results */}
                        {!isPremium && (
                            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/20 rounded-full text-primary">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Save Your Search</h3>
                                        <p className="text-sm text-muted-foreground">Premium members can add custom searches to their dashboard.</p>
                                    </div>
                                </div>
                                <Button onClick={() => setShowPremiumModal(true)} className="whitespace-nowrap">
                                    Unlock Premium
                                </Button>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {posts.length} Results {q && `for "${q}"`}
                            </h2>

                            {posts.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    <p>No results found. Try different keywords or filters.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {posts.map(post => (
                                        <div key={post.slug} className="h-[400px]">
                                            <PostView
                                                post={post}
                                                isActive={true}
                                                isLocked={!isPremium}
                                                onUnlockRequest={() => setShowPremiumModal(true)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        </div>
    );
}
