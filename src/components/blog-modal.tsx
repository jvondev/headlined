
"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Bookmark } from "lucide-react";
import type { Insight, SavedItem } from "@/types";
import { ArticleContent } from "@/app/blog/[slug]/article-content";
import { ScrollArea } from "./ui/scroll-area";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlogModalProps {
  insight: Insight;
  nextInsight: Insight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animation?: 'slide' | 'overlay';
}

const BlogFooter = ({ onVisible, hasNext }: { onVisible: () => void, hasNext: boolean }) => {
    const { ref, inView } = useInView({ threshold: 0.1 }); 
    
    useEffect(() => {
        if (inView && hasNext) {
            onVisible();
        }
    }, [inView, onVisible, hasNext]);

    return (
        <footer className="mt-64 border-t flex flex-col items-center justify-between text-center" style={{ minHeight: '120vh' }}>
            <div className="container mx-auto px-4 text-muted-foreground pt-32">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Next Up</h3>
                <p className="mt-64 mt-2 max-w-md text-lg mx-auto">
                    {hasNext ? "The next insight is ready for you." : "You've read the latest insight."}
                </p>
            </div>
            {/* The ref is now on an invisible div at the very bottom, pushed down by the container above */}
            <div ref={ref} className="mt-64 h-20 w-full" /> 
        </footer>
    );
};


export function BlogModal({ insight, nextInsight, open, onOpenChange, animation = 'slide' }: BlogModalProps) {
  const { toast } = useToast();
  const savedItemId = `${insight.slug}-blog`;
  const { isSaved, addSavedItem, removeSavedItem } = useSavedItems();
  const isCurrentlySaved = isSaved(savedItemId);

  const handleSaveToggle = () => {
    if (isCurrentlySaved) {
      removeSavedItem(savedItemId);
      toast({
        title: "Removed",
        description: "Removed from your saved items.",
      });
    } else {
      const isRss = insight.slug.startsWith('rss-');
      const itemToSave: Omit<SavedItem, 'savedAt'> = {
        id: savedItemId,
        slug: insight.slug,
        title: `${insight.title} (Full Story)`,
        type: 'blog',
        insightData: isRss ? insight : undefined, // Store full insight for RSS
      };
      addSavedItem(itemToSave);
      toast({
        title: "Saved!",
        description: "Added to your saved items.",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={animation === 'overlay' ? 'top' : 'right'}
        className="p-0 w-full h-full flex flex-col bg-background sm:max-w-full"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetTitle className="sr-only">
          {`Full Story: ${insight.title}`}
        </SheetTitle>
        
        <header className="flex items-center justify-between p-2 border-b bg-background sticky top-0 z-10">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
          <div className="flex-1 min-w-0 px-2">
              <p className="text-sm font-medium truncate" title={insight.title}>{insight.title}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveToggle}>
            <Bookmark className={`h-5 w-5 ${isCurrentlySaved ? 'fill-current text-primary' : ''}`} />
            <span className="sr-only">Save</span>
          </Button>
        </header>
        
        <div className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full touch-pan-y">
                <main className="container mx-auto px-4 py-8">
                    <ArticleContent insight={insight} />
                </main>
                <BlogFooter onVisible={() => onOpenChange(false)} hasNext={!!nextInsight} />
            </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
