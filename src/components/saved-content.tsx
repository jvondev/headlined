"use client";

import React, { FC } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";

type SavedContentProps = {
  isLoading: boolean;
};

export const SavedContent: FC<SavedContentProps> = ({ isLoading }) => {
  if (isLoading) {
    return <PostPageLoadingSkeleton />;
  }

  return (
    <div className="text-center py-16">
      <h1 className="font-headline text-4xl font-bold">Saved Content</h1>
      <p className="mt-2 text-lg text-muted-foreground">Your saved items will appear here.</p>
    </div>
  );
};
