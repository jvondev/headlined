'use client';

import { useState, useEffect, useCallback, type FC, useRef, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ArrowUp, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, ArrowDown, Pencil, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { CarouselContext } from "@/context/carousel-context";
import { useOnboardingContext } from "@/context/onboarding-context";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PostView } from "@/components/post-view";
import { PostCardSkeleton } from "./post-card-skeleton";
import { HomepagePostSlide } from "@/components/homepage-post-slide";
import { getPaginatedPosts } from "@/lib/client-posts";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

import { SaveDialog } from "./save-dialog";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { Post, SavedItem } from "@/types";
import { affiliateAds, AffiliateProgram } from "@/data/affiliate-ads";

type PostCarouselProps = {
  shouldFetchPaginatedPosts?: boolean,
  topicName?: string;
  searchQuery?: string;
}

const PAGE_SIZE = 10; // Define page size for client-side pagination

export const PostCarousel: FC<PostCarouselProps> = ({
  shouldFetchPaginatedPosts = false,
  topicName,
  searchQuery,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const returnToSlug = searchParams.get("returnTo");
  const action = searchParams.get("action");

  const currentKey = useMemo(() => {
    if (topicName) return `topic-${topicName}`;
    if (searchQuery) return `search-${searchQuery}`;
    return "default";
  }, [topicName, searchQuery]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = useRef(1);
  const nextAdDistance = useRef(Math.floor(Math.random() * 5) + 5); // Initial random range 5-10

  // Lazy Loading State
  const [hasActivated, setHasActivated] = useState(shouldFetchPaginatedPosts);

  useEffect(() => {
    if (shouldFetchPaginatedPosts) {
      setHasActivated(true);
    }
  }, [shouldFetchPaginatedPosts]);

  const createAdPost = useCallback((program: AffiliateProgram): Post => {
    const variant = program.variants[Math.floor(Math.random() * program.variants.length)];
    return {
      slug: `ad-${program.name}-${Math.random().toString(36).substr(2, 9)}`,
      title: variant.title,
      description: variant.description,
      link: variant.link,
      thumbnail_url: variant.asset,
      topic: "Sponsored",
      summaries: [{
        type: 'article-summary',
        title: 'Summary',
        icon: 'Info',
        content: {
          snippet: variant.description,
          originalArticleUrl: variant.link,
          slug: `ad-summary-${Math.random()}`
        }
      }]
    };
  }, []);

  const injectAds = useCallback((newPosts: Post[]) => {
    const postsWithAds: Post[] = [];

    // Filter ads relevant to current topic/interest
    const relevantAds = affiliateAds.filter(ad => {
      if (topicName && ad.topics && !ad.topics.includes(topicName)) return false;
      if (searchQuery && ad.interests && !ad.interests.includes(searchQuery)) return false;
      return true;
    });

    if (relevantAds.length === 0) return newPosts;

    for (const post of newPosts) {
      postsWithAds.push(post);
      nextAdDistance.current -= 1;

      if (nextAdDistance.current <= 0) {
        const randomAd = relevantAds[Math.floor(Math.random() * relevantAds.length)];
        const min = randomAd.frequency?.min || 5;
        const max = randomAd.frequency?.max || 10;

        postsWithAds.push(createAdPost(randomAd));
        nextAdDistance.current = Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }
    return postsWithAds;
  }, [topicName, searchQuery, createAdPost]);

  const fetchPosts = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { posts: newPosts, hasMore: newHasMore } = await getPaginatedPosts({
        page: 1,
        topic_name: topicName,
        search_query: searchQuery,
      });

      setPosts(injectAds(newPosts));
      setHasMore(newHasMore);
      page.current = 1;
    } catch (err: any) {
      console.error("Error fetching posts:", err.message);
      setError("Failed to load posts.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, topicName, searchQuery, injectAds]);

  useEffect(() => {
    if (hasActivated) {
      setPosts([]);
      setHasMore(false);
      page.current = 1;
      setActiveSlideIndex(0);
      fetchPosts();
    }
  }, [currentKey, hasActivated]);

  // Prevent iOS bounce on body and browser navigation swipes
  useEffect(() => {
    if (!hasActivated) return;
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overscrollBehavior = '';
    };
  }, [hasActivated]);

  const initialSlide = useMemo(() => {
    return 0;
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: 'y',
    startIndex: initialSlide,
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'y',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlide);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const currentPost = posts[activeSlideIndex];

  const { toast } = useToast();
  const { setVerticalEmblaApi } = useOnboardingContext();

  useEffect(() => {
    if (emblaApi && hasActivated) {
      setVerticalEmblaApi(emblaApi);
    }
    return () => {
      setVerticalEmblaApi(null);
    };
  }, [emblaApi, setVerticalEmblaApi, hasActivated]);

  const { isSaved, getSavedItem, addSavedItem, removeSavedItem, hasSaved, setHasSaved } = useSavedItems();


  const scrollUp = useCallback(() => {
    if (emblaApi && emblaApi!.canScrollPrev()) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollDown = useCallback(() => {
    if (emblaApi && emblaApi!.canScrollNext()) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);


  useEffect(() => {
    if (!hasActivated) return;
    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [scrollDown, scrollUp, currentPost, hasActivated]);


  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    page.current += 1;

    const { posts: newPosts, hasMore: newHasMore } = await getPaginatedPosts({
      page: page.current,
      topic_name: topicName, // Use topicName prop
      search_query: searchQuery, // Use searchQuery prop
    });

    if (newPosts.length > 0) {
      setPosts(prev => {
        const postsWithAds = injectAds(newPosts);
        const updatedPosts = [...prev, ...postsWithAds];
        return updatedPosts;
      });
    }
    setHasMore(newHasMore);
    setIsLoading(false);
  }, [isLoading, hasMore, topicName, searchQuery, injectAds]);


  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const applyTransforms = () => {
      const scrollProgress = emblaApi.scrollProgress();
      const slides = emblaApi.slideNodes();
      const snapList = emblaApi.scrollSnapList();

      slides.forEach((slide, index) => {
        const snap = snapList[index];
        const diffToTarget = snap - scrollProgress;
        const scale = 1 - Math.abs(diffToTarget * 0.9); // Scale down by 90% at the edges
        const translateY = diffToTarget * 300; // Adjust vertical position
        const zIndex = Math.round(20 - Math.abs(diffToTarget * 10));

        slide.style.transform = `scale(${scale}) translateY(${translateY}px) translateZ(0)`;
        slide.style.opacity = Math.max(0, 1 - Math.abs(diffToTarget * 1.5)).toString();
        slide.style.zIndex = zIndex.toString();
        slide.style.position = 'relative';
      });
    };

    emblaApi.on("scroll", applyTransforms);
    emblaApi.on("reInit", applyTransforms);
    applyTransforms(); // Apply initial transforms

    return () => {
      emblaApi.off("scroll", applyTransforms);
      emblaApi.off("reInit", applyTransforms);
    };
  }, [emblaApi, posts.length, hasActivated]);

  useEffect(() => {
    if (!emblaApi || !hasActivated) return;

    const onSelect = (api: UseEmblaCarouselType[1]) => {
      const newIndex = api!.selectedScrollSnap();
      setActiveSlideIndex(newIndex);

      if (hasMore && !isLoading && newIndex >= posts.length - 5) {
        loadMorePosts();
      }
    };

    emblaApi.on("select", onSelect);
    // Initial check
    onSelect(emblaApi);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, hasMore, isLoading, posts.length, loadMorePosts, topicName, searchQuery, hasActivated]);




  const handleCategoryChange = (category: string) => {

  };

  const currentItemId = useMemo(() => {
    if (!currentPost) return '';
    return `${currentPost.slug}-post`;
  }, [currentPost]);

  // When the active item changes, close the save dialog to prevent state bleeding.
  useEffect(() => {
    if (isSaveDialogOpen) {
      setIsSaveDialogOpen(false);
    }
  }, [currentItemId]);

  // State for save count
  const [saveCount, setSaveCount] = useState(0);

  const handleSaveWithNote = (item: Omit<SavedItem, 'savedAt'>) => {
    addSavedItem(item);
    toast({ title: "Saved!", description: "Your item and note have been saved." });
    if (!hasSaved(item.id)) {
      setHasSaved(item.id, true);
    }
  };

  const handleRemoveFromSaved = (id: string) => {
    removeSavedItem(id);
    toast({ title: "Removed", description: "Removed from your saved items." });
    if (hasSaved(id)) {
      setHasSaved(id, false);
    }
  }

  const isCurrentItemSaved = isSaved(currentItemId);
  const currentSavedItem = getSavedItem(currentItemId);

  const itemToSave = useMemo(() => {
    if (!currentPost) return null;
    let item: Omit<SavedItem, 'savedAt' | 'note' | 'postData'>;

    item = {
      id: `${currentPost.slug}-post`,
      slug: currentPost.slug,
      title: currentPost.title,
      type: 'post',
    };
    return item;
  }, [currentPost]);

  const handleSaveClick = async () => {
    if (!itemToSave) return;

    let fullItemData: Omit<SavedItem, 'savedAt' | 'note'>;

    fullItemData = { ...itemToSave, postData: currentPost };

    if (isCurrentItemSaved) {
      setIsSaveDialogOpen(true);
    } else {
      addSavedItem(fullItemData);
      toast({ title: "Saved!", description: "Added to your saved items." });
      if (!hasSaved(fullItemData.id)) {
        setHasSaved(fullItemData.id, true);
      }
    }
  };

  const renderContent = () => {
    if (isLoading && posts.length === 0) {
      return <PostPageLoadingSkeleton />;
    }
    if (error) {
      return (
        <div className="text-center text-red-500 py-16">
          <h1 className="font-headline text-4xl font-bold">Error</h1>
          <p className="mt-2 text-lg text-muted-foreground">{error}</p>
        </div>
      );
    }
    if (posts.length === 0) {
      return (
        <div className="text-center py-16">
          <h1 className="font-headline text-4xl font-bold">No Posts Found</h1>
          <p className="mt-2 text-lg text-muted-foreground">No posts found for this selection.</p>
        </div>
      );
    }
    return (
      <>
        {posts.map((post, index) => {
          // Virtualization: Only render slides within a buffer of the active index
          // This drastically reduces DOM weight and React reconciliation cost
          const shouldRender = Math.abs(index - activeSlideIndex) <= 5;

          return (
            <div
              className="relative min-w-0 flex-[0_0_100%] h-full flex justify-center py-2 px-4 md:py-4 md:px-8 lg:py-8 lg:px-16 will-change-[transform,opacity] transition-transform transition-opacity duration-200 ease-out"
              key={`${post.slug}-${index}-${topicName || searchQuery}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Post ${index + 1} of ${posts.length}`}
            >
              {shouldRender ? (
                post.slug === "home" ? (
                  <HomepagePostSlide />
                ) : (
                  <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                    <PostView
                      post={post}
                      isActive={index === activeSlideIndex}
                      emblaApi={emblaApi}
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full max-h-[85vh] md:max-h-[85vh] lg:max-h-[85vh]">
                  <PostCardSkeleton />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Loading more...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Lazy Loading Placeholder
  if (!hasActivated) {
    return <div className="w-full h-full" />;
  }

  if (!currentPost && posts.length > 0) {
    return null;
  }

  const SaveIcon = isCurrentItemSaved ? Pencil : Bookmark;
  const saveIconClassName = isCurrentItemSaved ? 'fill-current' : '';

  return (
    <CarouselContext.Provider value={{ currentPostSlug: currentPost?.slug }}>
      <div className="relative flex h-full w-full flex-col items-center justify-center">

        <div className="overflow-hidden h-full w-full touch-none overscroll-y-none overscroll-contain" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Posts Carousel">
          <div className="flex flex-col h-full backface-visibility-hidden">
            {renderContent()}
          </div>
        </div>

        {itemToSave && (
          <SaveDialog
            open={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
            itemToSave={itemToSave}
            initialNote={currentSavedItem?.note}
            onSave={handleSaveWithNote}
            onRemove={handleRemoveFromSaved}
          />
        )}
      </div>
    </CarouselContext.Provider>
  );
};