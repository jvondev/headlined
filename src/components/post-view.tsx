"use client";

import type { Post, Summary } from "@/types";
import { useEffect, type FC, useContext, useMemo, useState, useRef } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useTheme } from "next-themes";
import { Card } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";

import { SummaryView } from "./summary-view";

import { cn, splitIntoSubsentences } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostViewProps {
  post: Post;
  isActive: boolean;
  emblaApi?: UseEmblaCarouselType[1];
}

export const PostView: FC<PostViewProps> = ({ post, isActive, emblaApi }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [showSummary, setShowSummary] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (!emblaApi || !imageContainerRef.current) return;

                const handleScroll = () => {
                  if (!emblaApi || !imageContainerRef.current) return;
        
                  const scrollProgress = emblaApi.scrollProgress();
                  const slideIndex = emblaApi.selectedScrollSnap();
                  const slidesInView = emblaApi.slidesInView();
        
                  if (!slidesInView.includes(slideIndex)) {
                    setOffsetY(0);
                    return;
                  }
        
                  const slideViewportCenter = emblaApi.scrollSnapList()[slideIndex];
                  const currentScroll = emblaApi.scrollProgress();
        
                  // Calculate the difference between the current scroll and the slide's center
                  const scrollDifference = currentScroll - slideViewportCenter;
        
                  const parallaxSpeed = 80; // Adjust this value for more or less parallax
                  const newOffsetY = scrollDifference * parallaxSpeed;
                  setOffsetY(newOffsetY);
                };    emblaApi.on("scroll", handleScroll);
    emblaApi.on("reInit", handleScroll);

    return () => {
      emblaApi.off("scroll", handleScroll);
      emblaApi.off("reInit", handleScroll);
    };
  }, [emblaApi]);
  
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
    <div className="h-full w-full relative bg-background" onClick={handleCardClick}>
        {showSummary && summaries.length > 0 ? (
            <SummaryView summary={summaries[0]} />
        ) : (
            <>
                {post.thumbnail_url && (
                    <>
                        <div
                            className="absolute inset-0 w-full h-full overflow-hidden"
                            ref={imageContainerRef}
                        >
                            <img
                                src={post.thumbnail_url}
                                alt={post.title}
                                className="absolute top-1/2 left-1/2 w-full h-full object-cover will-change-transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-in-out"
                                loading="lazy"
                                style={{ transform: `translate(-50%, -50%) scale(1.2) translateY(${offsetY}px)` }}
                            />
                        </div>
                        <div className={cn("absolute inset-0", theme === 'light' ? 'bg-white/55' : 'bg-black/60')} />
                    </>
                )}
                <div className={cn(
                    "absolute inset-0 flex flex-col justify-center items-center p-8 md:p-12 text-left z-10",
                    post.thumbnail_url && (theme === 'light' ? 'text-black' : 'text-white')
                )}>
                    <div className="max-w-3xl">
                        <h1 className="font-headline text-3xl md:text-5xl font-bold mt-2">{post.title}</h1>

                    </div>
                </div>
            </>
        )}
    </div>
  );
};