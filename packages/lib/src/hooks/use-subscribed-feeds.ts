import { useState, useEffect } from 'react';
import { getSubscribedTopics, getSubscribedInterests, subscribeToFeed, unsubscribeFromFeed } from '../utils/local-storage';
import type { Topic, Interest } from '@/types';

export const useSubscribedFeeds = () => {
    const [subscribedTopics, setSubscribedTopics] = useState<Topic[]>([]);
    const [subscribedInterests, setSubscribedInterests] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);

    const updateFeeds = () => {
        setSubscribedTopics(getSubscribedTopics());
        setSubscribedInterests(getSubscribedInterests());
        setLoading(false);
    };

    useEffect(() => {
        // Initial load
        updateFeeds();

        // Listen for changes in local storage from other tabs/windows
        window.addEventListener('storage', updateFeeds);

        // Clean up the event listener
        return () => {
            window.removeEventListener('storage', updateFeeds);
        };
    }, []);

    // Also listen to a custom event for changes within the same tab/window
    // This is useful if the subscribe/unsubscribe functions don't trigger the 'storage' event
    // on the same window, or if we want more granular control.
    useEffect(() => {
        const handleFeedChange = () => {
            updateFeeds();
        };

        window.addEventListener('feedChange', handleFeedChange);

        return () => {
            window.removeEventListener('feedChange', handleFeedChange);
        };
    }, []);

    const subscribe = (feed: Topic | Interest, type: 'topic' | 'interest') => {
        subscribeToFeed(feed, type);
        // Manually trigger an update or a custom event to ensure immediate re-render
        window.dispatchEvent(new Event('feedChange'));
    };

    const unsubscribe = (feedName: string, type: 'topic' | 'interest') => {
        unsubscribeFromFeed(feedName, type);
        // Manually trigger an update or a custom event to ensure immediate re-render
        window.dispatchEvent(new Event('feedChange'));
    };

    return { subscribedTopics, subscribedInterests, subscribe, unsubscribe, loading };
};
