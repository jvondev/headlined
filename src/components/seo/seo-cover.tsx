"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, PanInfo, useMotionValue, useTransform } from "framer-motion";
import Link from 'next/link';
import { ChevronRight, BarChart3, Globe, ChevronDown, ArrowRight, Rss, Hash, Tag, HelpCircle, Network } from "lucide-react";
import { CategoryId } from "@/lib/seo-config";
import { SEO_CATEGORIES, SeoKeywordDef } from "@/lib/seo-keywords";
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
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const handleExploreData = () => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({ left: width, behavior: 'smooth' });
        }
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
        containerRef.current?.addEventListener("wheel", handleWheel, { passive: true }); // Attach to container too
        return () => {
            window.removeEventListener("wheel", handleWheel);
            containerRef.current?.removeEventListener("wheel", handleWheel);
        };
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

    // Get fallback topics if relatedTopics is empty
    const fallbackTopics = (!relatedTopics || relatedTopics.length === 0)
        // @ts-ignore
        ? (SEO_CATEGORIES[category] || []).filter((k: SeoKeywordDef) => k.slug !== slug).slice(0, 6) // Limit to 6 for balance
        : [];

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
            <div ref={scrollRef} className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x">

                {/* SLIDE 1: INTRO */}
                <header className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 relative overflow-y-auto bg-background">
                    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
                        <nav aria-label="Breadcrumb" className="mb-8">
                            <ol className="flex items-center gap-2 text-sm text-muted-foreground/60 font-medium tracking-wide uppercas">
                                <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                                <span className="opacity-30">/</span>
                                <li>
                                    <Link href={`/${category}`} className="hover:text-foreground transition-colors capitalize">{category}</Link>
                                </li>
                                <span className="opacity-30">/</span>
                                <li className="text-foreground capitalize">
                                    {displayTitle}
                                </li>
                            </ol>
                        </nav>

                        <div className="space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="text-5xl md:text-7xl font-bold tracking-tighter capitalize text-foreground"
                            >
                                {title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl font-light intro-text"
                            >
                                {intro}
                            </motion.p>
                        </div>

                        {/* Premium Badges - Monochrome & Minimal */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="flex flex-wrap gap-3 mt-10 mb-12"
                        >
                            <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 backdrop-blur-sm rounded-full text-xs font-medium tracking-wider uppercase border border-foreground/10 text-foreground/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
                                Live Feed
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 backdrop-blur-sm rounded-full text-xs font-medium tracking-wider uppercase border border-foreground/10 text-foreground/80">
                                <Globe className="w-3.5 h-3.5" />
                                Verified Sources
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 backdrop-blur-sm rounded-full text-xs font-medium tracking-wider uppercase border border-foreground/10 text-foreground/80">
                                <Rss className="w-3.5 h-3.5" />
                                {totalArticles} Updates
                            </div>
                            {aliases && aliases.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-transparent rounded-full text-xs font-medium tracking-wider uppercase text-muted-foreground border border-dashed border-foreground/10">
                                    AKA: {aliases[0]}
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center gap-4 group cursor-pointer w-fit opacity-60 hover:opacity-100 transition-opacity"
                            onClick={handleExploreData}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Explore Data</span>
                                <div className="h-[1px] w-full bg-foreground/20 group-hover:bg-foreground/50 transition-colors" />
                            </div>
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <ArrowRight className="w-4 h-4 text-foreground" />
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center pb-8 safe-area-bottom pointer-events-none">
                        <motion.div
                            className="flex flex-col items-center gap-3"
                            animate={{ y: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Scroll to Read</span>
                        </motion.div>
                    </div>
                </header>

                {/* SLIDE 2: DASHBOARD */}
                <section aria-label="Topic Statistics" className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 bg-background overflow-y-auto">
                    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-4 mb-12 opacity-80">
                            <div className="p-3 rounded-full bg-primary/5 border border-primary/10">
                                <BarChart3 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Intelligence Brief</h2>
                                <p className="text-sm text-muted-foreground">Key metrics and top headlines</p>
                            </div>
                        </div>

                        {/* Executive Summary - Glass & Clean */}
                        <div className="mb-8 p-8 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary"></span>
                                Top Stories
                            </h3>

                            <section id="top-headlines" aria-label="Top headlines">
                                <ol className="space-y-4">
                                    {posts.slice(0, 5).map((p, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <span className="text-xs font-mono text-muted-foreground/50 mt-1">0{i + 1}</span>
                                            <strong className="text-base font-medium text-foreground/90 group-hover:text-primary transition-colors leading-snug">
                                                {p.title}
                                            </strong>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <div className="mt-6 pt-6 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Based on {totalArticles} sources</span>
                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                <span>AI Curated</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl border border-border/40 bg-card/20 backdrop-blur-sm">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Coverage</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold tracking-tighter">{totalArticles}</span>
                                    <span className="text-xs text-muted-foreground font-medium">Articles</span>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl border border-border/40 bg-card/20 backdrop-blur-sm">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Freshness</h3>
                                <time
                                    dateTime={posts[0]?.date || new Date().toISOString()}
                                    className="text-4xl font-bold tracking-tighter block truncate"
                                >
                                    {latestUpdate.split(',')[0]}
                                </time>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 3: FAQ */}
                {faqs && faqs.length > 0 && (
                    <section aria-label="Common Questions" className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 overflow-y-auto bg-background/50">
                        <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
                            <div className="flex items-center gap-4 mb-12 opacity-80">
                                <div className="p-3 rounded-full bg-primary/5 border border-primary/10">
                                    <HelpCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Deep Dive</h2>
                                    <p className="text-sm text-muted-foreground">Expert analysis & common queries</p>
                                </div>
                            </div>

                            <div className="bg-card/20 backdrop-blur-sm rounded-3xl p-1 border border-border/40">
                                <FaqAccordion faqs={faqs} />
                            </div>

                            {/* Trending Keywords - Minimal Pills */}
                            <div className="mt-12">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5" />
                                    Related Entities
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {topTopics.length > 0 ? topTopics.map(t => (
                                        <span key={t} className="px-4 py-2 bg-foreground/5 border border-foreground/5 rounded-full text-sm font-medium hover:bg-foreground/10 hover:border-foreground/20 transition-all cursor-default text-muted-foreground hover:text-foreground">
                                            {t}
                                        </span>
                                    )) : (
                                        <span className="text-muted-foreground italic text-sm">No entities available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* SLIDE 4: NETWORK / LINKS */}
                <nav aria-label="Explore Network" className="min-w-full w-full h-full snap-center flex flex-col p-6 md:p-12 bg-background overflow-y-auto">
                    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-4 mb-12 opacity-80">
                            <div className="p-3 rounded-full bg-primary/5 border border-primary/10">
                                <Network className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Network Graph</h2>
                                <p className="text-sm text-muted-foreground">Explore connected topics</p>
                            </div>
                        </div>

                        {relatedTopics && relatedTopics.length > 0 ? (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {relatedTopics.map((topic, i) => (
                                        <Link
                                            key={i}
                                            href={`/${topic.category}/${topic.slug}`}
                                            className="group relative overflow-hidden p-6 bg-card/40 hover:bg-card/80 rounded-3xl border border-border/40 hover:border-border/80 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5"
                                        >
                                            <div className="flex flex-col gap-3 relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{topic.category}</span>
                                                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                                </div>
                                                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors capitalize leading-tight">
                                                    {topic.title}
                                                </h4>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                                <InternalLinks currentCategory={category as CategoryId} currentSlug={slug} />
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* Fallback: Show keywords from current category formatted as big cards SAME as above */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {fallbackTopics.map((k: SeoKeywordDef) => (
                                        <Link
                                            key={k.slug}
                                            href={`/${category}/${k.slug}`}
                                            className="group relative overflow-hidden p-6 bg-card/40 hover:bg-card/80 rounded-3xl border border-border/40 hover:border-border/80 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5"
                                        >
                                            <div className="flex flex-col gap-3 relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{category}</span>
                                                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                                </div>
                                                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors capitalize leading-tight">
                                                    {k.title}
                                                </h4>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                                {/* NOTE: InternalLinks NOT shown here to avoid duplication as we just showed them as big cards */}
                            </div>
                        )}

                        <div className="mt-auto pt-12 flex flex-col items-center pb-safe">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex flex-col items-center gap-3 cursor-pointer"
                                onClick={handleDismiss}
                            >
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 group-hover:text-foreground transition-colors">Start Feed</span>
                                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <ChevronDown className="w-6 h-6 text-primary group-hover:translate-y-1 transition-transform" />
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </nav>

            </div>
        </motion.div>
    );
}
