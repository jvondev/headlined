"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
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

const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSpeedingUp, setIsSpeedingUp] = useState(false);
    const hasCompleted = useRef(false);

    const textChars = useMemo(() => Array.from(text), [text]);

    useEffect(() => {
        setDisplayedText("");
        setCurrentIndex(0);
        setIsSpeedingUp(false);
        hasCompleted.current = false;
    }, [text]);

    useEffect(() => {
        if (currentIndex < textChars.length) {
            let delay = 0;
            let charsToAdd = 1;

            if (isSpeedingUp) {
                delay = 5;
                charsToAdd = 5;
            } else {
                const progress = currentIndex / textChars.length;
                const baseDelay = 30;
                const minDelay = 5;
                delay = Math.max(minDelay, baseDelay * (1 - progress));
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
    }, [currentIndex, textChars, onComplete, isSpeedingUp]);

    return (
        <div className="relative">
            {currentIndex < textChars.length && (
                <div
                    className="fixed inset-0 z-[150] cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSpeedingUp(true);
                    }}
                />
            )}
            <p className="text-base md:text-lg leading-relaxed font-sans text-primary-foreground">
                {displayedText}
                {currentIndex < textChars.length && <span className="inline-block w-[2px] h-5 ml-1 bg-primary animate-pulse align-middle" />}
            </p>
        </div>
    );
};

