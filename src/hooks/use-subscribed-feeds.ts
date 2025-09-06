"use client";



import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'subscribedFeeds';

export function useSubscribedFeeds() {
    const [subscribedFeeds, setSubscribedFeeds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    

    useEffect(() => {
        try {
            const storedFeeds = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedFeeds) {
                const parsedFeeds = JSON.parse(storedFeeds);
                // Check if it's an array of objects (new format) or array of strings (old format)
                if (Array.isArray(parsedFeeds) && parsedFeeds.length > 0 && typeof parsedFeeds[0] === 'object' && parsedFeeds[0] !== null && 'id' in parsedFeeds[0]) {
                    setSubscribedFeeds(parsedFeeds.map((feed: any) => feed.id));
                } else {
                    // Assume it's already an array of strings or empty
                    setSubscribedFeeds(parsedFeeds);
                }
            } else {
                // Default to BBC News if no feeds are subscribed
                setSubscribedFeeds(["https://feeds.bbci.co.uk/news/world/rss.xml"]);
            }
        } catch (error) {
            console.error("Failed to load subscribed feeds from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveToLocalStorage = (feeds: string[]) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(feeds));
        } catch (error) {
            console.error("Failed to save subscribed feeds to localStorage", error);
        }
    };

    const subscribeFeed = useCallback((feedUrl: string) => {
        setSubscribedFeeds(prevFeeds => {
            if (prevFeeds.includes(feedUrl)) {
                return prevFeeds; // Already subscribed
            }
            const newFeeds = [...prevFeeds, feedUrl];
            saveToLocalStorage(newFeeds);
            return newFeeds;
        });
    }, []);

    const unsubscribeFeed = useCallback((feedUrl: string) => {
        setSubscribedFeeds(prevFeeds => {
            const newFeeds = prevFeeds.filter(url => url !== feedUrl);
            saveToLocalStorage(newFeeds);
            return newFeeds;
        });
    }, []);

    const isSubscribed = useCallback((feedUrl: string) => {
        return subscribedFeeds.includes(feedUrl);
    }, [subscribedFeeds]);

    return { subscribedFeeds, subscribeFeed, unsubscribeFeed, isSubscribed, isLoaded };
}