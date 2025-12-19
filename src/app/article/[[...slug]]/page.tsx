
import ArticleClientPage from './client';
import ArticleListingPage from './listing';
import InternalArticlePage from './internal';
import { fetchArticleByDateAndSlug } from '@/lib/article-utils';
import { getArticleCanonicalPath } from '@/lib/category-utils';
import { getArticleBySlug, validateCategoryPath } from '@/lib/article-service';
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

    // Case 1: /article (root) -> Show article listing page
    if (slugParts.length === 0) {
        return <ArticleListingPage />;
    }

    // Case 2: /article/YYYY-MM-DD/slug (Old Pattern) -> 301 Redirect to News Pattern
    if (slugParts.length >= 2) {
        const potentialDate = slugParts[0];
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (dateRegex.test(potentialDate)) {
            const articleSlug = slugParts.slice(1).join('/');
            const article = await fetchArticleByDateAndSlug(potentialDate, articleSlug);

            if (article) {
                const newPath = getArticleCanonicalPath(article);
                if (newPath !== `/article/${potentialDate}/${articleSlug}`) {
                    redirect(newPath);
                }
            }
        }
    }

    // Case 3: /article/[category]/[subcategory]/[slug] - Internal article
    if (slugParts.length === 3) {
        const [category, subcategory, articleSlug] = slugParts;

        // Check if this is a valid internal article
        if (validateCategoryPath(category, subcategory)) {
            const internalArticle = getArticleBySlug(category, subcategory, articleSlug);
            if (internalArticle && internalArticle.status === 'published') {
                return <InternalArticlePage article={internalArticle} />;
            }
        }
    }

    // Case 4: Fallback - render the Client Page for legacy/external articles
    return <ArticleClientPage />;
}

