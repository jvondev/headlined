"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, ExternalLink, X, Maximize2, Minimize2 } from "lucide-react";
import { paperNoise, getPaperStyles } from "@/lib/paper-texture";
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
    }, 15); // Fast typing speed
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <p className="text-lg leading-relaxed font-serif text-slate-700">
      {displayedText}
      {!hasCompleted.current && <span className="inline-block w-[2px] h-5 ml-1 bg-slate-400 animate-pulse align-middle" />}
    </p>
  );
};

const PostViewComponent: FC<PostViewProps> = ({ post, isActive, emblaApi }) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const peekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Peek Logic
  const handlePointerDown = () => {
    if (isExpanded) return;
    peekTimeoutRef.current = setTimeout(() => {
      setIsPeeking(true);
    }, 300);
  };

  const handlePointerUp = () => {
    if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    setIsPeeking(false);
  };

  const handleCardClick = () => {
    if (isPeeking) return;
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
      setIsPeeking(false);
    }
  }, [isActive]);

  const paperStyle = useMemo(() => {
    const styles = getPaperStyles(post.slug || post.title || "default");
    return { ...styles, transform: 'none' };
  }, [post.slug, post.title]);

  const summaryText = useMemo(() => {
    if (post.summaries && post.summaries.length > 0 && post.summaries[0].content) {
      return typeof post.summaries[0].content === 'string'
        ? post.summaries[0].content
        : post.summaries[0].content.snippet || post.description || "No summary available.";
    }
    return post.description || "No summary available.";
  }, [post]);

  const uniqueId = post.slug || post.title || Math.random().toString();

  return (
    <>
      <motion.div
        className={cn(
          "relative w-full h-full rounded-2xl overflow-hidden cursor-pointer shadow-xl",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        layoutId={`card-container-${uniqueId}`}
        onClick={handleCardClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          backgroundImage: paperNoise,
          backgroundColor: '#fdfbf7',
          ...paperStyle,
        }}
      >
        {/* Card Content (Collapsed) */}
        <motion.div className="relative w-full h-full overflow-hidden bg-neutral-900">
          <motion.img
            src={post.thumbnail_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            layoutId={`image-${uniqueId}`}
          />
          {/* Gradient for Title Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

          {/* Title at TOP */}
          <motion.div className="absolute top-0 left-0 p-6 w-full" layoutId={`header-${uniqueId}`}>
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase text-white/80 mb-3">
              <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm">News</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <h1 className="font-headline font-bold text-white drop-shadow-md leading-tight text-2xl line-clamp-3 tracking-tight">
              {post.title}
            </h1>
          </motion.div>

          {/* Hint Icon */}
          <div className="absolute bottom-6 right-6">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/10 text-white/90 shadow-lg">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Peek Overlay */}
        <AnimatePresence>
          {isPeeking && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-40 bg-black/40 flex flex-col justify-center items-center text-center p-8"
            >
              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl max-w-xs mx-auto border border-white/50 text-slate-900">
                <h3 className="font-headline text-lg font-bold mb-3">{post.title}</h3>
                <p className="text-slate-700 line-clamp-5 font-serif leading-relaxed text-sm">
                  {summaryText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expanded View Portal - Premium Light Glass */}
      {mounted && isExpanded && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
          <motion.div
            className="relative w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-[500px] md:rounded-[40px] overflow-hidden shadow-2xl bg-black"
            layoutId={`card-container-${uniqueId}`}
          >
            {/* Full Screen Image */}
            <motion.img
              src={post.thumbnail_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
              layoutId={`image-${uniqueId}`}
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 10, ease: "linear" }}
            />

            {/* Header Actions (Top) */}
            <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
              {/* AI Briefing Label */}
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">AI Briefing</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full bg-black/20 backdrop-blur-md">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full bg-black/20 backdrop-blur-md" onClick={() => setIsExpanded(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Floating Glass Panel */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 z-20"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
            >
              <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 flex flex-col gap-6">

                {/* Header inside Glass */}
                <motion.div layoutId={`header-${uniqueId}`}>
                  <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">
                    <span className="bg-slate-200/50 px-2 py-1 rounded-full">News</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <h1 className="font-headline font-bold text-2xl md:text-3xl leading-tight text-slate-900">
                    {post.title}
                  </h1>
                </motion.div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-slate-200" />

                {/* Summary Text */}
                <div className="prose prose-lg max-w-none font-serif leading-relaxed text-slate-700">
                  <TypewriterText text={summaryText} />
                </div>

                {/* Action Button */}
                <Button
                  className="w-full rounded-full h-14 text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
                  onClick={() => window.open(post.link, "_blank")}
                >
                  Read Full Story
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
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