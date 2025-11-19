"use client";

import React, { FC, useEffect, useState, useCallback } from "react";
import { Greeting } from "@/components/dashboard/greeting";
import { Clock } from "@/components/dashboard/clock";
import { getAllPostsFromIndexedDB, getReadHistory, removeFromReadHistory } from "@/lib/indexeddb";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { Post } from "@/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Newspaper, Bookmark, Search, History, X, PieChart, BarChart3, Calendar, Layers, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const DashboardContent: FC = () => {
  const { subscribedTopics, loading: feedsLoading } = useSubscribedFeeds();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [readHistory, setReadHistory] = useState<(Post & { readAt: string })[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"intro" | "dashboard">("intro");

  const fetchData = async () => {
    try {
      const allPosts = await getAllPostsFromIndexedDB();
      const history = await getReadHistory();

      const subscribedNames = subscribedTopics.map(t => t.name);
      const subscribed = allPosts.filter(p => p.topic && subscribedNames.includes(p.topic));
      const others = allPosts.filter(p => !p.topic || !subscribedNames.includes(p.topic));

      setRecentPosts(subscribed.slice(0, 10));
      setTrendingPosts(others.slice(0, 5));
      setReadHistory(history);

      const savedItemsStr = localStorage.getItem('saved-items');
      if (savedItemsStr) {
        setSavedCount(JSON.parse(savedItemsStr).length);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!feedsLoading) {
      fetchData();
    }

    const handleHistoryUpdate = () => {
      fetchData();
    };

    window.addEventListener('read-history-updated', handleHistoryUpdate);
    return () => window.removeEventListener('read-history-updated', handleHistoryUpdate);
  }, [subscribedTopics, feedsLoading]);

  const handleRemoveFromHistory = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromReadHistory(slug);
  };

  const handleIntroComplete = useCallback(() => {
    setViewState("dashboard");
  }, []);

  // Group history by topic
  const groupedHistory = readHistory.reduce((acc, post) => {
    const topic = post.topic || 'Other';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(post);
    return acc;
  }, {} as Record<string, (Post & { readAt: string })[]>);

  const topicStats = Object.entries(groupedHistory)
    .map(([topic, posts]) => ({
      topic,
      count: posts.length,
      percentage: (posts.length / readHistory.length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Animation Variants
  const containerVariants = {
    intro: {
      justifyContent: "center",
      alignItems: "center",
      gap: "2rem"
    },
    dashboard: {
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: "1rem",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        staggerChildren: 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (loading) return null;

  return (
    <ScrollArea className="h-full w-full">
      <div className={cn(
        "min-h-full w-full p-4 md:p-8 transition-all duration-1000 flex flex-col",
        viewState === "intro" ? "justify-center" : "justify-start"
      )}>

        {/* Header Section (Clock & Greeting) */}
        <motion.div
          layout
          initial="intro"
          animate={viewState}
          variants={containerVariants}
          className="flex flex-col items-center relative z-20 shrink-0 mb-6"
        >
          <motion.div layout className={cn("transition-all duration-1000 ease-in-out", viewState === "dashboard" ? "origin-top -mb-12" : "")}>
            <Clock variant="stacked" className={cn(
              "transition-all duration-1000 ease-in-out",
              viewState === "intro" ? "text-[8rem] md:text-[12rem] opacity-90" : "text-[4rem] md:text-[6rem] opacity-80"
            )} />
          </motion.div>

          <motion.div layout className={cn("transition-all duration-1000 ease-in-out", viewState === "dashboard" ? "opacity-60 scale-75 origin-top" : "")}>
            <Greeting onComplete={handleIntroComplete} />
          </motion.div>
        </motion.div>

        {/* Main Content Area - Bento Grid Layout */}
        <AnimatePresence>
          {viewState === "dashboard" && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min"
            >
              {/* --- ROW 1: INSIGHT & STATS --- */}

              {/* Daily Insight (Wide) */}
              <motion.div className="col-span-1 md:col-span-2 row-span-1">
                <Card className="h-full p-6 bg-gradient-to-br from-primary/20 to-card backdrop-blur-xl border-white/10 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Daily Insight</span>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight">
                      {readHistory.length > 0
                        ? `You've read ${readHistory.length} articles today.`
                        : "Start your reading journey today."}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {readHistory.length > 5
                        ? `You're diving deep into ${topicStats[0]?.topic}. Keep it up!`
                        : "Explore trending topics to stay informed."}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Stats: Topic Distribution */}
              <motion.div className="col-span-1 md:col-span-1 row-span-1">
                <Card className="h-full p-5 bg-card/40 backdrop-blur-xl border-white/10 flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <PieChart className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Topics</span>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                    {topicStats.slice(0, 3).map((stat) => (
                      <div key={stat.topic} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
                          <span>{stat.topic}</span>
                          <span className="opacity-70">{Math.round(stat.percentage)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-primary/80 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                    {topicStats.length === 0 && (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No data</div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Stats: Total Count (Small) */}
              <motion.div className="col-span-1 md:col-span-1 row-span-1">
                <Card className="h-full p-5 bg-card/40 backdrop-blur-xl border-white/10 flex flex-col justify-center items-center text-center">
                  <History className="w-8 h-8 text-primary mb-2 opacity-80" />
                  <span className="text-4xl font-bold tabular-nums">{readHistory.length}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Articles Read</span>
                </Card>
              </motion.div>


              {/* --- ROW 2: TIMELINE & TOPICS --- */}

              {/* Timeline (Vertical List) */}
              <motion.div className="col-span-1 md:col-span-2 row-span-2">
                <Card className="h-[400px] bg-card/40 backdrop-blur-xl border-white/10 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm">Timeline</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{readHistory.length} items</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {readHistory.length > 0 ? (
                      <div className="relative border-l border-white/10 ml-2 space-y-6 py-2">
                        {readHistory.map((post) => (
                          <div key={post.slug} className="relative pl-6 group">
                            <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-card" />
                            <div className="flex flex-col gap-1 p-3 rounded-xl hover:bg-white/5 transition-colors relative border border-transparent hover:border-white/5">
                              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                                {new Date(post.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <h4 className="font-medium text-sm leading-snug line-clamp-2">{post.title}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => handleRemoveFromHistory(e, post.slug)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <p>No activity yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Topics Grouped (Grid of Pills) */}
              <motion.div className="col-span-1 md:col-span-2 row-span-2">
                <Card className="h-[400px] bg-card/40 backdrop-blur-xl border-white/10 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm">Grouped by Topic</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {Object.entries(groupedHistory).length > 0 ? (
                      Object.entries(groupedHistory).map(([topic, posts]) => (
                        <div key={topic} className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {topic}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {posts.map(post => (
                              <div key={post.slug} className="flex gap-3 items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group relative border border-white/5">
                                {post.thumbnail_url && (
                                  <img src={post.thumbnail_url} className="w-8 h-8 rounded object-cover bg-muted shrink-0" />
                                )}
                                <span className="text-xs font-medium line-clamp-1 flex-1">{post.title}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => handleRemoveFromHistory(e, post.slug)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <p>No topics explored yet</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>


              {/* --- ROW 3: APPS / WIDGETS --- */}

              {/* For You Widget */}
              <motion.div className="col-span-1 md:col-span-1 row-span-1 relative group">
                <Link href="/topic" className="absolute inset-0 z-10" />
                <Card className="h-40 w-full bg-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
                  <div className="flex items-center justify-between mb-auto">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -rotate-45 group-hover:rotate-0 duration-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">For You</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {recentPosts.length} new updates
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Trending Widget */}
              <motion.div className="col-span-1 md:col-span-1 row-span-1 relative group">
                <Link href="/explore" className="absolute inset-0 z-10" />
                <Card className="h-40 w-full bg-gradient-to-br from-orange-500/10 to-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
                  <div className="flex items-center justify-between mb-auto">
                    <div className="p-2.5 bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Trending</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {trendingPosts[0]?.title || "Explore what's hot"}
                    </p>
                  </div>
                </Card>
              </motion.div>

              {/* Saved Widget */}
              <motion.div className="col-span-1 row-span-1 relative group">
                <Link href="/saved" className="absolute inset-0 z-10" />
                <Card className="h-40 w-full bg-gradient-to-br from-blue-500/10 to-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
                  <div className="flex items-center justify-between mb-auto">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold tabular-nums">{savedCount}</span>
                  </div>
                  <h3 className="font-bold text-lg">Saved</h3>
                </Card>
              </motion.div>

              {/* Search Widget */}
              <motion.div className="col-span-1 row-span-1 relative group">
                <Link href="/search" className="absolute inset-0 z-10" />
                <Card className="h-40 w-full bg-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 p-5 text-muted-foreground hover:text-foreground">
                  <Search className="w-8 h-8" />
                  <span className="font-medium">Search</span>
                </Card>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
