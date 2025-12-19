import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/article-service';

// GET - List all published articles (public endpoint)
export async function GET() {
    try {
        const articles = getPublishedArticles();
        return NextResponse.json({ articles });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
