'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { InternalArticle } from '@/types/article';
import { ExpandedReader } from '@/components/expanded-reader';
import { Clock, Tag, ArrowLeft, Share2, Home } from 'lucide-react';

interface InternalArticlePageProps {
    article: InternalArticle;
}

export default function InternalArticlePage({ article }: InternalArticlePageProps) {
    const readingTime = useMemo(() => {
        if (article.readingTime && article.readingTime > 0) return article.readingTime;
        const words = (article.fullText || article.description || '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    }, [article]);

    // JSON-LD for SEO
    const jsonLd = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.seoTitle || article.title,
        description: article.seoDescription || article.description,
        datePublished: article.createdAt,
        dateModified: article.updatedAt,
        author: {
            '@type': 'Organization',
            name: 'Headlined',
            url: 'https://headlined.app'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Headlined',
            logo: {
                '@type': 'ImageObject',
                url: 'https://headlined.app/icon.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://headlined.app/article/${article.category}/${article.subcategory}/${article.slug}`
        },
        keywords: article.keywords?.join(', '),
        articleSection: article.category,
        wordCount: (article.fullText || '').split(/\s+/).length
    }), [article]);

    const handleShare = async () => {
        const url = `https://headlined.app/article/${article.category}/${article.subcategory}/${article.slug}`;
        if (navigator.share) {
            await navigator.share({
                title: article.title,
                text: article.description || '',
                url
            });
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/article"
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">All Articles</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4 text-white/70" />
                        </button>
                        <Link
                            href="/today"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            title="Home"
                        >
                            <Home className="w-4 h-4 text-white/70" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative py-12 md:py-16 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Category Pills */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black uppercase tracking-wider">
                                {article.category}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70 border border-white/10">
                                {article.subcategory}
                            </span>
                            {article.aiGenerated && (
                                <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    🤖 AI Generated
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                            {article.title}
                        </h1>

                        {/* Description */}
                        {article.description && (
                            <p className="text-lg text-white/60 max-w-2xl">
                                {article.description}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {readingTime} min read
                            </span>
                            <span>
                                Updated {new Date(article.updatedAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>

                        {/* Keywords */}
                        {article.keywords && article.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {article.keywords.slice(0, 5).map((keyword, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 rounded text-xs bg-white/5 text-white/50 border border-white/10"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
                >
                    <ExpandedReader
                        fullText={article.fullText ?? null}
                        description={article.description}
                        keywords={article.keywords || []}
                        slug={article.slug}
                        date={article.date}
                        readingTime={readingTime}
                        isPremium={false}
                        articleUrl={article.link}
                        onHighlightSave={() => { }}
                        onContinueStateChange={() => { }}
                        onContinueRequest={() => { }}
                        onDownload={() => { }}
                        isExporting={false}
                        onThemeChange={() => { }}
                        onClose={() => { }}
                        onStickyChange={() => { }}
                    />
                </motion.div>
            </main>

            {/* Back to articles */}
            <div className="max-w-4xl mx-auto px-4 pb-12">
                <Link
                    href="/article"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All Articles
                </Link>
            </div>

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </div>
    );
}
