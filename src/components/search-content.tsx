"use client";

import React, { FC } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { SearchInput } from "@/components/search/search-input";
import { useRouter } from "next/navigation";

type SearchContentProps = {
  isLoading: boolean;
};

export const SearchContent: FC<SearchContentProps> = ({ isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return <PostPageLoadingSkeleton />;
  }

  const handleSearch = (query: string, filters: { type: 'all' | 'topic' | 'interest'; value?: string }) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.type !== 'all' && filters.value) {
      params.set(filters.type, filters.value);
    }
    router.push(`/app/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-8">
      <div className="text-center space-y-4 max-w-lg">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          Search <span className="text-primary">Headlined</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Find exactly what you're looking for across all topics and interests.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <SearchInput onSearch={handleSearch} autoFocus={false} />
      </div>
    </div>
  );
};
