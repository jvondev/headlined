import { NextRequest, NextResponse } from 'next/server';
import { generateArticleContent } from '@/lib/ai-service';
import { AIGenerationInput } from '@/types/article';

// Only allow in development
function checkDevMode() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return null;
}

// POST - Generate article content using AI
export async function POST(request: NextRequest) {
    const devCheck = checkDevMode();
    if (devCheck) return devCheck;

    try {
        const input: AIGenerationInput = await request.json();

        if (!input.keyword || !input.category || !input.subcategory) {
            return NextResponse.json(
                { error: 'keyword, category, and subcategory are required' },
                { status: 400 }
            );
        }

        const result = await generateArticleContent(input);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error('AI generation error:', e);
        return NextResponse.json(
            { error: e.message || 'Failed to generate article' },
            { status: 500 }
        );
    }
}
