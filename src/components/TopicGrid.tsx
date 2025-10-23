import { Topic } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicIcon } from "@/components/dynamic-icon";
import React from "react"; // Import React for React.memo

interface TopicGridProps {
  topics: Topic[];
  onTopicSelect: (topic: string) => void;
  selectedTopic: string;
}

export const TopicGrid = React.memo(({ topics, onTopicSelect, selectedTopic }: TopicGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {topics.map((topic) => (
        <Card
          key={topic.id}
          className={`cursor-pointer transition-all hover:shadow-lg ${selectedTopic === topic.name ? 'border-primary bg-primary/10' : ''}`}
          onClick={() => onTopicSelect(topic.name)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            {topic.icon && <DynamicIcon name={topic.icon} className="h-8 w-8 mb-2 text-primary" />}
            <span className="font-medium text-lg">{topic.name}</span>
            {topic.description && <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

TopicGrid.displayName = "TopicGrid";
