"use client";

import React, { FC } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";

type SearchContentProps = {
  isLoading: boolean;
};

export const SearchContent: FC<SearchContentProps> = ({ isLoading }) => {
  if (isLoading) {
    return <PostPageLoadingSkeleton />;
  }

  return (
    <div className="text-center py-16">
      <h1 className="font-headline text-4xl font-bold">Search Content</h1>
      <p className="mt-2 text-lg text-muted-foreground">Search for posts across all feeds.</p>
    </div>
  );
};
