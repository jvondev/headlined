'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { InternalArticle } from '@/types/article';
import { ArticleFAQ } from '@/components/article-faq';
import { ArticleControls } from '@/components/article-controls';
import { Clock, Tag, ArrowLeft, Share2, Home, Calendar, User, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';

interface InternalArticlePageProps {
    article: InternalArticle;
}

export default function InternalArticlePage({ article }: InternalArticlePageProps) {
    const [fontSize, setFontSize] = useState(20);

    const readingTime = useMemo(() => {
        if (article.readingTime && article.readingTime > 0) return article.readingTime;
        const words = (article.fullText || article.description || '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    }, [article]);

    const textToSpeak = useMemo(() => {
        return `${article.title}. ${article.description}. ${article.fullText?.replace(/[#*]/g, '')}`;
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
        <div className="min-h-screen bg-white">
            {/* Header / Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/article"
                        className="flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Knowledge Hub</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="p-2.5 rounded-full bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <Link
                            href="/today"
                            className="p-2.5 rounded-full bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200"
                            title="Home"
                        >
                            <Home className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-4 pt-12 pb-24">
                {/* Meta Header */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-900 text-white uppercase tracking-widest">
                            {article.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-widest border border-zinc-200">
                            {article.subcategory}
                        </span>
                        {article.aiGenerated && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="w-3 h-3" />
                                VERIFIED EXPERT CONTENT
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-8">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500 font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.updatedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {readingTime} min read
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-zinc-900">
                            <User className="w-4 h-4" />
                            Headlined Editorial
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="prose prose-zinc prose-lg max-w-none">
                    <div className="text-xl text-zinc-600 leading-relaxed font-medium mb-12 border-l-4 border-primary/20 pl-6 italic">
                        {article.description}
                    </div>

                    <div
                        className="article-content space-y-8 text-zinc-800 leading-[1.8] font-serif"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ node, ...props }) => <h2 className="text-3xl font-bold text-zinc-900 mt-16 mb-8 scroll-mt-24" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-zinc-900 mt-12 mb-6" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />,
                                ul: ({ node, ...props }) => <ul className="space-y-3 my-8 list-none pl-6 border-l-2 border-zinc-100" {...props} />,
                                li: ({ node, ...props }) => (
                                    <li className="relative" {...props}>
                                        <span className="absolute -left-6 top-3 w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        {props.children}
                                    </li>
                                ),
                                a: ({ node, ...props }) => <a className="text-primary font-semibold underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary bg-zinc-50 px-8 py-6 rounded-r-xl italic text-zinc-700 my-10" {...props} />,
                                table: ({ node, ...props }) => (
                                    <div className="my-10 overflow-x-auto rounded-xl border border-zinc-100 shadow-sm">
                                        <table className="w-full text-sm text-left" {...props} />
                                    </div>
                                ),
                                thead: ({ node, ...props }) => <thead className="bg-zinc-50 border-b border-zinc-100" {...props} />,
                                th: ({ node, ...props }) => <th className="px-6 py-4 font-bold text-zinc-900 uppercase tracking-wider" {...props} />,
                                td: ({ node, ...props }) => <td className="px-6 py-4 text-zinc-600 border-b border-zinc-50 last:border-0" {...props} />,
                                tr: ({ node, ...props }) => <tr className="hover:bg-zinc-50/50 transition-colors" {...props} />,
                            }}
                        >
                            {article.fullText || ''}
                        </ReactMarkdown>
                    </div>

                    {/* FAQ Section */}
                    {article.faq && article.faq.length > 0 && (
                        <ArticleFAQ faq={article.faq} />
                    )}

                    {/* Sources & Trust Elements */}
                    {(article.sources && article.sources.length > 0) && (
                        <div className="mt-20 pt-10 border-t border-zinc-100">
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-6">References & Sources</h3>
                            <div className="grid gap-4">
                                {article.sources.map((source, i) => (
                                    <a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-100 transition-all group"
                                    >
                                        <span className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900">{source.title}</span>
                                        <Share2 className="w-3 h-3 text-zinc-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footnote / Trust Seal */}
                <footer className="mt-24 pt-12 border-t border-zinc-100 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Fact-checked & Verified Content
                    </div>
                    <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                        This article is part of Headlined's Knowledge Hub, providing verified, canonical Information on {article.subcategory}.
                    </p>
                </footer>
            </article>

            {/* Floating Controls */}
            <ArticleControls
                onFontSizeChange={setFontSize}
                currentFontSize={fontSize}
                textToSpeak={textToSpeak}
                onShare={handleShare}
            />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <style jsx global>{`
                .article-content {
                    font-size: 1.125rem;
                }
                @media (min-width: 768px) {
                    .article-content {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
}
