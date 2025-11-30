'use client';

import { getPostsBySlugs } from "@/lib/client-posts";
import { SavedPageHeader } from "@/components/saved/saved-page-header";
import SavedPageClient from "./client";
import type { SavedItem, CompendiaPost } from "@/types";
import { useEffect, useState } from 'react';

// Client-side function to get saved items from localStorage
function getSavedItemsClient(): SavedItem[] {
    if (typeof window === 'undefined') return [];
    const savedItemsCookie = localStorage.getItem('savedItems');
    if (savedItemsCookie) {
        try {
            return JSON.parse(savedItemsCookie);
        } catch (e) {
            console.error('Error parsing saved items from localStorage:', e);
            return [];
        }
    }
    return [];
}

export default function SavedPage() {
    const [postsWithSavedData, setPostsWithSavedData] = useState<Array<CompendiaPost & { savedItem: SavedItem }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSavedPosts() {
            setLoading(true);
            const savedItems = getSavedItemsClient();
            // Use id instead of slug for CompendiaPosts
            const postIds = savedItems.map(item => item.slug); // slug holds the id for compendia
            const posts = await getPostsBySlugs(postIds);

            const combinedData = posts.map(post => {
                const savedItem = savedItems.find(item => item.slug === post.id)!;
                return { ...post, savedItem };
            });
            setPostsWithSavedData(combinedData);
            setLoading(false);
        }
        fetchSavedPosts();
    }, []);

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <p>Loading saved posts...</p>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <SavedPageHeader title="Saved Items" />

            <main className="container mx-auto px-4 py-8 pt-24">
                <SavedPageClient initialPosts={postsWithSavedData} />
            </main>
        </div>
    );
}
