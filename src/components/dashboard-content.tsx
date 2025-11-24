"use client";

import React, { FC, useEffect, useState, useCallback } from "react";
import { Greeting } from "@/components/dashboard/greeting";
import { Clock } from "@/components/dashboard/clock";
import { getAllPostsFromIndexedDB, getReadHistory } from "@/lib/indexeddb";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { Post } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Newspaper, Bookmark, Search, PieChart, Calendar, Layers, ArrowRight, Sparkles, Grid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArchiveNavigation } from "@/components/dashboard/archive-navigation";
import { useArchiveAccess } from "@/hooks/use-archive-access";
import { checkLicenseStatus } from "@/lib/license-manager";
import { DistractionSettings } from "@/components/support/distraction-settings";
import { useAppUsage } from "@/hooks/use-app-usage";
import { PremiumModal } from "@/components/support/premium-modal";
import { SupportButton } from "@/components/support-button";

interface DashboardContentProps {
  setIsIntroMode?: (isIntro: boolean) => void;
  greetingMainText?: string;
  greetingSubText?: string;
  initialViewState?: "intro" | "dashboard";
  isIntroPaused?: boolean;
  date?: string;
  dateRange?: { start: string; end: string };
  periodLabel?: string;
}

export const DashboardContent: FC<DashboardContentProps> = ({ setIsIntroMode, greetingMainText, greetingSubText, initialViewState = "intro", isIntroPaused, date, dateRange, periodLabel }) => {
  const { hasAccess: hasArchiveAccess } = useArchiveAccess();
  const usage = useAppUsage();
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
  const [showSupportModal, setShowSupportModal] = useState(false);

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
      const todayStr = now.toISOString().split('T')[0];

      // Helper to get local YYYY-MM-DD from a date string
      const getLocalYMD = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.length === 10) return dateStr;
        const d = new Date(dateStr);
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
      };

      let filteredPosts = allPosts;

      if (date) {
        // Filter history for specific date (based on Post Date)
        history = history.filter(post => {
          if (!post.date) return false;
          const postDateStr = getLocalYMD(post.date);
          return postDateStr === date;
        });

        // Filter posts for specific date
        filteredPosts = allPosts.filter(p => p.date && getLocalYMD(p.date) === date);

      } else if (dateRange) {
        // Filter history for date range (based on Post Date)
        // dateRange.start and end are already local YYYY-MM-DD strings
        history = history.filter(post => {
          if (!post.date) return false;
          const postDateStr = getLocalYMD(post.date);
          return postDateStr >= dateRange.start && postDateStr <= dateRange.end;
        });

        // Filter posts for date range
        filteredPosts = allPosts.filter(p => {
          if (!p.date) return false;
          const postDateStr = getLocalYMD(p.date);
          return postDateStr >= dateRange.start && postDateStr <= dateRange.end;
        });

      } else {
        // Default view (Today) - Filter for Today's Content
        // We use the local YYYY-MM-DD of 'now' which is todayStr (calculated via ISO split might be UTC... wait)
        // new Date().toISOString() is UTC. We need local todayStr.
        const offset = now.getTimezoneOffset() * 60000;
        const localTodayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];

        history = history.filter(post => {
          if (!post.readAt) return false;
          const readDateStr = getLocalYMD(post.readAt);
          return readDateStr === localTodayStr;
        });

        // Filter posts for today only
        filteredPosts = allPosts.filter(p => p.date && getLocalYMD(p.date) === localTodayStr);
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

  const isPreviewMode = (date || dateRange) && !isPremiumUser;

  // Mock Data for Preview Mode
  const mockHistory = Array(5).fill(null).map((_, i) => ({
    slug: `mock-${i}`,
    title: "Premium Article Content Preview",
    description: "This content is available for premium supporters.",
    readAt: new Date().toISOString(),
    topic: ["Technology", "Science", "Health", "Design", "Business"][i % 5],
    thumbnail_url: null
  })) as (Post & { readAt: string })[];

  const mockTopicStats = [
    { topic: "Technology", count: 15, percentage: 45 },
    { topic: "Science", count: 10, percentage: 30 },
    { topic: "Health", count: 8, percentage: 25 }
  ];

  const mockInterestStats = [
    { interest: "AI", count: 8, percentage: 40 },
    { interest: "Space", count: 6, percentage: 30 },
    { interest: "Wellness", count: 6, percentage: 30 }
  ];

  const displayHistory = isPreviewMode ? mockHistory : readHistory;
  const displayTopicStats = isPreviewMode ? mockTopicStats : topicStats;
  const displayInterestStats = isPreviewMode ? mockInterestStats : interestStats;

  // Dynamic Mock Data based on User Subscriptions
  const displayGroupedTopics = isPreviewMode ? (
    subscribedTopics.length > 0 ?
      subscribedTopics.reduce((acc, topic) => {
        acc[topic.name] = mockHistory.slice(0, Math.floor(Math.random() * 3) + 1);
        return acc;
      }, {} as Record<string, (Post & { readAt: string })[]>)
      : { "Technology": mockHistory.slice(0, 3), "Science": mockHistory.slice(2, 4) } // Fallback if no subs
  ) : groupedTopics;

  const displayGroupedInterests = isPreviewMode ? (
    subscribedInterests.length > 0 ?
      subscribedInterests.reduce((acc, interest) => {
        acc[interest.name] = mockHistory.slice(0, Math.floor(Math.random() * 3) + 1);
        return acc;
      }, {} as Record<string, (Post & { readAt: string })[]>)
      : { "AI": mockHistory.slice(0, 2), "Space": mockHistory.slice(3, 5) } // Fallback if no subs
  ) : groupedInterests;

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
              viewState === "intro" ? "text-[6rem] md:text-[10rem] opacity-90" : "text-[4rem] md:text-[5rem] opacity-80"
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
              className="w-full max-w-6xl mx-auto space-y-12 relative"
            >
              {/* Premium Lock Overlay removed - allowing preview access */}

              <div className={cn("space-y-12 transition-all duration-500")}>
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
                          <h2 className={cn("text-xl md:text-2xl font-semibold leading-tight tracking-tight text-foreground", isPreviewMode && "blur-sm select-none")}>
                            {displayHistory.length > 0
                              ? (
                                periodLabel ? `You read ${displayHistory.length} articles ${periodLabel}.` :
                                  date ? `You read ${displayHistory.length} articles on ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.` :
                                    dateRange ? `You read ${displayHistory.length} articles from this period.` :
                                      `You've read ${displayHistory.length} articles today.`
                              )
                              : (
                                periodLabel ? `No reading activity ${periodLabel}.` :
                                  date ? `No articles read on ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.` :
                                    dateRange ? "No reading activity from this period." :
                                      "Start your reading journey today."
                              )}
                          </h2>
                          <p className={cn("text-muted-foreground mt-2 text-sm font-medium", isPreviewMode && "blur-sm select-none")}>
                            {displayHistory.length > 5
                              ? `You're diving deep into ${displayTopicStats[0]?.topic}. Keep it up!`
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
                        {displayTopicStats.slice(0, 3).map((stat) => (
                          <div key={stat.topic} className="space-y-1.5">
                            <div className={cn("flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground", isPreviewMode && "blur-sm select-none")}>
                              <span>{stat.topic}</span>
                              <span className="opacity-70">{Math.round(stat.percentage)}%</span>
                            </div>
                            <div className={cn("h-1.5 w-full bg-secondary rounded-full overflow-hidden", isPreviewMode && "blur-[2px]")}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.percentage}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                        {displayTopicStats.length === 0 && (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-medium">No data yet</div>
                        )}
                      </div>
                    </Card>
                  </motion.div >

                  {/* Stats: Interest Distribution */}
                  < motion.div className="col-span-1 md:col-span-1" >
                    <Card className="h-full p-5 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Grid className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Interests</span>
                      </div>
                      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                        {displayInterestStats.slice(0, 3).map((stat) => (
                          <div key={stat.interest} className="space-y-1.5">
                            <div className={cn("flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground", isPreviewMode && "blur-sm select-none")}>
                              <span className="line-clamp-1">{stat.interest}</span>
                              <span className="opacity-70">{Math.round(stat.percentage)}%</span>
                            </div>
                            <div className={cn("h-1.5 w-full bg-secondary rounded-full overflow-hidden", isPreviewMode && "blur-[2px]")}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.percentage}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                        {displayInterestStats.length === 0 && (
                          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-medium">No data yet</div>
                        )}
                      </div>
                    </Card>
                  </motion.div >
                </div >

                {/* SECTION 2: TIMELINE & TOPIC/INTEREST CARDS */}
                < div className="grid grid-cols-1 md:grid-cols-3 gap-8" >
                  {/* Timeline (Left Column) */}
                  < div className="col-span-1 md:col-span-1" >
                    <Card className="h-full p-5 bg-card/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                      <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Timeline</h3>
                      </div>
                      <div className="relative border-l border-border/50 ml-2 pl-6 space-y-8 py-2 flex-1">
                        {displayHistory.length > 0 ? (
                          <>
                            <div className={cn(isPreviewMode && "blur-sm select-none pointer-events-none")}>
                              {displayHistory.slice(0, timelineItemsToShow).map((post, i) => (
                                <div key={post.slug || i} className="relative group mb-8 last:mb-0">
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
                            </div>
                            {displayHistory.length > timelineItemsToShow && !isPreviewMode && (
                              <button
                                onClick={() => setTimelineItemsToShow(displayHistory.length)}
                                className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-border/50 rounded-md hover:bg-primary/5"
                              >
                                Show More ({displayHistory.length - timelineItemsToShow} more)
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No reading activity yet.</p>
                        )}

                        {/* Preview Mode Message Overlay */}
                        {isPreviewMode && (
                          <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
                            <div className="bg-background/95 backdrop-blur-sm border border-border p-4 rounded-xl shadow-lg text-center max-w-[240px]">
                              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                              <p className="text-xs font-medium text-foreground mb-3">
                                Unlock your complete reading history and deep dive into your past interests.
                              </p>
                              <SupportButton onClick={() => setShowSupportModal(true)} className="w-full h-8 text-xs" />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div >

                  {/* Right Column: Topics & Interests */}
                  < div className="col-span-1 md:col-span-2 space-y-8" >

                    {/* Topics Section */}
                    {
                      Object.keys(displayGroupedTopics).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 px-1">
                            <Layers className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Your Topics</h3>
                          </div>
                          <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", isPreviewMode && "blur-sm select-none pointer-events-none")}>
                            {Object.entries(displayGroupedTopics).map(([topic, posts]) => (
                              <Card key={topic} className="p-4 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-colors flex flex-col gap-3">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="font-bold text-sm uppercase tracking-wider">{topic}</span>
                                  </div>
                                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{posts.length}</span>
                                </div>
                                <div className="space-y-2">
                                  {posts.slice(0, 3).map((post, i) => (
                                    <div key={post.slug || i} className="flex items-center gap-3 group cursor-pointer">
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
                      )
                    }

                    {/* Interests Section */}
                    {
                      Object.keys(displayGroupedInterests).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 px-1">
                            <Grid className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Your Interests</h3>
                          </div>
                          <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", isPreviewMode && "blur-sm select-none pointer-events-none")}>
                            {Object.entries(displayGroupedInterests).map(([topic, posts]) => (
                              <Card key={topic} className="p-4 bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/20 transition-colors flex flex-col gap-3">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="font-bold text-sm uppercase tracking-wider">{topic}</span>
                                  </div>
                                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{posts.length}</span>
                                </div>
                                <div className="space-y-2">
                                  {posts.slice(0, 3).map((post, i) => (
                                    <div key={post.slug || i} className="flex items-center gap-3 group cursor-pointer">
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
                      )
                    }

                    {
                      Object.keys(displayGroupedTopics).length === 0 && Object.keys(displayGroupedInterests).length === 0 && (
                        <div className="p-8 border border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground h-full">
                          <Layers className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">Read articles to see them grouped here.</p>
                        </div>
                      )
                    }
                  </div >
                </div >

                {/* DIVIDER */}
                < div className="relative py-4" >
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-background px-2 text-muted-foreground">Apps & Widgets</span>
                  </div>
                </div >

                {/* SECTION 3: WIDGETS */}
                < div className="grid grid-cols-1 md:grid-cols-4 gap-4" >
                  {/* For You Widget */}
                  < motion.div className="col-span-1 md:col-span-1 relative group" >
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
                  </motion.div >

                  {/* Trending Widget */}
                  < motion.div className="col-span-1 md:col-span-1 relative group" >
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
                  </motion.div >

                  {/* Saved Widget */}
                  < motion.div className="col-span-1 relative group" >
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
                  </motion.div >

                  {/* Search Widget */}
                  < motion.div className="col-span-1 relative group" >
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
                  </motion.div >
                </div >

                {/* Distraction Settings (Premium Feature - Unlocks after 2 days) */}
                {usage.daysUsed > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div className="col-span-1 md:col-span-2 md:col-start-2">
                      <DistractionSettings
                        isPremium={isPremiumUser}
                        onOpenSupport={() => setShowSupportModal(true)}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <PremiumModal
                isOpen={showSupportModal}
                onClose={() => {
                  setShowSupportModal(false);
                  fetchData(); // Refresh data in case license was activated
                }}
              />
            </motion.div >
          )
          }
        </AnimatePresence >
      </div >
    </div >
  );
};
