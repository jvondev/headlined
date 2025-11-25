"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Share2, ExternalLink, X, Sparkles, Clock, ChevronRight, Lock, Bookmark, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { addToReadHistory } from "@/lib/indexeddb";

interface PostViewProps {
    post: Post;
    isActive: boolean;
    emblaApi?: UseEmblaCarouselType[1];
    isLocked?: boolean;
    onUnlockRequest?: () => void;
    onSave?: () => void;
    isSaved?: boolean;
    onShare?: () => void;
}

const decodeHtmlEntities = (text: string) => {
    if (typeof window === 'undefined') return text;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};

const TypewriterText = ({ text, onComplete, shouldSkip }: { text: string; onComplete?: () => void; shouldSkip: boolean }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasCompleted = useRef(false);

    const textChars = useMemo(() => Array.from(text), [text]);

    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
        hasCompleted.current = false;
    }, [text]);

    useEffect(() => {
        if (currentIndex < textChars.length) {
            let delay = 30;
            let charsToAdd = 1;

            if (shouldSkip) {
                delay = 2;
                charsToAdd = 5;
            } else {
                const progress = currentIndex / textChars.length;
                delay = Math.max(5, 30 * (1 - progress));
            }

            const timer = setTimeout(() => {
                const nextIndex = Math.min(currentIndex + charsToAdd, textChars.length);
                setDisplayedText(textChars.slice(0, nextIndex).join(''));
                setCurrentIndex(nextIndex);
            }, delay);
            return () => clearTimeout(timer);
        } else if (currentIndex === textChars.length && !hasCompleted.current) {
            hasCompleted.current = true;
            onComplete?.();
        }
    }, [currentIndex, textChars, onComplete, shouldSkip]);

    return (
        <p className="text-lg md:text-xl leading-relaxed font-serif text-zinc-300">
            {displayedText}
            {currentIndex < textChars.length && <span className="inline-block w-[2px] h-5 ml-1 bg-white animate-pulse align-middle" />}
        </p>
    );
};

