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
import { HomepagePostSlide } from "@/components/homepage-post-slide";
import { getPaginatedPosts } from "@/lib/client-posts";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

import { SaveDialog } from "./save-dialog";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { useCarouselState } from "@/context/carousel-state-context";



type PostCarouselProps = {
  shouldFetchPaginatedPosts?: boolean,
  hasSeenOnboarding: boolean,
  markOnboardingComplete: () => void,
  topicName?: string;
  searchQuery?: string;
}

const PAGE_SIZE = 10; // Define page size for client-side pagination

export const PostCarousel: FC<PostCarouselProps> = ({
  shouldFetchPaginatedPosts = false,
  hasSeenOnboarding,
  markOnboardingComplete,
  topicName,
  searchQuery,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const returnToSlug = searchParams.get("returnTo");
  const action = searchParams.get("action");

  const { getCarouselState, setCarouselState } = useCarouselState();

  const currentKey = useMemo(() => {
    if (topicName) return `topic-${topicName}`;
    if (searchQuery) return `search-${searchQuery}`;
    return "default";
  }, [topicName, searchQuery]);

  const savedState = getCarouselState(currentKey);

  const [posts, setPosts] = useState<Post[]>(savedState?.posts || []);
  const [hasMore, setHasMore] = useState(savedState?.hasMore || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = useRef(savedState?.page || 1);

  useEffect(() => {
    if (savedState) {
      setPosts(savedState.posts);
      setHasMore(savedState.hasMore);
      page.current = savedState.page;
      setActiveSlideIndex(savedState.activeSlideIndex);
      setIsLoading(false);
      setError(null);
    } else {
      setPosts([]);
      setHasMore(false);
      page.current = 1;
      setActiveSlideIndex(0);
      fetchPosts();
    }
  }, [currentKey]);

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

      setPosts(newPosts);
      setHasMore(newHasMore);
      page.current = 1;
      setCarouselState(currentKey, { posts: newPosts, hasMore: newHasMore, page: 1, activeSlideIndex: 0 });
    } catch (err: any) {
      console.error("Error fetching posts:", err.message);
      setError("Failed to load posts.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, topicName, searchQuery, currentKey, setCarouselState]);

  const initialSlide = useMemo(() => {
    return savedState ? savedState.activeSlideIndex : 0;
  }, [savedState]);

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


  useEffect(() => {
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
  }, [scrollDown, scrollUp, currentPost]);


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
            const updatedPosts = [...prev, ...newPosts];
            setCarouselState(currentKey, { ...getCarouselState(currentKey)!, posts: updatedPosts, hasMore: newHasMore, page: page.current });
            return updatedPosts;
        });
    }
    setHasMore(newHasMore);
    setIsLoading(false);
  }, [isLoading, hasMore, topicName, searchQuery, currentKey, getCarouselState, setCarouselState]);
  




  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = (api: UseEmblaCarouselType[1]) => {
        const newIndex = api!.selectedScrollSnap();
        setActiveSlideIndex(newIndex);
        setCarouselState(currentKey, { ...getCarouselState(currentKey)!, activeSlideIndex: newIndex });
        
        if (hasMore && !isLoading && newIndex >= posts.length - 3) {
            loadMorePosts();
        }
    };

    emblaApi.on("settle", onSettle);
    
    return () => {
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, hasMore, isLoading, posts.length, loadMorePosts, topicName, searchQuery, currentKey, getCarouselState, setCarouselState]);




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
        {posts.map((post, index) => (
          <div 
            className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center p-4 md:p-8"
            key={`${post.slug}-${index}-${topicName || searchQuery}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Post ${index + 1} of ${posts.length}`}
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

  if (!currentPost && posts.length > 0) {
    return null; 
  }

  const SaveIcon = isCurrentItemSaved ? Pencil : Bookmark;
  const saveIconClassName = isCurrentItemSaved ? 'fill-current' : '';

  return (
      <CarouselContext.Provider value={{ currentPostSlug: currentPost?.slug }}>
      <div className="relative flex h-screen w-full flex-col items-center justify-center">

        <div className="overflow-hidden h-full w-full" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Posts Carousel">
          <div className="flex flex-col h-full">
            {renderContent()}
          </div>
        </div>
        
                <div className={cn("fixed bottom-20 right-4 z-20 flex flex-col items-center gap-2")}>            <div className="relative">
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

        <div className={cn("fixed bottom-0 left-0 right-0 z-20 flex justify-center mb-16")}>            <Button 
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