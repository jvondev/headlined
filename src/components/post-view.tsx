"use client";

import type { Post, Summary } from "@/types";
import { useEffect, type FC, useContext, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { MoveRight, ChevronRight, Rss, ArrowDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Card } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { CollapsibleDescription } from "./collapsible-description";
import { SummaryView } from "./summary-view";

import { cn, splitIntoSubsentences } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { CarouselContext } from "@/context/carousel-context";

interface PostViewProps {
  post: Post;
  isActive: boolean;
}

export const PostView: FC<PostViewProps> = ({ post, isActive }) => {
  const { setHorizontalEmblaApi, triggerParentScrollDown } = useContext(CarouselContext);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
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

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    axis: "x", 
    skipSnaps: false, 
    slidesToScroll: 1,
    startIndex: 0,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'x',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);
  
  useEffect(() => {
    if (emblaApi && !isActive) {
      emblaApi.scrollTo(0, true); 
    }
  }, [isActive, emblaApi]);

  useEffect(() => {
    if (!emblaApi || !setHorizontalEmblaApi) return;
    
    // Register the API with the parent carousel
    const unregister = setHorizontalEmblaApi(post.slug, emblaApi);

    const handleSettle = () => {
        // The trigger is now the slide *after* the last summary
        if (emblaApi.selectedScrollSnap() === summaries.length + 1) {
            if (post.slug === "home") {
                if (triggerParentScrollDown) {
                    triggerParentScrollDown();
                }
                return; // Do not navigate for homepage post
            }
            router.push(post.link);
        }
    }
    
    emblaApi.on('settle', handleSettle);
    
    return () => {
        if(emblaApi) {
            emblaApi.off('settle', handleSettle);
        }
        unregister();
    }
  }, [emblaApi, setHorizontalEmblaApi, post, isActive, router, summaries.length]);
  

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="overflow-hidden h-full w-full" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Summaries Carousel">
            <div className="flex h-full">
                {/* Main Post Card */}
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

                {/* Summary Cards */}
                {summaries.map((summary, index) => {
                    return (
                        <div key={index} className="relative flex-[0_0_100%] summary-card-wrapper" role="group" aria-roledescription="slide" aria-label={`Summary ${index + 1}: ${summary.title}`}>
                            <SummaryView summary={summary} />
                        </div>
                    )
                })}

                 {/* Full Story trigger card */}
                <div className="relative flex-[0_0_25%] bg-background" role="group" aria-roledescription="slide" aria-label="Full Story Trigger">
                   <div className="flex h-full flex-col items-center justify-center text-center p-8">
                        {post.slug === "home" ? (
                            <ArrowDown className="size-8 text-muted-foreground/50" />
                        ) : (
                            <MoveRight className="size-8 text-muted-foreground/50" />
                        )}
                        <p className="mt-4 text-lg text-muted-foreground">{post.slug === "home" ? "Read More" : "Opening full story..."}</p>
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};