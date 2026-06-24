'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Clock, ChevronRight, Search, Filter } from 'lucide-react';
import { InternalArticle } from '@/types/article';

export default function ArticleListingPage() {
    const [articles, setArticles] = useState<InternalArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        // Fetch published articles (this works client-side)
        fetch('/api/articles')
            .then(res => res.json())
            .then(data => {
                setArticles(data.articles || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Get unique categories
    const categories = ['all', ...new Set(articles.map(a => a.category))];

    // Filter articles
    const filteredArticles = articles.filter(article => {
        const matchesSearch =
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            (article.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-zinc-900 to-black py-16 px-4 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                        <FileText className="w-4 h-4 text-white/70" />
                        <span className="text-sm text-white/70">Reference Articles</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Knowledge Base
                    </h1>
                    <p className="text-lg text-white/60 max-w-xl mx-auto">
                        In-depth guides, tutorials, and reference material to help you get the most out of Headlined.
                    </p>
                </motion.div>
            </div>

            {/* Search & Filter */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border py-4 px-4">
                <div className="max-w-4xl mx-auto flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                    }`}
                            >
                                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold mb-2">No articles found</h2>
                        <p className="text-muted-foreground">
                            {articles.length === 0
                                ? 'Check back soon for new content.'
                                : 'Try adjusting your search or filters.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredArticles.map((article, index) => (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/article/${article.category}/${article.subcategory}/${article.slug}`}
                                    className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                        {article.thumbnail_url ? (
                                            <img
                                                src={article.thumbnail_url}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                                <FileText className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                                {article.category}
                                            </span>
                                            {article.aiGenerated && (
                                                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600">
                                                    Verified Content
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                            {article.title}
                                        </h2>
                                        {article.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                {article.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {article.readingTime || 1} min read
                                            </span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
