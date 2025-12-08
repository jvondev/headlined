"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, PanInfo, useMotionValue, useTransform } from "framer-motion";
import Link from 'next/link';
import { ChevronRight, BarChart3, Globe, ChevronDown, ArrowRight, Rss, Hash, Tag, HelpCircle, Network } from "lucide-react";
import { CategoryId, SEO_CONFIG } from "@/lib/seo-config";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { FaqAccordion } from "./FaqAccordion";
import { InternalLinks } from "./InternalLinks";

interface SeoCoverProps {
    category: string;
    slug: string;
    title: string;
    intro: string;
    richTitle?: string;
    aliases?: string[];
    faqs?: { q: string; a: string; }[];
    posts: Post[];
    relatedTopics?: { category: string; slug: string; title: string }[];
}

export function SeoCover({ category, slug, title, intro, richTitle, aliases, faqs, posts, relatedTopics }: SeoCoverProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissing, setIsDismissing] = useState(false);
    const controls = useAnimation();
    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, -200], [1, 0]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Use rich title if provided, otherwise format slug
    const displayTitle = richTitle || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Calculate Stats
    const totalArticles = posts.length;
    const latestUpdate = posts[0]?.date
        ? new Date(posts[0].date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Recently';

    // Extract top topics/keywords
    const allTopics = posts.map(p => p.topic).filter(Boolean);
    const topicCounts: Record<string, number> = {};
    allTopics.forEach(t => {
        if (t) topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
    const topTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

    const handleDismiss = async () => {
        if (isDismissing) return;
        setIsDismissing(true);
        await controls.start({
            y: "-100%",
            transition: {
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1]
            }
        });
        setIsVisible(false);
    };

    // Handle Wheel (Desktop/Trackpad Scroll)
    useEffect(() => {
        if (!isVisible || isDismissing) return;

        let accumulateDelta = 0;

        const handleWheel = (e: WheelEvent) => {
            // Dismiss on vertical scroll down
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                accumulateDelta += e.deltaY;
                if (accumulateDelta > 50) { // Threshold for trackpad swipe
                    handleDismiss();
                }
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: true });
        return () => window.removeEventListener("wheel", handleWheel);
    }, [isVisible]);

    const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // If dragged up (finger moves up, content moves up) -> Dismiss
        if (info.offset.y < -50 || info.velocity.y < -300) {
            handleDismiss();
        } else {
            controls.start({ y: 0 });
        }
    };

    if (!isVisible) return null;

    return (
        <motion.div
            ref={containerRef}
            className={cn(
                "fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl overflow-hidden flex flex-col",
                isDismissing && "pointer-events-none"
            )}
            animate={controls}
            style={{ y, opacity }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
        >
            {/* Horizontal Scroll Container */}
            <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x">

                {/* SLIDE 1: INTRO */}
                <header className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 relative">
                    <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
                            <ol className="flex items-center gap-2">
                                <li><Link href="/" className="hover:text-foreground hover:underline underline-offset-4">Home</Link></li>
                                <ChevronRight className="h-4 w-4" />
                                <li>
                                    <Link href={`/${category}`} className="hover:text-foreground capitalize hover:underline underline-offset-4">{category}</Link>
                                </li>
                                <ChevronRight className="h-4 w-4" />
                                <li className="font-medium text-foreground capitalize">
                                    {displayTitle}
                                </li>
                            </ol>
                        </nav>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 capitalize leading-tight">
                            {title}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-8 intro-text">
                            {intro}
                        </p>

                        {/* Aliases Display */}
                        {aliases && aliases.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-8">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground mr-2">Also known as:</span>
                                {aliases.slice(0, 5).map(alias => (
                                    <span key={alias} className="text-xs bg-secondary/50 px-2.5 py-1 rounded-md text-foreground/80 font-medium">
                                        {alias}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* E-E-A-T Signals (NEW) */}
                        <div className="flex flex-wrap gap-4 mb-12">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold uppercase tracking-wider border border-green-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live Feed
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
                                <Globe className="w-3 h-3" />
                                Verified Sources
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-full text-xs font-semibold uppercase tracking-wider border border-purple-500/20">
                                <Rss className="w-3 h-3" />
                                {totalArticles}+ Articles
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4 animate-bounce">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Swipe Right for Data</span>
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center pb-8 safe-area-bottom">
                        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={handleDismiss}>
                            <span className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Scroll Down to Read Articles</span>
                            <ChevronDown className="w-6 h-6 text-foreground/50" />
                        </div>
                    </div>
                </header>

                {/* SLIDE 2: DASHBOARD */}
                <section aria-label="Topic Statistics" className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 bg-secondary/5">
                    <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-8 text-primary">
                            <BarChart3 className="w-8 h-8" />
                            <h2 className="text-3xl font-bold">Topic Insights</h2>
                        </div>

                        {/* Executive Summary (NEW) */}
                        <div className="mb-10 p-6 bg-card rounded-2xl border shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Rss className="w-4 h-4" />
                                Executive Summary
                            </h3>
                            <div className="space-y-3">
                                <p className="text-lg leading-relaxed font-medium">
                                    Current coverage on <span className="text-primary">{displayTitle}</span> is dominated by top stories including:
                                </p>

                                {/* AI Overview Optimized: Ordered List */}
                                <section id="top-headlines" aria-label="Top headlines">
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Top 5 {displayTitle} Headlines This Week</h4>
                                    <ol className="space-y-2 list-decimal list-inside marker:text-primary marker:font-bold">
                                        {posts.slice(0, 5).map((p, i) => (
                                            <li key={i} className="text-muted-foreground">
                                                <strong className="text-foreground">{p.title}</strong>
                                            </li>
                                        ))}
                                    </ol>
                                </section>

                                <p className="text-sm text-muted-foreground mt-4 italic">
                                    *Analysis based on {totalArticles} active sources.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="p-6 bg-card rounded-2xl border shadow-sm">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Coverage Volume</h3>
                                <p className="text-4xl font-bold">{totalArticles} <span className="text-lg text-muted-foreground font-normal">verified articles</span></p>
                            </div>
                            <div className="p-6 bg-card rounded-2xl border shadow-sm">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Freshness</h3>
                                <time
                                    dateTime={posts[0]?.date || new Date().toISOString()}
                                    className="text-4xl font-bold block"
                                >
                                    {latestUpdate}
                                </time>
                                <span className="text-xs text-muted-foreground mt-1 block">Last article updated</span>
                            </div>
                        </div>

                        {/* FAQ Section REMOVED from here */}
                    </div>
                </section>

                {/* SLIDE 3: FAQ */}
                {faqs && faqs.length > 0 && (
                    <section aria-label="Common Questions" className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 overflow-y-auto">
                        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                            <div className="flex items-center gap-3 mb-8 text-primary">
                                <HelpCircle className="w-8 h-8" />
                                <h2 className="text-3xl font-bold">Common Questions</h2>
                            </div>
                            <div className="bg-card/30 rounded-2xl p-2 border border-border/50">
                                <FaqAccordion faqs={faqs} />
                            </div>

                            {/* Trending Keywords */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-muted-foreground" />
                                    Trending Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {topTopics.length > 0 ? topTopics.map(t => (
                                        <span key={t} className="px-4 py-2 bg-background border rounded-full text-sm font-medium hover:bg-muted transition-colors cursor-default">
                                            #{t}
                                        </span>
                                    )) : (
                                        <span className="text-muted-foreground italic">No keywords data available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* SLIDE 4: NETWORK / LINKS */}
                <nav aria-label="Explore Network" className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12">
                    <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-8 text-primary">
                            <Globe className="w-8 h-8" />
                            <h2 className="text-3xl font-bold">Explore Network</h2>
                        </div>

                        {relatedTopics && relatedTopics.length > 0 ? (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {relatedTopics.map((topic, i) => (
                                        <Link
                                            key={i}
                                            href={`/${topic.category}/${topic.slug}`}
                                            className="group block p-4 bg-card hover:bg-accent rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <h4 className="font-semibold group-hover:text-primary transition-colors capitalize">
                                                {topic.title}
                                            </h4>
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {topic.slug.replace(/-/g, ' ')}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                                <InternalLinks currentCategory={category as CategoryId} currentSlug={slug} />
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="text-center py-12 text-muted-foreground">
                                    No direct related topics.
                                </div>
                                <InternalLinks currentCategory={category as CategoryId} currentSlug={slug} />
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={handleDismiss}>
                                <span className="text-sm font-semibold uppercase tracking-widest text-primary group-hover:underline">Start Reading Feed</span>
                                <ChevronDown className="w-6 h-6 text-primary animate-bounce decoration-transparent" />
                            </div>
                        </div>
                    </div>
                </nav>

            </div>
        </motion.div>
    );
}
