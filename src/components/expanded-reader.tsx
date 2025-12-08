"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    Sparkles
} from "lucide-react";
import { Button } from "./ui/button";

// ============================================================================
// EXPANDED READER - Progressive full-text reading experience
// Features: Section generation, keyword highlighting, TTS, progress bar
// ============================================================================

interface ExpandedReaderProps {
    fullText: string | null;
    description: string | null;
    keywords: string[];
    slug: string;
    readingTime?: number;
    isPremium?: boolean;
    onHighlightSave?: (quote: string) => void;
}

interface Section {
    id: string;
    content: string;
    isGenerated: boolean;
}

// Smart paragraph chunking - splits text into readable sections
function chunkTextIntoSections(text: string, targetWordsPerSection: number = 120): Section[] {
    if (!text) return [];

    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sections: Section[] = [];
    let currentSection = "";
    let currentWordCount = 0;
    let sectionIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.split(/\s+/).length;

        // If adding this paragraph exceeds target and we have content, finalize section
        if (currentWordCount > 0 && currentWordCount + paragraphWords > targetWordsPerSection * 1.5) {
            sections.push({
                id: `section-${sectionIndex}`,
                content: currentSection.trim(),
                isGenerated: sectionIndex === 0, // First section always generated
            });
            sectionIndex++;
            currentSection = paragraph;
            currentWordCount = paragraphWords;
        } else {
            currentSection += (currentSection ? "\n\n" : "") + paragraph;
            currentWordCount += paragraphWords;

            // If we've accumulated enough, create a section
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

    // Add remaining content as final section
    if (currentSection.trim()) {
        sections.push({
            id: `section-${sectionIndex}`,
            content: currentSection.trim(),
            isGenerated: sectionIndex === 0,
        });
    }

    return sections;
}

// Highlight keywords in text
function highlightKeywords(text: string, keywords: string[]): React.ReactNode[] {
    if (!keywords || keywords.length === 0) return [text];

    // Create regex pattern for all keywords (case insensitive, word boundaries)
    const pattern = new RegExp(
        `\\b(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
        'gi'
    );

    const parts = text.split(pattern);

    return parts.map((part, index) => {
        const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
        if (isKeyword) {
            return (
                <mark
                    key={index}
                    className="bg-amber-500/20 text-amber-200 px-0.5 rounded-sm border-b border-amber-500/30"
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
    speed = 15
}: {
    text: string;
    keywords: string[];
    onComplete?: () => void;
    speed?: number;
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
                // Type multiple characters at once for speed
                const charsToAdd = Math.min(3, text.length - displayedText.length);
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
        <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
            {highlightedContent}
            {!isComplete && (
                <span className="inline-block w-[2px] h-5 ml-1 bg-white animate-pulse align-middle" />
            )}
        </p>
    );
};

// Ad Slot Component
const AdSlot = ({ index }: { index: number }) => (
    <div className="w-full my-6 py-4">
        <div className="w-full min-h-[120px] bg-zinc-900/50 rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
            {/* @ts-ignore */}
            <div
                ta-ad-container=""
                id={`reader-ad-${index}`}
                className="w-full h-full flex items-center justify-center"
            >
                <span className="text-xs text-zinc-600">Sponsored</span>
            </div>
        </div>
    </div>
);

// Reading Progress Bar
const ReadingProgressBar = ({ progress }: { progress: number }) => (
    <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800 z-50">
        <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
        />
    </div>
);

export const ExpandedReader: React.FC<ExpandedReaderProps> = ({
    fullText,
    description,
    keywords = [],
    slug,
    readingTime = 1,
    isPremium = false,
    onHighlightSave,
}) => {
    // Use fullText if available, otherwise fall back to description
    const contentToDisplay = fullText || description || "";

    // Section state
    const [sections, setSections] = useState<Section[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // Reader settings
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSectionRef = useRef<HTMLDivElement>(null);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Initialize sections
    useEffect(() => {
        const chunked = chunkTextIntoSections(contentToDisplay);
        setSections(chunked);
        setCurrentSectionIndex(0);

        // Update URL with section anchor (SPA style)
        if (chunked.length > 0 && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.hash = `section-0`;
            window.history.replaceState({}, '', url.toString());
        }
    }, [contentToDisplay]);

    // Calculate progress
    const progress = useMemo(() => {
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

    // Handle continue reading
    const handleContinueReading = useCallback(() => {
        if (isGenerating) return;

        const nextIndex = sections.findIndex(s => !s.isGenerated);
        if (nextIndex === -1) return;

        setIsGenerating(true);
        setCurrentSectionIndex(nextIndex);

        // Update URL
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.hash = `section-${nextIndex}`;
            window.history.pushState({}, '', url.toString());
        }

        // Mark section as generated
        setSections(prev => prev.map((s, i) =>
            i === nextIndex ? { ...s, isGenerated: true } : s
        ));
    }, [sections, isGenerating]);

    // Handle section complete
    const handleSectionComplete = useCallback(() => {
        setIsGenerating(false);

        // Scroll to keep content in view - push up effect
        if (lastSectionRef.current) {
            lastSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
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

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full transition-colors duration-300",
                isDarkMode ? "bg-zinc-950 text-zinc-200" : "bg-zinc-100 text-zinc-900"
            )}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
        >
            {/* Progress Bar */}
            <ReadingProgressBar progress={progress} />

            {/* Reader Controls */}
            <div className={cn(
                "sticky top-0 z-40 border-b backdrop-blur-xl",
                isDarkMode
                    ? "bg-zinc-950/90 border-white/5"
                    : "bg-white/90 border-zinc-200"
            )}>
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Reading Stats */}
                    <div className="flex items-center gap-3 text-xs">
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full",
                            isDarkMode ? "bg-white/5" : "bg-zinc-100"
                        )}>
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>{progress}% read</span>
                        </div>
                        {hasMoreContent && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-full",
                                isDarkMode ? "bg-white/5" : "bg-zinc-100"
                            )}>
                                <Clock className="w-3 h-3" />
                                <span>{remainingTime} min left</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        {/* Font Size */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={decreaseFontSize}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="text-xs w-8 text-center">{fontSize}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={increaseFontSize}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Button>

                        <div className="w-px h-4 bg-white/10 mx-1" />

                        {/* TTS */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", isSpeaking && "bg-amber-500/20 text-amber-400")}
                            onClick={toggleSpeech}
                        >
                            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>

                        {/* Dark Mode Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div
                className="max-w-3xl mx-auto px-6 py-8 space-y-6"
                style={{ fontSize: `${fontSize}px` }}
            >
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
                                ref={index === currentSectionIndex ? lastSectionRef : null}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-4"
                            >
                                {/* Section Content */}
                                <div className={cn(
                                    "font-serif leading-relaxed",
                                    isDarkMode ? "text-zinc-300" : "text-zinc-700"
                                )}>
                                    {isCurrentlyGenerating ? (
                                        <TypewriterSection
                                            text={section.content}
                                            keywords={keywords}
                                            onComplete={handleSectionComplete}
                                        />
                                    ) : (
                                        <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                                            {highlightKeywords(section.content, keywords)}
                                        </p>
                                    )}
                                </div>

                                {/* Ad Slot */}
                                {showAd && <AdSlot index={index} />}

                                {/* Section Divider */}
                                {index < sections.filter(s => s.isGenerated).length - 1 && (
                                    <div className="flex items-center justify-center py-4">
                                        <div className={cn(
                                            "w-16 h-px",
                                            isDarkMode ? "bg-white/10" : "bg-zinc-300"
                                        )} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Continue Reading Button */}
                {hasMoreContent && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-3 py-8"
                    >
                        <Button
                            onClick={handleContinueReading}
                            className={cn(
                                "group px-8 py-6 rounded-2xl font-semibold text-base transition-all",
                                isDarkMode
                                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                                    : "bg-zinc-900 hover:bg-zinc-800 text-white"
                            )}
                        >
                            <ChevronDown className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                            Continue Reading
                            <span className="ml-2 text-xs opacity-60">
                                ({remainingSections} section{remainingSections > 1 ? 's' : ''} left)
                            </span>
                        </Button>

                        <span className={cn(
                            "text-xs",
                            isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        )}>
                            ~{remainingTime} min remaining
                        </span>
                    </motion.div>
                )}

                {/* Reading Complete */}
                {!hasMoreContent && sections.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "text-center py-12 px-6 rounded-2xl",
                            isDarkMode ? "bg-white/5 border border-white/10" : "bg-zinc-50 border border-zinc-200"
                        )}
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Reading Complete!</h3>
                        <p className={cn(
                            "text-sm mb-4",
                            isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        )}>
                            You've finished this article. Great job!
                        </p>
                    </motion.div>
                )}
            </div>

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
