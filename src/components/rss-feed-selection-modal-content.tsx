"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getFeedCategories, getRssFeeds } from "@/data/rss-feeds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RssFeed } from "@/types";
import Image from "next/image";
import { TopicSelector } from "@/components/topic-selector";
import { Plus, Check } from "lucide-react"; // Import icons

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
    onSubscribeToggle: (feed: RssFeed) => void; // New prop for subscribe/unsubscribe
    subscribedFeedIds: string[]; // New prop to pass subscribed feed IDs
}

export default function RssFeedSelectionModalContent({ onFeedSelect, onSubscribeToggle, subscribedFeedIds }: RssFeedSelectionModalContentProps) {
    const [categories, setCategories] = useState<string[]>([]);
    const [feeds, setFeeds] = useState<RssFeed[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const hasFetched = useRef(false);
    const [displayLimit, setDisplayLimit] = useState(20); // Initial display limit

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        async function fetchData() {
            const [fetchedCategories, fetchedFeeds] = await Promise.all([
                getFeedCategories(),
                getRssFeeds()
            ]);
            
            const allCategories = ["All", ...fetchedCategories];
            setCategories(allCategories);
            setFeeds(fetchedFeeds);
            // Set "All" as the default selected category
            setSelectedCategory("All");
        }
        fetchData();
    }, []);

    const handleSourceSelection = (feedUrl: string) => {
        onFeedSelect(feedUrl);
    };

    const handleAllCategorySelection = (category: string) => {
        onFeedSelect(`category:${category}`); // Special string to indicate category selection
    };

    const filteredFeeds = selectedCategory === "All"
        ? feeds
        : feeds.filter(feed => feed.category === selectedCategory);

    const feedsToDisplay = filteredFeeds.slice(0, displayLimit);

    const handleLoadMore = () => {
        setDisplayLimit(prevLimit => prevLimit + 20); // Load 20 more feeds
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold my-8 text-center">RSS Feed Explorer</h1>

            {/* Top Floating Category Selector */}
            <div className="flex justify-center mb-8">
                <TopicSelector
                    onTopicSelect={(selectedTopics) => {
                        setSelectedCategory(selectedTopics.length > 0 ? selectedTopics[0] : null);
                        setDisplayLimit(20); // Reset limit on category change
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
                            <CardTitle className="text-center text-lg font-medium">
                                {selectedCategory === "All" ? "All Feeds" : `All ${selectedCategory} Feeds`}
                            </CardTitle>
                        </CardContent>
                    </Card>
                )}
                {feedsToDisplay.map((feed) => {
                    const isSubscribed = subscribedFeedIds.includes(feed.url);
                    return (
                        <Card
                            key={feed.url}
                            className="relative cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 aspect-[4/3]"
                            onClick={() => handleSourceSelection(feed.url)}
                            style={{ backgroundColor: feed.cardBackgroundColor || undefined }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full bg-background shadow-md z-10"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    onSubscribeToggle(feed);
                                }}
                            >
                                {isSubscribed ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Plus className="h-4 w-4 text-primary" />
                                )}
                            </Button>
                            <CardContent className="p-0 flex flex-col h-full">
                                <div className="relative flex-grow grid place-items-center p-6">
                                    <FaviconImage fallbackIconUrl={feed.fallbackIconUrl} alt={`${feed.name} logo`} />
                                </div>
                                <div className="p-3 border-t">
                                    <CardTitle className="text-center text-sm font-medium truncate" style={{ color: feed.labelFontColor || undefined }}>{feed.name}</CardTitle>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {displayLimit < filteredFeeds.length && (
                <div className="flex justify-center mt-8">
                    <Button onClick={handleLoadMore} variant="outline">
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
}