const PostViewPremiumComponent: FC<PostViewProps> = ({ post, isActive, isLocked, onUnlockRequest, onSave, isSaved, onShare }) => {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const wheelAccumulator = useRef(0);
    const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const y = useMotionValue(0);
    const x = useMotionValue(0);
    const opacityScale = useTransform(
        [y, x],
        ([latestY, latestX]) => {
            const distance = Math.sqrt((latestY as number) ** 2 + (latestX as number) ** 2);
            return Math.max(0.5, 1 - distance / 400);
        }
    );
    const scaleAnim = useTransform(
        [y, x],
        ([latestY, latestX]) => {
            const distance = Math.sqrt((latestY as number) ** 2 + (latestX as number) ** 2);
            return Math.max(0.95, 1 - distance / 4000);
        }
    );
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
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    }, [summaryText]);

    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        const scrollContainer = scrollContainerRef.current;
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            scrollTop: scrollContainer ? scrollContainer.scrollTop : 0,
        };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (!touchStart.current) return;

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - touchStart.current.y;
        const deltaX = currentX - touchStart.current.x;
        x.set(deltaX * 0.85);
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer) {
            y.set(deltaY);
            return;
        }

        const isInsideScrollable = scrollContainer.contains(e.target as Node);
        const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;

        if (isInsideScrollable && isScrollable) {
            if (touchStart.current.scrollTop <= 0 && deltaY > 0) {
                y.set(deltaY * 0.75);
            } else if (Math.abs(scrollContainer.scrollHeight - touchStart.current.scrollTop - scrollContainer.clientHeight) < 2 && deltaY < 0) {
                y.set(deltaY * 0.75);
            }
        } else {
            y.set(deltaY * 0.85);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.stopPropagation();
        touchStart.current = null;
        const verticalDistance = Math.abs(y.get());
        const horizontalDistance = Math.abs(x.get());

        if (verticalDistance > 60 || horizontalDistance > 60) {
            setIsExpanded(false);
        } else {
            animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
    };

    useEffect(() => {
        if (!isExpanded) return;

        const handleWheel = (e: WheelEvent) => {
            const scrollContainer = scrollContainerRef.current;
            if (!scrollContainer || !(e.target instanceof Node)) return;

            const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
            const isAtTop = scrollContainer.scrollTop <= 0;
            const isAtBottom = Math.abs(scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight) < 1;
            const isInsideScrollable = scrollContainer.contains(e.target);

            if (isInsideScrollable && isScrollable) {
                if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                    wheelAccumulator.current += e.deltaY;
                } else {
                    wheelAccumulator.current = 0;
                }
            } else {
                wheelAccumulator.current += e.deltaY;
            }

            if (Math.abs(wheelAccumulator.current) > 60) {
                setIsExpanded(false);
                wheelAccumulator.current = 0;
            }

            if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
            wheelTimeoutRef.current = setTimeout(() => {
                wheelAccumulator.current = 0;
            }, 150);
        };

        window.addEventListener("wheel", handleWheel);
        return () => {
            window.removeEventListener("wheel", handleWheel);
            if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
        };
    }, [isExpanded]);

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

                        {/* Multi-layer Gradients for Premium Depth - Monochrome */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/3 via-transparent to-white/2" />

                        {/* Subtle Noise Texture */}
                        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
                        }} />
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
                                    <span>{new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="font-sans text-[2rem] md:text-[2.5rem] lg:text-5xl font-black text-white leading-[1.1] tracking-tight text-balance drop-shadow-2xl transform transition-all duration-500 group-hover:scale-[1.01] group-hover:tracking-tighter">
                                {decodedTitle}
                            </h2>

                            {/* Preview */}
                            <p className="text-white/70 text-sm md:text-base leading-relaxed font-light line-clamp-2 transform transition-all duration-500 opacity-80 group-hover:opacity-100">
                                {post.description?.substring(0, 120) || summaryText.substring(0, 120)}...
                            </p>
                        </motion.div>

                        {/* Bottom Section */}
                        <div className="space-y-4">
                            {/* Reading Time */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    <span className="text-xs font-medium text-white/90">{readingTime}</span>
                                </div>
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                            </div>

                            {/* Interactive Hint */}
                            <motion.div
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"
                                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                whileHover={{ height: 'auto', opacity: 1, marginBottom: 8 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-black shadow-lg">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-white">Tap to read full story</p>
                                    <p className="text-[10px] text-white/60">AI-powered summary ready</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Locked Overlay */}
                        {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-20">
                                <motion.div
                                    className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 dark:from-zinc-300 dark:to-zinc-100 flex items-center justify-center shadow-xl">
                                        <Lock className="w-7 h-7 text-white dark:text-black" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-bold text-white">Premium Content</p>
                                        <p className="text-xs text-white/70">Support to unlock</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
                    <p className="text-muted-foreground mb-8 text-lg max-w-xs mx-auto">
                        Support ReadMore+ to access unlimited search results and history.
                    </p>
                    <Button size="lg" className="w-full max-w-xs rounded-full text-lg h-14 font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        Unlock Premium
                    </Button>
                </motion.div>
            )}

            {/* Expanded View Portal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="fixed inset-0 z-[100] flex flex-col bg-black overscroll-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="relative w-full h-full flex flex-col will-change-transform touch-pan-y"
                                style={{ x, y, opacity: opacityScale, scale: scaleAnim }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div className="absolute inset-0 overflow-hidden bg-muted/30 dark:bg-muted/10">
                                    {post.thumbnail_url ? (
                                        <motion.img
                                            src={post.thumbnail_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            layoutId={`image-${uniqueId}`}
                                            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                        />
                                    ) : (
                                        <motion.div
                                            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900"
                                            layoutId={`image-${uniqueId}`}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90" />
                                </div>

                                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50">
                                    <motion.button
                                        onClick={() => setIsExpanded(false)}
                                        className="p-2 rounded-full bg-black/40 border border-white/10 text-white/90 hover:bg-white/20 transition-colors"
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>

                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-medium text-white/90">
                                        <Clock className="w-3 h-3" />
                                        {readingTime}
                                    </div>
                                </div>

                                <div
                                    ref={scrollContainerRef}
                                    className="relative flex-1 flex flex-col justify-end p-6 md:p-12 pb-10 md:pb-16 overflow-y-auto no-scrollbar overscroll-contain"
                                    onScroll={(e) => e.stopPropagation()}
                                >
                                    <motion.div
                                        layoutId={`header-${uniqueId}`}
                                        className="max-w-3xl mx-auto w-full space-y-6"
                                    >
                                        <div className="flex items-center gap-3 opacity-80">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black uppercase tracking-wider">
                                                News
                                            </span>
                                            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
                                                {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <h1 className="font-sans text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight text-balance">
                                            {decodedTitle}
                                        </h1>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-primary-foreground/80">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-semibold uppercase tracking-wider">AI Summary</span>
                                            </div>

                                            <div className="text-lg md:text-xl leading-relaxed text-primary-foreground font-sans font-light border-l-2 border-white/80 pl-4">
                                                <TypewriterText text={summaryText} />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-6">
                                            <Button
                                                className="flex-1 h-12 rounded-full bg-white text-black hover:bg-white/90 font-medium text-base transition-transform active:scale-95"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(post.link, "_blank");
                                                }}
                                            >
                                                Read Full Story <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>

                                            {onSave && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className={cn(
                                                        "h-12 w-12 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm",
                                                        isSaved && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
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
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onShare?.();
                                                }}
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
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
