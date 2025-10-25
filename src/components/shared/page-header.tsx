"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Rss, Bookmark, MoreVertical, Maximize, Minimize } from "lucide-react";
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
    isFullScreen: boolean;
    toggleFullScreen: () => void;
}

export function PageHeader({ 
    children, 
    title,
    isHeaderVisible: isVisibleProp = true,
    isFullScreen,
    toggleFullScreen,
}: PageHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const showHome = !pathname.startsWith('/post') && pathname !== '/';

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            </div>
        </div>
      </div>
  )
}