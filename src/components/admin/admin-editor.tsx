'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Eye, EyeOff, Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ReactMarkdown from 'react-markdown';
import { InternalArticle } from '@/types/article';
import { CATEGORIES } from '@scraper/categories';

interface AdminEditorProps {
    article: InternalArticle | null;
    onSave: (article: InternalArticle) => void;
    onCancel: () => void;
}

export default function AdminEditor({ article, onSave, onCancel }: AdminEditorProps) {
    const [formData, setFormData] = useState<Partial<InternalArticle>>({
        title: '',
        slug: '',
        description: '',
        fullText: '',
        category: '',
        subcategory: '',
        status: 'draft',
        keywords: [],
        thumbnail_url: '',
        seoTitle: '',
        seoDescription: '',
        link: '',
        summaries: [],
        aiGenerated: false,
        sourceKeywords: [],
        // E-E-A-T fields
        sources: [],
        factsCited: [],
        lastVerified: '',
    });
    const [showPreview, setShowPreview] = useState(false);
    const [subcategoryOptions, setSubcategoryOptions] = useState<{ slug: string; title: string }[]>([]);

    // Initialize form with article data
    useEffect(() => {
        if (article) {
            setFormData(article);
            // Set subcategory options based on category
            const cat = CATEGORIES.find(c => c.id === article.category);
            if (cat) {
                setSubcategoryOptions(cat.items.map(i => ({ slug: i.slug, title: i.title })));
            }
        }
    }, [article]);

    // Update subcategory options when category changes
    useEffect(() => {
        if (formData.category) {
            const cat = CATEGORIES.find(c => c.id === formData.category);
            if (cat) {
                setSubcategoryOptions(cat.items.map(i => ({ slug: i.slug, title: i.title })));
                // Reset subcategory if not in new options
                if (!cat.items.find(i => i.slug === formData.subcategory)) {
                    setFormData(prev => ({ ...prev, subcategory: cat.items[0]?.slug || '' }));
                }
            }
        }
    }, [formData.category]);

    // Auto-generate slug from title
    const generateSlug = useCallback((title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }, []);

    // Calculate reading time
    const calculateReadingTime = useCallback((text: string) => {
        const words = text.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    }, []);

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title),
        }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({
            ...prev,
            fullText: content,
            readingTime: calculateReadingTime(content),
        }));
    };

    const handleSave = (status: 'draft' | 'published') => {
        const now = new Date().toISOString();
        const id = article?.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const saveData: InternalArticle = {
            ...(formData as InternalArticle),
            id,
            status,
            createdAt: article?.createdAt || now,
            updatedAt: now,
            date: new Date().toISOString().split('T')[0],
            topic: formData.category || null,
        };

        onSave(saveData);
    };

    // Toolbar actions
    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.fullText || '';
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
        handleContentChange(newText);

        // Re-focus and position cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
        }, 0);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Article title"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="article-slug"
                    />
                </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                        value={formData.category || ''}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Select
                        value={formData.subcategory || ''}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, subcategory: v }))}
                        disabled={!formData.category}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                            {subcategoryOptions.map(sub => (
                                <SelectItem key={sub.slug} value={sub.slug}>{sub.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (Meta)</Label>
                <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description for SEO and previews (150-160 chars)"
                    rows={2}
                />
                <div className="text-xs text-muted-foreground">
                    {(formData.description || '').length}/160 characters
                </div>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                    id="thumbnail"
                    value={formData.thumbnail_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Content (Markdown)</Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            ~{formData.readingTime || 1} min read
                        </span>
                        <Switch
                            checked={showPreview}
                            onCheckedChange={setShowPreview}
                        />
                        <span className="text-sm">{showPreview ? 'Preview' : 'Edit'}</span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/50">
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('**', '**')} title="Bold">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('*', '*')} title="Italic">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('## ')} title="Heading 2">
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('### ')} title="Heading 3">
                        <Heading3 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('- ')} title="Bullet List">
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('1. ')} title="Numbered List">
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('> ')} title="Quote">
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('`', '`')} title="Code">
                        <Code className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('[', '](url)')} title="Link">
                        <Link2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => insertMarkdown('![alt](', ')')} title="Image">
                        <Image className="h-4 w-4" />
                    </Button>
                </div>

                {/* Editor / Preview */}
                <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    <Textarea
                        id="content-editor"
                        value={formData.fullText || ''}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Write your article content in Markdown..."
                        className="font-mono min-h-[400px] rounded-t-none"
                    />
                    {showPreview && (
                        <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-card overflow-auto max-h-[500px]">
                            <ReactMarkdown>{formData.fullText || '*Preview will appear here...*'}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                    id="keywords"
                    value={(formData.keywords || []).join(', ')}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                    }))}
                    placeholder="keyword1, keyword2, keyword3"
                />
                <div className="flex flex-wrap gap-1">
                    {(formData.keywords || []).map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                    ))}
                </div>
            </div>

            {/* AI Generated Badge */}
            {formData.aiGenerated && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">🤖 AI Generated</Badge>
                    {formData.sourceKeywords && formData.sourceKeywords.length > 0 && (
                        <span>from keywords: {formData.sourceKeywords.join(', ')}</span>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave('draft')}>
                        Save as Draft
                    </Button>
                    <Button onClick={() => handleSave('published')}>
                        <Save className="h-4 w-4 mr-2" />
                        Publish
                    </Button>
                </div>
            </div>
        </div>
    );
}
