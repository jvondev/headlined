"use client";

import { useEffect, useState } from "react";
import RssFeedSelectionModalContent from "@/components/rss-feed-selection-modal-content";
import { RssFeed } from "@/types"; // Import RssFeed type
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { getRssFeeds } from "@/data/rss-feeds"; // Import getRssFeeds

interface SubscribedFeed {
  id: string;
  name: string;
}

export default function ExplorePage() {
  const [subscribedFeeds, setSubscribedFeeds] = useState<SubscribedFeed[]>([]);
  const [availableFeeds, setAvailableFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const fetchFeedsAndCleanSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all available RSS feeds
        const fetchedAvailableFeeds = await getRssFeeds();
        setAvailableFeeds(fetchedAvailableFeeds);

        // Load subscribed feeds from local storage
        const storedFeeds = localStorage.getItem("subscribedFeeds");
        let currentSubscribed: SubscribedFeed[] = [];
        if (storedFeeds) {
          currentSubscribed = JSON.parse(storedFeeds);
        }

        // Clean subscribed feeds: keep only those that are still available
        const cleanedSubscribed = currentSubscribed.filter(sub => 
          fetchedAvailableFeeds.some(avail => avail.url === sub.id)
        );

        // If any feeds were removed, update local storage and notify user
        if (cleanedSubscribed.length < currentSubscribed.length) {
          localStorage.setItem("subscribedFeeds", JSON.stringify(cleanedSubscribed));
          toast({
            title: "Subscriptions Cleaned!",
            description: "Some of your subscribed feeds are no longer available and have been removed.",
            variant: "destructive",
          });
        }
        setSubscribedFeeds(cleanedSubscribed);

      } catch (err) {
        console.error("Error fetching feeds or cleaning subscriptions:", err);
        setError("Failed to load available feeds. Please try again later.");
        setTimeout(() => { // Defer toast call
          toast({
            title: "Error!",
            description: "Failed to load available feeds. Please check your internet connection.",
            variant: "destructive",
          });
        }, 0);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedsAndCleanSubscriptions();
  }, []);

  const handleFeedSelect = (selection: string) => {
    // This function is for selecting a feed to view, not for subscribing/unsubscribing
    console.log("Selected feed to view:", selection);
    // Example: router.push(`/rss/feed?source=${encodeURIComponent(selection)}`);
  };

  const handleSubscribeToggle = (feed: RssFeed) => {
    setSubscribedFeeds((prevFeeds) => {
      const isAlreadySubscribed = prevFeeds.some((f) => f.id === feed.url);
      let newSubscribedFeeds: SubscribedFeed[];

      if (isAlreadySubscribed) {
        newSubscribedFeeds = prevFeeds.filter((f) => f.id !== feed.url);
        toast({
          title: "Unsubscribed!",
          description: `You have unsubscribed from ${feed.name}.`,
        });
      } else {
        newSubscribedFeeds = [...prevFeeds, { id: feed.url, name: feed.name }];
        toast({
          title: "Subscribed!",
          description: `You have subscribed to ${feed.name}.`,
        });
      }
      localStorage.setItem("subscribedFeeds", JSON.stringify(newSubscribedFeeds));
      return newSubscribedFeeds;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-16 text-center">
        <p>Loading available feeds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pt-16 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (availableFeeds.length === 0) {
    return (
      <div className="container mx-auto p-4 pt-16 text-center">
        <p className="text-muted-foreground">No feeds available to explore at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-16">
      <RssFeedSelectionModalContent
        onFeedSelect={handleFeedSelect}
        onSubscribeToggle={handleSubscribeToggle}
        subscribedFeedIds={subscribedFeeds.map(f => f.id)}
      />
    </div>
  );
}