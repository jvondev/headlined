"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchInput } from './search-input';
import { getFilteredPosts } from '@/lib/client-posts';
import { Post } from '@/types';
import { PostView } from '@/components/post-view';

import { Button } from '@/components/ui/button';
import { PostCarousel } from '@/components/post-carousel';
import { ArrowLeft } from 'lucide-react';

import { OnboardingProvider } from "@/context/onboarding-provider";

export function SearchView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get('q') || '';
    const topic = searchParams.get('topic') || undefined;
    const interest = searchParams.get('interest') || undefined;

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            const results = await getFilteredPosts({ search_query: q, topic_name: topic, interest_name: interest });
            setPosts(results);
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
        <OnboardingProvider>
            <div className="h-screen bg-background flex flex-col overflow-hidden">
                <div className="flex-none z-40 bg-background/80 backdrop-blur-md border-b border-border/50 p-4 flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex-1">
                            <SearchInput
                                initialQuery={q}
                                onSearch={handleSearch}
                                isPremium={true}
                                showSubscribeButton={true}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <PostCarousel
                            posts={posts}
                            searchQuery={q}
                            topicName={topic}
                            shouldFetchPaginatedPosts={!posts}
                            isPremium={true}
                        />
                    )}
                </div>

            </div>
        </OnboardingProvider>
    );
}
