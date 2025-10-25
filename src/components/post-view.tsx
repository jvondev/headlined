"use client";

import type { Post, Summary } from "@/types";
import { useEffect, type FC, useContext, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Card } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { CollapsibleDescription } from "./collapsible-description";
import { SummaryView } from "./summary-view";

import { cn, splitIntoSubsentences } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostViewProps {
  post: Post;
  isActive: boolean;
}

export const PostView: FC<PostViewProps> = ({ post, isActive }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [showSummary, setShowSummary] = useState(false);
  
  const summaries = useMemo(() => {
    if (post.summaries && post.summaries.length > 0) {
      return post.summaries;
    }

    if (post.description) {
        let sentences = post.description.match(/[^.!?]+[.!?]+/g) || [];
        return sentences.map((sentence, index) => ({
            type: 'article-summary',
            title: `Summary (${index + 1}/${sentences.length})`,
            icon: 'BookText',
            content: {
                snippet: sentence,
                originalArticleUrl: post.link,
                slug: post.slug,
            },
        }));
    }

    return [];
  }, [post.description, post.summaries, post.link, post.slug]);

  const handleCardClick = () => {
    if (post.slug === "home") {
      // For homepage post, navigate to the link directly
      router.push(post.link);
    } else {
      setShowSummary(!showSummary);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background" onClick={handleCardClick}>
        {showSummary && summaries.length > 0 ? (
            <SummaryView summary={summaries[0]} />
        ) : (
            <div className="relative flex-[0_0_100%] bg-background text-foreground" role="group" aria-roledescription="slide" aria-label="Main Post">
                {post.thumbnail_url && (
                    <>
                        <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className={cn("absolute inset-0", theme === 'light' ? 'bg-white/55' : 'bg-black/60')} />
                    </>
                )}
                <div className={cn(
                    "relative flex h-full flex-col justify-center items-center p-8 md:p-12 text-left z-10",
                    post.thumbnail_url && (theme === 'light' ? 'text-black' : 'text-white')
                )}>
                    <div className="max-w-3xl">
                        <h1 className="font-headline text-3xl md:text-5xl font-bold mt-2">{post.title}</h1>
                        <CollapsibleDescription description={post.description} className={cn(
                            "mt-4 text-lg md:text-xl max-w-xl",
                            post.thumbnail_url ? (theme === 'light' ? 'text-black/80' : 'text-white/80') : "text-muted-foreground"
                        )} />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};