"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Post } from '@/types';

interface ArticleModalContextType {
    isOpen: boolean;
    currentSlug: string | null;
    currentDate: string | null;
    articleData: Post | null;
    openArticle: (date: string, slug: string, initialData?: Post) => void;
    closeArticle: () => void;
}

const ArticleModalContext = createContext<ArticleModalContextType | undefined>(undefined);

export function ArticleModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<string | null>(null);
    const [articleData, setArticleData] = useState<Post | null>(null);

    const router = useRouter();
    const pathname = usePathname();

    // Reset modal if user navigates away via browser back/forward and it changes the path significantly
    // But we want to keep it open if we just pushed the state ourselves.
    // Actually, listening to popstate is safer.

    useEffect(() => {
        const handlePopState = () => {
            // If user hits back button, close modal if it was open
            // We can check if the new URL is NOT an article URL, then close.
            // or simply rely on the fact that we pushed state for the modal.
            // For simplicity: if we are open, and history changes, we should probably close unless the new URL matches.
            // But actually, simpler approach:
            // The modal "pseudo-navigation" pushed a state. Hitting back pops that state.
            // We should detect if we are no longer on the article URL.

            // Simplest: Just close it on popstate to be safe, creating a "Back closes modal" effect.
            setIsOpen(false);
            setCurrentSlug(null);
            setCurrentDate(null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const openArticle = useCallback((date: string, slug: string, initialData?: Post) => {
        setIsOpen(true);
        setCurrentSlug(slug);
        setCurrentDate(date);
        if (initialData) setArticleData(initialData);

        // Update URL without navigation
        // Construct new URL
        const newUrl = `/article/${date}/${slug}`;

        // Push state so back button works to close it
        window.history.pushState({ modalOpen: true }, '', newUrl);
    }, []);

    const closeArticle = useCallback(() => {
        setIsOpen(false);
        setCurrentSlug(null);
        setCurrentDate(null);
        setArticleData(null);

        // Revert URL to previous (Dashboard)
        // Check if we can just go back
        // If state has our flag, we back. If not (maybe opened directly?), we replace.
        // For this implementation, we assume we always pushState on open.
        // So back() should return to dashboard.
        // However, to be robust:
        window.history.back();
    }, []);

    return (
        <ArticleModalContext.Provider value={{
            isOpen,
            currentSlug,
            currentDate,
            articleData,
            openArticle,
            closeArticle
        }}>
            {children}
        </ArticleModalContext.Provider>
    );
}

export function useArticleModal() {
    const context = useContext(ArticleModalContext);
    if (context === undefined) {
        throw new Error('useArticleModal must be used within a ArticleModalProvider');
    }
    return context;
}
