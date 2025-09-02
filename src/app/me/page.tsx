
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface SubscribedFeed {
  id: string;
  name: string;
}

export default function MePage() {
  const [subscribedFeeds, setSubscribedFeeds] = useState<SubscribedFeed[]>([]);

  useEffect(() => {
    // Load subscribed feeds from local storage
    const storedFeeds = localStorage.getItem("subscribedFeeds");
    if (storedFeeds) {
      setSubscribedFeeds(JSON.parse(storedFeeds));
    }
  }, []);

  const handleUnsubscribe = (id: string) => {
    const updatedFeeds = subscribedFeeds.filter(feed => feed.id !== id);
    setSubscribedFeeds(updatedFeeds);
    localStorage.setItem("subscribedFeeds", JSON.stringify(updatedFeeds));
  };

  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">My Subscriptions</h1>
      {
        subscribedFeeds.length === 0 ? (
          <p className="text-muted-foreground">You haven't subscribed to any feeds yet. Go to "Explore" to find some!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscribedFeeds.map((feed) => (
              <Card key={feed.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {feed.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleUnsubscribe(feed.id)}>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">ID: {feed.id}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}
