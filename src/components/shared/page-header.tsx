
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Rss, Bookmark, MoreVertical, Maximize, Minimize } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Search } from "@/components/search";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import type { Topic, Interest } from "@/types";


type PageHeaderProps = {
    children?: React.ReactNode;
    title?: string;
    isHeaderVisible?: boolean;
    isFullScreen: boolean;
    toggleFullScreen: () => void;
    topics: Topic[];
    interests: Interest[];
    activeFilterType: "topic" | "interest";
    activeFilterValue: string;
    onFilterChange: (type: "topic" | "interest", value: string) => void;
}

const VISIBLE_ITEMS_LIMIT = 5; // Limit for both topics and interests

export function PageHeader({
    children,
    title,
    isHeaderVisible: isVisibleProp = true,
    isFullScreen,
    toggleFullScreen,
    topics = [],
    interests = [],
    activeFilterType,
    activeFilterValue,
    onFilterChange,
}: PageHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const showHome = !pathname.startsWith('/post') && pathname !== '/';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allFilterItems = [
    ...(Array.isArray(topics) ? topics.map(topic => ({ ...topic, type: "topic" as const })) : []),
    ...(Array.isArray(interests) ? interests.map(interest => ({ ...interest, type: "interest" as const })) : [])
  ];

  const visibleItems = allFilterItems.slice(0, VISIBLE_ITEMS_LIMIT);
  const hiddenItems = allFilterItems.slice(VISIBLE_ITEMS_LIMIT);

  return (
       <div className={cn("fixed top-0 left-0 right-0 z-20 transition-all duration-300", {
        'opacity-0 pointer-events-none -translate-y-full': isMounted && !isVisibleProp || isFullScreen,
        'opacity-100 translate-y-0': isMounted && isVisibleProp && !isFullScreen,
        'opacity-0': !isMounted, 
       })}>
        <div className="container mx-auto px-2 md:px-4">
            <div className="flex flex-col">
                <div className="relative flex justify-between items-center h-14">
                    <div className="flex items-center gap-1">
                        {showHome && (
                            <Link href="/">
                                <Button variant="ghost" size="icon" aria-label="Home">
                                    <Home className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        <Link href="/saved">
                            <Button variant="ghost" size="icon" aria-label="Saved Items">
                                <Bookmark className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    {children}

                    {title && <h1 className="text-lg font-headline font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>}
                    
                    <div className="flex items-center gap-1">
                        <Search className={cn({ "hidden": isFullScreen })} />
                        <ModeToggle />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleFullScreen}
                            aria-label={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                            className={cn("bg-background/50 backdrop-blur-sm rounded-full", { "hidden": isFullScreen })}
                        >
                            {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                 {allFilterItems.length > 0 && (
                    <div className="w-full pb-2">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                                {visibleItems.map(item => (
                                    <Button
                                        key={item.name}
                                        variant={activeFilterType === item.type && activeFilterValue === item.name ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => onFilterChange(item.type, item.name)}
                                        className="rounded-full px-4 shrink-0"
                                    >
                                        {item.name}
                                    </Button>
                                ))}
                                {hiddenItems.length > 0 && (
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="rounded-full px-4 shrink-0">
                                                More
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {hiddenItems.map(item => (
                                                <DropdownMenuItem 
                                                    key={item.name} 
                                                    onClick={() => onFilterChange(item.type, item.name)}
                                                    >
                                                    {item.name}
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
