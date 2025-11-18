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
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset flip state when the slide changes
  useEffect(() => {
    if (!isActive) {
      const timer = setTimeout(() => setIsFlipped(false), 300); // Delay to allow flip-out animation
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    if (post.thumbnail_url && imageRef.current) {
      const img = imageRef.current;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, img.width, img.height);
          const imageData = context.getImageData(0, 0, img.width, img.height).data;
          // Simple average color calculation
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
          }
          const count = imageData.length / 4;
          r = Math.floor(r / count);
          g = Math.floor(g / count);
b = Math.floor(b / count);
          setDominantColor(`rgba(${r}, ${g}, ${b}, 0.5)`);
        }
      };
    }
  }, [post.thumbnail_url]);


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
          <div
            className="h-full w-full rounded-[48px] overflow-hidden p-2"
          >
            <div className="relative h-full w-full rounded-[40px] overflow-hidden glass-card shadow-2xl"
              style={{
                boxShadow: dominantColor ? `0 20px 50px -10px ${dominantColor}` : '0 20px 50px -10px rgba(0,0,0,0.5)',
              }}
            >
              {post.thumbnail_url && (
                <img
                  ref={imageRef}
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute top-0 left-0 w-full h-full flex flex-col p-8"
                style={{
                  background: dominantColor ? `linear-gradient(to bottom, ${dominantColor} 0%, transparent 100%)` : 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)'
                }}
              >
                <h1 className="font-headline text-3xl font-bold text-white">
                  {post.title}
                </h1>
              </div>
            </div>
          </div>
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