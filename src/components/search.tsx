"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { File, Search as SearchIcon } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import { DynamicIcon } from "./dynamic-icon";
import type { SearchResult } from "@/types";
import { Button } from "./ui/button";

import { cn } from "@/lib/utils";

export function Search({ className }: { className?: string }) {
  const { isReady, search, results } = useSearch();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleSelect = (result: SearchResult) => {
    let url = `/post/${result.slug}`;
    runCommand(() => router.push(url));
  };

  const goToSearchPage = () => {
    if (query.trim()) {
      runCommand(() => router.push(`/app/search?q=${encodeURIComponent(query.trim())}`));
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToSearchPage();
    }
  };

  useEffect(() => {
    if (open) {
      search(query);
    }
  }, [query, search, open]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="icon"
        className={cn("bg-background/50 backdrop-blur-sm rounded-full", className)}
      >
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput
            placeholder="Type to search..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
            disabled={!isReady}
            className="pr-20"
          />
          <Button onClick={goToSearchPage} size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2">
            Search
          </Button>
        </div>
        <CommandList>
          {!isReady && query && <CommandLoading>Preparing search...</CommandLoading>}
          {isReady && query && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {isReady && results.length > 0 && (
            <CommandGroup heading="Results">
              {results.slice(0, 10).map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-2"
                >
                  {result.icon ? (
                    <DynamicIcon name={result.icon} className="size-4 text-muted-foreground" />
                  ) : (
                    <File className="size-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.topic && `${result.topic} / `}
                      {result.type}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
