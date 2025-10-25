
"use client";

import Link from "next/link";
import { Home, Rss, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Topic, Interest } from "@/types";
import { CarouselNav } from "@/components/carousel-nav";


type PageHeaderProps = {
    children?: React.ReactNode;
    title?: string;
    isHeaderVisible?: boolean;
    topics: Topic[];
    interests: Interest[];
    activeFilterType: "topic" | "interest" | "none";
    activeFilterValue: string;
    onFilterChange: (type: "topic" | "interest", value: string) => void;
}

export function PageHeader({
    children,
    title,
    isHeaderVisible: isVisibleProp = true,
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

  return (
       <div className={cn("fixed top-0 left-0 right-0 z-20 transition-all duration-300", {
        'opacity-0 pointer-events-none -translate-y-full': isMounted && !isVisibleProp,
        'opacity-100 translate-y-0': isMounted && isVisibleProp,
        'opacity-0': !isMounted, 
       })}>
        <div className="container mx-auto px-2 md:px-4">
            <div className="flex flex-col py-2">
                <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        {showHome && (
                            <Link href="/">
                                <Button variant="ghost" size="icon" aria-label="Home">
                                    <Home className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                    </div>

                    {children}

                    {title && <h1 className="text-lg font-headline font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>}
                    
                    <div className="flex items-center gap-1">
                    </div>
                </div>
                <CarouselNav
                    topics={topics}
                    interests={interests}
                    activeFilterType={activeFilterType}
                    activeFilterValue={activeFilterValue}
                    onFilterChange={onFilterChange}
                />
            </div>
        </div>
      </div>
  )
}
