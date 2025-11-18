"use client";

import type { Post } from "@/types";
import React, { useEffect, type FC, useMemo, useState, useRef } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useTheme } from "next-themes";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { SummaryView } from "./summary-view";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, ArrowDown, ArrowRight, Info, ScanText } from "lucide-react";

interface PostViewProps {
  post: Post;
  isActive: boolean;
  emblaApi?: UseEmblaCarouselType[1];
}

const PostViewComponent: FC<PostViewProps> = ({ post, isActive, emblaApi }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  // Reset flip state when the slide changes
  useEffect(() => {
    if (!isActive) {
      const timer = setTimeout(() => setIsFlipped(false), 300); // Delay to allow flip-out animation
      return () => clearTimeout(timer);
    }
  }, [isActive]);


  useEffect(() => {
    if (!emblaApi) return;

    const handleScroll = () => {
      if (!imageContainerRef.current) return;
      const scrollProgress = emblaApi.scrollProgress();
      // ... (parallax logic)
    };
    emblaApi.on("scroll", handleScroll);
    return () => {
      emblaApi.off("scroll", handleScroll);
    };
  }, [emblaApi]);

  const summaries = useMemo(() => {
    if (post.summaries && post.summaries.length > 0) return post.summaries;
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
      }) as const);
    }
    return [];
  }, [post.description, post.summaries, post.link, post.slug]);

  const handleCardClick = () => {
    if (summaries.length > 0) {
      setIsFlipped(!isFlipped);
    } else if (post.slug === "home") {
      router.push(post.link);
    } else {
        window.open(post.link, "_blank");
    }
  };

  const handleReadMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(post.link, "_blank");
  };

  return (
    <div className="w-full h-full [perspective:1000px]">
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        )}
      >
        {/* Front of the card */}
        <div
          className="absolute w-full h-full [backface-visibility:hidden]"
          onClick={handleCardClick}
        >
          <Card className="h-full w-full flex flex-col overflow-hidden relative shadow-lg border border-primary/30">
            <div
              className="relative w-full h-2/5 overflow-hidden flex-shrink-0 rounded-lg" // Reduced height
              ref={imageContainerRef}
            >
              {post.thumbnail_url && (
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="absolute top-1/2 left-1/2 w-full h-full object-cover will-change-transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-in-out"
                  loading="lazy"
                  style={{ transform: `translate(-50%, -50%) scale(1.2) translateY(${offsetY}px)` }}
                />
              )}
            </div>
            <div className={cn(
              "flex flex-col justify-center p-6 md:p-8 flex-grow",
              "bg-card text-card-foreground"
            )}>
                                          <div className="flex flex-col items-center h-full">
                                            <h1 className="font-headline text-2xl sm:text-3xl font-bold leading-tight mt-auto mb-4">                  {post.title}
                </h1>
                {summaries.length > 0 ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="mt-auto mb-4 rounded-full"
                    onClick={handleCardClick}
                  >
                    <ScanText className="h-5 w-5" />
                    <span className="sr-only">View Summary</span>
                  </Button>
                ) : (
                  <div className="h-10 w-10 mt-auto mb-4 rounded-full invisible"></div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Back of the card */}
        <div
          className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
          onClick={handleCardClick}
        >
          <Card className="h-full w-full flex flex-col overflow-hidden relative bg-card text-card-foreground shadow-lg border border-primary/30">
            {summaries.length > 0 ? (
              <div className="relative h-full w-full">
                <SummaryView summary={summaries[0]} />
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full">
                    <ScanText className="h-5 w-5" />
                    <span className="sr-only">Flip back</span>
                </Button>
              </div>
            ) : (
                <div className="flex items-center justify-center h-full">No summary available.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export const PostView = React.memo(PostViewComponent);
