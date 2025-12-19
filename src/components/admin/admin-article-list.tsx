'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, Edit, Trash2, Eye, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { InternalArticle } from '@/types/article';

interface AdminArticleListProps {
    articles: InternalArticle[];
    loading: boolean;
    onEdit: (article: InternalArticle) => void;
    onDelete: (id: string) => void;
    onRefresh: () => void;
}

export default function AdminArticleList({
    articles,
    loading,
    onEdit,
    onDelete,
    onRefresh,
}: AdminArticleListProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Get unique categories
    const categories = [...new Set(articles.map(a => a.category))];

    // Filter articles
    const filteredArticles = articles.filter(article => {
        const matchesSearch =
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.slug.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort by updated date (newest first)
    const sortedArticles = [...filteredArticles].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{articles.length} total</span>
                <span>•</span>
                <span>{articles.filter(a => a.status === 'published').length} published</span>
                <span>•</span>
                <span>{articles.filter(a => a.status === 'draft').length} drafts</span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : sortedArticles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {articles.length === 0
                        ? 'No articles yet. Create your first article!'
                        : 'No articles match your filters.'
                    }
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedArticles.map(article => (
                                <TableRow key={article.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium line-clamp-1">{article.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-1">
                                                /{article.category}/{article.subcategory}/{article.slug}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{article.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={article.status === 'published' ? 'default' : 'secondary'}
                                        >
                                            {article.status === 'published' ? '✅ Published' : '📝 Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(`/article/${article.category}/${article.subcategory}/${article.slug}`, '_blank')}
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(article)}
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(article.id)}
                                                title="Delete"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
