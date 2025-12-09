"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Bookmark, Loader2, Music2, Instagram, Share2, Copy } from "lucide-react";
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
    isDarkMode = true
}) => {
    if (!visible) return null;

    return (
        <motion.div
            className="fixed bottom-6 left-4 right-4 md:bottom-8 md:left-0 md:right-0 flex justify-center z-[110] pointer-events-none"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className={cn(
                "flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 rounded-full backdrop-blur-xl border shadow-2xl pointer-events-auto transition-colors duration-300 max-w-full overflow-x-auto no-scrollbar",
                isDarkMode
                    ? "bg-zinc-900/90 border-white/10"
                    : "bg-white/95 border-zinc-200 shadow-lg"
            )}>
                {/* Primary Action Button */}
                {hasMoreContent ? (
                    <Button
                        className={cn(
                            "h-10 md:h-12 px-5 md:px-8 rounded-full font-bold text-sm md:text-base tracking-wide shadow-lg transition-colors duration-300 shrink-0",
                            isDarkMode
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-zinc-900 text-white hover:bg-zinc-800"
                        )}
                        disabled={isGeneratingContent}
                        onClick={(e) => {
                            e.stopPropagation();
                            onContinue();
                        }}
                    >
                        {isGeneratingContent ? (
                            <>Loading...</>
                        ) : (
                            <>Continue Reading ({remainingSections})</>
                        )}
                    </Button>
                ) : (
                    <Button
                        className={cn(
                            "h-10 md:h-12 px-5 md:px-8 rounded-full font-bold text-sm md:text-base tracking-wide shadow-lg transition-colors duration-300 shrink-0",
                            isDarkMode
                                ? "bg-white text-black hover:bg-zinc-200"
                                : "bg-zinc-900 text-white hover:bg-zinc-800"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(post.link, "_blank");
                        }}
                    >
                        Read Full Story <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {/* Divider */}
                <div className={cn(
                    "w-px h-5 md:h-6 mx-0.5 md:mx-1 transition-colors duration-300 shrink-0",
                    isDarkMode ? "bg-white/10" : "bg-zinc-200"
                )} />

                {/* Hidden Secondary Read Full (Removed to save space on mobile) */}

                {/* Bookmark Button */}
                {onSave && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-10 w-10 md:h-12 md:w-12 rounded-full transition-all shrink-0",
                            isDarkMode
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-zinc-100 text-zinc-700",
                            isSaved && (isDarkMode ? "text-white bg-white/20" : "text-zinc-900 bg-zinc-200")
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSave();
                        }}
                    >
                        <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                    </Button>
                )}

                {/* Unified Share Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 md:h-12 md:w-12 rounded-full transition-all shrink-0",
                                isDarkMode
                                    ? "hover:bg-white/10 text-white"
                                    : "hover:bg-zinc-100 text-zinc-700"
                            )}
                            disabled={isExporting}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isExporting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Share2 className="w-5 h-5" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={12}
                        className={cn(
                            "min-w-[220px] p-2 backdrop-blur-xl border rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] z-[120]",
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
            </div>
        </motion.div>
    );
};
