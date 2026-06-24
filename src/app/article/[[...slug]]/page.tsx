import ArticlePageRouter from './article-router';

// Generate a single static entry point for the catch-all route
export async function generateStaticParams() {
    return [{ slug: [] }];
}

export default function ArticlePage() {
    return <ArticlePageRouter />;
}

