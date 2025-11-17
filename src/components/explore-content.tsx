"use client";

import React, { FC, useEffect, useState } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Topic, Interest } from "@/types";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { checkIfFeedHasPosts } from "@/lib/client-posts";

type ExploreContentProps = {
  isLoading?: boolean;
};

export const ExploreContent: FC<ExploreContentProps> = ({ isLoading }) => {
  const { subscribedTopics, subscribedInterests, subscribe, unsubscribe } = useSubscribedFeeds();
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  useEffect(() => {
    const filterFeeds = async () => {
      setLoadingFeeds(true);
      const filteredTopics: Topic[] = [];
      for (const topic of topicsData) {
        const hasPosts = await checkIfFeedHasPosts("topic", topic.name);
        if (hasPosts) {
          filteredTopics.push(topic as Topic);
        }
      }
      setAvailableTopics(filteredTopics);

      const filteredInterests: Interest[] = [];
      for (const interest of interestsData) {
        const hasPosts = await checkIfFeedHasPosts("interest", interest.name);
        if (hasPosts) {
          filteredInterests.push(interest as Interest);
        }
      }
      setAvailableInterests(filteredInterests);
      setLoadingFeeds(false);
    };

    filterFeeds();
  }, []);

  const handleTopicSubscribe = (topic: Topic) => {
    const isSubscribed = subscribedTopics.some(t => t.name === topic.name);
    if (isSubscribed) {
      unsubscribe(topic.name, "topic");
    } else {
      subscribe(topic, "topic");
    }
  };

  const handleInterestSubscribe = (interest: Interest) => {
    const isSubscribed = subscribedInterests.some(i => i.name === interest.name);
    if (isSubscribed) {
      unsubscribe(interest.name, "interest");
    } else {
      subscribe(interest, "interest");
    }
  };

  if (isLoading || loadingFeeds) {
    return <PostPageLoadingSkeleton />;
  }

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar max-w-4xl mx-auto">
      <h1 className="font-headline text-4xl font-bold text-center mt-16 mb-8">Explore New Content</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTopics.map((topic) => {
            const isSubscribed = subscribedTopics.some(t => t.name === topic.name);
            return (
              <Card key={topic.name} className="flex flex-col items-center justify-between p-4">
                <DynamicIcon name={topic.icon} className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-center text-lg font-medium truncate mb-2">
                  {topic.name}
                </CardTitle>
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  onClick={() => handleTopicSubscribe(topic as Topic)}
                  className="w-full rounded-lg"
                >
                  {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Interests</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableInterests.map((interest) => {
            const isSubscribed = subscribedInterests.some(i => i.name === interest.name);
            return (
              <Card key={interest.name} className="flex flex-col items-center justify-between p-4">
                <DynamicIcon name={interest.icon} className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-center text-lg font-lg font-medium truncate mb-2">
                  {interest.name}
                </CardTitle>
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  onClick={() => handleInterestSubscribe(interest as Interest)}
                  className="w-full rounded-lg"
                >
                  {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};