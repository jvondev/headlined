"use client";

import type { Post } from "@/types";
import { PostView } from "@/components/post-view";
import { FC } from "react";

// Define headlinedHomepagePost here for use in this component
const headlinedHomepagePost: Post = {
  slug: "home",
  title: "Free No-Login RSS Feeds & News Reader that Scroll like TikTok",
  description: "Start reading instantly — no signup.",
  link: "/",
  thumbnail_url: null,
  topic: null,
  summaries: [],
};

export const HomepagePostSlide: FC = () => {
  return (
    <PostView
      post={headlinedHomepagePost}
      isActive={true} // Always active as it's a static homepage slide
    />
  );
};