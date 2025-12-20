"use client";

import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

interface ArticleCTAProps {
    category: string;
    subcategory: string;
}

export function ArticleCTA({ category, subcategory }: ArticleCTAProps) {
    return (
        <div className="my-10 p-6 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="p-3 rounded-full bg-zinc-100 text-primary">
                    <Newspaper className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">
                        Get the latest {subcategory} news
                    </h3>
                    <p className="text-sm text-zinc-500">
                        Stay updated with real-time coverage and breaking headlines.
                    </p>
                </div>
                <Link
                    href={`/news/${category}/${subcategory}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                    Read Today's News
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
