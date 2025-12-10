'use client';

import { Post } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Newspaper, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface RelatedArticlesSidebarProps {
    posts: Post[];
    isOpen: boolean;
    onClose: () => void;
    currentDate: string;
    isDarkMode?: boolean;
}

/**
 * Related Articles Sidebar
 * 
 * A slide-in drawer that displays related articles.
 * - Uses actual <Link> tags for SEO crawlability
 * - Links count as internal links for SEO
 * - Smooth slide animation from right
 */
export function RelatedArticlesSidebar({
    posts,
    isOpen,
    onClose,
    currentDate,
    isDarkMode = true
}: RelatedArticlesSidebarProps) {

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sidebar Panel */}
                    <motion.aside
                        className={cn(
                            "fixed top-0 right-0 bottom-0 z-[210] w-full max-w-md flex flex-col shadow-2xl",
                            isDarkMode
                                ? "bg-zinc-900 border-l border-white/10"
                                : "bg-white border-l border-zinc-200"
                        )}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className={cn(
                            "flex items-center justify-between p-4 border-b",
                            isDarkMode ? "border-white/10" : "border-zinc-200"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    isDarkMode ? "bg-white/5" : "bg-zinc-100"
                                )}>
                                    <Newspaper className={cn(
                                        "w-4 h-4",
                                        isDarkMode ? "text-white/70" : "text-zinc-600"
                                    )} />
                                </div>
                                <div>
                                    <h2 className={cn(
                                        "text-lg font-bold",
                                        isDarkMode ? "text-white" : "text-zinc-900"
                                    )}>More Stories</h2>
                                    <p className={cn(
                                        "text-xs",
                                        isDarkMode ? "text-white/50" : "text-zinc-500"
                                    )}>
                                        From {new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isDarkMode
                                        ? "hover:bg-white/10 text-white/70"
                                        : "hover:bg-zinc-100 text-zinc-600"
                                )}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable List - Using actual Links for SEO */}
                        <nav className="flex-1 overflow-y-auto p-4 space-y-3" aria-label="Related articles">
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post.slug}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/article/${post.date || currentDate}/${post.slug}`}
                                        onClick={onClose}
                                        className={cn(
                                            "block rounded-2xl overflow-hidden transition-all group",
                                            isDarkMode
                                                ? "bg-white/5 hover:bg-white/10 border border-white/10"
                                                : "bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
                                        )}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative h-32 overflow-hidden">
                                            {post.thumbnail_url ? (
                                                <img
                                                    src={post.thumbnail_url}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "w-full h-full",
                                                    isDarkMode
                                                        ? "bg-gradient-to-br from-zinc-700 to-zinc-900"
                                                        : "bg-gradient-to-br from-zinc-200 to-zinc-300"
                                                )} />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Topic Badge */}
                                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/90 text-black uppercase tracking-wide">
                                                {post.topic || 'News'}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 space-y-2">
                                            <h3 className={cn(
                                                "text-sm font-semibold line-clamp-2 leading-snug",
                                                isDarkMode ? "text-white" : "text-zinc-900"
                                            )}>
                                                {post.title}
                                            </h3>

                                            <div className="flex items-center justify-between">
                                                <div className={cn(
                                                    "flex items-center gap-1.5",
                                                    isDarkMode ? "text-white/50" : "text-zinc-500"
                                                )}>
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px]">
                                                        {post.readingTime || 1} min read
                                                    </span>
                                                </div>
                                                <ArrowRight className={cn(
                                                    "w-4 h-4 group-hover:translate-x-1 transition-all",
                                                    isDarkMode ? "text-white/30 group-hover:text-white/60" : "text-zinc-400 group-hover:text-zinc-600"
                                                )} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Footer - View All Link */}
                        <div className={cn(
                            "p-4 border-t",
                            isDarkMode ? "border-white/10" : "border-zinc-200"
                        )}>
                            <Link
                                href="/today"
                                className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
                                    isDarkMode
                                        ? "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900"
                                )}
                            >
                                View All Headlines
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
