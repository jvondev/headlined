"use client";

import React, { FC, useEffect, useState, useCallback } from "react";
import { Greeting } from "@/components/dashboard/greeting";
import { Clock } from "@/components/dashboard/clock";
import { getAllPostsFromIndexedDB, getReadHistory } from "@/lib/indexeddb";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { Post } from "@/types";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Newspaper, Bookmark, Search, PieChart, Calendar, Layers, ArrowRight, Sparkles, Grid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArchiveNavigation } from "@/components/dashboard/archive-navigation";
import { useArchiveAccess } from "@/hooks/use-archive-access";
import { checkLicenseStatus } from "@/lib/license-manager";

interface DashboardContentProps {
  setIsIntroMode?: (isIntro: boolean) => void;
  greetingMainText?: string;
  greetingSubText?: string;
  initialViewState?: "intro" | "dashboard";
  isIntroPaused?: boolean;
  date?: string;
  dateRange?: { start: string; end: string };
}

export const DashboardContent: FC<DashboardContentProps> = ({ setIsIntroMode, greetingMainText, greetingSubText, initialViewState = "intro", isIntroPaused, date, dateRange }) => {
  const { hasAccess: hasArchiveAccess } = useArchiveAccess();
  const { subscribedTopics, subscribedInterests, loading: feedsLoading } = useSubscribedFeeds();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [readHistory, setReadHistory] = useState<(Post & { readAt: string })[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<"intro" | "dashboard">(() => {
    if (initialViewState === 'dashboard') return 'dashboard';
    if (typeof window !== 'undefined' && sessionStorage.getItem('intro_shown')) {
      return 'dashboard';
    }
    return 'intro';
  });
  const [timelineItemsToShow, setTimelineItemsToShow] = useState(4);

  // Sync viewState with prop changes (e.g. navigation)
  useEffect(() => {
    if (initialViewState === 'dashboard') {
      setViewState('dashboard');
    }
  }, [initialViewState]);

  useEffect(() => {
    if (viewState === "dashboard") {
      sessionStorage.setItem('intro_shown', 'true');
    }
  }, [viewState]);

  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const fetchData = async () => {
    try {
      const allPosts = await getAllPostsFromIndexedDB();
      // Sort posts by date descending (newest first)
      allPosts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      let history = await getReadHistory();
      const isPremium = await checkLicenseStatus();
      setIsPremiumUser(isPremium);

      const now = new Date();
      // Reset time to start of day for accurate "today" comparison
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      let filteredPosts = allPosts;

      if (date) {
        // Filter history for specific date (UTC comparison)
        history = history.filter(post => {
          const postDateStr = new Date(post.readAt).toISOString().split('T')[0];
          return postDateStr === date;
        });

        // Filter posts for specific date
        filteredPosts = allPosts.filter(p => p.date === date);

      } else if (dateRange) {
        // Filter history for date range
        const start = new Date(dateRange.start).getTime();
        const end = new Date(dateRange.end).getTime() + 86400000; // Include the end date

        history = history.filter(post => {
          const readAtTime = new Date(post.readAt).getTime();
          return readAtTime >= start && readAtTime < end;
        });

        // Filter posts for date range
        filteredPosts = allPosts.filter(p => {
          const postDate = p.date ? new Date(p.date).getTime() : 0;
          return postDate >= start && postDate < end;
        });

      } else {
        // Default view (Today) - Always show Local Today
        history = history.filter(post => {
          const readAtTime = new Date(post.readAt).getTime();
          return readAtTime >= todayStart;
        });

        // Filter posts for today only
        const todayStr = now.toISOString().split('T')[0];
        filteredPosts = allPosts.filter(p => p.date === todayStr);
      }

      const subscribedNames = subscribedTopics.map(t => t.name);
      const subscribed = filteredPosts.filter(p => p.topic && subscribedNames.includes(p.topic));
      const others = filteredPosts.filter(p => !p.topic || !subscribedNames.includes(p.topic));

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
  }, [subscribedTopics, feedsLoading, date, dateRange]);

  const handleIntroComplete = useCallback(() => {
    setViewState("dashboard");
  }, []);

  useEffect(() => {
    if (setIsIntroMode) {
      setIsIntroMode(viewState === "intro");
    }
  }, [viewState, setIsIntroMode]);

  // Group history by Topics (based on post.topic field)
  const groupedTopics = readHistory.reduce((acc, post) => {
    const topicName = post.topic;
    if (topicName && subscribedTopics.some(t => t.name === topicName)) {
      if (!acc[topicName]) acc[topicName] = [];
      acc[topicName].push(post);
    }
    return acc;
  }, {} as Record<string, (Post & { readAt: string })[]>);

  // Get all post slugs that are already in topics
  const topicPostSlugs = new Set(
    Object.values(groupedTopics).flat().map(post => post.slug)
  );

  // Calculate stats for topics only
  const topicStats = Object.entries(groupedTopics)
    .map(([topic, posts]) => ({
      topic,
      count: posts.length,
      percentage: Object.values(groupedTopics).flat().length > 0
        ? (posts.length / Object.values(groupedTopics).flat().length) * 100
        : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Group history by Interests (based on content matching with aliases)
  // Exclude posts that are already categorized under topics
  const groupedInterests = readHistory.reduce((acc, post) => {
    // Skip if this post is already in a topic
    if (topicPostSlugs.has(post.slug)) {
      return acc;
    }

    subscribedInterests.forEach(interest => {
      const searchTerms = [interest.name, ...(interest.aliases || [])];
      const content = `${post.title} ${post.description || ''}`.toLowerCase();

      const isMatch = searchTerms.some(term => content.includes(term.toLowerCase()));

      if (isMatch) {
        if (!acc[interest.name]) acc[interest.name] = [];
        if (!acc[interest.name].some(p => p.slug === post.slug)) {
          acc[interest.name].push(post);
        }
      }
    });
    return acc;
  }, {} as Record<string, (Post & { readAt: string })[]>);

  // Calculate stats for interests only
  const interestStats = Object.entries(groupedInterests)
    .map(([interest, posts]) => ({
      interest,
      count: posts.length,
      percentage: Object.values(groupedInterests).flat().length > 0
        ? (posts.length / Object.values(groupedInterests).flat().length) * 100
        : 0
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
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
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
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  if (loading) return null;

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar">
      <div className={cn(
        "min-h-full w-full p-4 md:p-8 transition-all duration-1000 flex flex-col",
        viewState === "intro" ? "justify-center" : "justify-start"
      )}>

        {/* Header Section (Clock & Greeting) */}
        <motion.div
          layout
          initial="intro"
          animate={viewState}
          variants={containerVariants as any}
          className="flex flex-col items-center relative z-20 shrink-0 mb-8"
        >

          <motion.div layout className={cn("transition-all duration-1000 ease-in-out", viewState === "dashboard" ? "origin-top  " : "")}>
            <Clock variant="stacked" className={cn(
              "transition-all duration-1000 ease-in-out",
              viewState === "intro" ? "text-[6rem] md:text-[10rem] opacity-90" : "text-[4rem] md:text-[6rem] opacity-80"
            )} />
          </motion.div>

          <motion.div layout className={cn("transition-all duration-1000 ease-in-out", viewState === "dashboard" ? "opacity-80 scale-90 origin-top -mt-4" : "")}>
            <Greeting
              onComplete={handleIntroComplete}
              mainText={greetingMainText}
              subText={greetingSubText}
              action={viewState === "dashboard" && hasArchiveAccess ? <ArchiveNavigation /> : undefined}
              isPaused={isIntroPaused}
            />
          </motion.div>
        </motion.div>

        {/* Main Content Area - Neo-Minimalist Grid */}
        <AnimatePresence>
          {viewState === "dashboard" && (
            <motion.div
              variants={contentVariants as any}
              initial="hidden"
              animate="visible"
              className="w-full max-w-6xl mx-auto space-y-12"
            >
              {/* SECTION 1: OVERVIEW & STATS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Daily Insight (Wide) */}
                <motion.div className="col-span-1 md:col-span-2">
                  <Card className="h-full p-6 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Daily Insight</span>
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold leading-tight tracking-tight text-foreground">
                          {readHistory.length > 0
                            ? (
                              date ? `You read ${readHistory.length} articles on ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.` :
                                dateRange ? `You read ${readHistory.length} articles during this period.` :
                                  `You've read ${readHistory.length} articles today.`
                            )
                            : (
                              date ? `No articles read on ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.` :
                                dateRange ? "No reading activity during this period." :
                                  "Start your reading journey today."
                            )}
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm font-medium">
                          {readHistory.length > 5
                            ? `You're diving deep into ${topicStats[0]?.topic}. Keep it up!`
                            : "Explore trending topics to stay informed."}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Stats: Topic Distribution */}
                <motion.div className="col-span-1 md:col-span-1">
                  <Card className="h-full p-5 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <PieChart className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Topics</span>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {topicStats.slice(0, 3).map((stat) => (
                        <div key={stat.topic} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            <span>{stat.topic}</span>
                            <span className="opacity-70">{Math.round(stat.percentage)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                      {topicStats.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-medium">No data yet</div>
                      )}
                    </div>
                  </Card>
                </motion.div>

                {/* Stats: Interest Distribution */}
                <motion.div className="col-span-1 md:col-span-1">
                  <Card className="h-full p-5 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Grid className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Interests</span>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {interestStats.slice(0, 3).map((stat) => (
                        <div key={stat.interest} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            <span className="line-clamp-1">{stat.interest}</span>
                            <span className="opacity-70">{Math.round(stat.percentage)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                      {interestStats.length === 0 && (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-medium">No data yet</div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* SECTION 2: TIMELINE & TOPIC/INTEREST CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Timeline (Left Column) */}
                <div className="col-span-1 md:col-span-1">
                  <Card className="h-full p-5 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <Calendar className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Timeline</h3>
                    </div>
                    <div className="relative border-l border-border/50 ml-2 pl-6 space-y-8 py-2 flex-1">
                      {readHistory.length > 0 ? (
                        <>
                          {readHistory.slice(0, timelineItemsToShow).map((post) => (
                            <div key={post.slug} className="relative group">
                              <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary z-10 group-hover:scale-125 transition-transform duration-300" />
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground font-mono font-medium">
                                  {new Date(post.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <h4 className="font-medium text-sm leading-snug text-foreground/90 hover:text-primary transition-colors cursor-pointer">
                                  {post.title}
                                </h4>
                              </div>
                            </div>
                          ))}
                          {readHistory.length > timelineItemsToShow && (
                            <button
                              onClick={() => setTimelineItemsToShow(readHistory.length)}
                              className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-border/50 rounded-md hover:bg-primary/5"
                            >
                              Show More ({readHistory.length - timelineItemsToShow} more)
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No reading activity yet.</p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Column: Topics & Interests */}
                <div className="col-span-1 md:col-span-2 space-y-8">

                  {/* Topics Section */}
                  {Object.keys(groupedTopics).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <Layers className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Your Topics</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(groupedTopics).map(([topic, posts]) => (
                          <Card key={topic} className="p-4 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-colors flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-bold text-sm uppercase tracking-wider">{topic}</span>
                              </div>
                              <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{posts.length}</span>
                            </div>
                            <div className="space-y-2">
                              {posts.slice(0, 3).map(post => (
                                <div key={post.slug} className="flex items-center gap-3 group cursor-pointer">
                                  {post.thumbnail_url && (
                                    <img src={post.thumbnail_url} className="w-6 h-6 rounded object-cover bg-muted shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                  )}
                                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">{post.title}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests Section */}
                  {Object.keys(groupedInterests).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <Grid className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Your Interests</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(groupedInterests).map(([topic, posts]) => (
                          <Card key={topic} className="p-4 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-colors flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-bold text-sm uppercase tracking-wider">{topic}</span>
                              </div>
                              <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{posts.length}</span>
                            </div>
                            <div className="space-y-2">
                              {posts.slice(0, 3).map(post => (
                                <div key={post.slug} className="flex items-center gap-3 group cursor-pointer">
                                  {post.thumbnail_url && (
                                    <img src={post.thumbnail_url} className="w-6 h-6 rounded object-cover bg-muted shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                  )}
                                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">{post.title}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(groupedTopics).length === 0 && Object.keys(groupedInterests).length === 0 && (
                    <div className="p-8 border border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground h-full">
                      <Layers className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Read articles to see them grouped here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* DIVIDER */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-background px-2 text-muted-foreground">Apps & Widgets</span>
                </div>
              </div>

              {/* SECTION 3: WIDGETS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* For You Widget */}
                <motion.div className="col-span-1 md:col-span-1 relative group">
                  <Link href="/topic" className="absolute inset-0 z-10" />
                  <Card className="h-40 w-full bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col p-5">
                    <div className="flex items-center justify-between mb-auto">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Newspaper className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -rotate-45 group-hover:rotate-0 duration-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg tracking-tight">For You</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 font-medium mt-1">
                        {recentPosts.length} new updates
                      </p>
                    </div>
                  </Card>
                </motion.div>

                {/* Trending Widget */}
                <motion.div className="col-span-1 md:col-span-1 relative group">
                  <Link href="/explore" className="absolute inset-0 z-10" />
                  <Card className="h-40 w-full bg-gradient-to-br from-orange-500/5 to-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col p-5">
                    <div className="flex items-center justify-between mb-auto">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg tracking-tight">Trending</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 font-medium mt-1">
                        {trendingPosts[0]?.title || "Explore what's hot"}
                      </p>
                    </div>
                  </Card>
                </motion.div>

                {/* Saved Widget */}
                <motion.div className="col-span-1 relative group">
                  <Link href="/saved" className="absolute inset-0 z-10" />
                  <Card className="h-40 w-full bg-gradient-to-br from-blue-500/5 to-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col p-5">
                    <div className="flex items-center justify-between mb-auto">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-bold tabular-nums tracking-tight">{savedCount}</span>
                    </div>
                    <h3 className="font-semibold text-lg tracking-tight">Saved</h3>
                  </Card>
                </motion.div>

                {/* Search Widget */}
                <motion.div className="col-span-1 relative group">
                  <Link href="/search" className="absolute inset-0 z-10" />
                  <Card className="h-40 w-full bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 p-5 text-muted-foreground hover:text-foreground group-hover:border-primary/20">
                    <div className="p-3 bg-secondary rounded-full group-hover:bg-primary/10 transition-colors">
                      <Search className="w-6 h-6 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium text-sm">Search</span>
                    <div className="absolute bottom-3 right-3 flex gap-1">
                      <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">⌘</span>
                      <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">K</span>
                    </div>
                  </Card>
                </motion.div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
