"use client";

import type { CompendiaPost } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ExternalLink, X, Sparkles, Clock, Lock, Bookmark, Download, Quote, FileText, Globe, BookOpen, Calendar, Hash, Copy, Check } from "lucide-react";
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

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

// Highlighting Component
const HighlightedAbstract: FC<{ text: string; keywords: string[]; topics: string[]; concepts: string[] }> = ({ text, keywords, topics, concepts }) => {
    const parts = useMemo(() => {
        if (!text) return [];

        // Create a map of terms to their type/color
        const terms = new Map<string, string>();

        // Sort by length descending to match longest phrases first
        const allTerms = [
            ...topics.map(t => ({ term: t.toLowerCase(), type: 'topic', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100' })),
            ...keywords.map(k => ({ term: k.toLowerCase(), type: 'keyword', color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-900 dark:text-sky-100' })),
            ...concepts.map(c => ({ term: c.toLowerCase(), type: 'concept', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100' }))
        ].sort((a, b) => b.term.length - a.term.length);

        // Escape regex special characters
        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Build a single regex for all terms
        if (allTerms.length === 0) return [{ text, highlight: null }];

        const pattern = new RegExp(`\\b(${allTerms.map(t => escapeRegExp(t.term)).join('|')})\\b`, 'gi');

        const result = [];
        let lastIndex = 0;
        let match;

        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({ text: text.slice(lastIndex, match.index), highlight: null });
            }

            const matchedTerm = match[0].toLowerCase();
            const termInfo = allTerms.find(t => t.term === matchedTerm);

            result.push({
                text: match[0],
                highlight: termInfo ? termInfo.color : null
            });

            lastIndex = pattern.lastIndex;
        }

        if (lastIndex < text.length) {
            result.push({ text: text.slice(lastIndex), highlight: null });
        }

        return result;
    }, [text, keywords, topics, concepts]);

    return (
        <span>
            {parts.map((part, i) => (
                part.highlight ? (
                    <mark key={i} className={cn("rounded-sm px-0.5 font-medium mx-0.5", part.highlight)}>
                        {part.text}
                    </mark>
                ) : (
                    <span key={i}>{part.text}</span>
                )
            ))}
        </span>
    );
};

const PostViewComponent: FC<PostViewProps> = ({ post, isActive, isLocked, onUnlockRequest, onSave, isSaved, onShare, isPremium }) => {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [copiedDoi, setCopiedDoi] = useState(false);
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

    const handleCopyDoi = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (post.doi) {
            navigator.clipboard.writeText(post.doi);
            setCopiedDoi(true);
            setTimeout(() => setCopiedDoi(false), 2000);
        }
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
        const decoded = decodeHtmlEntities(post.abstract || "No abstract available.");
        return stripHtml(decoded);
    }, [post]);

    const uniqueId = post.id || Math.random().toString();
    const decodedTitle = useMemo(() => decodeHtmlEntities(post.title), [post.title]);

    const readingTime = useMemo(() => {
        const words = summaryText.split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    }, [summaryText]);

    // Extract terms for highlighting
    const highlightTerms = useMemo(() => {
        return {
            keywords: post.keywords?.map(k => k.display_name) || [],
            topics: post.topics?.map(t => t.display_name) || [],
            concepts: post.concepts?.map(c => c.display_name) || []
        };
    }, [post]);

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
                <div className="absolute inset-0 bg-[#fdfdfd] text-zinc-900 overflow-hidden shadow-md border border-zinc-200 z-10 flex flex-col font-serif">
                    {/* Premium Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                    {/* Header: Journal Info & Metadata */}
                    <div className="p-4 md:p-8 pb-3 md:pb-4 border-b border-zinc-200 relative">
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="flex flex-col gap-1 pr-2">
                                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-sans text-zinc-400 font-semibold">Original Research</span>
                                <h3 className="text-base md:text-lg font-bold font-serif italic text-zinc-800 leading-tight line-clamp-2">
                                    {post.journal || "Open Research"}
                                </h3>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white font-serif font-bold italic shadow-sm text-xs md:text-sm">
                                    R
                                </div>
                                {post.isOpenAccess && (
                                    <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-sans font-bold text-emerald-700 uppercase tracking-wider">
                                        <BookOpen className="w-3 h-3" /> OA
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Metadata Row */}
                        <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-sans text-zinc-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                    {post.publication_date
                                        ? new Date(post.publication_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                        : new Date(post.date).getFullYear()}
                                </span>
                            </div>
                            {post.volume && (
                                <div className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    <span>Vol. {post.volume}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Quote className="w-3 h-3" />
                                <span>{post.citationCount || 0} Citations</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col p-4 md:p-8 pt-4 md:pt-6 overflow-hidden relative">
                        {/* Title */}
                        <h1 className="text-xl md:text-[1.75rem] font-bold leading-[1.2] md:leading-[1.15] text-zinc-900 font-serif mb-2 md:mb-3 tracking-tight line-clamp-3 md:line-clamp-none">
                            {decodedTitle}
                        </h1>

                        {/* Authors */}
                        <div className="text-xs md:text-sm text-zinc-600 italic font-serif mb-4 md:mb-6 border-l-2 border-zinc-300 pl-3">
                            {post.authors.slice(0, 3).join(", ")}
                            {post.authors.length > 3 && " et al."}
                        </div>

                        {/* Abstract Section */}
                        <div className="flex-1 overflow-hidden relative">
                            <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest font-sans text-zinc-400 mb-1 md:mb-2">Abstract</h4>
                            <p className="text-xs md:text-[13px] leading-[1.6] text-zinc-800 font-serif text-justify line-clamp-[6] md:line-clamp-[8]">
                                <HighlightedAbstract
                                    text={summaryText}
                                    keywords={highlightTerms.keywords}
                                    topics={highlightTerms.topics}
                                    concepts={highlightTerms.concepts}
                                />
                            </p>
                            {/* Fade out at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-[#fdfdfd] to-transparent" />
                        </div>
                    </div>

                    {/* Footer: Keywords & DOI */}
                    <div className="px-4 md:px-8 py-3 md:py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-[9px] md:text-[10px] font-sans text-zinc-500">
                        <div className="flex items-center gap-2 overflow-hidden max-w-[60%]">
                            <span className="font-bold text-zinc-700 shrink-0">Keywords:</span>
                            <span className="italic truncate">{post.tags.slice(0, 3).join(", ")}</span>
                        </div>
                        {post.doi && (
                            <div className="shrink-0 font-mono text-zinc-400 truncate max-w-[35%]">
                                {post.doi.replace('https://doi.org/', 'DOI: ')}
                            </div>
                        )}
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

            {/* EXPANDED VIEW PORTAL */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            layoutId={`card-container-${uniqueId}`}
                            className="fixed inset-0 z-[100] flex flex-col bg-[#e5e5e5] backdrop-blur-xl overscroll-none text-zinc-900"
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
                                className="relative w-full h-full flex flex-col will-change-transform touch-pan-y max-w-4xl mx-auto bg-[#fdfdfd] shadow-2xl my-0 md:my-8 md:rounded-lg overflow-hidden"
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
                                    className="flex-1 overflow-y-auto no-scrollbar overscroll-contain p-6 md:p-16 font-serif"
                                >
                                    {/* Header Info */}
                                    <div className="border-b border-zinc-200 pb-6 md:pb-8 mb-8 md:mb-10">
                                        <div className="flex items-center gap-3 text-xs font-sans text-zinc-500 uppercase tracking-widest mb-4 md:mb-6 flex-wrap">
                                            <span className="font-bold text-zinc-900">{post.journal || "Journal Article"}</span>
                                            <span>•</span>
                                            <span>{post.publication_date || new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            {post.isOpenAccess && (
                                                <span className="ml-auto md:ml-0 flex items-center gap-1 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded-full bg-emerald-50">
                                                    <BookOpen className="w-3 h-3" /> Open Access
                                                </span>
                                            )}
                                        </div>

                                        <h1 className="text-2xl md:text-5xl font-bold leading-[1.1] text-zinc-900 mb-6 md:mb-8 tracking-tight">
                                            {decodedTitle}
                                        </h1>

                                        <div className="space-y-4">
                                            <div className="text-lg md:text-xl italic text-zinc-700 font-serif">
                                                {post.authors.join(", ")}
                                            </div>
                                            {post.affiliations && post.affiliations.length > 0 && (
                                                <div className="text-xs md:text-sm text-zinc-500 font-sans border-l-2 border-zinc-200 pl-4">
                                                    {post.affiliations.map((aff, i) => (
                                                        <div key={i} className="mb-1">{aff}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Abstract */}
                                    <div className="mb-12">
                                        <h3 className="text-sm font-bold uppercase tracking-widest font-sans text-zinc-900 mb-4 border-b border-zinc-100 pb-2 inline-block">Abstract</h3>
                                        <p className="text-base md:text-lg leading-[1.8] text-zinc-800 text-justify font-serif">
                                            <HighlightedAbstract
                                                text={summaryText}
                                                keywords={highlightTerms.keywords}
                                                topics={highlightTerms.topics}
                                                concepts={highlightTerms.concepts}
                                            />
                                        </p>
                                    </div>

                                    {/* Detailed Metadata Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                        {/* Topics */}
                                        {post.topics && post.topics.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest font-sans text-zinc-400 mb-3">Topics</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.topics.slice(0, 5).map((topic, i) => (
                                                        <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-sans font-medium rounded border border-emerald-100">
                                                            {topic.display_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Keywords */}
                                        {post.keywords && post.keywords.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest font-sans text-zinc-400 mb-3">Keywords</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.keywords.slice(0, 8).map((keyword, i) => (
                                                        <span key={i} className="px-2 py-1 bg-sky-50 text-sky-700 text-xs font-sans font-medium rounded border border-sky-100">
                                                            {keyword.display_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Concepts */}
                                        {post.concepts && post.concepts.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest font-sans text-zinc-400 mb-3">Concepts</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.concepts.slice(0, 8).map((concept, i) => (
                                                        <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-sans font-medium rounded border border-amber-100">
                                                            {concept.display_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Metrics */}
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-widest font-sans text-zinc-400 mb-3">Impact Metrics</h4>
                                            <div className="flex flex-col gap-2 text-sm font-sans text-zinc-600">
                                                <div className="flex justify-between border-b border-zinc-100 pb-1">
                                                    <span>Citations</span>
                                                    <span className="font-bold">{post.citationCount}</span>
                                                </div>
                                                {post.fwci && (
                                                    <div className="flex justify-between border-b border-zinc-100 pb-1">
                                                        <span>Field-Weighted Citation Impact</span>
                                                        <span className="font-bold">{post.fwci.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* DOI / Link */}
                                    {post.doi && (
                                        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100 text-sm font-sans text-zinc-500 mb-24 flex items-center gap-2 flex-wrap justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="font-bold text-zinc-700 shrink-0">DOI:</span>
                                                <a href={post.doi} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline truncate">{post.doi}</a>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs gap-1 text-zinc-500 hover:text-zinc-900"
                                                onClick={handleCopyDoi}
                                            >
                                                {copiedDoi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                {copiedDoi ? "Copied" : "Copy DOI"}
                                            </Button>
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
                                    <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-900/95 backdrop-blur-xl shadow-2xl pointer-events-auto border border-zinc-800">
                                        <Button
                                            className="h-12 px-6 md:px-8 rounded-full font-bold text-sm md:text-base tracking-wide shadow-lg bg-white text-black hover:bg-zinc-200 font-sans"
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
