"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    Volume2,
    VolumeX,
    Moon,
    Sun,
    Minus,
    Plus,
    BookmarkPlus,
    Share2,
    Clock,
    Sparkles,
    ExternalLink,
    Link2,
    Check,
    Highlighter,
    Download,
    Loader2,
    Music2,
    Instagram,
    X,
} from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ============================================================================
// EXPANDED READER - Progressive full-text reading experience
// Features: Floating action bar with exports, unified scroll, smart anchoring
// ============================================================================

interface ExpandedReaderProps {
    fullText: string | null;
    description: string | null;
    keywords: string[];
    slug: string;
    readingTime?: number;
    isPremium?: boolean;
    onHighlightSave?: (quote: string) => void;
    // Callbacks for PostView to manage floating bar
    onContinueStateChange?: (hasMore: boolean, isGenerating: boolean, remaining: number) => void;
    onContinueRequest?: () => void;
    articleUrl?: string;
    // Export props
    onDownload?: (platform: 'tiktok' | 'instagram') => void;
    isExporting?: boolean;
    date?: string;
    // Theme sync callback
    // Theme sync callback
    onThemeChange?: (isDark: boolean) => void;
    // Close & Sticky Sync
    onClose?: () => void;
    onStickyChange?: (isSticky: boolean) => void;
}

interface Section {
    id: string;
    content: string;
    isGenerated: boolean;
}

// Rotating pastel highlight colors (subtle, not distracting)
const HIGHLIGHT_COLORS = [
    "bg-blue-500/10 text-blue-300/90 border-blue-400/20",
    "bg-emerald-500/10 text-emerald-300/90 border-emerald-400/20",
    "bg-purple-500/10 text-purple-300/90 border-purple-400/20",
    "bg-rose-500/10 text-rose-300/90 border-rose-400/20",
];

// Highlight stopwords (common words to skip)
const HIGHLIGHT_STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
    'your', 'my', 'his', 'her', 'our', 'their', 'what', 'which', 'who', 'whom', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'just', 'also', 'now', 'here', 'there', 'then', 'new', 'said', 'says', 'like',
    'one', 'two', 'first', 'many', 'year', 'years', 'time', 'way', 'day', 'use', 'make',
    'get', 'go', 'see', 'come', 'take', 'know', 'think', 'want', 'need', 'look', 'work',
]);

// Smart paragraph chunking - splits text into readable sections with deduplication
// REFINED: Chunk size reduced to 80 words for better readability
function chunkTextIntoSections(text: string, targetWordsPerSection: number = 80): Section[] {
    if (!text) return [];

    // Split by paragraphs and deduplicate
    const allParagraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const seenParagraphs = new Set<string>();
    const paragraphs: string[] = [];

    for (const p of allParagraphs) {
        const normalized = p.trim().toLowerCase().substring(0, 100); // Compare first 100 chars
        if (!seenParagraphs.has(normalized)) {
            seenParagraphs.add(normalized);
            paragraphs.push(p);
        }
    }

    const sections: Section[] = [];
    let currentSection = "";
    let currentWordCount = 0;
    let sectionIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.split(/\s+/).length;

        // Tighter chunking logic
        if (currentWordCount > 0 && currentWordCount + paragraphWords > targetWordsPerSection * 1.3) {
            sections.push({
                id: `section-${sectionIndex}`,
                content: currentSection.trim(),
                isGenerated: sectionIndex === 0,
            });
            sectionIndex++;
            currentSection = paragraph;
            currentWordCount = paragraphWords;
        } else {
            currentSection += (currentSection ? "\n\n" : "") + paragraph;
            currentWordCount += paragraphWords;

            if (currentWordCount >= targetWordsPerSection) {
                sections.push({
                    id: `section-${sectionIndex}`,
                    content: currentSection.trim(),
                    isGenerated: sectionIndex === 0,
                });
                sectionIndex++;
                currentSection = "";
                currentWordCount = 0;
            }
        }
    }

    if (currentSection.trim()) {
        sections.push({
            id: `section-${sectionIndex}`,
            content: currentSection.trim(),
            isGenerated: sectionIndex === 0,
        });
    }

    return sections;
}

// Filter keywords to remove stopwords and short words
function filterKeywords(keywords: string[]): string[] {
    return keywords.filter(k =>
        k.length >= 4 && !HIGHLIGHT_STOPWORDS.has(k.toLowerCase())
    );
}

