'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Check, AlertCircle, Zap, Globe, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { InternalArticle, AIGenerationOutput } from '@/types/article';

interface AIGeneratorProps {
    onGenerated: (article: Partial<InternalArticle>) => void;
    onCancel: () => void;
}

export default function AIGenerator({ onGenerated, onCancel }: AIGeneratorProps) {
    const [keyword, setKeyword] = useState('');
    const [relatedKeywords, setRelatedKeywords] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AIGenerationOutput | null>(null);
    const [status, setStatus] = useState('');

    const handleGenerate = async () => {
        if (!keyword.trim()) {
            setError('Please enter a keyword');
            return;
        }

        setGenerating(true);
        setError(null);
        setResult(null);
        setStatus('🔍 Searching USA SERP...');

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
                    // No category/subcategory - AI will auto-suggest!
                }),
            });

            setStatus('🤖 Generating E-E-A-T content with Gemini...');

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate article');
            }

            const data = await res.json();
            setResult(data);
            setStatus('');
        } catch (e: any) {
            setError(e.message || 'Failed to generate article');
            setStatus('');
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
            // Use AI-suggested category and subcategory
            category: result.suggestedCategory,
            subcategory: result.suggestedSubcategory,
            status: 'draft',
            aiGenerated: true,
            sourceKeywords: [keyword, ...relatedKeywords.split('\n').filter(Boolean)],
            // E-E-A-T fields
            sources: result.sources,
            factsCited: result.factsCited,
            lastVerified: result.lastVerified,
            thumbnail_url: null,
            link: '',
            summaries: [],
            topic: result.suggestedCategory,
        };

        onGenerated(article);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Article Generator V2
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            USA SERP Data
                        </span>
                        <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Auto-Category
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            E-E-A-T Optimized
                        </span>
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
                            className="text-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                            Just enter a keyword - AI will auto-detect category and gather real-time data
                        </p>
                    </div>

                    {/* Related Keywords */}
                    <div className="space-y-2">
                        <Label htmlFor="related">Related Keywords (optional, one per line)</Label>
                        <Textarea
                            id="related"
                            value={relatedKeywords}
                            onChange={(e) => setRelatedKeywords(e.target.value)}
                            placeholder="rss reader apps&#10;news aggregator&#10;feed reader comparison"
                            rows={3}
                        />
                    </div>

                    {/* Status */}
                    {status && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {status}
                        </div>
                    )}

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
                        disabled={generating || !keyword.trim()}
                        className="w-full"
                        size="lg"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating (SERP + AI + E-E-A-T)...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Article (1-Click)
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">Title</div>
                                <div className="font-medium">{result.title}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Reading Time</div>
                                <div className="font-medium">{result.readingTime} min</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Category</div>
                                <Badge variant="outline">{result.suggestedCategory}</Badge>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Subcategory</div>
                                <Badge variant="outline">{result.suggestedSubcategory}</Badge>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="text-sm text-muted-foreground">Meta Description</div>
                            <div className="text-sm">{result.description}</div>
                        </div>

                        {/* Strategic Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div>
                                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    User Intent
                                </div>
                                <div className="text-sm italic text-muted-foreground">
                                    {result.userIntent || 'Analysing...'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Competitor Gap
                                </div>
                                <div className="text-sm italic text-muted-foreground">
                                    {result.competitorGap || 'Finding gaps...'}
                                </div>
                            </div>
                        </div>

                        {/* Sources */}
                        {result.sources && result.sources.length > 0 && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-2">Sources ({result.sources.length})</div>
                                <div className="flex flex-wrap gap-2">
                                    {result.sources.slice(0, 5).map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                        >
                                            {source.title.slice(0, 30)}...
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Facts Cited */}
                        {result.factsCited && result.factsCited.length > 0 && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-2">Facts Cited ({result.factsCited.length})</div>
                                <ul className="text-sm space-y-1">
                                    {result.factsCited.slice(0, 3).map((fact, i) => (
                                        <li key={i} className="text-muted-foreground">• {fact}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

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

                        {/* Last Verified */}
                        {result.lastVerified && (
                            <div className="text-xs text-muted-foreground">
                                Last verified: {result.lastVerified}
                            </div>
                        )}

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
