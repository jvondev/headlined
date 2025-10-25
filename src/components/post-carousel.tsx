"use client";

import type { Post, SavedItem } from "@/types";
import { useState, useEffect, useCallback, type FC, useRef, useMemo, useTransition } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ArrowUp, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, ArrowDown, ArrowRight, Pencil, HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { CarouselContext } from "@/context/carousel-context";
import { useOnboardingContext } from "@/context/onboarding-context";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { PageHeader } from "./shared/page-header";
import { useFullScreen } from '@/context/full-screen-context';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PostView } from "@/components/post-view";
import { HomepagePostSlide } from "@/components/homepage-post-slide";
import { getPaginatedPosts } from "@/lib/posts";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { usePreferences } from "@/hooks/use-preferences";
import { SaveDialog } from "./save-dialog";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";



type PostCarouselProps = {
  initialPosts: Post[], 
  initialSlug: string, 
  initialHasMore: boolean,
  shouldFetchPaginatedPosts?: boolean,
  hasSeenOnboarding: boolean,
  markOnboardingComplete: () => void,
}

const PAGE_SIZE = 10; // Define page size for client-side pagination

export const PostCarousel: FC<PostCarouselProps> = ({ 
  initialPosts, 
  initialSlug, 
  initialHasMore,
  shouldFetchPaginatedPosts = false,
  hasSeenOnboarding,
  markOnboardingComplete,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const returnToSlug = searchParams.get("returnTo");
  const action = searchParams.get("action");

  // State initialization on client side to avoid hydration issues
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(initialPosts.length === 0); // New state

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || posts.length > 0) return; // Only run if client-side and no posts loaded yet

    processAndSetPosts();
  }, [isClient, posts.length, initialSlug, pathname, shouldFetchPaginatedPosts]);




  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const page = useRef(1);

  const { preferences, addPreference, isLoaded: isPreferencesLoaded } = usePreferences();

  const initialSlide = useMemo(() => {
    if (posts.length === 0) return 0;
    const index = posts.findIndex(post => post.slug === initialSlug);
    return Math.max(0, index);
  }, [posts, initialSlug]);

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
  const { isFullScreen, toggleFullScreen } = useFullScreen(); // Added FullScreenContext
  const { setVerticalEmblaApi, setHorizontalEmblaApi } = useOnboardingContext();

  useEffect(() => {
    if (emblaApi) {
      setVerticalEmblaApi(emblaApi);
    }
    return () => {
      setVerticalEmblaApi(null);
    };
  }, [emblaApi, setVerticalEmblaApi]);

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

  const { triggerScrollRight } = useOnboardingContext();


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          scrollDown();
          break;
        case "ArrowUp":
          scrollUp();
          break;
        case "ArrowRight":
          if (currentPost)
            triggerScrollRight(currentPost.slug);
          break;
        case "ArrowLeft":
          // scrollLeft();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollDown, scrollUp, triggerScrollRight, currentPost]);


  const loadMorePosts = useCallback(async () => {
    console.log('loadMorePosts called');
    if (isLoading || !hasMore || !isPreferencesLoaded) return;
    
    setIsLoading(true);
    page.current += 1;
    
    const topic_id = searchParams.get("topic_id");

    const { posts: newPosts, hasMore: newHasMore } = await getPaginatedPosts({
      page: page.current,
      topic_id: topic_id || undefined,
    });

    if (newPosts.length > 0) {
        if (posts.length === 0) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]); // Append new posts
        }
    }
    setHasMore(newHasMore);
    setIsLoading(false);
  }, [isLoading, hasMore, searchParams, preferences, isPreferencesLoaded]);
  




  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = (api: UseEmblaCarouselType[1]) => {
        const newIndex = api!.selectedScrollSnap();
        setActiveSlideIndex(newIndex);
        
        if (hasMore && !isLoading && newIndex >= posts.length - 3) {
            loadMorePosts();
        }
    };

    emblaApi.on("settle", onSettle);
    
    return () => {
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, hasMore, isLoading, posts.length, loadMorePosts]);




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
    if (!isClient || isLoadingPosts) { // Check isLoadingPosts here
      return <PostPageLoadingSkeleton />;
    }
    if (posts.length === 0 && !isLoading) {
      return <PostPageLoadingSkeleton />; 
    }
    return (
      <>
        {posts.map((post, index) => (
          <div className="relative min-w-0 flex-[0_0_100%] h-full" key={`${post.slug}-${index}`} role="group" aria-roledescription="slide" aria-label={`Post ${index + 1} of ${posts.length}`}>
              {post.slug === "home" ? (
                <HomepagePostSlide />
              ) : (
                <PostView 
                  post={post} 
                  isActive={index === activeSlideIndex}
                />
              )}
          </div>
        ))}
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

  if (!currentPost && posts.length > 0 && isClient) {
    return null; 
  }

  const SaveIcon = isCurrentItemSaved ? Pencil : Bookmark;
  const saveIconClassName = isCurrentItemSaved ? 'fill-current' : '';


  return (
      <CarouselContext.Provider value={{ setHorizontalEmblaApi, currentPostSlug: currentPost?.slug, triggerParentScrollDown: scrollDown }}>
      <div className="relative flex h-screen w-full flex-col items-center justify-center" onDoubleClick={toggleFullScreen}>
        <PageHeader 
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
        />

        <div className="overflow-hidden h-full w-full" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Posts Carousel">
          <div className="flex flex-col h-full">
            {renderContent()}
          </div>
        </div>
        
        <div className={cn("fixed bottom-20 right-4 z-20 flex flex-col items-center gap-2", { "hidden": isFullScreen })}>
            <div className="relative">
                <Button
                  onClick={handleSaveClick}
                  variant="outline"
                  size="icon"
                  aria-label="Save"
                  className="bg-background/50 backdrop-blur-sm rounded-full"
                  disabled={!currentPost}
                >
                  <SaveIcon className={cn("h-4 w-4", saveIconClassName)} />
                </Button>
            </div>
            
        </div>

        <div className={cn("fixed right-0 top-1/2 -translate-y-1/2 z-20", { "hidden": isFullScreen })}>
            <Button
              onClick={() => currentPost && triggerScrollRight(currentPost.slug)}
              variant="outline"
              aria-label="Scroll Right"
              className={cn(
                "h-10 px-3 bg-background/50 backdrop-blur-sm rounded-l-[1rem] rounded-r-none text-sm font-semibold flex items-center gap-2 text-muted-foreground", // Desktop
                isMobile && "h-auto w-auto min-w-[2rem] py-4 px-1 mb-0 mt-0 text-xs flex justify-center items-center gap-1 [writing-mode:vertical-rl] rounded-tr-none rounded-tl-[1rem] rounded-br-none rounded-bl-[1rem] text-muted-foreground" // Mobile: flex items-center, rotate 270
              )}
              disabled={Boolean(!currentPost)}
            >
              <span className={cn(isMobile && "rotate-180")}>Read More</span> <ArrowRight className="h-4 w-4" />
            </Button>
        </div>

        <div className={cn("fixed bottom-0 left-0 right-0 z-20 flex justify-center mb-16", { "hidden": isFullScreen })}>
            <Button 
              onClick={scrollDown} 
              variant="outline" 
              size="icon" 
              aria-label="Next Post" 
              className="min-w-[3rem] w-auto h-auto py-2 px-4 bg-background/50 mb-0 mt-0 backdrop-blur-sm rounded-t-[1rem] rounded-b-none text-sm font-semibold flex items-center gap-2 text-muted-foreground"
              
            >
              Next<ArrowDown className="h-5 w-5" />
            </Button>
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