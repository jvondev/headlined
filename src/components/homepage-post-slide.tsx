"use client";

import type { Post } from "@/types";
import { PostView } from "@/components/post-view";
import { FC } from "react";

// Define readmoreHomepagePost here for use in this component
const readmoreHomepagePost: Post = {
  id: "home",
  slug: "home",
  title: "Free No-Login RSS Feeds & News Reader that Scroll like TikTok",
  description: "Start reading instantly — no signup.",
  link: "/",
  thumbnail_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  topic_id: null,
  summaries: [],
};

export const HomepagePostSlide: FC = () => {
  return (
    <PostView
      post={readmoreHomepagePost}
      isActive={true} // Always active as it's a static homepage slide
    />
  );
};