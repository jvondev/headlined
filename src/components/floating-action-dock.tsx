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
    visible = true
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
            <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
                {/* Primary Action Button (Continue Reading OR Read Full Story) */}
                {hasMoreContent ? (
                    <Button
                        className="h-12 px-8 rounded-full font-bold text-base tracking-wide shadow-lg bg-white text-black hover:bg-zinc-200"
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
                        className="h-12 px-8 rounded-full font-bold text-base tracking-wide shadow-lg bg-white text-black hover:bg-zinc-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(post.link, "_blank");
                        }}
                    >
                        Read Full Story <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {/* Divider */}
                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Secondary Read Full (when Continue is Primary) */}
                {hasMoreContent && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full hover:bg-white/10 transition-all text-white"
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

                {/* Link & Download Group */}
                <div className="flex items-center">
                    {/* Copy Link */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full hover:bg-white/10 transition-all text-white"
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
                                className="h-12 w-12 rounded-full hover:bg-white/10 transition-all text-white"
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
                            className="min-w-[200px] p-1.5 bg-[#121212]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] z-[120] animate-in fade-in-0 zoom-in-95 duration-200"
                        >
                            <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                Share Target
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/[0.08] mx-1 my-1" />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload('tiktok');
                                }}
                                className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-zinc-300 focus:text-white focus:bg-white/[0.08] cursor-pointer outline-none transition-all duration-200"
                            >
                                <div className="p-1.5 rounded-md bg-zinc-800 group-focus:bg-zinc-700 transition-colors">
                                    <Music2 className="w-3.5 h-3.5 text-zinc-400 group-focus:text-white" />
                                </div>
                                <span>TikTok</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload('instagram');
                                }}
                                className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-zinc-300 focus:text-white focus:bg-white/[0.08] cursor-pointer outline-none transition-all duration-200"
                            >
                                <div className="p-1.5 rounded-md bg-zinc-800 group-focus:bg-zinc-700 transition-colors">
                                    <Instagram className="w-3.5 h-3.5 text-zinc-400 group-focus:text-white" />
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
