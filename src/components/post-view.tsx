"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Share2, ExternalLink, X, Sparkles, Clock, ChevronRight, Lock, Bookmark } from "lucide-react";
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

  // Convert text to array of characters (handles Unicode properly including emojis)
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
        delay = 5; // Super fast tick
        charsToAdd = 5; // Add multiple chars to speed up significantly
      } else {
        // Calculate delay based on progress: slower at start, faster at end
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

const PostViewComponent: FC<PostViewProps> = ({ post, isActive, isLocked, onUnlockRequest, onSave, isSaved, onShare }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wheelAccumulator = useRef(0);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual Touch Handling State
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

  // Lock body scroll and reset state when expanded
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
      // Track read history when expanding
      addToReadHistory(post).catch(console.error);
    }

    setIsExpanded(!isExpanded);
  };

  // Reset state when slide changes
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

  // Decode title for display
  const decodedTitle = useMemo(() => decodeHtmlEntities(post.title), [post.title]);

  // Calculate reading time (approximate)
  const readingTime = useMemo(() => {
    const words = summaryText.split(/\s+/).length;
    const minutes = Math.ceil(words / 4);
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
      // Dragging down from top
      if (touchStart.current.scrollTop <= 0 && deltaY > 0) {
        y.set(deltaY * 0.75); // Reduced Resistance (easier to drag)
      }
      // Dragging up from bottom
      else if (Math.abs(scrollContainer.scrollHeight - touchStart.current.scrollTop - scrollContainer.clientHeight) < 2 && deltaY < 0) {
        y.set(deltaY * 0.75); // Reduced Resistance
      }
    } else {
      // Outside scrollable area
      y.set(deltaY * 0.85); // Reduced Resistance
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStart.current = null;
    // Lower threshold for easier closing - now checks both vertical AND horizontal movement
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

      // If we don't have the ref yet, or if the event target isn't a node, ignore
      if (!scrollContainer || !(e.target instanceof Node)) return;

      const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      const isAtTop = scrollContainer.scrollTop <= 0;
      // 1px tolerance for float calculations
      const isAtBottom = Math.abs(scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight) < 1;

      const isInsideScrollable = scrollContainer.contains(e.target);

      if (isInsideScrollable && isScrollable) {
        // If inside scrollable content:
        // Only accumulate if we are at boundaries and trying to scroll past them
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          wheelAccumulator.current += e.deltaY;
        } else {
          // Otherwise we are scrolling content, reset accumulator
          wheelAccumulator.current = 0;
        }
      } else {
        // If outside scrollable area (e.g. image) or content fits screen:
        // Any vertical swipe contributes to closing
        wheelAccumulator.current += e.deltaY;
      }

      // Threshold for closing (adjust as needed, 60 is easier than 100)
      if (Math.abs(wheelAccumulator.current) > 60) {
        setIsExpanded(false);
        wheelAccumulator.current = 0;
      }

      // Reset accumulator if no events for a short time
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
      <motion.div
        className={cn(
          "relative w-full h-full rounded-[24px] overflow-hidden cursor-pointer bg-card border border-border/50 shadow-sm group",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        layoutId={`card-container-${uniqueId}`}
        onClick={handleCardClick}
        whileHover={{ scale: 0.99 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Background Image with Blur & Zoom Effect */}
        <div className="absolute inset-0 overflow-hidden bg-muted/30 dark:bg-muted/10">
          {post.thumbnail_url ? (
            <motion.img
              src={post.thumbnail_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
              layoutId={`image-${uniqueId}`}
            />
          ) : (
            <motion.div
              className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900"
              layoutId={`image-${uniqueId}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </div>

        {/* Card Content - Neo-Minimalist Layout */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
          <motion.div layoutId={`header-${uniqueId}`} className="space-y-4 pt-4">
            {/* Meta Tags - Glass Pill - Optimized: Removed backdrop-blur-md */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-medium text-white/90 tracking-wide uppercase">
                News
              </span>
              <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Title - Clean Sans-Serif - Moved to Top for better readability */}
            <h2 className="font-sans text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight text-balance drop-shadow-lg">
              {decodedTitle}
            </h2>
          </motion.div>

          {/* Subtle Interaction Hint */}
          <div className="h-0 overflow-hidden group-hover:h-10 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 mt-0 group-hover:mt-6">
            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
              <span className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </span>
              <span>View Details</span>
            </div>
          </div>

          {/* Locked State Overlay */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
              <div className="bg-background/90 p-3 rounded-full shadow-lg">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>
          )}
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

      {/* Expanded View Portal - Full Screen Morphing Design */}
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
              {/* Main Container with Drag to Dismiss */}
              <motion.div
                className="relative w-full h-full flex flex-col will-change-transform touch-pan-y"
                style={{ x, y, opacity: opacityScale, scale: scaleAnim }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Full Screen Morphing Image */}
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
                  {/* Gradient Overlay for Text Readability - Calibrated for Productivity/Focus */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90" />
                </div>

                {/* Top Bar - Minimalist Utility */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50">
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full bg-black/40 border border-white/10 text-white/90 hover:bg-white/20 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Reading Time Badge - Optimized: Removed backdrop-blur-md */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-medium text-white/90">
                    <Clock className="w-3 h-3" />
                    {readingTime}
                  </div>
                </div>

                {/* Content Overlay - Bottom Aligned */}
                <div
                  ref={scrollContainerRef}
                  className="relative flex-1 flex flex-col justify-end p-6 md:p-12 pb-10 md:pb-16 overflow-y-auto no-scrollbar overscroll-contain"
                  onScroll={(e) => e.stopPropagation()}
                >
                  <motion.div
                    layoutId={`header-${uniqueId}`}
                    className="max-w-3xl mx-auto w-full space-y-6"
                  >
                    {/* Meta Info */}
                    <div className="flex items-center gap-3 opacity-80">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black uppercase tracking-wider">
                        News
                      </span>
                      <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
                        {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Title - Clean & Impactful */}
                    <h1 className="font-sans text-3xl md:text-2xl font-bold text-white leading-tight tracking-tight text-balance">
                      {decodedTitle}
                    </h1>

                    {/* Key Insights / Summary - Distraction Free */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary-foreground/80">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Summary</span>
                      </div>

                      <div className="text-lg md:text-xl leading-relaxed text-primary-foreground font-sans font-light border-l-2 border-white/80 pl-4">
                        <TypewriterText text={summaryText} />
                      </div>
                    </div>

                    {/* Action Bar - Utility First */}
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

export const PostView = React.memo(PostViewComponent);