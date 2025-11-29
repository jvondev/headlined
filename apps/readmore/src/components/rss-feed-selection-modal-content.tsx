"use client";

import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
// import { getFeedCategories, getRssFeeds } from "@/data/rss-feeds"; // Data now comes from props
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RssFeed } from "@/types";

import { TopicSelector } from "@/components/topic-selector";
import { Plus, Check } from "lucide-react"; // Import icons
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";

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
        <img
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-contain"
            onError={() => setSrc("/favicon.ico")} // Set fallback to final default
            loading="lazy"
        />
    );
};

interface RssFeedSelectionModalContentProps {
    availableFeeds: RssFeed[]; // Added this prop
    categories: string[]; // Added this prop
}

export default function RssFeedSelectionModalContent({ availableFeeds, categories }: RssFeedSelectionModalContentProps) {
    const [displayLimit, setDisplayLimit] = useState(20); // Initial display limit
    const { subscribedFeeds, subscribeFeed, unsubscribeFeed, isSubscribed, isLoaded } = useSubscribedFeeds();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { toast } = useToast();
    const prevSubscribedFeedsRef = useRef<string[]>([]);
    useEffect(() => {
        if (!isLoaded) return;

        const prevFeeds = prevSubscribedFeedsRef.current;
        // Only show toast if there was a previous state, indicating a change, not initial load
        if (prevFeeds.length > 0) {
            if (subscribedFeeds.length > prevFeeds.length) {
                toast({ title: "Subscribed!", description: "You have subscribed to a new feed." });
            } else if (subscribedFeeds.length < prevFeeds.length) {
                toast({ title: "Unsubscribed!", description: "You have unsubscribed from a feed." });
            }
        }
        prevSubscribedFeedsRef.current = subscribedFeeds;
    }, [subscribedFeeds, toast, isLoaded]);

    useEffect(() => {
        setSelectedCategory("All");
    }, [availableFeeds, categories]);

    

    const filteredFeeds = selectedCategory === "All"
        ? availableFeeds
        : availableFeeds.filter(feed => feed.category === selectedCategory);

    const feedsToDisplay = filteredFeeds.slice(0, displayLimit);

    const handleLoadMore = () => {
        setDisplayLimit(prevLimit => prevLimit + 20); // Load 20 more feeds
    };

    const formattedCategories = useMemo(() => {
        const allCategory = { name: "All", description: "View all available feeds." };
        const otherCategories = categories.map(cat => ({ name: cat, description: `Feeds related to ${cat}` }));
        return [allCategory, ...otherCategories];
    }, [categories]);

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
                    topics={formattedCategories}
                />
            </div>

            {/* Main Content Area */}
            <h2 className="text-xl font-semibold mb-4">Sources in {selectedCategory}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {selectedCategory && (
                    <Card
                        className="cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 aspect-[4/3]"
                    >
                        <CardContent className="p-0 flex flex-col h-full items-center justify-center">
                            <CardTitle className="text-center text-lg font-medium">
                                {selectedCategory === "All" ? "All Feeds" : `All ${selectedCategory} Feeds`}
                            </CardTitle>
                        </CardContent>
                    </Card>
                )}
                {feedsToDisplay.map((feed) => {
                    const isFeedSubscribed = isSubscribed(feed.url);
                    return (
                        <Card
                            key={feed.url}
                            className="relative cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 aspect-[4/3]"
                            style={{ backgroundColor: feed.cardBackgroundColor || undefined }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full bg-background shadow-md z-10"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    if (isFeedSubscribed) {
                                        unsubscribeFeed(feed.url);
                                    } else {
                                        subscribeFeed(feed.url);
                                    }
                                }}
                            >
                                {isFeedSubscribed ? (
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
