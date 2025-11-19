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
import { TrendingUp, Newspaper, Bookmark, Search, History, X, PieChart, BarChart3, Calendar, Layers, ArrowRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "topics">("overview");

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
    // State update happens via event listener
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

  const tabContentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
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
          <motion.div layout className={cn("transition-all duration-700", viewState === "dashboard" ? "scale-[0.6] origin-top -mb-16" : "")}>
            <Clock variant="stacked" className="text-[8rem] md:text-[12rem] leading-[0.8] opacity-90" />
          </motion.div>

          <motion.div layout className={cn("transition-all duration-700", viewState === "dashboard" ? "opacity-60 scale-75 origin-top" : "")}>
            <Greeting onComplete={handleIntroComplete} />
          </motion.div>
        </motion.div>

        {/* Main Content Area */}
        <AnimatePresence>
          {viewState === "dashboard" && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-5xl mx-auto space-y-6"
            >
              {/* PRIMARY SECTION: Read Today Tracker */}
              <motion.div className="w-full">
                <Card className="w-full overflow-hidden bg-card/40 backdrop-blur-2xl border-white/10 dark:border-white/5 shadow-2xl ring-1 ring-white/5">
                  <div className="flex flex-col md:flex-row h-[500px] md:h-[400px]">

                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 bg-black/5 dark:bg-white/5 p-4 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-white/5">
                      <div className="mb-4 px-2">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <History className="w-5 h-5 text-primary" />
                          Read Today
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          {readHistory.length} articles • {topicStats.length} topics
                        </p>
                      </div>

                      <nav className="flex flex-row md:flex-col gap-1">
                        {[
                          { id: 'overview', label: 'Overview', icon: BarChart3 },
                          { id: 'timeline', label: 'Timeline', icon: Calendar },
                          { id: 'topics', label: 'Topics', icon: Layers },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                          >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        ))}
                      </nav>

                      {/* Daily Insight Mini-Card (Bottom of sidebar) */}
                      {readHistory.length > 0 && (
                        <div className="mt-auto hidden md:block p-3 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Daily Insight</p>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {readHistory.length > 5
                              ? `You're focused on ${topicStats[0]?.topic} today.`
                              : "Keep reading to generate insights."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Main Content Area for Read Today */}
                    <div className="flex-1 p-6 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                      <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                          <motion.div
                            key="overview"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="h-full flex flex-col"
                          >
                            <h3 className="text-xl font-semibold mb-6">Activity Overview</h3>

                            {readHistory.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                {/* Stats Cards */}
                                <div className="space-y-4">
                                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-sm text-muted-foreground">Total Read</p>
                                    <p className="text-4xl font-bold text-foreground mt-1">{readHistory.length}</p>
                                  </div>
                                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-sm text-muted-foreground">Top Topic</p>
                                    <p className="text-2xl font-bold text-primary mt-1">{topicStats[0]?.topic || 'N/A'}</p>
                                  </div>
                                </div>

                                {/* Distribution Chart */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col">
                                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                                    <PieChart className="w-4 h-4" /> Topic Distribution
                                  </p>
                                  <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                    {topicStats.map((stat) => (
                                      <div key={stat.topic} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                          <span>{stat.topic}</span>
                                          <span className="opacity-70">{Math.round(stat.percentage)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.percentage}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-primary rounded-full"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <BarChart3 className="w-16 h-16 mb-4 stroke-1" />
                                <p className="text-lg">No activity yet</p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {activeTab === 'timeline' && (
                          <motion.div
                            key="timeline"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="h-full flex flex-col"
                          >
                            <h3 className="text-xl font-semibold mb-4">Reading Timeline</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                              {readHistory.length > 0 ? (
                                <div className="relative border-l border-white/10 ml-3 space-y-6 py-2">
                                  {readHistory.map((post, idx) => (
                                    <div key={post.slug} className="relative pl-6 group">
                                      <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-card" />
                                      <div className="flex flex-col gap-1 p-3 rounded-xl hover:bg-white/5 transition-colors relative">
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {new Date(post.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <h4 className="font-medium text-sm leading-snug">{post.title}</h4>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
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
                                  <Calendar className="w-16 h-16 mb-4 stroke-1" />
                                  <p>Your timeline is empty</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 'topics' && (
                          <motion.div
                            key="topics"
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="h-full flex flex-col"
                          >
                            <h3 className="text-xl font-semibold mb-4">Grouped by Topic</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-6">
                              {Object.entries(groupedHistory).length > 0 ? (
                                Object.entries(groupedHistory).map(([topic, posts]) => (
                                  <div key={topic} className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-md py-2 z-10">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                      {topic}
                                      <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{posts.length}</span>
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                      {posts.map(post => (
                                        <div key={post.slug} className="flex gap-3 items-center p-2 rounded-lg hover:bg-white/5 transition-colors group relative">
                                          {post.thumbnail_url && (
                                            <img src={post.thumbnail_url} className="w-10 h-10 rounded object-cover bg-muted shrink-0" />
                                          )}
                                          <span className="text-sm font-medium line-clamp-1 flex-1">{post.title}</span>
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
                                  <Layers className="w-16 h-16 mb-4 stroke-1" />
                                  <p>No topics explored yet</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* SECONDARY SECTION: Widgets Grid */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px]"
              >
                {/* For You Widget */}
                <motion.div className="col-span-2 md:col-span-1 row-span-1 relative group">
                  <Link href="/topic" className="absolute inset-0 z-10" />
                  <Card className="h-full w-full bg-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
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
                <motion.div className="col-span-2 md:col-span-1 row-span-1 relative group">
                  <Link href="/explore" className="absolute inset-0 z-10" />
                  <Card className="h-full w-full bg-gradient-to-br from-orange-500/10 to-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
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
                  <Card className="h-full w-full bg-gradient-to-br from-blue-500/10 to-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col p-5">
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
                  <Card className="h-full w-full bg-card/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 p-5 text-muted-foreground hover:text-foreground">
                    <Search className="w-8 h-8" />
                    <span className="font-medium">Search</span>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
