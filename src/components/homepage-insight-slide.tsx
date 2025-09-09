"use client";

import type { Insight } from "@/types";
import { InsightView } from "@/components/insight-view";
import { FC } from "react";

// Define readmoreHomepageInsight here for use in this component
const readmoreHomepageInsight: Insight = {
  slug: "home",
  title: "Free No-Login RSS Feeds & News Reader that Scroll like TikTok",
  description: "Start reading instantly — no signup.",
  category: ["RSS Feeds Reader", "Free", "No Login", "Scroll like TikTok"],
  seo: {
    title: "Free No-Login RSS Feeds & News Reader that Scroll like TikTok | ReadMore",
    description: "Free No-Signup RSS reader. Subscribe to any RSS feed, enjoy a scrolling reading experience, and get summarized articles. ReadMore is a free RSS reader that respects your privacy.",
  },
  deepDives: [
    {
      "type": "data",
      "title": "ReadMore Features",
      "icon": "BarChart3",
      "content": {
        "points": [
          { "label": "Free, No Login", "value": "100%", "icon": "ShieldAlert" },
          { "label": "TikTok-Like Scroll", "value": "∞", "icon": "Shuffle" },
          { "label": "Summary Included in Daily Digest", "value": "Fast", "icon": "BookText" },
          { "label": "Read Feeds & Save Note Highlights", "value": "Private", "icon": "Bookmark" }
        ]
      }
    },    
    {
      type: "quote",
      title: "Free Daily Digest",
      icon: "Rss",
      content: {
        text: "Subscribe to free RSS feeds and get your daily digest — no signup required.",
        author: "Plus, enjoy free article summaries with every update."
      }
    },
    {
      type: "comparison",
      title: "ReadMore vs Others",
      icon: "Columns",
      content: {
        titleA: "Other",
        titleB: "ReadMore",
        items: [
          { feature: "Navigation", itemA: "Lists & folders", itemB: "Swipes + scroll" },
          { feature: "Readability", itemA: "Cluttered UI", itemB: "Distraction-free" },
          { feature: "Performance", itemA: "Lightweight app", itemB: "Heavy load" },
          { feature: "Article view", itemA: "Free summaries", itemB: "Full articles only" },
          { feature: "Pricing", itemA: "Free forever (No-Login)", itemB: "Paid tiers (Subscription)" }
        ]
      }
    },
    
    {
      type: "howto",
      title: "How to Use",
      icon: "ListOrdered",
      content: {
        steps: [
          {
            title: "Open ReadMore",
            description: "Access ReadMore instantly — no signup required. Open in your browser or install the PWA for mobile-friendly reading."
          },
          {
            title: "Browse Feeds Vertically",
            description: "Scroll down to see your subscribed feeds and quickly check for new articles."
          },
          {
            title: "Swipe Summaries Horizontally",
            description: "Within a feed, swipe horizontally through summaries to scan multiple articles efficiently."
          },
          {
            title: "Read Full Articles",
            description: "Swipe horizontally again to read the full content of any article seamlessly."
          },
          {
            title: "Highlight & Take Notes",
            description: "Tap the 'Save' button to highlight key points and take private notes for offline reference."
          }        ]
      },
    },
    {
      "type": "qna",
      "title": "Frequently Asked Questions",
      "icon": "HelpCircle",
      "content": {
        "questions": [
          {
            "q": "How does ReadMore help me save time?",
            "a": "By providing summarized content from multiple feeds, ReadMore lets you grasp key insights quickly without reading full articles immediately."
          },
          {
            "q": "How often are feeds updated?",
            "a": "Feeds refresh automatically throughout the day so you get the latest articles and summaries without manual effort."
          },
          {
            "q": "Is there a way to revisit my favorite articles?",
            "a": "Articles can be bookmarked and highlighted, allowing you to quickly revisit and review important content anytime."
          },
          {
            "q": "How secure is my data?",
            "a": "All notes and highlights are stored locally on your device, ensuring privacy without sharing your information."
          },
          {
            "q": "Can I search across multiple feeds?",
            "a": "You can quickly search for keywords across all your subscribed feeds to find relevant articles instantly."
          }
        ]
      }
    },    
  ],
  blogContent: "", // No blog content for this static slide
};

export const HomepageInsightSlide: FC = () => {
  return (
    <InsightView
      insight={readmoreHomepageInsight}
      isActive={true} // Always active as it's a static homepage slide
      initialDeepDiveIndex={0}
      startOnDeepDive={false}
    />
  );
};
