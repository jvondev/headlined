"use client";

import React, { FC } from "react";
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";

type ExploreContentProps = {
  isLoading: boolean;
};

export const ExploreContent: FC<ExploreContentProps> = ({ isLoading }) => {
  if (isLoading) {
    return <PostPageLoadingSkeleton />;
  }

  return (
    <div className="text-center py-16">
      <h1 className="font-headline text-4xl font-bold">Explore New Content</h1>
      <p className="mt-2 text-lg text-muted-foreground">Discover new topics and interests.</p>
    </div>
  );
};
