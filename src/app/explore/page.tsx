"use client";

import { useEffect, useState } from "react";
import RssFeedSelectionModalContent from "@/components/rss-feed-selection-modal-content";
import { RssFeed } from "@/types"; // Import RssFeed type
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface SubscribedFeed {
  id: string;
  name: string;
}

export default function ExplorePage() {
  const [subscribedFeeds, setSubscribedFeeds] = useState<SubscribedFeed[]>([]);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    // Load subscribed feeds from local storage on component mount
    const storedFeeds = localStorage.getItem("subscribedFeeds");
    if (storedFeeds) {
      setSubscribedFeeds(JSON.parse(storedFeeds));
    }
  }, []);

  const handleFeedSelect = (selection: string) => {
    // This function is for selecting a feed to view, not for subscribing/unsubscribing
    // You might want to navigate to a feed display page here
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