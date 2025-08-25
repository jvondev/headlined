
'use client';

import Image from "next/image";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Insight } from "@/types";

export function ArticleContent({ insight }: { insight: Insight }) {
  const isRss = insight.slug.startsWith('rss-');

  // Splitting bylines that might contain newlines
  const bylines = isRss && insight.author ? insight.author.split('\n') : [];

  return (
    <article className="prose prose-lg dark:prose-invert mx-auto max-w-3xl">
      <div className="text-center mb-12">
        <div className="not-prose flex flex-wrap justify-center gap-2 mb-4">
          {insight.category.map((cat) => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-4 !mb-2">{insight.title}</h1>
        <p className="text-xl text-muted-foreground !mt-2">{insight.summary}</p>
        
        {isRss && bylines.length > 0 && (
          <div className="mt-6 text-base not-prose text-muted-foreground">
            {bylines.map((line, index) => (
              <p key={index} className="m-0 font-medium">{line}</p>
            ))}
          </div>
        )}
      </div>

      {insight.thumbnailUrl && (
        <div className="relative mb-12 w-full aspect-video rounded-lg overflow-hidden not-prose">
            <Image
                src={insight.thumbnailUrl}
                alt={insight.headline}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
            />
        </div>
      )}

      <MarkdownRenderer className="prose-p:text-lg prose-p:leading-relaxed prose-headings:font-headline">
        {insight.blogContent}
      </MarkdownRenderer>
    </article>
  );
}

export function ArticleContentLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
        <article className="prose prose-lg dark:prose-invert mx-auto max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-7 w-1/2 mx-auto" />
          </div>
          <Skeleton className="mb-12 w-full aspect-video rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[85%]" />
            <br />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[90%]" />
            <Skeleton className="h-5 w-[80%]" />
          </div>
        </article>
    </div>
  );
}
