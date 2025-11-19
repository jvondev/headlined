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

  return <p className="text-lg leading-relaxed font-serif text-foreground/90">{displayedText}</p>;
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

  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const imageX = useTransform(mouseX, [-0.5, 0.5], ["-5%", "5%"]);
  const imageY = useTransform(mouseY, [-0.5, 0.5], ["-5%", "5%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isExpanded) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - left) / width - 0.5;
    const yPct = (e.clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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
          "relative w-full h-full rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500 shadow-2xl hover:shadow-3xl",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        layoutId={`card-${uniqueId}`}
        onClick={handleCardClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundImage: paperNoise,
          backgroundColor: '#fdfbf7',
          ...paperStyle,
        }}
      >
        {/* Card Content (Collapsed) - Full Image Focus */}
        <motion.div className="relative w-full h-full overflow-hidden bg-neutral-900">
          <motion.img
            src={post.thumbnail_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            style={{ x: imageX, y: imageY, scale: 1.1 }}
            layoutId={`image-${uniqueId}`}
          />
          {/* Strong Gradient for Title Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <motion.div className="absolute bottom-0 left-0 p-6 md:p-8 w-full" layoutId={`header-${uniqueId}`}>
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase text-white/70 mb-3">
              <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm">News</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <h1 className="font-headline font-bold text-white drop-shadow-xl leading-[1.1] text-3xl md:text-4xl line-clamp-3 tracking-tight">
              {post.title}
            </h1>
          </motion.div>

          {/* Subtle "Tap to expand" hint */}
          <div className="absolute top-6 right-6">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 text-white/80 shadow-lg">
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
              className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-center items-center text-center p-8"
            >
              <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl max-w-sm mx-auto border border-white/10 text-white">
                <h3 className="font-headline text-xl font-bold mb-4">{post.title}</h3>
                <p className="text-white/80 line-clamp-6 font-serif leading-relaxed text-sm">
                  {summaryText}
                </p>
                <p className="mt-6 text-[10px] text-white/60 font-bold uppercase tracking-widest">Release to close</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expanded View Portal - Immersive Story Mode */}
      {mounted && isExpanded && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
          <motion.div
            className="relative w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-[500px] md:rounded-[40px] overflow-hidden shadow-2xl bg-black"
            layoutId={`card-${uniqueId}`}
          >
            {/* Full Screen Background Image */}
            <motion.img
              src={post.thumbnail_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              layoutId={`image-${uniqueId}`}
            />

            {/* Gradient Blur Overlay - "Story" Style */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90" />
            <div className="absolute inset-0 backdrop-blur-[2px]" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col p-8">
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <span className="font-bold text-white text-xs">AI</span>
                  </div>
                  <span className="text-white/90 text-sm font-medium tracking-wide">Briefing</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsExpanded(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Main Content Block */}
              <div className="relative z-10 my-auto flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  {/* Title */}
                  <motion.div layoutId={`header-${uniqueId}`} className="mb-6">
                    <h1 className="font-headline font-bold text-3xl md:text-4xl leading-tight text-white drop-shadow-lg text-center">
                      {post.title}
                    </h1>
                  </motion.div>

                  {/* Quote Block with Dividers */}
                  <div className="relative py-8">
                    {/* Decorative Quote Icon */}
                    <div className="absolute -top-4 left-0 text-white/20 text-6xl font-serif leading-none">“</div>

                    {/* Top Divider */}
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mb-6" />

                    {/* Text Content */}
                    <div className="relative px-4">
                      <div className="prose prose-invert prose-lg max-w-none font-serif leading-relaxed text-white/95 text-center">
                        <TypewriterText text={summaryText} />
                      </div>
                    </div>

                    {/* Bottom Divider */}
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-6" />
                  </div>
                </motion.div>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto pt-8 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <Button className="flex-1 rounded-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-shadow" onClick={() => window.open(post.link, "_blank")}>
                    Read Full Story
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-14 w-14 border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md">
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
};

export const PostView = React.memo(PostViewComponent);