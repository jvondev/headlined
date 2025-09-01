'use client';

import { useEffect, useState } from 'react';
import { getRssFeeds } from '@/data/rss-feeds';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import RssFeedSelectionModalContent from '@/components/rss-feed-selection-modal-content';
import { useRouter } from 'next/navigation';

export default function RssSelectionPage() {
    
    const router = useRouter();
    

    
    
    
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true); // Always open modal on this page
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!isModalOpen) {
            // Redirect to BBC News if modal closes
            router.push(`/rss/feed`);
        }
    }, [isModalOpen, router]);

    

    const handleFeedSelect = async (selection: string) => {
        setIsModalOpen(false);
        setIsLoading(true);

        if (selection.startsWith('category:')) {
            const category = selection.replace('category:', '');
            const allFeeds = await getRssFeeds();
            const feedsForCategory = allFeeds.filter(feed => feed.category === category);
            
            if (feedsForCategory.length > 0) {
                const firstFeedUrl = feedsForCategory[0].url;
                router.push(`/rss/feed?source=${encodeURIComponent(firstFeedUrl)}`);
            } else {
                router.push(`/rss`); // Go back to modal page
            }
        } else {
            // This is a direct feed URL
            router.push(`/rss/feed?source=${encodeURIComponent(selection)}`);
        }
        setIsLoading(false);
    };

    return (
        <>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    {/* You can add a button here to re-open the modal if needed */}
                    { !isModalOpen && <button className="hidden">Open RSS Feed Selector</button>}
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Select RSS Feed</DialogTitle>
                    <RssFeedSelectionModalContent onFeedSelect={handleFeedSelect} />
                </DialogContent>
            </Dialog>

            {/* This page only shows the modal, not the insights directly */}
            {/* The insights will be shown on /rss/feed */}
        </>
    );
}
