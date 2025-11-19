"use client";

import React, { FC, useEffect, useState } from "react";
import { Greeting } from "@/components/dashboard/greeting";
import { Clock } from "@/components/dashboard/clock";
import { getAllPostsFromIndexedDB, getReadHistory, removeFromReadHistory } from "@/lib/indexeddb";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { Post } from "@/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Newspaper, Bookmark, Search, Compass, ArrowUpRight, History, X, PieChart, BarChart3 } from "lucide-react";
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
  }, [subscribedTopics, feedsLoading]);

  const handleRemoveFromHistory = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromReadHistory(slug);
    setReadHistory(prev => prev.filter(p => p.slug !== slug));
  };

  const handleIntroComplete = () => {
    setViewState("dashboard");
  };

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
      gap: "0.5rem",
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const gridVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        staggerChildren: 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
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
          className="flex flex-col items-center relative z-20 shrink-0"
        >
          <motion.div layout className={cn("transition-all duration-700", viewState === "dashboard" ? "scale-[0.6] origin-top -mb-16" : "")}>
            <Clock variant="stacked" className="text-[8rem] md:text-[12rem] leading-[0.8] opacity-90" />
          </motion.div>

          <motion.div layout className={cn("transition-all duration-700", viewState === "dashboard" ? "opacity-60 scale-75 origin-top" : "")}>
            <Greeting onComplete={handleIntroComplete} />
          </motion.div>
        </motion.div>

        {/* Dashboard Grid (Launcher Style) */}
        <AnimatePresence>
          {viewState === "dashboard" && (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-6xl mx-auto mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[220px]"
            >
              {/* Read History Widget (Main Focus - Enhanced) */}
              <motion.div variants={cardVariants} className="col-span-2 row-span-2 relative group">
                <Card className="h-full w-full overflow-hidden bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Widget Header */}
                  <div className="p-6 pb-2 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight">Read Today</h2>
                        <p className="text-xs text-muted-foreground font-medium">
                          {readHistory.length} articles • {topicStats.length} topics
                        </p>
                      </div>
                    </div>
                    {readHistory.length > 3 && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                        <BarChart3 className="w-3 h-3" />
                        <span>Insight Available</span>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 p-6 pt-2">

                    {/* Left: Insights / Graph (Visible if data exists) */}
                    {readHistory.length > 0 && (
                      <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <PieChart className="w-4 h-4" />
                            <span>Topic Distribution</span>
                          </div>
                          <div className="space-y-2">
                            {topicStats.slice(0, 4).map((stat) => (
                              <div key={stat.topic} className="space-y-1">
                                <div className="flex justify-between text-[10px] uppercase tracking-wider font-medium opacity-70">
                                  <span>{stat.topic}</span>
                                  <span>{Math.round(stat.percentage)}%</span>
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
                          </div>
                        </div>

                        {readHistory.length > 5 && (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                            <p className="text-xs font-medium text-primary mb-1">Daily Insight</p>
                            <p className="text-sm text-muted-foreground leading-snug">
                              You're diving deep into <span className="font-bold text-foreground">{topicStats[0].topic}</span> today. Great progress!
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Right: Grouped List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                      {readHistory.length > 0 ? (
                        <div className="space-y-6">
                          {Object.entries(groupedHistory).map(([topic, posts]) => (
                            <div key={topic} className="space-y-2">
                              <h3 className="sticky top-0 bg-card/95 backdrop-blur-md py-2 z-10 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                {topic}
                              </h3>
                              <div className="space-y-2">
                                {posts.map(post => (
                                  <div key={post.slug} className="group/item flex gap-3 items-start p-2 rounded-xl hover:bg-white/5 transition-colors relative">
                                    {post.thumbnail_url && (
                                      <img src={post.thumbnail_url} className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0 py-0.5">
                                      <h4 className="font-medium text-sm leading-snug line-clamp-2 text-foreground/90 group-hover/item:text-primary transition-colors">
                                        {post.title}
                                      </h4>
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(post.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity absolute top-2 right-2 hover:bg-destructive/10 hover:text-destructive"
                                      onClick={(e) => handleRemoveFromHistory(e, post.slug)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                          <History className="w-12 h-12 mb-3 stroke-1" />
                          <p className="font-medium">No articles read yet</p>
                          <p className="text-xs">Tap an article to start tracking</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* For You Widget (Smaller now) */}
              <motion.div variants={cardVariants} className="col-span-2 md:col-span-1 row-span-1 relative group">
                <Link href="/topic" className="absolute inset-0 z-10" />
                <Card className="h-full w-full bg-card/50 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
                  <div className="flex items-center justify-between mb-auto">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <motion.div variants={cardVariants} className="col-span-2 md:col-span-1 row-span-1 relative group">
                <Link href="/explore" className="absolute inset-0 z-10" />
                <Card className="h-full w-full bg-gradient-to-br from-orange-500/10 to-card/50 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
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
              <motion.div variants={cardVariants} className="col-span-1 row-span-1 relative group">
                <Link href="/saved" className="absolute inset-0 z-10" />
                <Card className="h-full w-full bg-gradient-to-br from-blue-500/10 to-card/50 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
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
              <motion.div variants={cardVariants} className="col-span-1 row-span-1 relative group">
                <Link href="/search" className="absolute inset-0 z-10" />
                <Card className="h-full w-full bg-card/50 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 p-5 text-muted-foreground hover:text-foreground">
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
