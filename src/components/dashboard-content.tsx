"use client";

import React, { FC, useEffect, useState } from "react";
import { Greeting } from "@/components/dashboard/greeting";
import { Clock } from "@/components/dashboard/clock";
import { getAllPostsFromIndexedDB } from "@/lib/indexeddb";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { Post } from "@/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Newspaper, Bookmark, Search, Compass, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const DashboardContent: FC = () => {
  const { subscribedTopics, loading: feedsLoading } = useSubscribedFeeds();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"intro" | "dashboard">("intro");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allPosts = await getAllPostsFromIndexedDB();
        const subscribedNames = subscribedTopics.map(t => t.name);
        const subscribed = allPosts.filter(p => p.topic && subscribedNames.includes(p.topic));
        const others = allPosts.filter(p => !p.topic || !subscribedNames.includes(p.topic));

        setRecentPosts(subscribed.slice(0, 10));
        setTrendingPosts(others.slice(0, 5));

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

    if (!feedsLoading) {
      fetchData();
    }
  }, [subscribedTopics, feedsLoading]);

  const handleIntroComplete = () => {
    setViewState("dashboard");
  };

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
      gap: "1.5rem",
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const headerVariants = {
    intro: { y: 0, scale: 1 },
    dashboard: { y: 0, scale: 0.9, transformOrigin: "top center" }
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
          <motion.div layout className={cn("transition-all duration-700", viewState === "dashboard" ? "scale-50 origin-top -mb-10" : "")}>
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
              className="w-full max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[220px]"
            >
              {/* For You Widget (Large) */}
              <motion.div variants={cardVariants} className="col-span-2 row-span-2 relative group">
                <Link href="/topic" className="absolute inset-0 z-10" />
                <Card className="h-full w-full overflow-hidden bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">For You</h2>
                    <div className="flex-1 overflow-hidden relative">
                      {recentPosts.length > 0 ? (
                        <div className="space-y-4 mask-image-b">
                          {recentPosts.slice(0, 3).map(post => (
                            <div key={post.slug} className="flex gap-3 items-start">
                              {post.thumbnail_url && (
                                <img src={post.thumbnail_url} className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0" />
                              )}
                              <div>
                                <h3 className="font-medium line-clamp-2 text-sm leading-snug">{post.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{post.topic}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No updates yet.</p>
                      )}
                    </div>
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

              {/* Explore More Widget */}
              <motion.div variants={cardVariants} className="col-span-2 md:col-span-1 row-span-1 relative group">
                <Link href="/explore" className="absolute inset-0 z-10" />
                <Card className="h-full w-full bg-card/50 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Explore</h3>
                      <p className="text-xs text-muted-foreground">Discover new topics</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </Card>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
