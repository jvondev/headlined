
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigationBar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-lg border-t border-border shadow-lg", className)}>
      <div className="flex h-16 items-center justify-around px-4">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          Me
        </Link>
        <Link
          href="/explore"
          className={cn(
            "flex flex-col items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
            pathname === "/explore" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Compass className="h-5 w-5" />
          Explore
        </Link>
        <Link
          href="/saved"
          className={cn(
            "flex flex-col items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
            pathname === "/saved" ? "text-primary" : "text-muted-foreground"
          )}
        >
        <Bookmark className="h-5 w-5" />
          Saved
        </Link>
      </div>
    </nav>
  );
}
