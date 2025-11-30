"use client";

import type { CompendiaPost } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ExternalLink, X, Sparkles, Clock, Lock, Bookmark, Download, Quote, FileText, Globe, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { PostExportTemplate } from "./post-export-template";

interface PostViewProps {
    post: CompendiaPost;
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
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
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
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isExpanded, y, x]);

    const handleCardClick = () => {
        if (isLocked) {
            onUnlockRequest?.();
            return;
        }
        setIsExpanded(!isExpanded);
    };

    const handleDownload = async () => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const element = exportRef.current;
            if (!element) {
                console.error("Export template not found");
                setIsExporting(false);
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 1,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                width: 1080,
                height: 1350,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('post-export-template');
                    if (clonedElement) {
                        clonedElement.style.display = 'block';
                    }
                }
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `compendia-${post.id || 'post'}.png`;
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        if (!isActive) {
            setIsExpanded(false);
        }
    }, [isActive]);

    const summaryText = useMemo(() => {
        return decodeHtmlEntities(post.abstract || "No abstract available.");
    }, [post]);

    const uniqueId = post.id || Math.random().toString();
    const decodedTitle = useMemo(() => decodeHtmlEntities(post.title), [post.title]);

    const readingTime = useMemo(() => {
        const words = summaryText.split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    }, [summaryText]);

    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollContainer = scrollContainerRef.current;
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

        if (deltaY > 0) {
            const resistance = 0.5;
            y.set(deltaY * resistance);
            x.set(deltaX * 0.2);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchStart.current = null;
        const verticalDistance = y.get();

        if (verticalDistance > 120) {
            setIsExpanded(false);
        } else {
            animate(y, 0, { type: "spring", stiffness: 400, damping: 40 });
            animate(x, 0, { type: "spring", stiffness: 400, damping: 40 });
        }
    };

    return (
        <>
            {/* RESEARCH PAPER / MANUSCRIPT CARD */}
            <motion.div
                className={cn(
                    "relative w-full h-full cursor-pointer group perspective-1000",
                    isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
                layoutId={`card-container-${uniqueId}`}
                onClick={handleCardClick}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Paper Shadow/Depth */}
                <div className="absolute top-2 left-2 right-[-2px] bottom-[-2px] bg-black/5 rounded-[2px] z-0" />

                {/* Main Paper Surface */}
                <div className="absolute inset-0 bg-[#fdfdfd] text-zinc-900 overflow-hidden shadow-md border border-zinc-200 z-10 flex flex-col p-6 md:p-8 font-serif">

                    {/* Header: Journal Info */}
                    <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-4 mb-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest font-sans text-zinc-500 mb-1">Available online at ReadMore</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-xl font-bold font-serif italic text-zinc-800">{post.journal || "Open Research"}</h3>
                                {post.volume && <span className="text-xs font-sans text-zinc-500">Vol. {post.volume}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white font-serif font-bold italic">
                                R
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight text-zinc-900 font-serif">
                            {decodedTitle}
                        </h1>

                        {/* Authors */}
                        <div className="text-sm text-zinc-600 italic font-serif">
                            {post.authors.join(", ")}
                        </div>

                        {/* Affiliations (if available) - Show first one */}
                        {post.affiliations && post.affiliations.length > 0 && (
                            <div className="text-[10px] text-zinc-500 font-sans leading-tight line-clamp-2">
                                {post.affiliations[0]}
                            </div>
                        )}

                        {/* Abstract Section */}
                        <div className="mt-4 flex-1 overflow-hidden relative">
                            <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-zinc-900 mb-2">Abstract</h4>
                            <p className="text-sm leading-relaxed text-zinc-800 font-serif text-justify line-clamp-[8] md:line-clamp-[10]">
                                {summaryText}
                            </p>
                            {/* Fade out at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#fdfdfd] to-transparent" />
                        </div>
                    </div>

                    {/* Footer: Metadata */}
                    <div className="mt-auto pt-4 border-t border-zinc-200 flex items-center justify-between text-[10px] font-sans text-zinc-500">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-700">Keywords:</span>
                                <span className="italic truncate max-w-[150px]">{post.tags.slice(0, 3).join(", ")}</span>
                            </div>
                            {post.doi && (
                                <div className="flex items-center gap-1">
                                    <span>DOI:</span>
                                    <span className="font-mono">{post.doi.replace('https://doi.org/', '')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {post.isOpenAccess && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 border border-zinc-300 rounded text-zinc-600">
                                    <BookOpen className="w-3 h-3" />
                                    <span>OA</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Quote className="w-3 h-3" />
                                <span>{post.citationCount || 0}</span>
                            </div>
                            <span className="font-medium">{new Date(post.date).getFullYear()}</span>
                        </div>
                    </div>

                    {/* Lock Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] z-20">
                            <div className="flex flex-col items-center gap-2">
                                <Lock className="w-6 h-6 text-zinc-400" />
                                <span className="text-xs font-medium text-zinc-500">Premium Content</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* EXPANDED VIEW PORTAL - Keeping Dark Mode for Reading Experience? Or matching paper style? 
                User asked for "Research Paper", usually reading PDFs is white. 
                Let's make the expanded view also paper-like but optimized for screen reading.
            */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            layoutId={`card-container-${uniqueId}`}
                            className="fixed inset-0 z-[100] flex flex-col bg-[#f0f0f0] backdrop-blur-xl overscroll-none text-zinc-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Hidden Export Template */}
                            <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
                                <PostExportTemplate ref={exportRef} post={post} isLocked={isLocked} />
                            </div>

                            <motion.div
                                className="relative w-full h-full flex flex-col will-change-transform touch-pan-y max-w-4xl mx-auto bg-white shadow-2xl my-0 md:my-8 md:rounded-lg overflow-hidden"
                                style={{ x, y, opacity: opacityScale, scale: scaleAnim }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Close Button */}
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(false);
                                    }}
                                    className="absolute top-6 right-6 z-[60] p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-all"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>

                                {/* Scrollable Content */}
                                <div
                                    ref={scrollContainerRef}
                                    className="flex-1 overflow-y-auto no-scrollbar overscroll-contain p-8 md:p-12 font-serif"
                                >
                                    {/* Header Info */}
                                    <div className="border-b border-zinc-200 pb-6 mb-8">
                                        <div className="flex items-center gap-2 text-xs font-sans text-zinc-500 uppercase tracking-wider mb-4">
                                            <span>{post.journal || "Journal Article"}</span>
                                            <span>•</span>
                                            <span>{new Date(post.date).toLocaleDateString()}</span>
                                            {post.isOpenAccess && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-emerald-600 font-bold"><BookOpen className="w-3 h-3" /> Open Access</span>
                                                </>
                                            )}
                                        </div>

                                        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-zinc-900 mb-6">
                                            {decodedTitle}
                                        </h1>

                                        <div className="space-y-2">
                                            <div className="text-lg italic text-zinc-700">
                                                {post.authors.join(", ")}
                                            </div>
                                            {post.affiliations && post.affiliations.length > 0 && (
                                                <div className="text-sm text-zinc-500 font-sans">
                                                    {post.affiliations.map((aff, i) => (
                                                        <div key={i}>{aff}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Abstract */}
                                    <div className="mb-12">
                                        <h3 className="text-sm font-bold uppercase tracking-widest font-sans text-zinc-900 mb-4">Abstract</h3>
                                        <p className="text-lg leading-relaxed text-zinc-800 text-justify">
                                            {summaryText}
                                        </p>
                                    </div>

                                    {/* Keywords */}
                                    <div className="flex flex-wrap gap-2 mb-12">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-sans rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* DOI / Link */}
                                    {post.doi && (
                                        <div className="text-sm font-sans text-zinc-500 mb-24">
                                            <span className="font-bold">DOI:</span> <a href={post.doi} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{post.doi}</a>
                                        </div>
                                    )}
                                </div>

                                {/* Floating Action Dock */}
                                <motion.div
                                    className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-900/90 backdrop-blur-xl shadow-2xl pointer-events-auto">
                                        <Button
                                            className="h-12 px-8 rounded-full font-bold text-base tracking-wide shadow-lg bg-white text-black hover:bg-zinc-200 font-sans"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(post.landingPageUrl || post.pdfUrl || '#', "_blank");
                                            }}
                                        >
                                            View Original <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>

                                        <div className="w-px h-6 bg-white/20 mx-1" />

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
                                                handleDownload();
                                            }}
                                            disabled={isExporting}
                                        >
                                            {isExporting ? (
                                                <span className="animate-spin">⏳</span>
                                            ) : (
                                                <Download className="w-5 h-5" />
                                            )}
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

export const PostView = React.memo(PostViewComponent);
