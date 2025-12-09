"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Bookmark, Download, Loader2, Music2, Instagram, Link2 } from "lucide-react";
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
            className="fixed bottom-8 left-0 right-0 flex justify-center z-[110] pointer-events-none"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className={cn(
                "flex items-center gap-2 p-2 rounded-full backdrop-blur-xl border shadow-2xl pointer-events-auto transition-colors duration-300",
                isDarkMode
                    ? "bg-zinc-900/80 border-white/10"
                    : "bg-white/90 border-zinc-200 shadow-lg"
            )}>
                {/* Primary Action Button (Continue Reading OR Read Full Story) */}
                {hasMoreContent ? (
                    <Button
                        className={cn(
                            "h-12 px-8 rounded-full font-bold text-base tracking-wide shadow-lg transition-colors duration-300",
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
                            "h-12 px-8 rounded-full font-bold text-base tracking-wide shadow-lg transition-colors duration-300",
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
                    "w-px h-6 mx-1 transition-colors duration-300",
                    isDarkMode ? "bg-white/10" : "bg-zinc-200"
                )} />

                {/* Secondary Read Full (when Continue is Primary) */}
                {hasMoreContent && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-12 w-12 rounded-full transition-all",
                            isDarkMode
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-zinc-100 text-zinc-700"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(post.link, "_blank");
                        }}
                    >
                        <ExternalLink className="w-5 h-5" />
                    </Button>
                )}

                {/* Bookmark Button */}
                {onSave && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-12 w-12 rounded-full transition-all",
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

                {/* Link & Download Group */}
                <div className="flex items-center">
                    {/* Copy Link */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-12 w-12 rounded-full transition-all",
                            isDarkMode
                                ? "hover:bg-white/10 text-white"
                                : "hover:bg-zinc-100 text-zinc-700"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Logic update: use /read/date/slug if available, else window href
                            const shareUrl = window.location.href;
                            navigator.clipboard.writeText(shareUrl);
                        }}
                    >
                        <Link2 className="w-5 h-5" />
                    </Button>

                    {/* Download Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-12 w-12 rounded-full transition-all",
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
                                    <Download className="w-5 h-5" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={12}
                            className={cn(
                                "min-w-[200px] p-1.5 backdrop-blur-xl border rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] z-[120] animate-in fade-in-0 zoom-in-95 duration-200",
                                isDarkMode
                                    ? "bg-[#121212]/95 border-white/[0.08]"
                                    : "bg-white/95 border-zinc-200"
                            )}
                        >
                            <DropdownMenuLabel className={cn(
                                "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider",
                                isDarkMode ? "text-zinc-500" : "text-zinc-400"
                            )}>
                                Share Target
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className={cn(
                                "mx-1 my-1",
                                isDarkMode ? "bg-white/[0.08]" : "bg-zinc-200"
                            )} />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload('tiktok');
                                }}
                                className={cn(
                                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer outline-none transition-all duration-200",
                                    isDarkMode
                                        ? "text-zinc-300 focus:text-white focus:bg-white/[0.08]"
                                        : "text-zinc-600 focus:text-zinc-900 focus:bg-zinc-100"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    isDarkMode
                                        ? "bg-zinc-800 group-focus:bg-zinc-700"
                                        : "bg-zinc-100 group-focus:bg-zinc-200"
                                )}>
                                    <Music2 className={cn(
                                        "w-3.5 h-3.5",
                                        isDarkMode
                                            ? "text-zinc-400 group-focus:text-white"
                                            : "text-zinc-500 group-focus:text-zinc-900"
                                    )} />
                                </div>
                                <span>TikTok</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload('instagram');
                                }}
                                className={cn(
                                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer outline-none transition-all duration-200",
                                    isDarkMode
                                        ? "text-zinc-300 focus:text-white focus:bg-white/[0.08]"
                                        : "text-zinc-600 focus:text-zinc-900 focus:bg-zinc-100"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    isDarkMode
                                        ? "bg-zinc-800 group-focus:bg-zinc-700"
                                        : "bg-zinc-100 group-focus:bg-zinc-200"
                                )}>
                                    <Instagram className={cn(
                                        "w-3.5 h-3.5",
                                        isDarkMode
                                            ? "text-zinc-400 group-focus:text-white"
                                            : "text-zinc-500 group-focus:text-zinc-900"
                                    )} />
                                </div>
                                <span>Instagram</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.div>
    );
};
