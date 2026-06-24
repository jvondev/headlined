'use client';

import { Post } from '@/types';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedArticlesProps {
    posts: Post[];
    onPostClick: (post: Post) => void;
    currentDate: string;
    className?: string;
}

/**
 * Related Articles Component
 * Displays a list of related articles in a compact card format.
 * Mobile-friendly with horizontal scroll on smaller screens.
 */
export function RelatedArticles({ posts, onPostClick, currentDate, className }: RelatedArticlesProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className={cn("mt-8 pt-8 border-t border-white/10", className)}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Newspaper className="w-4 h-4 text-white/70" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">More Stories</h2>
                    <p className="text-xs text-white/50">Related articles from {new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Cards Grid - Horizontal scroll on mobile, grid on desktop */}
            <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar">
                {posts.map((post, index) => (
                    <motion.button
                        key={post.slug}
                        onClick={() => onPostClick(post)}
                        className="flex-shrink-0 w-[280px] md:w-full text-left group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/8 group-active:scale-[0.98]">
                            {/* Thumbnail */}
                            <div className="relative h-32 overflow-hidden">
                                {post.thumbnail_url ? (
                                    <img
                                        src={post.thumbnail_url}
                                        alt=""
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Topic Badge */}
                                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/90 text-black uppercase tracking-wide">
                                    {post.topic || 'News'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-white/90">
                                    {post.title}
                                </h3>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-white/50">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px]">
                                            {post.readingTime || 1} min read
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* View All Link */}
            <motion.a
                href="/"
                className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                View All Headlines
                <ArrowRight className="w-4 h-4" />
            </motion.a>
        </section>
    );
}
