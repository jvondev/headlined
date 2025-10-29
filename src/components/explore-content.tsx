"use client";

import React, { FC, useState, useEffect } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSubscribedTopics, setSubscribedTopics, getSubscribedInterests, setSubscribedInterests } from "@/lib/local-storage";
import type { Topic, Interest } from "@/types";

type ExploreContentProps = {
  isLoading: boolean;
};

export const ExploreContent: FC<ExploreContentProps> = ({ isLoading }) => {
  const [localSubscribedTopics, setLocalSubscribedTopics] = useState<Topic[]>([]);
  const [localSubscribedInterests, setLocalSubscribedInterests] = useState<Interest[]>([]);

  useEffect(() => {
    setLocalSubscribedTopics(getSubscribedTopics());
    setLocalSubscribedInterests(getSubscribedInterests());
  }, []);

  const handleTopicSubscribe = (topic: Topic) => {
    const isSubscribed = localSubscribedTopics.some(t => t.name === topic.name);
    if (isSubscribed) {
      const newSubscribedTopics = localSubscribedTopics.filter(t => t.name !== topic.name);
      setLocalSubscribedTopics(newSubscribedTopics);
      setSubscribedTopics(newSubscribedTopics);
    } else {
      const newSubscribedTopics = [...localSubscribedTopics, topic];
      setLocalSubscribedTopics(newSubscribedTopics);
      setSubscribedTopics(newSubscribedTopics);
    }
  };

  const handleInterestSubscribe = (interest: Interest) => {
    const isSubscribed = localSubscribedInterests.some(i => i.name === interest.name);
    if (isSubscribed) {
      const newSubscribedInterests = localSubscribedInterests.filter(i => i.name !== interest.name);
      setLocalSubscribedInterests(newSubscribedInterests);
      setSubscribedInterests(newSubscribedInterests);
    } else {
      const newSubscribedInterests = [...localSubscribedInterests, interest];
      setLocalSubscribedInterests(newSubscribedInterests);
      setSubscribedInterests(newSubscribedInterests);
    }
  };

  if (isLoading) {
    return <PostPageLoadingSkeleton />;
  }

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar max-w-4xl mx-auto">
      <h1 className="font-headline text-4xl font-bold text-center mt-16 mb-8">Explore New Content</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicsData.map((topic) => {
            const isSubscribed = localSubscribedTopics.some(t => t.name === topic.name);
            return (
              <Card key={topic.name} className="flex flex-col items-center justify-between p-4">
                <DynamicIcon name={topic.icon} className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-center text-lg font-medium truncate mb-2">
                  {topic.name}
                </CardTitle>
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  onClick={() => handleTopicSubscribe(topic as Topic)}
                  className="w-full"
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
          {interestsData.map((interest) => {
            const isSubscribed = localSubscribedInterests.some(i => i.name === interest.name);
            return (
              <Card key={interest.name} className="flex flex-col items-center justify-between p-4">
                <DynamicIcon name={interest.icon} className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-center text-lg font-medium truncate mb-2">
                  {interest.name}
                </CardTitle>
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  onClick={() => handleInterestSubscribe(interest as Interest)}
                  className="w-full"
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
