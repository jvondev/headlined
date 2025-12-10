
import ArticleClientPage from './client';

// Generate a single static entry point for the catch-all route
// Cloudflare Pages will use this index.html (or similar) to serve all /article/* requests via _redirects
export async function generateStaticParams() {
    return [{ slug: [] }];
}

export default function ArticlePage() {
    return <ArticleClientPage />;
}