const PostViewPremiumComponent: FC<PostViewProps> = ({ post, isActive, isLocked, onUnlockRequest, onSave, isSaved, onShare }) => {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [skipTypewriter, setSkipTypewriter] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Gestures
    const y = useMotionValue(0);
    const x = useMotionValue(0);
    const opacityScale = useTransform([y, x], ([latestY, latestX]) => {
        const distance = Math.sqrt((latestY as number) ** 2 + (latestX as number) ** 2);
        return Math.max(0.5, 1 - distance / 400);
    });
    const scaleAnim = useTransform([y, x], ([latestY, latestX]) => {
        const distance = Math.sqrt((latestY as number) ** 2 + (latestX as number) ** 2);
        return Math.max(0.95, 1 - distance / 4000);
    });
    const touchStart = useRef<{ x: number; y: number; scrollTop: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            y.set(0);
            x.set(0);
            setSkipTypewriter(false);
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isExpanded, y, x]);

    const isCTA = post.slug === 'premium-cta';

    const handleCardClick = () => {
        if (isCTA) {
            onUnlockRequest?.();
            return;
        }
        if (post.slug === "home") {
            router.push(post.link);
            return;
        }
        if (isLocked) {
            onUnlockRequest?.();
            return;
        }
        if (!isExpanded) {
            addToReadHistory(post).catch(console.error);
        }
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        if (!isActive) {
            setIsExpanded(false);
        }
    }, [isActive]);

    const summaryText = useMemo(() => {
        let text = "No summary available.";
        if (post.summaries && post.summaries.length > 0 && post.summaries[0].content) {
            text = typeof post.summaries[0].content === 'string'
                ? post.summaries[0].content
                : post.summaries[0].content.snippet || post.description || "No summary available.";
        } else if (post.description) {
            text = post.description;
        }
        return decodeHtmlEntities(text);
    }, [post]);

    const uniqueId = post.slug || post.title || Math.random().toString();
    const decodedTitle = useMemo(() => decodeHtmlEntities(post.title), [post.title]);

    const readingTime = useMemo(() => {
        const words = summaryText.split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    }, [summaryText]);

    // Enhanced Touch Handling for "Award Worthy" Feel
    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollContainer = scrollContainerRef.current;
        // Allow gesture if at top of scroll
        if (scrollContainer && scrollContainer.scrollTop > 5) return;

        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            scrollTop: scrollContainer ? scrollContainer.scrollTop : 0,
        };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer && scrollContainer.scrollTop > 5) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - touchStart.current.y;
        const deltaX = currentX - touchStart.current.x;

        // Only allow dragging DOWN to close
        if (deltaY > 0) {
            // Add resistance
            const resistance = 0.5;
            y.set(deltaY * resistance);

            // Optional: slight horizontal movement for natural feel
            x.set(deltaX * 0.2);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchStart.current = null;
        const verticalDistance = y.get();

        // Threshold to close
        if (verticalDistance > 120) {
            setIsExpanded(false);
        } else {
            // Spring back
            animate(y, 0, { type: "spring", stiffness: 400, damping: 40 });
            animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
        }
    };

    return (
        <>
            {/* PREMIUM COLLAPSED CARD */}
            <motion.div
                className={cn(
                    "relative w-full h-full rounded-[28px] overflow-hidden cursor-pointer group",
                    isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
                layoutId={`card-container-${uniqueId}`}
                onClick={handleCardClick}
                whileHover={{ scale: 0.985, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
                {/* Premium Glow Effect - Monochrome */}
                <div className="absolute -inset-1 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                {/* Main Card Container */}
                <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-gradient-to-br from-zinc-900 to-black shadow-2xl border border-white/5">
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden">
                        {post.thumbnail_url ? (
                            <motion.img
                                src={post.thumbnail_url}
                                alt=""
                                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                                layoutId={`image-${uniqueId}`}
                            />
                        ) : (
                            <motion.div
                                className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"
                                layoutId={`image-${uniqueId}`}
                            />
                        )}

                        {/* Multi-layer Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/3 via-transparent to-white/2" />
                    </div>

                    {/* Card Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-7 md:p-10">
                        <motion.div layoutId={`header-${uniqueId}`} className="space-y-5 pt-2">
                            {/* Meta Info */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-xs font-semibold text-white tracking-wide uppercase shadow-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    {post.topic || 'News'}
                                </span>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 border border-white/10 text-xs font-medium text-white/80">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="font-sans text-[2rem] md:text-[2.5rem] lg:text-5xl font-black text-white leading-[1.1] tracking-tight text-balance drop-shadow-2xl">
                                {decodedTitle}
                            </h2>

                            {/* Preview */}
                            <p className="text-white/70 text-sm md:text-base leading-relaxed font-light line-clamp-2 opacity-80">
                                {post.description?.substring(0, 120) || summaryText.substring(0, 120)}...
                            </p>
                        </motion.div>

                        {/* Bottom Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    <span className="text-xs font-medium text-white/90">{readingTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Locked Overlay */}
                        {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-20">
                                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center shadow-xl">
                                        <Lock className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-white">Premium Content</p>
                                        <p className="text-xs text-white/70">Support to unlock</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* CTA Card Override */}
            {isCTA && (
                <motion.div
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background p-8 text-center"
                    onClick={handleCardClick}
                >
                    <div className="mb-6 p-4 bg-primary/10 rounded-full">
                        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tight">Unlock More Results</h2>
                    <Button size="lg" className="w-full max-w-xs rounded-full text-lg h-14 font-bold shadow-lg mt-8">
                        Unlock Premium
                    </Button>
                </motion.div>
            )}

            {/* EXPANDED VIEW PORTAL */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            layoutId={`card-container-${uniqueId}`}
                            className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 backdrop-blur-xl overscroll-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.div
                                className="relative w-full h-full flex flex-col will-change-transform touch-pan-y"
                                style={{ x, y, opacity: opacityScale, scale: scaleAnim }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onClick={() => setSkipTypewriter(true)}
                            >
                                {/* Close Button */}
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(false);
                                    }}
                                    className="absolute top-6 right-6 z-[60] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95 shadow-lg"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>

                                {/* Single Scrollable Container */}
                                <div
                                    ref={scrollContainerRef}
                                    className="flex-1 overflow-y-auto no-scrollbar overscroll-contain"
                                >
                                    {/* Hero Section - Scrolls with content */}
                                    <div className="relative w-full h-[45vh] md:h-[55vh]">
                                        {post.thumbnail_url ? (
                                            <motion.img
                                                src={post.thumbnail_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                layoutId={`image-${uniqueId}`}
                                            />
                                        ) : (
                                            <motion.div
                                                className="w-full h-full bg-gradient-to-br from-zinc-800 to-black"
                                                layoutId={`image-${uniqueId}`}
                                            />
                                        )}
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90" />

                                        {/* Title on Image */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pb-12 flex flex-col justify-end z-20">
                                            <motion.div layoutId={`header-${uniqueId}`} className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-black uppercase tracking-widest shadow-lg">
                                                        {post.topic || 'News'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-white/90 uppercase tracking-wide bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h1 className="font-sans text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter text-balance drop-shadow-2xl">
                                                    {decodedTitle}
                                                </h1>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Content Body - Dark Mode */}
                                    <div className="relative z-10 bg-zinc-950 px-6 md:px-10 py-10 pb-32 -mt-6 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
                                        {/* Drag Handle Indicator */}
                                        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-8" />

                                        <div className="max-w-3xl mx-auto space-y-8">
                                            {/* Summary Header */}
                                            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                                <div className="p-2 rounded-full bg-white/5 border border-white/5">
                                                    <Sparkles className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Executive Summary</span>
                                                <div className="flex-1" />
                                                <span className="text-xs font-medium text-zinc-500">{readingTime}</span>
                                            </div>

                                            {/* Typewriter Summary */}
                                            <div className="min-h-[200px]">
                                                <TypewriterText text={summaryText} shouldSkip={skipTypewriter} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Action Dock */}
                                <motion.div
                                    className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
                                        <Button
                                            className="h-12 px-8 rounded-full font-bold text-base tracking-wide shadow-lg bg-white text-black hover:bg-zinc-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(post.link, "_blank");
                                            }}
                                        >
                                            Read Full Story <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>

                                        <div className="w-px h-6 bg-white/10 mx-1" />

                                        {onSave && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "h-12 w-12 rounded-full hover:bg-white/10 transition-all text-white",
                                                    isSaved && "text-white bg-white/20"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSave();
                                                }}
                                            >
                                                <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 rounded-full hover:bg-white/10 transition-all text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onShare?.();
                                            }}
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export const PostViewPremium = React.memo(PostViewPremiumComponent);
