"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TopicGrid } from "@/components/TopicGrid";
import { InterestGrid } from "@/components/InterestGrid";
import RssFeedSelectionModalContent from "@/components/rss-feed-selection-modal-content";
import { Topic, Interest, RssFeed } from "@/types";

import { useContext, useCallback, useMemo } from "react";

interface ExploreClientPageProps {
  topics: Topic[];
  interests: Interest[];
  feeds: RssFeed[];
}

export default function ExploreClientPage({ topics, interests, feeds }: ExploreClientPageProps) {



  const [searchTerm, setSearchTerm] = useState("");

  const [customSearchQuery, setCustomSearchQuery] = useState(""); // New state for premium custom search

  const [selectedTopic, setSelectedTopic] = useState("All");
  const [activeTab, setActiveTab] = useState("topics");
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentTranslateXRef = useRef(0); // To store the translateX at the start of a swipe
  const isClickRef = useRef(true); // New ref to track if the interaction is a click
  const tabs = ["topics", "interests", "sources"];

  const handleTopicSelect = useCallback((topicName: string) => {
    setSelectedTopic(topicName);
    setActiveTab("interests"); // Switch to interests tab
    const tabIndex = tabs.indexOf("interests");
    setTranslateX(-tabIndex * 100); // Explicitly set translateX for animation
  }, [tabs]);

  // Effect to manage global text selection and cursor
  useEffect(() => {
    if (isSwiping) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
      window.addEventListener("pointerup", handlePointerUp);
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isSwiping]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const tabIndex = tabs.indexOf(value);
    setTranslateX(-tabIndex * 100);
  };

  const getClientX = (e: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    if ("touches" in e) {
      return e.touches[0].clientX;
    }
    return e.clientX;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Only start swiping on left mouse button or touch
    if ("button" in e && e.button !== 0) return;
    isClickRef.current = true; // Assume it's a click initially
    startXRef.current = getClientX(e);
    currentTranslateXRef.current = translateX; // Store current translateX
    setIsSwiping(true);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = getClientX(e);
    const diff = currentX - startXRef.current;

    if (Math.abs(diff) > 5) { // If moved more than 5 pixels, it's a drag, not a click
      isClickRef.current = false;
      e.preventDefault(); // Prevent text selection and other default behaviors during move
    }

    // Calculate new translateX based on the initial translateX and the drag difference
    setTranslateX(currentTranslateXRef.current + (diff / window.innerWidth) * 100);
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent | PointerEvent) => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const currentIndex = tabs.indexOf(activeTab);

    if (isClickRef.current) {
      // If it was a click, don't change tab
      return;
    }

    // Determine if we swiped enough to change tabs
    const swipeThreshold = window.innerWidth / 4; // Swipe 1/4 of the screen width to change tab
    const swipeDistance = translateX - currentTranslateXRef.current;

    let newIndex = currentIndex;
    if (swipeDistance < -swipeThreshold && currentIndex < tabs.length - 1) {
      newIndex = currentIndex + 1;
    } else if (swipeDistance > swipeThreshold && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    // Animate to the new tab position
    setTranslateX(-newIndex * 100);
    setActiveTab(tabs[newIndex]);
  };

  const filteredTopics = useMemo(() => {
    if (!searchTerm) return topics;
    return topics.filter(topic =>
      topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, searchTerm]);

  const filteredInterests = useMemo(() => {
    if (!searchTerm && selectedTopic === "All") return interests;

    return interests.filter(interest => {
      const matchesSearch = searchTerm ? interest.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const matchesTopic = selectedTopic === "All" ? true : interest.topic_id === topics.find(t => t.name === selectedTopic)?.id;
      return matchesSearch && matchesTopic;
    });
  }, [interests, searchTerm, selectedTopic, topics]);

  const filteredFeeds = useMemo(() => {
    if (!searchTerm) return feeds;
    return feeds.filter(feed =>
      feed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feeds, searchTerm]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Search topics, interests, or sources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-grow">
        <TabsList
          className="grid w-full grid-cols-3 rounded-none border-b bg-background p-0 px-4"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'pan-y' }} // Allow vertical scrolling
        >
          <TabsTrigger value="topics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Topics</TabsTrigger>
          <TabsTrigger value="interests" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Interests</TabsTrigger>
          <TabsTrigger value="sources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Sources</TabsTrigger>
        </TabsList>

        <div className="relative flex-grow overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${translateX}%)` }}
          >
            <TabsContent value="topics" className="w-full flex-shrink-0 overflow-y-auto p-4 mt-0">
              <TopicGrid topics={filteredTopics} onTopicSelect={handleTopicSelect} selectedTopic={selectedTopic} />
            </TabsContent>
            <TabsContent value="interests" className="w-full flex-shrink-0 overflow-y-auto p-4 mt-0">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Interests {selectedTopic !== "All" && `in ${selectedTopic}`}</h2>
                {selectedTopic !== "All" && (
                  <Button variant="ghost" onClick={() => setSelectedTopic("All")}>Show All</Button>
                )}
              </div>
              <InterestGrid interests={filteredInterests} />
            </TabsContent>
            <TabsContent value="sources" className="w-full flex-shrink-0 overflow-y-auto p-4 mt-0">
              <RssFeedSelectionModalContent availableFeeds={filteredFeeds} categories={[]} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
