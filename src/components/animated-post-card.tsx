'use client';

import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import type { Post } from "@/types";
import { HomepagePostSlide } from "@/components/homepage-post-slide";
import { PostView } from "@/components/post-view";
import { cn } from "@/lib/utils";

interface AnimatedPostCardProps {
  post: Post;
  index: number;
  activeSlideIndex: number;
  emblaApi: UseEmblaCarouselType[1] | undefined;
  topicName?: string;
  searchQuery?: string;
  totalPosts: number;
}

const useAnimationProgress = (emblaApi: UseEmblaCarouselType[1] | undefined, index: number) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const updateProgress = () => {
      const slideProgress = emblaApi.scrollProgress() * (emblaApi.slideNodes().length - 1) - index;
      setProgress(slideProgress);
    };

    emblaApi.on('scroll', updateProgress);
    emblaApi.on('reInit', updateProgress);
    updateProgress(); // Initial update

    return () => {
      emblaApi.off('scroll', updateProgress);
      emblaApi.off('reInit', updateProgress);
    };
  }, [emblaApi, index]);

  const scaleX = 1 - Math.min(1, Math.abs(progress * 0.2)); // Scale width down by 20% at edges
  const scaleY = 1; // Keep height constant for vertical swipe
  const y = progress * 50; // Move up/down by 50px at edges
  const rotateX = progress * 10; // Tilt by 10 degrees at edges

  return { y, scaleX, scaleY, rotateX };
};

export const AnimatedPostCard: FC<AnimatedPostCardProps> = ({
  post,
  index,
  activeSlideIndex,
  emblaApi,
  topicName,
  searchQuery,
  totalPosts,
}) => {
  const { y, scaleX, scaleY, rotateX } = useAnimationProgress(emblaApi, index);

  return (
    <motion.div
      className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center p-4 md:p-8 [perspective:1000px]"
      key={`${post.slug}-${index}-${topicName || searchQuery}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`Post ${index + 1} of ${totalPosts}`}
      style={{ y, scaleX, scaleY, rotateX }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {post.slug === "home" ? (
        <HomepagePostSlide />
      ) : (
        <div className="w-full max-w-sm md:max-w-xl lg:max-w-2xl h-full max-h-[80vh] md:max-h-[85vh]">
          <PostView
            post={post}
            isActive={index === activeSlideIndex}
            emblaApi={emblaApi}
          />
        </div>
      )}
    </motion.div>
  );
};
