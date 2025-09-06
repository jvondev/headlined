"use client";

import { useEffect, useState } from "react";
import RssFeedSelectionModalContent from "@/components/rss-feed-selection-modal-content";
import { RssFeed } from "@/types"; // Import RssFeed type
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { getRssFeeds } from "@/data/rss-feeds"; // Import getRssFeeds



export default function ExplorePage() {
  
  const [availableFeeds, setAvailableFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedAvailableFeeds = await getRssFeeds();
        setAvailableFeeds(fetchedAvailableFeeds);
      } catch (err) {
        console.error("Error fetching feeds:", err);
        setError("Failed to load available feeds. Please try again later.");
        toast({
          title: "Error!",
          description: "Failed to load available feeds. Please check your internet connection.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [toast]);

  

  

  

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

  const categories = Array.from(new Set(availableFeeds.map(feed => feed.category)));

  return (
    <div className="container mx-auto p-4 pt-16">
      <RssFeedSelectionModalContent
        availableFeeds={availableFeeds}
        categories={categories}
      />
    </div>
  );
}
