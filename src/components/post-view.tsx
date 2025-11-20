"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Share2, ExternalLink, X, Sparkles, Clock, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { addToReadHistory } from "@/lib/indexeddb";

interface PostViewProps {
  post: Post;
  isActive: boolean;
  emblaApi?: UseEmblaCarouselType[1];
}

const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasCompleted = useRef(false);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    hasCompleted.current = false;
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        setCurrentIndex((prev) => prev + 1);
      }, 30); // Slower typing speed for more natural feel
      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete?.();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <p className="text-base md:text-lg leading-relaxed font-sans text-primary-foreground">
      {displayedText}
      {currentIndex < text.length && <span className="inline-block w-[2px] h-5 ml-1 bg-primary animate-pulse align-middle" />}
    </p>
  );
};

const PostViewComponent: FC<PostViewProps> = ({ post, isActive }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCardClick = () => {
    if (post.slug === "home") {
      router.push(post.link);
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
    if (post.summaries && post.summaries.length > 0 && post.summaries[0].content) {
      return typeof post.summaries[0].content === 'string'
        ? post.summaries[0].content
        : post.summaries[0].content.snippet || post.description || "No summary available.";
    }
    return post.description || "No summary available.";
  }, [post]);

  const uniqueId = post.slug || post.title || Math.random().toString();

  // Calculate reading time (approximate)
  const readingTime = useMemo(() => {
    const words = summaryText.split(/\s+/).length;
    const minutes = Math.ceil(words / 4);
    return `${minutes} min read`;
  }, [summaryText]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Allow swipe in any direction to dismiss (mobile friendly)
    // Lower thresholds for better sensitivity
    const threshold = 80;
    const velocityThreshold = 400;

    if (
      Math.abs(info.offset.y) > threshold ||
      Math.abs(info.velocity.y) > velocityThreshold ||
      Math.abs(info.offset.x) > threshold ||
      Math.abs(info.velocity.x) > velocityThreshold
    ) {
      setIsExpanded(false);
    }
  };

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
            {/* Meta Tags - Glass Pill */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90 tracking-wide uppercase">
                News
              </span>
              <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Title - Clean Sans-Serif - Moved to Top for better readability */}
            <h2 className="font-sans text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight text-balance drop-shadow-lg">
              {post.title}
            </h2>
          </motion.div>

          {/* Subtle Interaction Hint */}
          <div className="h-0 overflow-hidden group-hover:h-10 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 mt-0 group-hover:mt-6">
            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
              <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </span>
              <span>View Details</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded View Portal - Full Screen Morphing Design */}
      {mounted && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="fixed inset-0 z-[100] flex flex-col bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main Container with Drag to Dismiss */}
              <motion.div
                className="relative w-full h-full flex flex-col"
                drag
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
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
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 hover:bg-white/20 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Reading Time Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
                    <Clock className="w-3 h-3" />
                    {readingTime}
                  </div>
                </div>

                {/* Content Overlay - Bottom Aligned */}
                <div className="relative flex-1 flex flex-col justify-end p-6 md:p-12 pb-10 md:pb-16 overflow-y-auto no-scrollbar">
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
                      {post.title}
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

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share logic here
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