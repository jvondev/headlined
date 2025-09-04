
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-t border-border">
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
