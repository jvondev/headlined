"use client";

import { useEffect, useRef } from 'react';
import { useArticleModal } from '@/context/article-modal-context';
import ArticleClientPage from '@/app/article/[[...slug]]/client';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ArticleModal() {
    const { isOpen, closeArticle, currentSlug, currentDate } = useArticleModal();

    // We don't need to pass params because ArticleClientPage uses useParams/usePathname
    // BUT, since we are faking the URL with pushState, Next.js hooks might not update immediately or correctly
    // in components designed for real routing.
    // However, ArticleClientPage likely reads from URL. Since we updated window location, 
    // we need to make sure it picks it up. 
    // actually, standardized ArticleClientPage usually takes props OR reads params.
    // Let's verify ArticleClientPage implementation.
    // If it relies solely on useParams(), it might fail because Next.js Router didn't technically update its internal state for useParams.
    // We might need to modify ArticleClientPage to accept override props.

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeArticle}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-4 sm:rounded-2xl sm:border shadow-2xl overflow-hidden"
                    >
                        {/* We use a key to force re-mount when slug changes */}
                        <div className="flex-1 w-full h-full relative overflow-y-auto overflow-x-hidden bg-background">
                            {/* 
                                IMPORTANT: We are rendering the existing Client Page.
                                NOTE: Requires ArticleClientPage to be able to read from window.location OR props.
                                We will check ArticleClientPage next.
                            */}
                            <ArticleClientPage />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