// Create consistent color mapping: same keyword = same color
function createKeywordColorMap(keywords: string[]): Map<string, string> {
    const colorMap = new Map<string, string>();
    keywords.forEach((keyword, index) => {
        colorMap.set(keyword.toLowerCase(), HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]);
    });
    return colorMap;
}

// Highlight keywords with consistent colors per keyword
function highlightKeywords(text: string, keywords: string[]): React.ReactNode[] {
    const filteredKeywords = filterKeywords(keywords);
    if (!filteredKeywords || filteredKeywords.length === 0) return [text];

    const colorMap = createKeywordColorMap(filteredKeywords);

    const pattern = new RegExp(
        `\\b(${filteredKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
        'gi'
    );

    const parts = text.split(pattern);

    return parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const color = colorMap.get(lowerPart);
        if (color) {
            return (
                <mark
                    key={index}
                    className={cn("px-1 py-0.5 rounded border-b", color)}
                >
                    {part}
                </mark>
            );
        }
        return <span key={index}>{part}</span>;
    });
}

// Typewriter animation for sections
const TypewriterSection = ({
    text,
    keywords,
    onComplete,
    speed = 12,
    fontSize
}: {
    text: string;
    keywords: string[];
    onComplete?: () => void;
    speed?: number;
    fontSize: number;
}) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const hasCompleted = useRef(false);

    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);
        hasCompleted.current = false;
    }, [text]);

    useEffect(() => {
        if (displayedText.length < text.length) {
            const timer = setTimeout(() => {
                const charsToAdd = Math.min(4, text.length - displayedText.length);
                setDisplayedText(text.substring(0, displayedText.length + charsToAdd));
            }, speed);
            return () => clearTimeout(timer);
        } else if (!hasCompleted.current) {
            hasCompleted.current = true;
            setIsComplete(true);
            onComplete?.();
        }
    }, [displayedText, text, speed, onComplete]);

    const highlightedContent = useMemo(() => {
        return highlightKeywords(displayedText, keywords);
    }, [displayedText, keywords]);

    return (
        <p
            className="leading-relaxed whitespace-pre-wrap"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
        >
            {highlightedContent}
            {!isComplete && (
                <span className="inline-block w-[2px] h-5 ml-1 bg-zinc-400 animate-pulse align-middle" />
            )}
        </p>
    );
};

// Ad Slot Component
const AdSlot = ({ index }: { index: number }) => (
    <div className="w-full my-8 py-2">
        <div className="relative w-full min-h-[280px] bg-transparent rounded-2xl flex flex-col items-center justify-center overflow-hidden">
            <div
                // @ts-ignore
                ta-ad-container=""
                id={`reader-ad-${index}`}
                className="w-full h-full min-h-[280px] flex items-center justify-center"
            />
        </div>
    </div>
);

// Reading Progress Bar component removed - progress shown inline



export const ExpandedReader: React.FC<ExpandedReaderProps> = ({
    fullText,
    description,
    keywords = [],
    slug,
    readingTime = 1,
    isPremium = false,
    onHighlightSave,
    onContinueStateChange,
    onContinueRequest,
    articleUrl,
    onDownload,
    isExporting,
    date,
    onThemeChange,
    onClose,
    onStickyChange
}) => {
    const contentToDisplay = fullText || description || "";

    // URL rewriting disabled - modal stays on current page

    // Scroll Progress Logic (Interactive)
    const [readingProgress, setReadingProgress] = useState(0);
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            let scrollTop = 0;
            let scrollHeight = 0;
            let clientHeight = 0;

            const container = document.getElementById('post-view-scroll-container');
            if (container) {
                scrollTop = container.scrollTop;
                scrollHeight = container.scrollHeight;
                clientHeight = container.clientHeight;
            } else {
                scrollTop = window.scrollY;
                scrollHeight = document.documentElement.scrollHeight;
                clientHeight = window.innerHeight;
            }

            if (scrollHeight > clientHeight) {
                const p = (scrollTop / (scrollHeight - clientHeight)) * 100;
                setReadingProgress(Math.min(100, Math.max(0, p)));
            }

            // Sticky Header Detection for Mobile "Morph" Close Button
            // Only apply on mobile (< 768px / md breakpoint)
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            const isSticky = isMobile && scrollTop > 100;
            onStickyChange?.(isSticky);
            setIsHeaderSticky(isSticky);
        };

        const container = document.getElementById('post-view-scroll-container');
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Section state
    const [sections, setSections] = useState<Section[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // Reader settings - with localStorage persistence for theme
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('reader-theme');
            return saved !== null ? saved === 'dark' : true;
        }
        return true;
    });
    const [fontSize, setFontSize] = useState(18);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const [highlightsEnabled, setHighlightsEnabled] = useState(true);

    // Persist theme preference and sync to parent
    useEffect(() => {
        localStorage.setItem('reader-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Sync initial theme to parent on mount
    useEffect(() => {
        onThemeChange?.(isDarkMode);
    }, []); // Only run on mount

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyHeaderRef = useRef<HTMLDivElement>(null);
    const contentEndRef = useRef<HTMLDivElement>(null);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Track if user was at bottom before new content
    const wasAtBottomRef = useRef(false);

    // Initialize sections
    useEffect(() => {
        const chunked = chunkTextIntoSections(contentToDisplay);
        setSections(chunked);
        setCurrentSectionIndex(0);
    }, [contentToDisplay]);

    // Calculate read progress percentage
    const readProgress = useMemo(() => {
        if (sections.length === 0) return 0;
        const generatedCount = sections.filter(s => s.isGenerated).length;
        return Math.round((generatedCount / sections.length) * 100);
    }, [sections]);


    // Remaining time estimation
    const remainingTime = useMemo(() => {
        if (sections.length === 0) return 0;
        const generatedCount = sections.filter(s => s.isGenerated).length;
        const remainingRatio = 1 - (generatedCount / sections.length);
        return Math.max(1, Math.ceil(readingTime * remainingRatio));
    }, [sections, readingTime]);

    // Progressive Auto-Scroll (Parallel with generation)
    useEffect(() => {
        if (!isGenerating) return;

        let animationFrameId: number;

        const smoothScrollToBottom = () => {
            if (wasAtBottomRef.current && contentEndRef.current) {
                // Scroll to keep bottom in view, but gently
                contentEndRef.current.scrollIntoView({
                    behavior: 'auto', // Auto is better for continuous updates than smooth
                    block: 'end'
                });
            }
            animationFrameId = requestAnimationFrame(smoothScrollToBottom);
        };

        // Start scrolling loop
        animationFrameId = requestAnimationFrame(smoothScrollToBottom);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isGenerating]);

    // Handle section complete
    const handleSectionComplete = useCallback(() => {
        setIsGenerating(false);
    }, []);

    // Handle continue reading
    const handleContinueReading = useCallback(() => {
        if (isGenerating) return;

        // Smart Scroll Logic: Check if user is near bottom BEFORE generating
        const scrollThreshold = 100; // px
        const isNearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - scrollThreshold);
        wasAtBottomRef.current = isNearBottom;

        const nextIndex = sections.findIndex(s => !s.isGenerated);
        if (nextIndex === -1) return;

        setIsGenerating(true);
        setCurrentSectionIndex(nextIndex);

        setSections(prev => prev.map((s, i) =>
            i === nextIndex ? { ...s, isGenerated: true } : s
        ));
    }, [sections, isGenerating]);

    // Handle read full story
    const handleReadFull = useCallback(() => {
        if (articleUrl) {
            window.open(articleUrl, '_blank');
        }
    }, [articleUrl]);

    // Handle copy link - Uses updated window.location.href
    const handleCopyLink = useCallback(() => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    }, []);

    // Text-to-Speech
    const toggleSpeech = useCallback(() => {
        if (!('speechSynthesis' in window)) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const textToSpeak = sections
                .filter(s => s.isGenerated)
                .map(s => s.content)
                .join('. ');

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.onend = () => setIsSpeaking(false);

            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    }, [isSpeaking, sections]);

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Font size controls
    const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
    const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 14));

    // Handle text selection for quote saving
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 10) {
            setSelectedQuote(selection.toString().trim());
        } else {
            setSelectedQuote(null);
        }
    }, []);

    const handleSaveQuote = useCallback(() => {
        if (selectedQuote && onHighlightSave) {
            onHighlightSave(selectedQuote);
            setSelectedQuote(null);
        }
    }, [selectedQuote, onHighlightSave]);

    const remainingSections = sections.filter(s => !s.isGenerated).length;
    const hasMoreContent = remainingSections > 0;

    // Notify PostView of continue state changes
    useEffect(() => {
        onContinueStateChange?.(hasMoreContent, isGenerating, remainingSections);
    }, [hasMoreContent, isGenerating, remainingSections, onContinueStateChange]);

    // Expose continue handler to PostView
    useEffect(() => {
        if (onContinueRequest) {
            // Store the ref for PostView to call
            (window as any).__expandedReaderContinue = handleContinueReading;
        }
        return () => {
            delete (window as any).__expandedReaderContinue;
        };
    }, [handleContinueReading, onContinueRequest]);

    return (
        <div
            ref={containerRef}
            // ... (keep attributes)
            className={cn(
                "relative w-full min-h-screen transition-colors duration-300",
                isDarkMode ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-900"
            )}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
        >

            {/* Sticky Reader Controls Header */}
            <div
                ref={stickyHeaderRef}
                className={cn(
                    "sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300",
                    isDarkMode
                        ? "bg-zinc-950/90 border-white/5"
                        : "bg-white/90 border-zinc-200"
                )}>
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Reading Stats */}
                    <div className="flex items-center gap-3 text-xs">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors",
                            isDarkMode ? "bg-white/5" : "bg-zinc-100"
                        )}>
                            <Sparkles className="w-3 h-3 text-zinc-400" />
                            <span>{readProgress}% read</span>
                        </div>
                        {hasMoreContent && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hidden sm:flex transition-colors",
                                isDarkMode ? "bg-white/5" : "bg-zinc-100"
                            )}>
                                <Clock className="w-3 h-3" />
                                <span>{remainingTime} min left</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        {/* Desktop: Expanded Controls */}
                        <div className="hidden md:flex items-center gap-1">
                            {/* Font Size */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={decreaseFontSize}
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <span className="text-xs w-8 text-center font-mono">{fontSize}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={increaseFontSize}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>

                            <div className="w-px h-4 bg-white/10 mx-1" />

                            {/* Highlight Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-full",
                                    highlightsEnabled && "bg-blue-500/20 text-blue-400"
                                )}
                                onClick={() => setHighlightsEnabled(!highlightsEnabled)}
                                title={highlightsEnabled ? "Hide highlights" : "Show highlights"}
                            >
                                <Highlighter className="w-4 h-4" />
                            </Button>

                            {/* TTS */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-full",
                                    isSpeaking && "bg-emerald-500/20 text-emerald-400"
                                )}
                                onClick={toggleSpeech}
                            >
                                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>

                            {/* Dark Mode Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => {
                                    const newMode = !isDarkMode;
                                    setIsDarkMode(newMode);
                                    onThemeChange?.(newMode);
                                }}
                            >
                                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Mobile: Grouped Settings Menu + Close Morph */}
                        <div className="md:hidden flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-9 w-9 p-0 rounded-full font-serif italic text-lg font-medium shadow-sm border",
                                            isDarkMode
                                                ? "bg-white/10 border-white/10 text-zinc-100 hover:bg-white/20"
                                                : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
                                        )}
                                    >
                                        Aa
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    sideOffset={8}
                                    className={cn(
                                        "min-w-[220px] p-4 backdrop-blur-xl border rounded-2xl shadow-xl z-[150]",
                                        isDarkMode
                                            ? "bg-[#121212]/95 border-white/[0.08]"
                                            : "bg-white/95 border-zinc-200"
                                    )}
                                >
                                    <div className="space-y-4">
                                        {/* Font Size Control */}
                                        <div className="flex items-center justify-between">
                                            <span className={cn("text-xs font-medium uppercase tracking-wider", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                                                Font Size
                                            </span>
                                            <div className={cn(
                                                "flex items-center gap-2 rounded-full p-0.5 border",
                                                isDarkMode ? "bg-white/5 border-white/10" : "bg-zinc-100 border-zinc-200"
                                            )}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn("h-7 w-7 rounded-full", isDarkMode ? "text-zinc-300 hover:text-white hover:bg-white/10" : "text-zinc-600 hover:text-zinc-900 hover:bg-white")}
                                                    onClick={decreaseFontSize}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className={cn("text-sm w-8 text-center font-bold font-mono", isDarkMode ? "text-white" : "text-zinc-900")}>
                                                    {fontSize}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn("h-7 w-7 rounded-full", isDarkMode ? "text-zinc-300 hover:text-white hover:bg-white/10" : "text-zinc-600 hover:text-zinc-900 hover:bg-white")}
                                                    onClick={increaseFontSize}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <DropdownMenuSeparator className={cn("my-2", isDarkMode ? "bg-white/10" : "bg-zinc-200")} />

                                        {/* Toggles */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* Highlight */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-auto py-2 flex flex-col gap-2 rounded-xl border transition-all duration-300",
                                                    highlightsEnabled
                                                        ? (isDarkMode ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600")
                                                        : (isDarkMode ? "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-100 border-zinc-200 text-zinc-500")
                                                )}
                                                onClick={() => setHighlightsEnabled(!highlightsEnabled)}
                                            >
                                                <Highlighter className="w-4 h-4" />
                                                <span className="text-[10px] font-medium">Highlight</span>
                                            </Button>

                                            {/* Audio */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-auto py-2 flex flex-col gap-2 rounded-xl border transition-all duration-300",
                                                    isSpeaking
                                                        ? (isDarkMode ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                                                        : (isDarkMode ? "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-100 border-zinc-200 text-zinc-500")
                                                )}
                                                onClick={toggleSpeech}
                                            >
                                                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                                <span className="text-[10px] font-medium">Read</span>
                                            </Button>

                                            {/* Theme */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-auto py-2 flex flex-col gap-2 rounded-xl border transition-all duration-300",
                                                    isDarkMode
                                                        ? "bg-white/10 border-white/10 text-zinc-100"
                                                        : "bg-amber-100 border-amber-200 text-amber-700"
                                                )}
                                                onClick={() => {
                                                    const newMode = !isDarkMode;
                                                    setIsDarkMode(newMode);
                                                    onThemeChange?.(newMode);
                                                }}
                                            >
                                                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                                <span className="text-[10px] font-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Local Close Button (Right of Aa, appears when sticky) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className={cn(
                                    "rounded-full shadow-sm border transition-all duration-300",
                                    isDarkMode
                                        ? "bg-white/10 border-white/10 text-zinc-100 hover:bg-white/20 hover:text-white"
                                        : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200 hover:text-black",
                                    isHeaderSticky
                                        ? "w-9 h-9 p-0 opacity-100 scale-100 ml-2"
                                        : "w-0 h-0 p-0 opacity-0 scale-0 ml-0 overflow-hidden border-none"
                                )}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area - with generous bottom padding for floating bar */}
            <div className="max-w-3xl mx-auto px-6 py-8 pb-40 space-y-6">
                {/* Generated Sections */}
                <AnimatePresence mode="popLayout">
                    {sections.map((section, index) => {
                        if (!section.isGenerated) return null;

                        const isCurrentlyGenerating = index === currentSectionIndex && isGenerating;
                        const showAd = !isPremium && (index === 0 || (index > 0 && index % 3 === 0));

                        return (
                            <motion.div
                                key={section.id}
                                id={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-4"
                            >
                                {/* Section Content */}
                                <div className={cn(
                                    "font-serif",
                                    isDarkMode ? "text-zinc-300" : "text-zinc-700"
                                )}>
                                    {isCurrentlyGenerating ? (
                                        <TypewriterSection
                                            text={section.content}
                                            keywords={highlightsEnabled ? keywords : []}
                                            onComplete={handleSectionComplete}
                                            fontSize={fontSize}
                                        />
                                    ) : (
                                        <p
                                            className="leading-relaxed whitespace-pre-wrap"
                                            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                                        >
                                            {highlightsEnabled
                                                ? highlightKeywords(section.content, keywords)
                                                : section.content
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Ad Slot */}
                                {showAd && <AdSlot index={index} />}

                                {/* Section Divider */}
                                {index < sections.filter(s => s.isGenerated).length - 1 && (
                                    <div className="flex items-center justify-center py-6">
                                        <div className={cn(
                                            "w-12 h-px",
                                            isDarkMode ? "bg-white/10" : "bg-zinc-300"
                                        )} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Spacer to prevent content from scrolling behind floating dock */}
                <div className="h-24" aria-hidden="true" />

                {/* Scroll anchor for auto-scroll */}
                <div ref={contentEndRef} />

                {/* Reading Complete Message */}
                {!hasMoreContent && sections.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "text-center py-10 px-6 rounded-2xl",
                            isDarkMode
                                ? "bg-white/5 border border-white/10"
                                : "bg-zinc-100 border border-zinc-200"
                        )}
                    >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-zinc-700 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Reading Complete</h3>
                        <p className={cn(
                            "text-sm",
                            isDarkMode ? "text-zinc-500" : "text-zinc-500"
                        )}>
                            You've finished this article
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Floating bar moved to PostView */}

            {/* Quote Save Popover */}
            <AnimatePresence>
                {selectedQuote && onHighlightSave && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl backdrop-blur-xl border",
                            isDarkMode
                                ? "bg-zinc-900/90 border-white/10"
                                : "bg-white/90 border-zinc-200"
                        )}>
                            <Button
                                size="sm"
                                className="h-8 rounded-full"
                                onClick={handleSaveQuote}
                            >
                                <BookmarkPlus className="w-4 h-4 mr-1" />
                                Save Quote
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-full"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({ text: selectedQuote });
                                    }
                                }}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExpandedReader;
