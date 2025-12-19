'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { InternalArticle, AIGenerationOutput } from '@/types/article';
import { CATEGORIES } from '@scraper/categories';

interface AIGeneratorProps {
    onGenerated: (article: Partial<InternalArticle>) => void;
    onCancel: () => void;
}

export default function AIGenerator({ onGenerated, onCancel }: AIGeneratorProps) {
    const [keyword, setKeyword] = useState('');
    const [relatedKeywords, setRelatedKeywords] = useState('');
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AIGenerationOutput | null>(null);

    // Get subcategory options based on selected category
    const subcategoryOptions = category
        ? CATEGORIES.find(c => c.id === category)?.items.map(i => ({ slug: i.slug, title: i.title })) || []
        : [];

    const handleGenerate = async () => {
        if (!keyword.trim() || !category || !subcategory) {
            setError('Please fill in keyword, category, and subcategory');
            return;
        }

        setGenerating(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/admin/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: keyword.trim(),
                    relatedKeywords: relatedKeywords
                        .split('\n')
                        .map(k => k.trim())
                        .filter(Boolean),
                    category,
                    subcategory,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate article');
            }

            const data = await res.json();
            setResult(data);
        } catch (e: any) {
            setError(e.message || 'Failed to generate article');
        } finally {
            setGenerating(false);
        }
    };

    const handleUseResult = () => {
        if (!result) return;

        const article: Partial<InternalArticle> = {
            title: result.title,
            slug: result.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim(),
            description: result.description,
            seoTitle: result.seoTitle,
            seoDescription: result.seoDescription,
            fullText: result.fullText,
            keywords: result.keywords,
            readingTime: result.readingTime,
            category,
            subcategory,
            status: 'draft',
            aiGenerated: true,
            sourceKeywords: [keyword, ...relatedKeywords.split('\n').filter(Boolean)],
            thumbnail_url: null,
            link: '',
            summaries: [],
            topic: category,
        };

        onGenerated(article);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Article Generator
                    </CardTitle>
                    <CardDescription>
                        Generate a reference-grade article from keywords using Gemini AI
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Primary Keyword */}
                    <div className="space-y-2">
                        <Label htmlFor="keyword">Primary Keyword</Label>
                        <Input
                            id="keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g., best rss readers 2025"
                        />
                    </div>

                    {/* Related Keywords */}
                    <div className="space-y-2">
                        <Label htmlFor="related">Related Keywords (one per line)</Label>
                        <Textarea
                            id="related"
                            value={relatedKeywords}
                            onChange={(e) => setRelatedKeywords(e.target.value)}
                            placeholder="rss reader apps&#10;news aggregator&#10;feed reader comparison"
                            rows={4}
                        />
                    </div>

                    {/* Category & Subcategory */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={(v) => {
                                setCategory(v);
                                setSubcategory('');
                            }}>
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
                                value={subcategory}
                                onValueChange={setSubcategory}
                                disabled={!category}
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

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={generating || !keyword.trim() || !category || !subcategory}
                        className="w-full"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating with AI...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Article
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Result Preview */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            Generated Article
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">Title</div>
                                <div className="font-medium">{result.title}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Reading Time</div>
                                <div className="font-medium">{result.readingTime} min</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">User Intent</div>
                                <div className="font-medium">{result.userIntent}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Competitor Gap</div>
                                <div className="font-medium">{result.competitorGap}</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="text-sm text-muted-foreground">Meta Description</div>
                            <div className="text-sm">{result.description}</div>
                        </div>

                        {/* Keywords */}
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Keywords</div>
                            <div className="flex flex-wrap gap-1">
                                {result.keywords.map((kw, i) => (
                                    <Badge key={i} variant="secondary">{kw}</Badge>
                                ))}
                            </div>
                        </div>

                        {/* Content Preview */}
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Content Preview</div>
                            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[400px] overflow-auto p-4 border rounded-lg bg-muted/30">
                                <ReactMarkdown>{result.fullText}</ReactMarkdown>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setResult(null)}>
                                Regenerate
                            </Button>
                            <Button onClick={handleUseResult}>
                                Edit & Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cancel */}
            <div className="flex justify-center">
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
