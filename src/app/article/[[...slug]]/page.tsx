
import ArticleClientPage from './client';
import { fetchArticleByDateAndSlug } from '@/lib/article-utils';
import { getArticleCanonicalPath } from '@/lib/category-utils';
import { redirect } from 'next/navigation';

// Generate a single static entry point for the catch-all route
export async function generateStaticParams() {
    return [{ slug: [] }];
}

interface PageProps {
    params: {
        slug?: string[];
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const slugParts = slug || [];

    // Case 1: /article (root) -> Redirect to today
    if (slugParts.length === 0) {
        redirect('/today');
    }

    // Case 2: /article/YYYY-MM-DD/slug (Old Pattern) -> Redirect to New News Pattern
    // Check if first part looks like a date and second part exists
    if (slugParts.length >= 2) {
        const potentialDate = slugParts[0];
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (dateRegex.test(potentialDate)) {
            const articleSlug = slugParts.slice(1).join('/'); // In case slug has slashes, though unlikely
            const article = await fetchArticleByDateAndSlug(potentialDate, articleSlug);

            if (article) {
                const newPath = getArticleCanonicalPath(article);
                if (newPath !== `/article/${potentialDate}/${articleSlug}`) {
                    redirect(newPath);
                }
            }
        }
    }

    // Case 3: Evergreen Content / Fallback
    // e.g. /article/some-evergreen-slug or /article/category/slug (if we use that for pages)
    // For now, render the Client Page which will attempt to load it or show 404
    return <ArticleClientPage />;
}
