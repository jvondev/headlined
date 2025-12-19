'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Sparkles, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminArticleList from './admin-article-list';
import AdminEditor from './admin-editor';
import AIGenerator from './ai-generator';
import { InternalArticle } from '@/types/article';

type View = 'list' | 'editor' | 'ai-generator';

export default function AdminDashboard() {
    const [view, setView] = useState<View>('list');
    const [editingArticle, setEditingArticle] = useState<InternalArticle | null>(null);
    const [articles, setArticles] = useState<InternalArticle[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch articles on mount
    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/admin/articles');
            if (res.ok) {
                const data = await res.json();
                setArticles(data.articles || []);
            }
        } catch (e) {
            console.error('Failed to fetch articles:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleNewArticle = () => {
        setEditingArticle(null);
        setView('editor');
    };

    const handleEditArticle = (article: InternalArticle) => {
        setEditingArticle(article);
        setView('editor');
    };

    const handleSaveArticle = async (article: InternalArticle) => {
        try {
            const res = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(article),
            });
            if (res.ok) {
                await fetchArticles();
                setView('list');
            }
        } catch (e) {
            console.error('Failed to save article:', e);
        }
    };

    const handleDeleteArticle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            const res = await fetch(`/api/admin/articles?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchArticles();
            }
        } catch (e) {
            console.error('Failed to delete article:', e);
        }
    };

    const handleAIGenerated = (article: Partial<InternalArticle>) => {
        setEditingArticle(article as InternalArticle);
        setView('editor');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {view !== 'list' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setView('list')}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Article Admin
                            </h1>
                        </div>

                        {view === 'list' && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setView('ai-generator')}
                                    className="flex items-center gap-2"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    AI Generate
                                </Button>
                                <Button onClick={handleNewArticle} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    New Article
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {view === 'list' && (
                    <AdminArticleList
                        articles={articles}
                        loading={loading}
                        onEdit={handleEditArticle}
                        onDelete={handleDeleteArticle}
                        onRefresh={fetchArticles}
                    />
                )}

                {view === 'editor' && (
                    <AdminEditor
                        article={editingArticle}
                        onSave={handleSaveArticle}
                        onCancel={() => setView('list')}
                    />
                )}

                {view === 'ai-generator' && (
                    <AIGenerator
                        onGenerated={handleAIGenerated}
                        onCancel={() => setView('list')}
                    />
                )}
            </main>
        </div>
    );
}
