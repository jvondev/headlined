"use client";

import React, { FC, useEffect, useState } from "react";
import { Greeting } from "@/components/dashboard/greeting";
import { Clock } from "@/components/dashboard/clock";
import { getAllPostsFromIndexedDB } from "@/lib/indexeddb";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { Post } from "@/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { TrendingUp, Newspaper, Calendar, Bookmark, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const DashboardContent: FC = () => {
  const { subscribedTopics, loading: feedsLoading } = useSubscribedFeeds();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const date = new Date();
    setDateStr(date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    const fetchData = async () => {
      try {
        const allPosts = await getAllPostsFromIndexedDB();

        // Get subscribed topic names
        const subscribedNames = subscribedTopics.map(t => t.name);

        // Filter posts
        const subscribed = allPosts.filter(p => p.topic && subscribedNames.includes(p.topic));
        const others = allPosts.filter(p => !p.topic || !subscribedNames.includes(p.topic));

        // Since we don't have a date field, we'll just take the first ones as "recent" 
        // assuming IndexedDB returns them in some consistent order or they were added recently.
        // In a real app, we should sort by pubDate.
        setRecentPosts(subscribed.slice(0, 10));
        setTrendingPosts(others.slice(0, 5));

        // Mock saved count for now or fetch if we had a way (we can check localStorage for saved items count if needed)
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="h-full w-full p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-muted rounded-full"></div>
          <div className="h-4 w-32 bg-muted rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 md:p-8 pb-24 max-w-7xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Greeting />
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-lg font-medium">{dateStr}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <Clock />
              </div>
            </div>
          </header>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

            {/* Main "For You" Widget - Spans 8 columns */}
            <motion.div variants={item} className="md:col-span-8 row-span-2 h-full min-h-[400px]">
              <Card className="h-full flex flex-col bg-card/40 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="p-6 pb-4 border-b border-border/10 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">For You</h2>
                      <p className="text-xs text-muted-foreground">Latest from your subscriptions</p>
                    </div>
                  </div>
                  <Link href="/topic" className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {recentPosts.length > 0 ? (
                      recentPosts.map((post, i) => (
                        <Link href={`/post/${post.slug}`} key={post.slug} className="block">
                          <div className="group/item flex gap-4 p-3 rounded-xl hover:bg-accent/40 transition-all border border-transparent hover:border-border/50">
                            {post.thumbnail_url && (
                              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                                <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full">
                                  {post.topic || 'News'}
                                </span>
                              </div>
                              <h3 className="font-semibold text-base md:text-lg leading-tight group-hover/item:text-primary transition-colors line-clamp-2 mb-1">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 hidden md:block">
                                {post.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <Newspaper className="w-12 h-12 mb-4 opacity-20" />
                        <p>No updates yet.</p>
                        <p className="text-sm opacity-70">Subscribe to topics to see them here.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </motion.div>

            {/* Right Column Widgets - Spans 4 columns */}
            <div className="md:col-span-4 space-y-4 md:space-y-6 flex flex-col h-full">

              {/* Trending / Explore Widget */}
              <motion.div variants={item} className="flex-1 min-h-[200px]">
                <Card className="h-full flex flex-col bg-card/40 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="p-5 pb-3 border-b border-border/10 flex items-center justify-between bg-gradient-to-r from-orange-500/5 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500/10 rounded-md text-orange-500">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h2 className="font-semibold">Trending Now</h2>
                    </div>
                    <Link href="/explore" className="text-xs text-muted-foreground hover:text-primary">Explore</Link>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {trendingPosts.length > 0 ? (
                        trendingPosts.map((post, i) => (
                          <Link href={`/post/${post.slug}`} key={post.slug} className="block">
                            <div className="p-3 rounded-lg hover:bg-accent/40 transition-colors flex items-start gap-3">
                              <span className="text-lg font-bold text-muted-foreground/30 font-mono">0{i + 1}</span>
                              <div>
                                <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
                                  {post.title}
                                </h3>
                                <span className="text-[10px] text-muted-foreground mt-1 block">{post.topic}</span>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No trending topics right now.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>

              {/* Stats / Utility Widget */}
              <motion.div variants={item} className="h-[180px]">
                <Card className="h-full relative overflow-hidden bg-gradient-to-br from-primary/5 via-card/50 to-card border-border/40 shadow-sm hover:shadow-md transition-all group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Bookmark className="w-24 h-24 -rotate-12" />
                  </div>
                  <div className="p-6 h-full flex flex-col justify-between relative z-10">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Saved for Later
                      </h3>
                    </div>
                    <div>
                      <div className="text-5xl font-bold tracking-tight text-foreground">
                        {savedCount}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Articles waiting for you</p>
                    </div>
                    <Link href="/saved" className="absolute inset-0" />
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </ScrollArea>
  );
};
