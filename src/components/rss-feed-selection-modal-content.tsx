"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getFeedCategories, getRssFeeds } from "@/data/rss-feeds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RssFeed } from "@/types";
import Image from "next/image";
import { TopicSelector } from "@/components/topic-selector";

// Helper function to construct the favicon URL
const getFaviconUrl = (feedUrl: string) => {
    try {
        const domain = new URL(feedUrl).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (error) {
        console.error("Invalid URL for favicon:", feedUrl);
        return "/favicon.ico"; // Fallback icon
    }
};

// A new component to handle image fallbacks gracefully
const FaviconImage = ({ fallbackIconUrl, alt }: { fallbackIconUrl?: string, alt: string }) => {
    const [src, setSrc] = useState(fallbackIconUrl || "/favicon.ico");

    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-contain w-full h-full"
            onError={() => setSrc("/favicon.ico")} // Set fallback to final default
        />
    );
};

interface RssFeedSelectionModalContentProps {
    onFeedSelect: (feedUrl: string) => void;
}

export default function RssFeedSelectionModalContent({ onFeedSelect }: RssFeedSelectionModalContentProps) {
    const [categories, setCategories] = useState<string[]>([]);
    const [feeds, setFeeds] = useState<RssFeed[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        async function fetchData() {
            const [fetchedCategories, fetchedFeeds] = await Promise.all([
                getFeedCategories(),
                getRssFeeds()
            ]);
            setCategories(fetchedCategories);
            setFeeds(fetchedFeeds);
            // Set a default category
            if (fetchedCategories.length > 0) {
                setSelectedCategory(fetchedCategories[0]);
            }
        }
        fetchData();
    }, []);

    const handleSourceSelection = (feedUrl: string) => {
        onFeedSelect(feedUrl);
    };

    const handleAllCategorySelection = (category: string) => {
        onFeedSelect(`category:${category}`); // Special string to indicate category selection
    };

    const filteredFeeds = selectedCategory
        ? feeds.filter(feed => feed.category === selectedCategory)
        : [];

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold my-8 text-center">RSS Feed Explorer</h1>

            {/* Top Floating Category Selector */}
            <div className="flex justify-center mb-8">
                <TopicSelector
                    onTopicSelect={(selectedTopics) => {
                        setSelectedCategory(selectedTopics.length > 0 ? selectedTopics[0] : null);
                    }}
                    initialSelectedTopics={selectedCategory ? [selectedCategory] : []}
                />
            </div>

            {/* Main Content Area */}
            <h2 className="text-xl font-semibold mb-4">Sources in {selectedCategory}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {selectedCategory && (
                    <Card
                        className="cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 aspect-[4/3]"
                        onClick={() => handleAllCategorySelection(selectedCategory)}
                    >
                        <CardContent className="p-0 flex flex-col h-full items-center justify-center">
                            <CardTitle className="text-center text-lg font-medium">All {selectedCategory} Feeds</CardTitle>
                        </CardContent>
                    </Card>
                )}
                {filteredFeeds.map((feed) => (
                        <Card
                            key={feed.url}
                            className="cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 aspect-[4/3]"
                            onClick={() => handleSourceSelection(feed.url)}
                            style={{ backgroundColor: feed.cardBackgroundColor || undefined }}
                        >
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="relative flex-grow grid place-items-center p-6">
                                    <FaviconImage fallbackIconUrl={feed.fallbackIconUrl} alt={`${feed.name} logo`} />
                                </div>
                                <div className="p-3 border-t">
                                    <CardTitle className="text-center text-sm font-medium truncate" style={{ color: feed.labelFontColor || undefined }}>{feed.name}</CardTitle>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
}
