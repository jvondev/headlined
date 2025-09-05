
"use client";

import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'subscribedRssFeeds';

export function useSubscribedFeeds() {
    const [subscribedFeeds, setSubscribedFeeds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedFeeds = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedFeeds) {
                setSubscribedFeeds(JSON.parse(storedFeeds));
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
