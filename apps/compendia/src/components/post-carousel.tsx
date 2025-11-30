"use client";

import { useEffect, useState, useCallback } from "react";
import { CompendiaPost } from "@/types";
import { getFeedPosts } from "@/lib/client-openalex";
import { PostView } from "./post-view";
import { Loader2 } from "lucide-react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { checkLicenseStatus } from "@/lib/license-manager";
import { SupportButton } from "@/components/support-button";
import { PremiumModal } from "@/components/support/premium-modal";

interface PostCarouselProps {
  view?: string;
}

export function PostCarousel({ view }: PostCarouselProps) {
  const [posts, setPosts] = useState<CompendiaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: 'y',
    startIndex: 0,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'y',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);

  useEffect(() => {
    checkLicenseStatus().then(setIsPremium);
  }, []);

  useEffect(() => {
    async function loadPosts() {
      if (!hasMore && page > 1) return;

      setLoading(true);

      const newPosts = await getFeedPosts(view, page);

      if (newPosts.length < 10) {
        setHasMore(false);
      }

      setPosts((prev) => {
        // If view changed, treat as a full reset by checking the page number
        if (page === 1) {
          return newPosts; // Complete replacement for first page/new view
        }
        // Otherwise, append for pagination
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });
      setLoading(false);
    }
    loadPosts();
  }, [page, view, hasMore]);

  // When view changes, reset pagination
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setActiveSlideIndex(0);
    if (emblaApi) emblaApi.scrollTo(0, true);
  }, [view, emblaApi]);

  // Keyboard Navigation
  const scrollUp = useCallback(() => {
    if (emblaApi && emblaApi.canScrollPrev()) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollDown = useCallback(() => {
    if (emblaApi && emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          scrollDown();
          break;
        case "ArrowUp":
          scrollUp();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollDown, scrollUp]);

  // Embla scroll listener for animations and pagination
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = (api: UseEmblaCarouselType[1]) => {
      const newIndex = api!.selectedScrollSnap();
      setActiveSlideIndex(newIndex);

      // Load more when near end
      if (hasMore && !loading && newIndex >= posts.length - 3) {
        setPage(prev => prev + 1);
      }
    };

    const applyTransforms = () => {
      const scrollProgress = emblaApi.scrollProgress();
      const slides = emblaApi.slideNodes();
      const snapList = emblaApi.scrollSnapList();

      slides.forEach((slide, index) => {
        const snap = snapList[index];
        const diffToTarget = snap - scrollProgress;

        if (Math.abs(diffToTarget) > 2) {
          slide.style.opacity = '0';
          slide.style.pointerEvents = 'none';
          return;
        }

        slide.style.pointerEvents = 'auto';
        const scale = 1 - Math.abs(diffToTarget * 0.9);
        const translateY = diffToTarget * 300;
        const zIndex = Math.round(20 - Math.abs(diffToTarget * 10));

        slide.style.transform = `scale(${scale}) translateY(${translateY}px) translateZ(0)`;
        slide.style.opacity = Math.max(0, 1 - Math.abs(diffToTarget * 1.5)).toString();
        slide.style.zIndex = zIndex.toString();
        slide.style.position = 'relative';
      });
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", applyTransforms);
    emblaApi.on("reInit", applyTransforms);
    applyTransforms();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", applyTransforms);
      emblaApi.off("reInit", applyTransforms);
    };
  }, [emblaApi, hasMore, loading, posts.length]);

  // Prevent overscroll
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      {/* Dashboard Header with Greeting */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between">
            {/* Left: Greeting */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight font-headline text-foreground">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 5) return "Good Night";
                  if (hour < 12) return "Good Morning";
                  if (hour < 18) return "Good Afternoon";
                  return "Good Evening";
                })()}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Right: Clock and Stats */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-3xl md:text-5xl font-bold tabular-nums">
                  {(() => {
                    const now = new Date();
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                  })()}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {posts.length} papers found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="flex-1 overflow-hidden">
        <div className="overflow-hidden h-full w-full touch-none overscroll-y-none overscroll-contain" ref={emblaRef}>
          <div className="flex flex-col h-full backface-visibility-hidden">
            {!loading && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto px-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="relative mb-8 group cursor-pointer" onClick={() => setShowSupportModal(true)}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-background to-muted rounded-2xl border border-border/50 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-50" />
                    <Loader2 className="w-10 h-10 text-primary relative z-10 animate-spin" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-3">
                  No Posts Found
                </h2>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  We couldn't find any papers for this period. Try checking a different time range or explore the archive.
                </p>

                <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[200px]">
                  <SupportButton
                    onClick={() => setShowSupportModal(true)}
                    className="w-full h-12 text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  />
                </div>
              </div>
            )}
            {posts.map((post, index) => {
              const shouldRender = Math.abs(index - activeSlideIndex) <= 3;

              return (
                <div
                  className="relative min-w-0 flex-[0_0_100%] h-full flex justify-center py-2 px-4 md:py-4 md:px-8 lg:py-8 lg:px-16 will-change-[transform,opacity] transition-transform transition-opacity duration-200 ease-out"
                  key={post.id}
                >
                  {shouldRender ? (
                    <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                      <PostView
                        post={post}
                        isActive={index === activeSlideIndex}
                        emblaApi={emblaApi}
                        isLocked={false}
                        isPremium={isPremium}
                        onShare={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: post.title,
                              text: post.abstract || undefined,
                              url: post.landingPageUrl || window.location.href,
                            }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(post.landingPageUrl || window.location.href);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh] bg-muted/10 rounded-3xl animate-pulse" />
                  )}
                </div>
              );
            })}
            {loading && posts.length > 0 && (
              <div className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
      <PremiumModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </div>
  );
}
