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

interface PostViewProps {
  post: Post;
  isActive: boolean;
  emblaApi?: UseEmblaCarouselType[1];
}

const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const hasCompleted = useRef(false);

  useEffect(() => {
    setDisplayedText("");
    hasCompleted.current = false;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (!hasCompleted.current) {
          hasCompleted.current = true;
          onComplete?.();
        }
      }
    }, 10);
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <p className="text-base md:text-lg leading-relaxed font-sans text-foreground">
      {displayedText}
      {!hasCompleted.current && <span className="inline-block w-[2px] h-5 ml-1 bg-primary animate-pulse align-middle" />}
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
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  }, [summaryText]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 150 || info.velocity.y > 500) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <motion.div
        className={cn(
          "relative w-full h-full rounded-[40px] overflow-hidden cursor-pointer bg-card border border-border/50 shadow-sm group",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        layoutId={`card-container-${uniqueId}`}
        onClick={handleCardClick}
        whileHover={{ scale: 0.99 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Background Image with Blur & Zoom Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={post.thumbnail_url || ""}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
            layoutId={`image-${uniqueId}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>

        {/* Card Content - Neo-Minimalist Layout */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
          <motion.div layoutId={`header-${uniqueId}`} className="space-y-4">
            {/* Meta Tags - Glass Pill */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90 tracking-wide uppercase">
                News
              </span>
              <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Title - Clean Sans-Serif */}
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

      {/* Expanded View Portal - Raycast-inspired Floating Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Backdrop with Blur */}
              <motion.div
                className="absolute inset-0 bg-background/60 backdrop-blur-3xl"
                onClick={() => setIsExpanded(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal Container */}
              <motion.div
                className="relative w-full h-[92vh] md:h-[85vh] md:max-w-4xl bg-card/90 backdrop-blur-2xl border border-white/20 md:rounded-[40px] rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col"
                layoutId={`card-container-${uniqueId}`}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {/* Drag Handle / Header */}
                <div className="absolute top-0 left-0 right-0 h-14 flex justify-center items-center z-50 bg-gradient-to-b from-card/50 to-transparent pointer-events-none">
                  <div className="w-12 h-1.5 bg-foreground/20 rounded-full backdrop-blur-md" />
                </div>

                {/* Close Button (Desktop Hover / Mobile Tap) */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                  <X className="w-5 h-5 text-foreground/70" />
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                  {/* Hero Section */}
                  <div className="relative h-[40vh] w-full">
                    <motion.img
                      src={post.thumbnail_url || ""}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      layoutId={`image-${uniqueId}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    {/* Floating Title on Image */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                      <motion.div layoutId={`header-${uniqueId}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 rounded-full bg-background/30 backdrop-blur-xl border border-white/10 text-xs font-medium text-foreground/90 tracking-wide uppercase shadow-sm">
                            AI Briefing
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md px-2 py-1 rounded-full bg-background/20">
                            <Clock className="w-3 h-3" />
                            {readingTime}
                          </span>
                        </div>
                        <h1 className="font-sans text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight text-balance drop-shadow-sm">
                          {post.title}
                        </h1>
                      </motion.div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="px-8 md:px-12 pb-24 max-w-3xl mx-auto">
                    {/* AI Summary Block - Raycast Style */}
                    <div className="mb-10 p-6 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Key Insights</h3>
                      </div>
                      <div className="text-lg leading-relaxed text-foreground/90 font-sans">
                        <TypewriterText text={summaryText} />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-8 border-t border-border/50">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full border-border/50 bg-transparent hover:bg-accent">
                          <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                      </div>
                      <Button
                        className="w-full sm:w-auto rounded-full px-8 h-12 font-medium text-base shadow-lg shadow-primary/20"
                        onClick={() => window.open(post.link, "_blank")}
                      >
                        Read Full Story <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
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