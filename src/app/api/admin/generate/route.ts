import { NextRequest, NextResponse } from 'next/server';
import { generateEnhancedArticle } from '@/lib/ai-service';

// Only allow in development
function checkDevMode() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return null;
}

// POST - Generate article content using enhanced AI with grounding
export async function POST(request: NextRequest) {
    const devCheck = checkDevMode();
    if (devCheck) return devCheck;

    try {
        const { keyword, relatedKeywords } = await request.json();

        if (!keyword) {
            return NextResponse.json(
                { error: 'keyword is required' },
                { status: 400 }
            );
        }

        // Single request: grounding + generation + auto-categorization
        const result = await generateEnhancedArticle(keyword, relatedKeywords || []);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error('AI generation error:', e);
        return NextResponse.json(
            { error: e.message || 'Failed to generate article' },
            { status: 500 }
        );
    }
}
