"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Bookmark, Loader2, Music2, Instagram, Share2, Copy, ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

interface FloatingActionDockProps {
    post: Post;
    hasMoreContent: boolean;
    isGeneratingContent: boolean;
    remainingSections: number;
    onContinue: () => void;
    onSave?: () => void;
    isSaved?: boolean;
    onDownload: (platform: 'tiktok' | 'instagram') => void;
    isExporting: boolean;
    visible?: boolean;
    isDarkMode?: boolean;
}

export const FloatingActionDock: React.FC<FloatingActionDockProps> = ({
    post,
    hasMoreContent,
    isGeneratingContent,
    remainingSections,
    onContinue,
    onSave,
    isSaved,
    onDownload,
    isExporting,
    visible = true,
    isDarkMode = false
}) => {
    const scrollToTop = () => {
        const container = document.getElementById('article-scroll-container');
        if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!visible) return null;

    return (
        <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-[110]">
            <motion.div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-full backdrop-blur-xl border shadow-2xl transition-all duration-500 pointer-events-auto transform-gpu",
                    isDarkMode
                        ? "bg-zinc-900/90 border-white/10"
                        : "bg-white/90 border-zinc-200"
                )}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {/* Scroll to Top */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-9 w-9 rounded-full transition-colors",
                        isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-zinc-100 text-zinc-600"
                    )}
                    onClick={scrollToTop}
                >
                    <ArrowUp className="w-4 h-4" />
                </Button>

                {/* Bookmark Button */}
                {onSave && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-9 w-9 rounded-full transition-all shrink-0",
                            isDarkMode
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-zinc-100 text-zinc-600",
                            isSaved && (isDarkMode ? "text-white bg-white/20" : "text-primary bg-primary/10")
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave();
                        }}
                    >
                        <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                    </Button>
                )}

                {/* Read Full Story */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-9 w-9 rounded-full transition-colors",
                        isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-zinc-100 text-zinc-600"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(post.link, "_blank");
                    }}
                >
                    <ExternalLink className="w-4 h-4" />
                </Button>

                {/* Continue Reading Button (Primary Action) */}
                {hasMoreContent && (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onContinue();
                        }}
                        className={cn(
                            "h-10 px-6 rounded-full flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95 group mx-1",
                            isDarkMode
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-zinc-900 text-white hover:bg-black"
                        )}
                    >
                        <span className="text-xs uppercase tracking-tight">
                            Continue
                        </span>
                        <div className={cn(
                            "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                            isDarkMode ? "bg-black/10 text-black/60" : "bg-white/20 text-white/90"
                        )}>
                            {remainingSections}
                        </div>
                    </Button>
                )}

                {/* Unified Share Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-9 w-9 rounded-full transition-all shrink-0",
                                isDarkMode
                                    ? "hover:bg-white/10 text-white"
                                    : "hover:bg-zinc-100 text-zinc-600"
                            )}
                            disabled={isExporting}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Share2 className="w-4 h-4" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={12}
                        className={cn(
                            "min-w-[220px] p-2 backdrop-blur-xl border rounded-2xl shadow-2xl z-[120]",
                            isDarkMode
                                ? "bg-[#121212]/95 border-white/[0.08]"
                                : "bg-white/95 border-zinc-200"
                        )}
                    >
                        <DropdownMenuLabel className={cn(
                            "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-50",
                            isDarkMode ? "text-white" : "text-zinc-900"
                        )}>
                            Share Article
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                const shareUrl = window.location.href;
                                navigator.clipboard.writeText(shareUrl);
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-colors",
                                isDarkMode
                                    ? "text-zinc-200 focus:bg-white/10"
                                    : "text-zinc-800 focus:bg-zinc-100"
                            )}
                        >
                            <Copy className="w-4 h-4 opacity-70" />
                            <span className="text-sm font-medium">Copy Link</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className={cn("my-1.5", isDarkMode ? "bg-white/10" : "bg-zinc-200")} />

                        <DropdownMenuLabel className={cn(
                            "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-50",
                            isDarkMode ? "text-white" : "text-zinc-900"
                        )}>
                            Export as Image
                        </DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload('tiktok');
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-colors",
                                isDarkMode
                                    ? "text-zinc-200 focus:bg-white/10"
                                    : "text-zinc-800 focus:bg-zinc-100"
                            )}
                        >
                            <Music2 className="w-4 h-4 opacity-70" />
                            <span className="text-sm font-medium">TikTok Story</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload('instagram');
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer outline-none transition-colors",
                                isDarkMode
                                    ? "text-zinc-200 focus:bg-white/10"
                                    : "text-zinc-800 focus:bg-zinc-100"
                            )}
                        >
                            <Instagram className="w-4 h-4 opacity-70" />
                            <span className="text-sm font-medium">Instagram Story</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </motion.div>
        </div>
    );
};
