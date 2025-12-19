import { NextRequest, NextResponse } from 'next/server';
import {
    getAllArticles,
    saveArticle,
    deleteArticle
} from '@/lib/article-service';
import { InternalArticle } from '@/types/article';

// Only allow in development
function checkDevMode() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return null;
}

// GET - List all articles
export async function GET() {
    const devCheck = checkDevMode();
    if (devCheck) return devCheck;

    try {
        const articles = getAllArticles();
        return NextResponse.json({ articles });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST - Create or update an article
export async function POST(request: NextRequest) {
    const devCheck = checkDevMode();
    if (devCheck) return devCheck;

    try {
        const article: InternalArticle = await request.json();
        const saved = saveArticle(article);
        return NextResponse.json({ article: saved });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE - Delete an article by ID
export async function DELETE(request: NextRequest) {
    const devCheck = checkDevMode();
    if (devCheck) return devCheck;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const deleted = deleteArticle(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
