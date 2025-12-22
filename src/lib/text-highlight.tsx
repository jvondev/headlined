import React from 'react';
import { cn } from "@/lib/utils";

// Rotating pastel highlight colors (subtle, not distracting)
export const HIGHLIGHT_COLORS = [
    "bg-blue-500/10 text-blue-300/90 border-blue-400/20",
    "bg-emerald-500/10 text-emerald-300/90 border-emerald-400/20",
    "bg-purple-500/10 text-purple-300/90 border-purple-400/20",
    "bg-rose-500/10 text-rose-300/90 border-rose-400/20",
];

// Highlight stopwords (common words to skip)
export const HIGHLIGHT_STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
    'your', 'my', 'his', 'her', 'our', 'their', 'what', 'which', 'who', 'whom', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'can', 'just', 'also', 'now', 'here', 'there', 'then', 'new', 'said', 'says', 'like',
    'one', 'two', 'first', 'many', 'year', 'years', 'time', 'way', 'day', 'use', 'make',
    'get', 'go', 'see', 'come', 'take', 'know', 'think', 'want', 'need', 'look', 'work',
]);

// Filter keywords to remove stopwords and short words
export function filterKeywords(keywords: string[]): string[] {
    return keywords.filter(k =>
        k.length >= 4 && !HIGHLIGHT_STOPWORDS.has(k.toLowerCase())
    );
}

// Create consistent color mapping: same keyword = same color
export function createKeywordColorMap(keywords: string[]): Map<string, string> {
    const colorMap = new Map<string, string>();
    keywords.forEach((keyword, index) => {
        colorMap.set(keyword.toLowerCase(), HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]);
    });
    return colorMap;
}

// Highlight keywords with consistent colors per keyword
export function highlightKeywords(text: string, keywords: string[]): React.ReactNode[] {
    const filteredKeywords = filterKeywords(keywords);
    if (!filteredKeywords || filteredKeywords.length === 0) return [text];

    const colorMap = createKeywordColorMap(filteredKeywords);

    // Escape regex characters
    const escapedKeywords = filteredKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Create regex with word boundaries
    const pattern = new RegExp(
        `\\b(${escapedKeywords.join('|')})\\b`,
        'gi'
    );

    const parts = text.split(pattern);

    return parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const color = colorMap.get(lowerPart);
        if (color) {
            return (
                <mark
                    key={index}
                    className={cn("px-1 py-0.5 rounded border-b", color)}
                >
                    {part}
                </mark>
            );
        }
        return <span key={index}>{part}</span>;
    });
}
