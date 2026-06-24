"use client";

import React, { useState, useRef, useEffect } from "react"; // Import useRef and useEffect
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react"; // Import the icon

interface TopicSelectorProps {
  onTopicSelect: (selectedTopics: string[]) => void;
  initialSelectedTopics?: string[];
  topics: { name: string; description: string; }[]; // Add topics prop
}

export function TopicSelector({ onTopicSelect, initialSelectedTopics = [], topics }: TopicSelectorProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialSelectedTopics);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const topicsContainerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const handleTopicClick = (topicName: string) => {
    setSelectedTopics((prevSelectedTopics) => {
      let newSelectedTopics: string[];
      if (topicName === "All") {
        newSelectedTopics = ["All"];
      } else if (prevSelectedTopics.includes(topicName)) {
        newSelectedTopics = prevSelectedTopics.filter((t) => t !== topicName && t !== "All");
        if (newSelectedTopics.length === 0) {
            newSelectedTopics = ["All"]; // If no topics selected, default to All
        }
      } else {
        newSelectedTopics = [...prevSelectedTopics.filter((t) => t !== "All"), topicName];
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
