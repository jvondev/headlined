"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { X, Sparkles, Clock, ChevronRight, Lock, Heart } from "lucide-react";

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
    isPremium?: boolean;
}

const decodeHtmlEntities = (text: string) => {
    if (typeof window === 'undefined') return text;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
};



const PostViewComponent: FC<PostViewProps> = ({ post, isActive, isLocked, onUnlockRequest, onSave, isSaved, onShare, isPremium }) => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

        addToReadHistory(post).catch(console.error);

        const postDate = post.date || new Date().toISOString().split('T')[0];
        router.push(`/article/${postDate}/${post.slug}`, { scroll: false });
    };



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
        // Use post's readingTime if available
        if (post.readingTime && post.readingTime > 0) {
            return `${post.readingTime} min read`;
        }
        // Calculate from fullText if available, otherwise description, then summary
        const textContent = post.fullText || post.description || summaryText;
        const words = textContent.split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    }, [post.readingTime, post.fullText, post.description, summaryText]);

    // Enhanced Touch Handling for "Award Worthy" Feel


    return (
        <>
            {/* PREMIUM COLLAPSED CARD */}
            <motion.div
                className={cn(
                    "relative w-full h-full cursor-pointer group",
                )}
                layoutId={`card-container-${uniqueId}`}
                onClick={handleCardClick}
                whileHover={{ scale: 0.985, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                {/* Outer Ring - Museum Glass Boundary */}
                <div
                    className="absolute inset-0 rounded-[48px] z-20 pointer-events-none transition-all duration-500"
                    style={{
                        // The "Museum Glass" Effect:
                        // 1. 1px subtle dark stroke (defines the physical edge)
                        // 2. White inner highlight (cut glass edge)
                        // 3. Subtle inner shadow (simulates thickness/depth of the glass block)
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), inset 0 0 0 1.5px rgba(255,255,255,0.8), inset 0 0 20px rgba(0,0,0,0.02)"
                    }}
                />

                {/* Main Card Container - The "Art Piece" */}
                <div className="absolute inset-4 md:inset-5 rounded-[32px] overflow-hidden bg-zinc-950 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 z-10 group-hover:scale-[1.01] transition-transform duration-700 ease-out" style={{ WebkitTapHighlightColor: 'transparent' }}>
                    {/* Premium Texture Overlay (Noise) - Adds tactile "paper" feel */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                    {/* Subtle Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
                    {/* Background Image */}
                    <div className="absolute inset-0 overflow-hidden rounded-[32px]">
                        {post.thumbnail_url ? (
                            <motion.img
                                src={post.thumbnail_url}
                                alt=""
                                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110 rounded-[32px]"
                                layoutId={`image-${uniqueId}`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            />
                        ) : (
                            <motion.div
                                className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-[32px]"
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


        </>
    );
};

export const PostView = React.memo(PostViewComponent);
