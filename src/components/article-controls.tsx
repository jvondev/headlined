'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import {
    Volume2,
    VolumeX,
    Minus,
    Plus,
    Share2,
    ArrowUp,
    Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ArticleControlsProps {
    onFontSizeChange: (size: number) => void;
    currentFontSize: number;
    textToSpeak: string;
    onShare: () => void;
}

export function ArticleControls({
    onFontSizeChange,
    currentFontSize,
    textToSpeak,
    onShare
}: ArticleControlsProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 200;
            setScrolled(isScrolled);

            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = (window.scrollY / totalHeight) * 100;
            setProgress(currentProgress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleSpeech = () => {
        if (!('speechSynthesis' in window)) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.9;
            utterance.onend = () => setIsSpeaking(false);
            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Top Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-zinc-100">
                <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Floating Action Bar */}
            <div className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-full bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl transition-all duration-500",
                scrolled ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
            )}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-zinc-100 text-zinc-600"
                    onClick={scrollToTop}
                >
                    <ArrowUp className="w-4 h-4" />
                </Button>

                <div className="w-px h-4 bg-zinc-200 mx-1" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-zinc-100 text-zinc-600"
                        onClick={() => onFontSizeChange(Math.max(currentFontSize - 2, 14))}
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-[10px] font-bold w-6 text-center text-zinc-400 font-mono">
                        {currentFontSize}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-zinc-100 text-zinc-600"
                        onClick={() => onFontSizeChange(Math.min(currentFontSize + 2, 28))}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                </div>

                <div className="w-px h-4 bg-zinc-200 mx-1" />

                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full transition-colors",
                        isSpeaking ? "bg-primary/10 text-primary" : "hover:bg-zinc-100 text-zinc-600"
                    )}
                    onClick={toggleSpeech}
                >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-zinc-100 text-zinc-600"
                    onClick={onShare}
                >
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </>
    );
}
