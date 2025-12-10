import ArticleClientPage from '@/app/article/[[...slug]]/client';

export async function generateStaticParams() {
    return [{ slug: [] }];
}

export default function NewsInterceptedArticlePage() {
    return <ArticleClientPage />;
}
