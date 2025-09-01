"use client";

import React, { useState, useRef, useEffect } from "react"; // Import useRef and useEffect
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react"; // Import the icon

const topics = [
  {
    name: "News",
    description: "Stay informed with the latest headlines and current events.",
  },
  {
    name: "Tech",
    description: "Explore advancements in technology, gadgets, and digital trends.",
  },
  {
    name: "Design",
    description: "Discover creative designs, aesthetics, and visual innovations.",
  },
  {
    name: "Science",
    description: "Uncover breakthroughs, research, and discoveries in various scientific fields.",
  },
  {
    name: "Health",
    description: "Learn about well-being, fitness, nutrition, and medical advancements.",
  },
  {
    name: "Finance",
    description: "Understand markets, investments, personal finance, and economic trends.",
  },
  {
    name: "Food",
    description: "Delight in culinary arts, recipes, food culture, and dining experiences.",
  },
  {
    name: "Travel",
    description: "Journey through destinations, travel tips, and cultural explorations.",
  },
  {
    name: "Sports",
    description: "Follow athletic events, team news, and sports analysis.",
  },
  {
    name: "Entertainment",
    description: "Catch up on movies, music, pop culture, and celebrity news.",
  },
  {
    name: "Fashion",
    description: "Explore style trends, clothing, accessories, and beauty.",
  },
  {
    name: "Education",
    description: "Gain insights into learning, academic pursuits, and educational systems.",
  },
  {
    name: "Environment",
    description: "Understand ecological issues, conservation, and sustainability efforts.",
  },
  {
    name: "Politics",
    description: "Stay updated on government, policy, and political developments.",
  },
  {
    name: "Art",
    description: "Appreciate artistic expressions, history, and cultural movements.",
  },
];

interface TopicSelectorProps {
  onTopicSelect: (selectedTopics: string[]) => void;
  initialSelectedTopics?: string[];
}

export function TopicSelector({ onTopicSelect, initialSelectedTopics = [] }: TopicSelectorProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialSelectedTopics);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const topicsContainerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const handleTopicClick = (topicName: string) => {
    setSelectedTopics((prevSelectedTopics) => {
      let newSelectedTopics: string[];
      if (prevSelectedTopics.includes(topicName)) {
        newSelectedTopics = [];
      } else {
        newSelectedTopics = [topicName];
      }
      setTimeout(() => {
        onTopicSelect(newSelectedTopics);
      }, 0);
      return newSelectedTopics;
    });
  };

  // Effect to check for overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (topicsContainerRef.current) {
        // Temporarily set max-height to a single row height to check for overflow
        // This is a heuristic, a more precise way would be to render a single row and measure its height
        // For now, let's assume a single row height is around 40px (button height + padding)
        const singleRowHeight = 40; // Approximate height of one row of buttons

        // Reset max-height to allow scrollHeight to be accurate
        topicsContainerRef.current.style.maxHeight = '';
        const currentScrollHeight = topicsContainerRef.current.scrollHeight;
        const currentClientHeight = topicsContainerRef.current.clientHeight;

        // If scrollHeight is greater than clientHeight, there's overflow
        // Or if scrollHeight is greater than our assumed singleRowHeight
        setHasOverflow(currentScrollHeight > singleRowHeight);

        // Restore max-height if not showing all topics
        if (!showAllTopics) {
            topicsContainerRef.current.style.maxHeight = `${singleRowHeight}px`;
            topicsContainerRef.current.style.overflow = 'hidden';
        } else {
            topicsContainerRef.current.style.maxHeight = 'none';
            topicsContainerRef.current.style.overflow = 'visible';
        }
      }
    };

    checkOverflow(); // Initial check

    // Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [showAllTopics]); // Re-run when showAllTopics changes

  return (
    <div className="flex flex-col items-center w-full">
      <div
        ref={topicsContainerRef} // Attach ref
        className="flex flex-wrap items-center justify-center gap-2"
        style={{ maxHeight: showAllTopics ? 'none' : '40px', overflow: showAllTopics ? 'visible' : 'hidden' }} // Apply max-height and overflow
      >
        {topics.map((topic) => (
          <Button
            key={topic.name}
            variant="outline"
            className={cn(
              "rounded-full px-4 shrink-0",
              selectedTopics.includes(topic.name)
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => handleTopicClick(topic.name)}
          >
            {topic.name}
          </Button>
        ))}
      </div>
      {hasOverflow && !showAllTopics && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setShowAllTopics(true)}
        >
          Load More <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
