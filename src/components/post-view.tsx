"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
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
    }, 10); // Slightly faster for better reading flow
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <p className="text-base md:text-lg leading-relaxed font-sans text-neutral-200/90">
      {displayedText}
      {!hasCompleted.current && <span className="inline-block w-[2px] h-5 ml-1 bg-blue-400 animate-pulse align-middle" />}
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

  return (
    <>
      <motion.div
        className={cn(
          "relative w-full h-full rounded-[32px] overflow-hidden cursor-pointer bg-neutral-900 group",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        layoutId={`card-container-${uniqueId}`}
        onClick={handleCardClick}
        whileHover={{ scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Background Image with Zoom Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={post.thumbnail_url || ""}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-80"
            layoutId={`image-${uniqueId}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Card Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <motion.div layoutId={`header-${uniqueId}`} className="space-y-3">
            {/* Meta Tags */}
            <div className="flex items-center gap-3 text-xs font-medium tracking-wider text-neutral-400 uppercase">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5 text-white">
                News
              </span>
              <span>•</span>
              <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-white leading-tight line-clamp-3 text-balance drop-shadow-sm">
              {post.title}
            </h2>
          </motion.div>

          {/* Subtle "Read" Indicator on Hover */}
          <div className="h-0 overflow-hidden group-hover:h-8 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 mt-0 group-hover:mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <span>Read Summary</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded View Portal */}
      {mounted && isExpanded && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />

          {/* Main Card Container */}
          <motion.div
            className="relative w-full h-[92vh] md:h-[85vh] md:max-w-2xl md:rounded-[40px] rounded-t-[32px] overflow-hidden bg-neutral-900 shadow-2xl flex flex-col"
            layoutId={`card-container-${uniqueId}`}
          >
            {/* Close Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Image Section */}
            <div className="relative h-[40%] md:h-[45%] w-full shrink-0">
              <motion.img
                src={post.thumbnail_url || ""}
                alt={post.title}
                className="w-full h-full object-cover"
                layoutId={`image-${uniqueId}`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-neutral-900" />
            </div>

            {/* Content Section */}
            <motion.div
              className="flex-1 relative bg-neutral-900 -mt-12 px-6 md:px-10 pb-8 overflow-y-auto no-scrollbar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Header */}
              <motion.div layoutId={`header-${uniqueId}`} className="mb-8 pt-4">
                <div className="flex items-center gap-3 text-xs font-medium tracking-wider text-neutral-400 uppercase mb-4">
                  <span className="text-blue-400 font-bold">AI Briefing</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readingTime}</span>
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-medium text-white leading-tight text-balance">
                  {post.title}
                </h1>
              </motion.div>

              {/* AI Summary Box */}
              <div className="relative mb-8">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-70" />
                <div className="pl-4">
                  <div className="flex items-center gap-2 mb-3 text-blue-300/80 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    <span>Key Insights</span>
                  </div>
                  <TypewriterText text={summaryText} />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-4 flex flex-col gap-3">
                <Button
                  className="w-full h-14 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-200 font-semibold text-lg shadow-lg shadow-white/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  onClick={() => window.open(post.link, "_blank")}
                >
                  Read Full Story
                  <ExternalLink className="w-5 h-5 opacity-60" />
                </Button>

                <div className="flex items-center justify-center gap-4 mt-2">
                  <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
};

export const PostView = React.memo(PostViewComponent);