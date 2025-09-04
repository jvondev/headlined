
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Rss, Bookmark, MoreVertical } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Search } from "@/components/search";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";


type PageHeaderProps = {
    children?: React.ReactNode;
    title?: string;
    isHeaderVisible?: boolean;
    // Props for RSS Category switcher
    rssCategories?: string[];
    rssSelectedCategory?: string;
    onRssCategoryChange?: (category: string) => void;
}

const VISIBLE_CATEGORIES_LIMIT = 5;

export function PageHeader({ 
    children, 
    title,
    isHeaderVisible: isVisibleProp = true,
    rssCategories,
    rssSelectedCategory,
    onRssCategoryChange,
}: PageHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const showHome = !pathname.startsWith('/insight') && pathname !== '/';
  const showRss = !pathname.startsWith('/rss');
  const showSaved = pathname !== '/saved';

  const visibleCategories = rssCategories?.slice(0, VISIBLE_CATEGORIES_LIMIT) || [];
  const hiddenCategories = rssCategories?.slice(VISIBLE_CATEGORIES_LIMIT) || [];


  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
       <div className={cn("fixed top-0 left-0 right-0 z-20 transition-all duration-300", {
        'opacity-0 pointer-events-none -translate-y-full': isMounted && !isVisibleProp,
        'opacity-100 translate-y-0': isMounted && isVisibleProp,
        'opacity-0': !isMounted, 
       })}>
        <div className="container mx-auto px-2 md:px-4">
            <div className="flex flex-col">
                <div className="relative flex justify-between items-center h-14">
                    <div className="flex items-center gap-1">
                    </div>

                    {children}

                    {title && <h1 className="text-lg font-headline font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>}
                    
                    <div className="flex items-center gap-1">
                        
                        <Search />
                        <ModeToggle />
                    </div>
                </div>

                 {rssCategories && (
                    <div className="w-full pb-2">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                                {visibleCategories.map(category => (
                                    <Button
                                        key={category}
                                        variant={rssSelectedCategory === category ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => onRssCategoryChange?.(category)}
                                        className="rounded-full px-4 shrink-0"
                                    >
                                        {category}
                                    </Button>
                                ))}
                                {hiddenCategories.length > 0 && (
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-full px-4 shrink-0">
                                                More
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {hiddenCategories.map(category => (
                                                <DropdownMenuItem 
                                                    key={category} 
                                                    onClick={() => onRssCategoryChange?.(category)}
                                                    >
                                                    {category}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <ScrollBar orientation="horizontal" className="invisible" />
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
      </div>
  )
}
