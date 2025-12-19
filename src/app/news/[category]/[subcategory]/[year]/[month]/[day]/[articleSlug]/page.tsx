'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ArticleClientPage from '@/app/article/[[...slug]]/client';
import { fetchArticleByDateAndSlug } from '@/lib/article-utils';
import { getArticleCategory } from '@/lib/category-utils';
import { Loader2 } from 'lucide-react';

export default function DeepArticlePage() {
    const params = useParams();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    const year = params.year as string;
    const month = params.month as string;
    const day = params.day as string;
    const slug = params.articleSlug as string;
    const date = `${year}-${month}-${day}`;

    // Validate canonical path on mount
    useEffect(() => {
        async function validatePath() {
            try {
                const post = await fetchArticleByDateAndSlug(date, slug);
                if (post) {
                    const { category, subcategory } = getArticleCategory(post);
                    const currentCategory = params.category as string;
                    const currentSubcategory = params.subcategory as string;

                    if (category !== currentCategory || subcategory !== currentSubcategory) {
                        // Redirect to correct canonical path
                        router.replace(`/news/${category}/${subcategory}/${year}/${month}/${day}/${slug}`);
                        return;
                    }
                }
            } catch (e) {
                // Ignore errors here
            }

            setIsChecking(false);
        }

        validatePath();
    }, [year, month, day, slug, params.category, params.subcategory, router]);

    if (isChecking) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            </div>
        );
    }

    return (
        <ArticleClientPage
            overrideDate={date}
            overrideSlug={slug}
        />
    );
}
